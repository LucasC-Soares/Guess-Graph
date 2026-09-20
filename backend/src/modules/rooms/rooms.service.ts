import { Inject, Injectable } from '@nestjs/common';
import { GraphWithProperties } from '../graphs/interfaces/graph.interface';
import { PlayerState, QuestionLogEntry, Room } from './interfaces/room.interface';
import { RedisRoomStore, RoomStore } from './redis-room-store';
import { randomUUID } from 'node:crypto';

/** Estado efêmero das salas, compartilhado entre instâncias via Redis. */
@Injectable()
export class RoomsService {
  private readonly codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  constructor(@Inject(RedisRoomStore) private readonly roomStore: RoomStore) {}

  /** Gera um código curto e fácil de compartilhar (ex: 4-6 letras maiúsculas). */
  async generateRoomCode(): Promise<string> {
    do {
      let code = '';
      for (let index = 0; index < 5; index += 1) {
        code += this.codeAlphabet[Math.floor(Math.random() * this.codeAlphabet.length)];
      }
      if (!(await this.roomStore.exists(code))) return code;
    } while (true);
  }

  async createRoom(username: string, socketId: string): Promise<string> {
    const code = await this.generateRoomCode();
    const room: Room = {
      code,
      status: 'WAITING_FOR_PLAYER',
      players: [this.createPlayer(username, socketId), null],
      currentTurn: 'player1',
      questionLog: [],
    };
    await this.roomStore.set(room);
    return code;
  }

  async joinRoom(code: string, username: string, socketId: string): Promise<Room> {
    const room = await this.getRoom(code);
    if (room.status !== 'WAITING_FOR_PLAYER' || room.players[1]) {
      throw new Error('A sala já está cheia ou em andamento');
    }
    room.players[1] = this.createPlayer(username, socketId);
    room.status = 'IN_PROGRESS';
    await this.roomStore.set(room);
    return room;
  }

  async getRoom(code: string): Promise<Room> {
    const normalizedCode = code.trim().toUpperCase();
    const room = await this.roomStore.get(normalizedCode);
    if (!room) throw new Error('Sala não encontrada');
    return room;
  }

  async assignHands(code: string, player1Graphs: GraphWithProperties[], player2Graphs: GraphWithProperties[]): Promise<Room> {
    const room = await this.getRoom(code);
    if (!room.players[0] || !room.players[1]) {
      throw new Error('A sala precisa de dois jogadores para receber as mãos');
    }
    room.players[0].hand = player1Graphs;
    room.players[1].hand = player2Graphs;
    room.players[0].opponentGraphRefs = this.createGraphRefs(player2Graphs);
    room.players[1].opponentGraphRefs = this.createGraphRefs(player1Graphs);
    await this.roomStore.set(room);
    return room;
  }

  async recordQuestion(code: string, entry: QuestionLogEntry): Promise<Room> {
    const room = await this.getRoom(code);
    room.questionLog.push(entry);
    room.currentTurn = room.currentTurn === 'player1' ? 'player2' : 'player1';
    await this.roomStore.set(room);
    return room;
  }

  async removeRoom(code: string): Promise<void> {
    await this.roomStore.delete(code.trim().toUpperCase());
  }

  async removePlayer(socketId: string): Promise<string | undefined> {
    for (const code of await this.roomStore.listCodes()) {
      const room = await this.roomStore.get(code);
      if (!room) continue;
      const playerIndex = room.players.findIndex((player) => player?.socketId === socketId);
      if (playerIndex === -1) continue;
      room.players[playerIndex] = null;
      if (!room.players[0] && !room.players[1]) await this.roomStore.delete(code);
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
    if (!this.getPlayerRole(room, socketId)) throw new Error('Socket não pertence à sala');
    return room;
  }

  async saveRoom(room: Room): Promise<void> {
    await this.roomStore.set(room);
  }

  getOpponentGraph(room: Room, role: 'player1' | 'player2', targetRef: string): GraphWithProperties | undefined {
    const player = room.players[role === 'player1' ? 0 : 1];
    const opponent = room.players[role === 'player1' ? 1 : 0];
    const graphId = player?.opponentGraphRefs[targetRef];
    return opponent?.hand.find(({ graph }) => graph.id === graphId);
  }

  getPlayerRole(room: Room, socketId: string): 'player1' | 'player2' | undefined {
    if (room.players[0]?.socketId === socketId) return 'player1';
    if (room.players[1]?.socketId === socketId) return 'player2';
    return undefined;
  }

  private createPlayer(username: string, socketId: string): PlayerState {
    if (!username.trim() || !socketId.trim()) throw new Error('Nome e socket são obrigatórios');
    return {
      username: username.trim(),
      socketId,
      hand: [],
      opponentGraphRefs: {},
      score: 0,
      guessedGraphIds: [],
    };
  }

  private createGraphRefs(graphs: GraphWithProperties[]): Record<string, string> {
    return Object.fromEntries(graphs.map(({ graph }) => [randomUUID(), graph.id]));
  }
}
