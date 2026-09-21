import { RoomsService } from './rooms.service';
import { RoomStore } from './redis-room-store';
import { Room } from './interfaces/room.interface';
import { QuestionType } from '../questions/question-catalog';

describe('RoomsService', () => {
  let service: RoomsService;
  let rooms: Map<string, Room>;

  beforeEach(() => {
    rooms = new Map();
    const store: RoomStore = {
      exists: async (code) => rooms.has(code),
      get: async (code) => rooms.get(code),
      set: async (room) => {
        rooms.set(room.code, room);
      },
      delete: async (code) => {
        rooms.delete(code);
      },
      listCodes: async () => [...rooms.keys()],
    };
    service = new RoomsService(store);
  });

  it('creates a waiting room with the host as player1', async () => {
    const code = await service.createRoom(' Alice ', 'socket-1');
    const room = await service.getRoom(code);
    expect(code).toMatch(/^[A-Z2-9]{5}$/);
    expect(room.status).toBe('WAITING_FOR_PLAYER');
    expect(room.players[0]).toMatchObject({
      username: 'Alice',
      socketId: 'socket-1',
    });
    expect(room.players[1]).toBeNull();
  });

  it('increases the code length after a collision', async () => {
    rooms.set('AAAAAAAAA'.slice(0, 5), {} as Room);
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    await expect(service.generateRoomCode()).resolves.toBe('AAAAAA');

    randomSpy.mockRestore();
  });

  it('rejects a missing username without throwing a TypeError', async () => {
    await expect(
      service.createRoom(undefined as unknown as string, 'socket-1'),
    ).rejects.toThrow('Nome de usuário é obrigatório');
  });

  it('joins a room once and rejects a third player', async () => {
    const code = await service.createRoom('Alice', 'socket-1');
    await service.joinRoom(code, 'Bob', 'socket-2');
    expect((await service.getRoom(code)).status).toBe('IN_PROGRESS');
    await expect(service.joinRoom(code, 'Carol', 'socket-3')).rejects.toThrow(
      'cheia',
    );
  });

  it('assigns hands and alternates the turn when recording a question', async () => {
    const code = await service.createRoom('Alice', 'socket-1');
    await service.joinRoom(code, 'Bob', 'socket-2');
    const graph = {
      id: 'graph-1',
      vertexCount: 2,
      edges: [[0, 1]] as [number, number][],
    };
    const properties = {
      isConnected: true,
      isBipartite: true,
      hasCycle: false,
      isTree: true,
      hasBridge: true,
      maxDegree: 1,
      minDegree: 1,
    };
    await service.assignHands(code, [{ graph, properties }], []);
    const room = await service.recordQuestion(code, {
      askedBy: 'player1',
      question: { type: QuestionType.IS_TREE },
      answer: true,
      eliminatedGraphIds: [],
      remainingGraphIds: ['graph-1'],
    });
    expect(room.players[0]?.hand).toHaveLength(1);
    expect(room.questionLog).toHaveLength(1);
    expect(room.currentTurn).toBe('player2');
  });

  it('removes a disconnected player and the room after both leave', async () => {
    const code = await service.createRoom('Alice', 'socket-1');
    await service.joinRoom(code, 'Bob', 'socket-2');
    expect(await service.removePlayer('socket-1')).toBe(code);
    expect((await service.getRoom(code)).status).toBe('WAITING_FOR_PLAYER');
    await service.removePlayer('socket-2');
    await expect(service.getRoom(code)).rejects.toThrow('não encontrada');
  });

  it('restarts a rematch only after both players agree', async () => {
    const code = await service.createRoom('Alice', 'socket-1');
    await service.joinRoom(code, 'Bob', 'socket-2');
    const room = await service.getRoom(code);
    room.status = 'FINISHED';
    await service.saveRoom(room);

    expect(await service.requestRematch(code, 'player1')).toBe(false);
    expect((await service.getRoom(code)).status).toBe('FINISHED');
    expect(await service.requestRematch(code, 'player2')).toBe(true);
    const restartedRoom = await service.getRoom(code);
    expect(restartedRoom.status).toBe('IN_PROGRESS');
    expect(restartedRoom.rematchVotes).toEqual([]);
    expect(restartedRoom.questionLog).toEqual([]);
  });
});
