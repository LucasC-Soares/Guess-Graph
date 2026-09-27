import { Inject, Injectable } from '@nestjs/common';
import { GraphWithProperties } from '../graphs/interfaces/graph.interface';
import {
  PlayerState,
  QuestionLogEntry,
  Room,
} from './interfaces/room.interface';
import { RedisRoomStore, RoomStore } from './redis-room-store';
import { Question, answerQuestion } from '../questions/question-catalog';

/** Estado efêmero das salas, compartilhado entre instâncias via Redis. */
@Injectable()
export class RoomsService {
  private readonly codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  constructor(@Inject(RedisRoomStore) private readonly roomStore: RoomStore) {}

  /** Gera um código curto e aumenta o comprimento se houver colisão. */
  async generateRoomCode(): Promise<string> {
    let codeLength = 5;
    while (true) {
      let code = '';
      for (let index = 0; index < codeLength; index += 1) {
        code +=
          this.codeAlphabet[
            Math.floor(Math.random() * this.codeAlphabet.length)
          ];
      }
      if (!(await this.roomStore.exists(code))) return code;
      codeLength += 1;
    }
  }

  async createRoom(username: string, socketId: string): Promise<string> {
    const code = await this.generateRoomCode();
    const room: Room = {
      code,
      status: 'WAITING_FOR_PLAYER',
      players: [this.createPlayer(username, socketId), null],
      currentTurn: 'player1',
      questionLog: [],
      rematchVotes: [],
      hand: [],
    };
    await this.roomStore.set(room);
    return code;
  }

  async joinRoom(
    code: string,
    username: string,
    socketId: string,
  ): Promise<Room> {
    const room = await this.getRoom(code);
    if (room.status !== 'WAITING_FOR_PLAYER' || room.players[1]) {
      throw new Error('A sala já está cheia ou em andamento');
    }
    room.players[1] = this.createPlayer(username, socketId);
    room.status = 'IN_PROGRESS';
    await this.roomStore.set(room);
    return room;
  }

  /**
   * Reassocia um socket novo (após reload ou reconexão) ao jogador salvo
   * localmente pelo cliente, sem exigir uma nova entrada via JOIN_ROOM.
   */
  async resumePlayer(
    code: string,
    role: 'player1' | 'player2',
    username: string,
    socketId: string,
  ): Promise<Room> {
    const room = await this.getRoom(code);
    const index = role === 'player1' ? 0 : 1;
    const player = room.players[index];
    if (!player || player.username !== username.trim()) {
      throw new Error('Não foi possível retomar a sala');
    }
    player.socketId = socketId;
    await this.roomStore.set(room);
    return room;
  }

  async getRoom(code: string): Promise<Room> {
    const normalizedCode = code.trim().toUpperCase();
    const room = await this.roomStore.get(normalizedCode);
    if (!room) throw new Error('Sala não encontrada');
    return room;
  }

  /**
   * Distribui uma única mão compartilhada pros dois jogadores e sorteia,
   * dentro dela, um grafo secreto diferente pra cada um.
   */
  async assignHands(code: string, hand: GraphWithProperties[]): Promise<Room> {
    const room = await this.getRoom(code);
    if (!room.players[0] || !room.players[1]) {
      throw new Error('A sala precisa de dois jogadores para receber as mãos');
    }
    const [firstSecretIndex, secondSecretIndex] = this.pickDistinctIndices(
      hand.length,
    );
    room.hand = hand;
    room.players[0].secretGraphId = hand[firstSecretIndex].graph.id;
    room.players[1].secretGraphId = hand[secondSecretIndex].graph.id;
    room.players[0].remainingOpponentGraphIds = hand.map(
      ({ graph }) => graph.id,
    );
    room.players[1].remainingOpponentGraphIds = hand.map(
      ({ graph }) => graph.id,
    );
    await this.roomStore.set(room);
    return room;
  }

  /** Sorteia dois índices distintos em [0, size) com distribuição uniforme. */
  private pickDistinctIndices(size: number): [number, number] {
    const first = Math.floor(Math.random() * size);
    let second = Math.floor(Math.random() * (size - 1));
    if (second >= first) second += 1;
    return [first, second];
  }

  /**
   * Recebe o `room` já mutado (por `filterOpponentGraphs`, por exemplo) em
   * vez de buscar uma cópia nova do store — senão a redução de
   * `remainingOpponentGraphIds` feita antes desta chamada se perde e nunca
   * é persistida.
   */
  async recordQuestion(room: Room, entry: QuestionLogEntry): Promise<Room> {
    room.questionLog.push(entry);
    room.currentTurn = room.currentTurn === 'player1' ? 'player2' : 'player1';
    await this.roomStore.set(room);
    return room;
  }

  /**
   * Elimina, dentro da mão compartilhada da sala, os candidatos cuja
   * resposta diverge da resposta real do grafo secreto do oponente.
   * `remainingGraphIds` reflete o total possível na mão compartilhada
   * (global), não uma cópia local recalculada por cliente.
   */
  filterOpponentGraphs(
    room: Room,
    role: 'player1' | 'player2',
    question: Question,
    answer: boolean,
  ): { eliminatedGraphIds: string[]; remainingGraphIds: string[] } {
    const player = room.players[role === 'player1' ? 0 : 1];
    if (!player) throw new Error('Jogador não encontrado');

    const remainingSet = new Set(player.remainingOpponentGraphIds);
    const eliminatedGraphIds = room.hand
      .filter(
        ({ graph, properties }) =>
          remainingSet.has(graph.id) &&
          answerQuestion(properties, question) !== answer,
      )
      .map(({ graph }) => graph.id);
    player.remainingOpponentGraphIds = player.remainingOpponentGraphIds.filter(
      (graphId) => !eliminatedGraphIds.includes(graphId),
    );

    return {
      eliminatedGraphIds,
      remainingGraphIds: player.remainingOpponentGraphIds,
    };
  }

  async removeRoom(code: string): Promise<void> {
    await this.roomStore.delete(code.trim().toUpperCase());
  }

  async removePlayer(socketId: string): Promise<string | undefined> {
    for (const code of await this.roomStore.listCodes()) {
      const room = await this.roomStore.get(code);
      if (!room) continue;
      const playerIndex = room.players.findIndex(
        (player) => player?.socketId === socketId,
      );
      if (playerIndex === -1) continue;
      room.players[playerIndex] = null;
      if (!room.players[0] && !room.players[1])
        await this.roomStore.delete(code);
      else {
        room.status = 'WAITING_FOR_PLAYER';
        await this.roomStore.set(room);
      }
      return code;
    }
    return undefined;
  }

  async getRoomForSocket(socketId: string, roomCode?: string): Promise<Room> {
    if (!roomCode) throw new Error('Socket não está associado a uma sala');
    const room = await this.getRoom(roomCode);
    if (!this.getPlayerRole(room, socketId))
      throw new Error('Socket não pertence à sala');
    return room;
  }

  async saveRoom(room: Room): Promise<void> {
    await this.roomStore.set(room);
  }

  /**
   * A revanche começa com quem venceu a última partida — `currentTurn`
   * já é o vencedor desde `handleMakeGuess`, então basta não sobrescrever.
   */
  async requestRematch(
    code: string,
    role: 'player1' | 'player2',
  ): Promise<boolean> {
    const room = await this.getRoom(code);
    if (room.status !== 'FINISHED')
      throw new Error(
        'A revanche só pode ser solicitada após o fim da partida',
      );
    if (!room.rematchVotes.includes(role)) room.rematchVotes.push(role);
    if (room.rematchVotes.length < 2) {
      await this.roomStore.set(room);
      return false;
    }
    room.status = 'IN_PROGRESS';
    room.questionLog = [];
    room.rematchVotes = [];
    room.hand = [];
    for (const player of room.players) {
      if (!player) continue;
      player.secretGraphId = undefined;
      player.remainingOpponentGraphIds = [];
      player.score = 0;
      player.guessedGraphIds = [];
    }
    await this.roomStore.set(room);
    return true;
  }

  /** Grafo secreto do oponente, dentro da mão compartilhada da sala. */
  getActiveOpponentGraph(
    room: Room,
    role: 'player1' | 'player2',
  ): GraphWithProperties | undefined {
    const opponent = room.players[role === 'player1' ? 1 : 0];
    return room.hand.find(({ graph }) => graph.id === opponent?.secretGraphId);
  }

  getPlayerRole(
    room: Room,
    socketId: string,
  ): 'player1' | 'player2' | undefined {
    if (room.players[0]?.socketId === socketId) return 'player1';
    if (room.players[1]?.socketId === socketId) return 'player2';
    return undefined;
  }

  private createPlayer(username: string, socketId: string): PlayerState {
    if (typeof username !== 'string' || !username.trim()) {
      throw new Error('Nome de usuário é obrigatório');
    }
    if (typeof socketId !== 'string' || !socketId.trim()) {
      throw new Error('Socket é obrigatório');
    }
    return {
      username: username.trim(),
      socketId,
      remainingOpponentGraphIds: [],
      score: 0,
      guessedGraphIds: [],
    };
  }
}
