import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { GraphGeneratorService } from '../graphs/graph-generator.service';
import { GraphPropertiesService } from '../graphs/graph-properties.service';
import { Question, answerQuestion } from '../questions/question-catalog';

/**
 * Um evento por ação do jogo. Mantenha os payloads pequenos e nomeados
 * de forma consistente entre cliente e servidor — copie esses nomes
 * literalmente no frontend (entities/room/api) pra evitar bugs de digitação
 * em strings soltas.
 */
const EVENTS = {
  CREATE_ROOM: 'room:create',
  JOIN_ROOM: 'room:join',
  ASK_QUESTION: 'game:ask-question',
  MAKE_GUESS: 'game:make-guess',
  // Eventos emitidos pelo servidor (broadcast):
  ROOM_UPDATED: 'room:updated',
  OPPONENT_JOINED: 'room:opponent-joined',
  QUESTION_ANSWERED: 'game:question-answered',
  GAME_OVER: 'game:over',
} as const;

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' } })
export class RoomsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly roomsService: RoomsService,
    private readonly graphGenerator: GraphGeneratorService,
    private readonly graphProperties: GraphPropertiesService,
  ) {}

  @SubscribeMessage(EVENTS.CREATE_ROOM)
  handleCreateRoom(@MessageBody() data: { username: string }, @ConnectedSocket() client: Socket) {
    const code = this.roomsService.createRoom(data.username, client.id);
    void client.join(code);
    return { code, status: 'WAITING_FOR_PLAYER' };
  }

  @SubscribeMessage(EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @MessageBody() data: { code: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.roomsService.joinRoom(data.code, data.username, client.id);
    void client.join(room.code);
    const createHand = () => this.graphGenerator.generateBatch(3, 5).map((graph) => ({
      graph,
      properties: this.graphProperties.computeAll(graph),
    }));
    this.roomsService.assignHands(room.code, createHand(), createHand());
    for (const [index, player] of room.players.entries()) {
      if (!player) continue;
      const opponent = room.players[index === 0 ? 1 : 0];
      this.server.to(player.socketId).emit(EVENTS.OPPONENT_JOINED, {
        code: room.code,
        status: room.status,
        opponentHand: opponent?.hand.map(({ graph }) => graph) ?? [],
        currentTurn: room.currentTurn,
        yourRole: index === 0 ? 'player1' : 'player2',
      });
    }
    return { code: room.code, status: room.status };
  }

  @SubscribeMessage(EVENTS.ASK_QUESTION)
  handleAskQuestion(
    @MessageBody() data: { code: string; graphId: string; question: Question },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.roomsService.getRoom(data.code);
    const role = this.roomsService.getPlayerRole(room, client.id);
    if (!role || room.currentTurn !== role) throw new Error('Não é a vez deste jogador');
    const opponent = room.players[role === 'player1' ? 1 : 0];
    const target = opponent?.hand.find(({ graph }) => graph.id === data.graphId);
    if (!target) throw new Error('Grafo não encontrado');
    const answer = answerQuestion(target.properties, data.question);
    const updatedRoom = this.roomsService.recordQuestion(room.code, {
      askedBy: role,
      question: data.question,
      answer,
    });
    this.server.to(room.code).emit(EVENTS.QUESTION_ANSWERED, {
      graphId: data.graphId,
      question: data.question,
      answer,
      currentTurn: updatedRoom.currentTurn,
    });
    return { answer, currentTurn: updatedRoom.currentTurn };
  }

  @SubscribeMessage(EVENTS.MAKE_GUESS)
  handleMakeGuess(
    @MessageBody() data: { code: string; graphId: string; guessedGraphId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.roomsService.getRoom(data.code);
    const role = this.roomsService.getPlayerRole(room, client.id);
    if (!role || room.currentTurn !== role) throw new Error('Não é a vez deste jogador');
    const player = room.players[role === 'player1' ? 0 : 1];
    const opponent = room.players[role === 'player1' ? 1 : 0];
    if (!player || !opponent || !opponent.hand.some(({ graph }) => graph.id === data.graphId)) {
      throw new Error('Grafo não encontrado');
    }
    const correct = data.graphId === data.guessedGraphId;
    if (correct && !player.guessedGraphIds.includes(data.graphId)) {
      player.guessedGraphIds.push(data.graphId);
      player.score += 1;
    }
    const finished = player.score >= opponent.hand.length;
    if (finished) {
      room.status = 'FINISHED';
      this.server.to(room.code).emit(EVENTS.GAME_OVER, { winner: role, score: player.score });
    } else {
      room.currentTurn = role === 'player1' ? 'player2' : 'player1';
      this.server.to(room.code).emit(EVENTS.ROOM_UPDATED, { currentTurn: room.currentTurn, score: player.score });
    }
    return { correct, finished, score: player.score };
  }

  handleDisconnect(client: Socket): void {
    const code = this.roomsService.removePlayer(client.id);
    if (code) this.server.to(code).emit(EVENTS.ROOM_UPDATED, { status: 'WAITING_FOR_PLAYER' });
  }
}
