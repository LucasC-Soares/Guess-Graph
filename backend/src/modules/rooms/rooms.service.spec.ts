import { RoomsService } from './rooms.service';
import { QuestionType } from '../questions/question-catalog';

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(() => {
    service = new RoomsService();
  });

  it('creates a waiting room with the host as player1', () => {
    const code = service.createRoom(' Alice ', 'socket-1');
    const room = service.getRoom(code);
    expect(code).toMatch(/^[A-Z2-9]{5}$/);
    expect(room.status).toBe('WAITING_FOR_PLAYER');
    expect(room.players[0]).toMatchObject({ username: 'Alice', socketId: 'socket-1' });
    expect(room.players[1]).toBeNull();
  });

  it('joins a room once and rejects a third player', () => {
    const code = service.createRoom('Alice', 'socket-1');
    service.joinRoom(code, 'Bob', 'socket-2');
    expect(service.getRoom(code).status).toBe('IN_PROGRESS');
    expect(() => service.joinRoom(code, 'Carol', 'socket-3')).toThrow('cheia');
  });

  it('assigns hands and alternates the turn when recording a question', () => {
    const code = service.createRoom('Alice', 'socket-1');
    service.joinRoom(code, 'Bob', 'socket-2');
    const graph = { id: 'graph-1', vertexCount: 2, edges: [[0, 1]] as [number, number][] };
    const properties = {
      isConnected: true,
      isBipartite: true,
      hasCycle: false,
      isTree: true,
      hasBridge: true,
      maxDegree: 1,
      minDegree: 1,
    };
    service.assignHands(code, [{ graph, properties }], []);
    const room = service.recordQuestion(code, {
      askedBy: 'player1',
      question: { type: QuestionType.IS_TREE },
      answer: true,
    });
    expect(room.players[0]?.hand).toHaveLength(1);
    expect(room.questionLog).toHaveLength(1);
    expect(room.currentTurn).toBe('player2');
  });

  it('removes a disconnected player and the room after both leave', () => {
    const code = service.createRoom('Alice', 'socket-1');
    service.joinRoom(code, 'Bob', 'socket-2');
    expect(service.removePlayer('socket-1')).toBe(code);
    expect(service.getRoom(code).status).toBe('WAITING_FOR_PLAYER');
    service.removePlayer('socket-2');
    expect(() => service.getRoom(code)).toThrow('não encontrada');
  });
});