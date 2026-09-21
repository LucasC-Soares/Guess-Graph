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
  CLOSE_ROOM: 'room:close',
  REMATCH: 'game:rematch',
  // Eventos emitidos pelo servidor (broadcast):
  ROOM_UPDATED: 'room:updated',
  OPPONENT_JOINED: 'room:opponent-joined',
  QUESTION_ANSWERED: 'game:question-answered',
  GAME_OVER: 'game:over',
  ROOM_CLOSED: 'room:closed',
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
  async handleCreateRoom(@MessageBody() data: { username: string }, @ConnectedSocket() client: Socket) {
    const code = await this.roomsService.createRoom(data.username, client.id);
    client.data.roomCode = code;
    void client.join(code);
    return { code, status: 'WAITING_FOR_PLAYER' };
  }

  @SubscribeMessage(EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @MessageBody() data: { code: string; username: string },
    @ConnectedSocket() client: Socket,
  ): Promise<{ code: string; status: 'WAITING_FOR_PLAYER' | 'IN_PROGRESS' | 'FINISHED'; opponentHand: unknown[]; currentTurn: 'player1' | 'player2'; yourRole: 'player1' | 'player2' }> {
    const room = await this.roomsService.joinRoom(data.code, data.username, client.id);
    client.data.roomCode = room.code;
    void client.join(room.code);
    const createHand = () => this.graphGenerator.generateHand().map((graph) => ({
      graph,
      properties: this.graphProperties.computeAll(graph),
    }));
    await this.roomsService.assignHands(room.code, createHand(), createHand());
    const updatedRoom = await this.roomsService.getRoom(room.code);
    const myIndex = updatedRoom.players.findIndex((player) => player?.socketId === client.id);
    const myRole: 'player1' | 'player2' = myIndex === 0 ? 'player1' : 'player2';
    const opponent = updatedRoom.players[myIndex === 0 ? 1 : 0];
    const roomState: {
      status: 'WAITING_FOR_PLAYER' | 'IN_PROGRESS' | 'FINISHED';
      opponentHand: unknown[];
      currentTurn: 'player1' | 'player2';
      yourRole: 'player1' | 'player2';
    } = {
      status: updatedRoom.status,
      opponentHand: opponent?.hand.map(({ graph }) => graph) ?? [],
      currentTurn: updatedRoom.currentTurn,
      yourRole: myRole,
    };
    for (const [index, player] of updatedRoom.players.entries()) {
      if (!player) continue;
      const opponentForPlayer = updatedRoom.players[index === 0 ? 1 : 0];
      this.server.to(player.socketId).emit(EVENTS.OPPONENT_JOINED, {
        status: updatedRoom.status,
        opponentHand: opponentForPlayer?.hand.map(({ graph }) => graph) ?? [],
        currentTurn: updatedRoom.currentTurn,
        yourRole: index === 0 ? 'player1' : 'player2',
      });
    }
    return { code: updatedRoom.code, ...roomState };
  }

  @SubscribeMessage(EVENTS.ASK_QUESTION)
  async handleAskQuestion(
    @MessageBody() data: { question: Question },
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.roomsService.getRoomForSocket(client.id, client.data.roomCode);
    const role = this.roomsService.getPlayerRole(room, client.id);
    if (!role || room.currentTurn !== role) throw new Error('Não é a vez deste jogador');
    const target = this.roomsService.getActiveOpponentGraph(room, role);
    if (!target) throw new Error('Grafo não encontrado');
    const answer = answerQuestion(target.properties, data.question);
    const filterResult = this.roomsService.filterOpponentGraphs(room, role, data.question, answer);
    const updatedRoom = await this.roomsService.recordQuestion(room.code, {
      askedBy: role,
      question: data.question,
      answer,
      ...filterResult,
    });
    this.server.to(room.code).emit(EVENTS.QUESTION_ANSWERED, {
      askedBy: role,
      question: data.question,
      answer,
      ...filterResult,
      remainingCount: filterResult.remainingGraphIds.length,
      currentTurn: updatedRoom.currentTurn,
    });
    return {
      askedBy: role,
      answer,
      ...filterResult,
      remainingCount: filterResult.remainingGraphIds.length,
      finished: false,
      currentTurn: updatedRoom.currentTurn,
    };
  }

  @SubscribeMessage(EVENTS.MAKE_GUESS)
  async handleMakeGuess(
    @MessageBody() data: { guessedGraphId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.roomsService.getRoomForSocket(client.id, client.data.roomCode);
    const role = this.roomsService.getPlayerRole(room, client.id);
    if (!role || room.currentTurn !== role) throw new Error('Não é a vez deste jogador');
    const player = room.players[role === 'player1' ? 0 : 1];
    const opponent = room.players[role === 'player1' ? 1 : 0];
    const target = room.players[role === 'player1' ? 0 : 1]?.remainingOpponentGraphIds.length === 1
      ? this.roomsService.getOnlyRemainingOpponentGraph(room, role)
      : this.roomsService.getActiveOpponentGraph(room, role);
    if (!player || !opponent || !target) {
      throw new Error('Grafo não encontrado');
    }
    const correct = target.graph.id === data.guessedGraphId;
    if (correct && !player.guessedGraphIds.includes(target.graph.id)) {
      player.guessedGraphIds.push(target.graph.id);
      player.score += 1;
      this.roomsService.advanceActiveOpponentGraph(room, role);
    }
    const finished = true;
    const winner = correct ? role : role === 'player1' ? 'player2' : 'player1';
    const winnerPlayer = correct ? player : opponent;
    room.status = 'FINISHED';
    this.server.to(room.code).emit(EVENTS.GAME_OVER, {
      winner,
      winnerName: winnerPlayer.username,
      score: correct ? player.score : opponent.score,
      correct,
    });
    await this.roomsService.saveRoom(room);
    return { correct, finished, score: player.score };
  }

  @SubscribeMessage(EVENTS.REMATCH)
  async handleRematch(@ConnectedSocket() client: Socket) {
    const room = await this.roomsService.getRoomForSocket(client.id, client.data.roomCode);
    const role = this.roomsService.getPlayerRole(room, client.id);
    if (!role) throw new Error('Jogador não pertence à sala');
    const accepted = await this.roomsService.requestRematch(room.code, role);
    if (!accepted) {
      this.server.to(room.code).emit(EVENTS.ROOM_UPDATED, { rematchRequestedBy: role });
      return { accepted: false, status: 'WAITING_FOR_REMATCH' };
    }
    const createHand = () => this.graphGenerator.generateHand().map((graph) => ({
      graph,
      properties: this.graphProperties.computeAll(graph),
    }));
    await this.roomsService.assignHands(room.code, createHand(), createHand());
    const restartedRoom = await this.roomsService.getRoom(room.code);
    for (const [index, player] of restartedRoom.players.entries()) {
      if (!player) continue;
      const opponent = restartedRoom.players[index === 0 ? 1 : 0];
      this.server.to(player.socketId).emit(EVENTS.OPPONENT_JOINED, {
        status: restartedRoom.status,
        opponentHand: opponent?.hand.map(({ graph }) => graph) ?? [],
        currentTurn: restartedRoom.currentTurn,
        yourRole: index === 0 ? 'player1' : 'player2',
      });
    }
    return { accepted: true, status: restartedRoom.status };
  }

  @SubscribeMessage(EVENTS.CLOSE_ROOM)
  async handleCloseRoom(@ConnectedSocket() client: Socket) {
    const room = await this.roomsService.getRoomForSocket(client.id, client.data.roomCode);
    await this.roomsService.removeRoom(room.code);
    this.server.to(room.code).emit(EVENTS.ROOM_CLOSED);
    return { closed: true };
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const code = await this.roomsService.removePlayer(client.id);
    if (code) this.server.to(code).emit(EVENTS.ROOM_UPDATED, { status: 'WAITING_FOR_PLAYER' });
  }
}
