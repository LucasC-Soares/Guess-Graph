import { Injectable } from '@nestjs/common';
import { GraphWithProperties } from '../graphs/interfaces/graph.interface';
import { PlayerState, QuestionLogEntry, Room } from './interfaces/room.interface';

/**
 * Estado do jogo em memória — suficiente pro MVP (uma instância do servidor).
 * TODO: se precisar escalar horizontalmente no futuro, migrar esse Map pra
 * Redis (não é necessário agora, e adicionaria complexidade sem necessidade).
 */
@Injectable()
export class RoomsService {
  private rooms = new Map<string, Room>();
  private readonly codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  /** Gera um código curto e fácil de compartilhar (ex: 4-6 letras maiúsculas). */
  generateRoomCode(): string {
    do {
      let code = '';
      for (let index = 0; index < 5; index += 1) {
        code += this.codeAlphabet[Math.floor(Math.random() * this.codeAlphabet.length)];
      }
      if (!this.rooms.has(code)) return code;
    } while (true);
  }

  createRoom(username: string, socketId: string): string {
    const code = this.generateRoomCode();
    const room: Room = {
      code,
      status: 'WAITING_FOR_PLAYER',
      players: [this.createPlayer(username, socketId), null],
      currentTurn: 'player1',
      questionLog: [],
    };
    this.rooms.set(code, room);
    return code;
  }

  joinRoom(code: string, username: string, socketId: string): Room {
    const room = this.getRoom(code);
    if (room.status !== 'WAITING_FOR_PLAYER' || room.players[1]) {
      throw new Error('A sala já está cheia ou em andamento');
    }
    room.players[1] = this.createPlayer(username, socketId);
    room.status = 'IN_PROGRESS';
    return room;
  }

  getRoom(code: string): Room {
    const normalizedCode = code.trim().toUpperCase();
    const room = this.rooms.get(normalizedCode);
    if (!room) throw new Error('Sala não encontrada');
    return room;
  }

  assignHands(code: string, player1Graphs: GraphWithProperties[], player2Graphs: GraphWithProperties[]): Room {
    const room = this.getRoom(code);
    if (!room.players[0] || !room.players[1]) {
      throw new Error('A sala precisa de dois jogadores para receber as mãos');
    }
    room.players[0].hand = player1Graphs;
    room.players[1].hand = player2Graphs;
    return room;
  }

  recordQuestion(code: string, entry: QuestionLogEntry): Room {
    const room = this.getRoom(code);
    room.questionLog.push(entry);
    room.currentTurn = room.currentTurn === 'player1' ? 'player2' : 'player1';
    return room;
  }

  removeRoom(code: string): void {
    this.rooms.delete(code.trim().toUpperCase());
  }

  removePlayer(socketId: string): string | undefined {
    for (const [code, room] of this.rooms) {
      const playerIndex = room.players.findIndex((player) => player?.socketId === socketId);
      if (playerIndex === -1) continue;
      room.players[playerIndex] = null;
      if (!room.players[0] && !room.players[1]) this.rooms.delete(code);
      else room.status = 'WAITING_FOR_PLAYER';
      return code;
    }
    return undefined;
  }

  getPlayerRole(room: Room, socketId: string): 'player1' | 'player2' | undefined {
    if (room.players[0]?.socketId === socketId) return 'player1';
    if (room.players[1]?.socketId === socketId) return 'player2';
    return undefined;
  }

  private createPlayer(username: string, socketId: string): PlayerState {
    if (!username.trim() || !socketId.trim()) throw new Error('Nome e socket são obrigatórios');
    return { username: username.trim(), socketId, hand: [], score: 0, guessedGraphIds: [] };
  }
}
