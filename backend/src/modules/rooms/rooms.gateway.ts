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
  RESUME_ROOM: 'room:resume',
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

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' },
})
export class RoomsGateway implements OnGatewayDisconnect {
  /**
   * Um reload de página derruba o socket antes do novo conectar e mandar
   * RESUME_ROOM. Sem essa folga, handleDisconnect já teria removido o
   * jogador da sala antes do resume chegar.
   */
  private static readonly RECONNECT_GRACE_MS = 8000;

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly roomsService: RoomsService,
    private readonly graphGenerator: GraphGeneratorService,
    private readonly graphProperties: GraphPropertiesService,
  ) {}

  @SubscribeMessage(EVENTS.CREATE_ROOM)
  async handleCreateRoom(
    @MessageBody() data: { username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = await this.roomsService.createRoom(data.username, client.id);
    client.data.roomCode = code;
    void client.join(code);
    return { code, status: 'WAITING_FOR_PLAYER' };
  }

  @SubscribeMessage(EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @MessageBody() data: { code: string; username: string },
    @ConnectedSocket() client: Socket,
  ): Promise<{
    code: string;
    status: 'WAITING_FOR_PLAYER' | 'IN_PROGRESS' | 'FINISHED';
    hand: unknown[];
    yourGraphId: string | undefined;
    currentTurn: 'player1' | 'player2';
    yourRole: 'player1' | 'player2';
  }> {
    const room = await this.roomsService.joinRoom(
      data.code,
      data.username,
      client.id,
    );
    client.data.roomCode = room.code;
    void client.join(room.code);
    const hand = this.graphGenerator.generateHand().map((graph) => ({
      graph,
      properties: this.graphProperties.computeAll(graph),
    }));
    await this.roomsService.assignHands(room.code, hand);
    const updatedRoom = await this.roomsService.getRoom(room.code);
    const myIndex = updatedRoom.players.findIndex(
      (player) => player?.socketId === client.id,
    );
    const myRole: 'player1' | 'player2' = myIndex === 0 ? 'player1' : 'player2';
    const sharedHand = updatedRoom.hand.map(({ graph }) => graph);
    const roomState = {
      status: updatedRoom.status,
      hand: sharedHand,
      yourGraphId: updatedRoom.players[myIndex]?.secretGraphId,
      currentTurn: updatedRoom.currentTurn,
      yourRole: myRole,
    };
    for (const [index, player] of updatedRoom.players.entries()) {
      if (!player) continue;
      this.server.to(player.socketId).emit(EVENTS.OPPONENT_JOINED, {
        status: updatedRoom.status,
        hand: sharedHand,
        yourGraphId: player.secretGraphId,
        currentTurn: updatedRoom.currentTurn,
        yourRole: index === 0 ? 'player1' : 'player2',
      });
    }
    return { code: updatedRoom.code, ...roomState };
  }

  /**
   * Reassocia o socket novo (após reload/reconexão) ao jogador salvo pelo
   * cliente em localStorage, em vez de exigir um JOIN_ROOM — que falharia
   * porque a sala já está cheia.
   */
  @SubscribeMessage(EVENTS.RESUME_ROOM)
  async handleResumeRoom(
    @MessageBody()
    data: { code: string; username: string; role: 'player1' | 'player2' },
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.roomsService.resumePlayer(
      data.code,
      data.role,
      data.username,
      client.id,
    );
    client.data.roomCode = room.code;
    void client.join(room.code);
    const myIndex = data.role === 'player1' ? 0 : 1;
    const roomState = {
      status: room.status,
      hand: room.hand.map(({ graph }) => graph),
      yourGraphId: room.players[myIndex]?.secretGraphId,
      currentTurn: room.currentTurn,
      questionLog: room.questionLog,
      rematchRequestedBy:
        room.rematchVotes.length === 1 ? room.rematchVotes[0] : null,
      yourRole: data.role,
    };
    client.emit(EVENTS.OPPONENT_JOINED, roomState);
    if (room.status === 'FINISHED') {
      const winnerRole = room.currentTurn;
      const winnerPlayer = room.players[winnerRole === 'player1' ? 0 : 1];
      if (winnerPlayer) {
        client.emit(EVENTS.GAME_OVER, {
          winner: winnerRole,
          winnerName: winnerPlayer.username,
          score: winnerPlayer.score,
          correct: winnerPlayer.score > 0,
        });
      }
    }
    return { code: room.code, ...roomState };
  }

  @SubscribeMessage(EVENTS.ASK_QUESTION)
  async handleAskQuestion(
    @MessageBody() data: { question: Question },
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.roomsService.getRoomForSocket(
      client.id,
      client.data.roomCode,
    );
    const role = this.roomsService.getPlayerRole(room, client.id);
    if (!role || room.currentTurn !== role)
      throw new Error('Não é a vez deste jogador');
    const target = this.roomsService.getActiveOpponentGraph(room, role);
    if (!target) throw new Error('Grafo não encontrado');
    const answer = answerQuestion(target.properties, data.question);
    const filterResult = this.roomsService.filterOpponentGraphs(
      room,
      role,
      data.question,
      answer,
    );
    const updatedRoom = await this.roomsService.recordQuestion(room, {
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
    const room = await this.roomsService.getRoomForSocket(
      client.id,
      client.data.roomCode,
    );
    const role = this.roomsService.getPlayerRole(room, client.id);
    if (!role || room.currentTurn !== role)
      throw new Error('Não é a vez deste jogador');
    const player = room.players[role === 'player1' ? 0 : 1];
    const opponent = room.players[role === 'player1' ? 1 : 0];
    const target = this.roomsService.getActiveOpponentGraph(room, role);
    if (!player || !opponent || !target) {
      throw new Error('Grafo não encontrado');
    }
    const correct = target.graph.id === data.guessedGraphId;
    if (correct) player.score += 1;
    const winner = correct ? role : role === 'player1' ? 'player2' : 'player1';
    const winnerPlayer = correct ? player : opponent;
    room.status = 'FINISHED';
    room.currentTurn = winner;
    this.server.to(room.code).emit(EVENTS.GAME_OVER, {
      winner,
      winnerName: winnerPlayer.username,
      score: correct ? player.score : opponent.score,
      correct,
    });
    await this.roomsService.saveRoom(room);
    return { correct, finished: true, score: player.score };
  }

  @SubscribeMessage(EVENTS.REMATCH)
  async handleRematch(@ConnectedSocket() client: Socket) {
    const room = await this.roomsService.getRoomForSocket(
      client.id,
      client.data.roomCode,
    );
    const role = this.roomsService.getPlayerRole(room, client.id);
    if (!role) throw new Error('Jogador não pertence à sala');
    const bothVoted = await this.roomsService.requestRematch(room.code, role);
    if (!bothVoted) {
      this.server
        .to(room.code)
        .emit(EVENTS.ROOM_UPDATED, { rematchRequestedBy: role });
      return { accepted: false, status: 'WAITING_FOR_REMATCH' };
    }
    try {
      const hand = this.graphGenerator.generateHand().map((graph) => ({
        graph,
        properties: this.graphProperties.computeAll(graph),
      }));
      await this.roomsService.assignHands(room.code, hand);
    } catch {
      // A sala continua FINISHED com os dois votos já contados — o
      // próximo clique em "revanche" tenta gerar a mão de novo sem exigir
      // voto de novo. Isso nunca deixa a sala IN_PROGRESS sem mão, e o ack
      // sempre responde (nunca mais trava em timeout por exceção).
      return { accepted: false, status: 'FINISHED' };
    }
    const restartedRoom = await this.roomsService.finishRematchReset(room.code);
    const sharedHand = restartedRoom.hand.map(({ graph }) => graph);
    for (const [index, player] of restartedRoom.players.entries()) {
      if (!player) continue;
      this.server.to(player.socketId).emit(EVENTS.OPPONENT_JOINED, {
        status: restartedRoom.status,
        hand: sharedHand,
        yourGraphId: player.secretGraphId,
        currentTurn: restartedRoom.currentTurn,
        questionLog: restartedRoom.questionLog,
        rematchRequestedBy: null,
        yourRole: index === 0 ? 'player1' : 'player2',
      });
    }
    return { accepted: true, status: restartedRoom.status };
  }

  @SubscribeMessage(EVENTS.CLOSE_ROOM)
  async handleCloseRoom(@ConnectedSocket() client: Socket) {
    const room = await this.roomsService.getRoomForSocket(
      client.id,
      client.data.roomCode,
    );
    await this.roomsService.removeRoom(room.code);
    this.server.to(room.code).emit(EVENTS.ROOM_CLOSED);
    return { closed: true };
  }

  /**
   * Não remove o jogador na hora — um reload de página também dispara
   * disconnect. Espera uma folga pro cliente reconectar e mandar
   * RESUME_ROOM; só remove de verdade se o socket ainda estiver "velho"
   * depois da espera (removePlayer só acha o jogador pelo socketId antigo,
   * então se o resume já trocou o socketId, isso vira um no-op).
   */
  async handleDisconnect(client: Socket): Promise<void> {
    const staleSocketId = client.id;
    setTimeout(() => {
      void this.finalizeDisconnect(staleSocketId);
    }, RoomsGateway.RECONNECT_GRACE_MS);
  }

  private async finalizeDisconnect(staleSocketId: string): Promise<void> {
    const code = await this.roomsService.removePlayer(staleSocketId);
    if (code)
      this.server
        .to(code)
        .emit(EVENTS.ROOM_UPDATED, { status: 'WAITING_FOR_PLAYER' });
  }
}
