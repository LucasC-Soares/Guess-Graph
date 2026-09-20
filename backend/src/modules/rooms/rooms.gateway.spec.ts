import { Socket } from 'socket.io';
import { GraphGeneratorService } from '../graphs/graph-generator.service';
import { GraphPropertiesService } from '../graphs/graph-properties.service';
import { QuestionType } from '../questions/question-catalog';
import { RoomsGateway } from './rooms.gateway';
import { RoomsService } from './rooms.service';
import { RoomStore } from './redis-room-store';
import { Room } from './interfaces/room.interface';

describe('RoomsGateway', () => {
  const graphProperties = {
    isConnected: true,
    isBipartite: true,
    hasCycle: false,
    isTree: true,
    hasBridge: true,
    maxDegree: 1,
    minDegree: 1,
  };
  let gateway: RoomsGateway;
  let roomsService: RoomsService;
  let emit: jest.Mock;
  let server: { to: jest.Mock };
  let rooms: Map<string, Room>;

  const socket = (id: string) => ({
    id,
    join: jest.fn().mockResolvedValue(undefined),
    data: {},
  }) as unknown as Socket;

  beforeEach(() => {
    rooms = new Map();
    const store: RoomStore = {
      exists: async (code) => rooms.has(code),
      get: async (code) => rooms.get(code),
      set: async (room) => { rooms.set(room.code, room); },
      delete: async (code) => { rooms.delete(code); },
      listCodes: async () => [...rooms.keys()],
    };
    roomsService = new RoomsService(store);
    const graphGenerator = {
      generateBatch: jest.fn().mockImplementation((_count: number, _vertexCount: number) => [{
        id: `graph-${Math.random()}`,
        vertexCount: 2,
        edges: [[0, 1]],
      }]),
    } as unknown as GraphGeneratorService;
    const propertiesService = {
      computeAll: jest.fn().mockReturnValue(graphProperties),
    } as unknown as GraphPropertiesService;
    emit = jest.fn();
    server = { to: jest.fn().mockReturnValue({ emit }) };
    gateway = new RoomsGateway(roomsService, graphGenerator, propertiesService);
    gateway.server = server as never;
  });

  it('sends only opaque references when the game starts', async () => {
    const host = socket('socket-1');
    const guest = socket('socket-2');
    const { code } = await gateway.handleCreateRoom({ username: 'Alice' }, host);
    await gateway.handleJoinRoom({ code, username: 'Bob' }, guest);

    expect(emit).toHaveBeenCalledTimes(2);
    const firstPayload = emit.mock.calls[0][1];
    expect(firstPayload).not.toHaveProperty('code');
    expect(firstPayload).not.toHaveProperty('opponentHand');
    expect(firstPayload).not.toHaveProperty('graph');
    expect(firstPayload).not.toHaveProperty('edges');
  });

  it('answers a question using the room associated with the socket', async () => {
    const host = socket('socket-1');
    const guest = socket('socket-2');
    const { code } = await gateway.handleCreateRoom({ username: 'Alice' }, host);
    await gateway.handleJoinRoom({ code, username: 'Bob' }, guest);
    emit.mockClear();
    const room = await roomsService.getRoom(code);
    const result = await gateway.handleAskQuestion(
      { question: { type: QuestionType.IS_TREE } },
      host,
    );

    expect(result).toEqual({ answer: true, currentTurn: 'player2' });
    expect(emit).toHaveBeenCalledWith('game:question-answered', expect.objectContaining({
      question: { type: QuestionType.IS_TREE },
      answer: true,
      currentTurn: 'player2',
    }));
  });
});
