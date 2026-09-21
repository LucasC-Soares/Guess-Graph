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
    let generatedHand = 0;
    const graphGenerator = {
      generateHand: jest.fn().mockImplementation(() => Array.from({ length: 10 }, (_value, index) => ({
        id: `graph-${generatedHand}-${index}`,
        vertexCount: 2,
        edges: [[0, 1]],
      })).map((graph) => {
        generatedHand += 1;
        return graph;
      })),
    } as unknown as GraphGeneratorService;
    const propertiesService = {
      computeAll: jest.fn().mockReturnValue(graphProperties),
    } as unknown as GraphPropertiesService;
    emit = jest.fn();
    server = { to: jest.fn().mockReturnValue({ emit }) };
    gateway = new RoomsGateway(roomsService, graphGenerator, propertiesService);
    gateway.server = server as never;
  });

  it('sends public opponent graphs without private properties', async () => {
    const host = socket('socket-1');
    const guest = socket('socket-2');
    const { code } = await gateway.handleCreateRoom({ username: 'Alice' }, host);
    await gateway.handleJoinRoom({ code, username: 'Bob' }, guest);

    expect(emit).toHaveBeenCalledTimes(2);
    const firstPayload = emit.mock.calls[0][1];
    expect(firstPayload).not.toHaveProperty('code');
    expect(firstPayload.opponentHand).toHaveLength(10);
    expect(firstPayload.opponentHand[0]).not.toHaveProperty('properties');
    expect(firstPayload.opponentHand[0]).toHaveProperty('edges');
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

    expect(result).toEqual(expect.objectContaining({
      answer: true,
      eliminatedGraphIds: [],
      remainingGraphIds: expect.any(Array),
      remainingCount: 10,
      finished: false,
      currentTurn: 'player2',
    }));
    expect((await roomsService.getRoom(code)).status).toBe('IN_PROGRESS');
    expect(emit).not.toHaveBeenCalledWith('game:over', expect.anything());
    expect(emit).toHaveBeenCalledWith('game:question-answered', expect.objectContaining({
      question: { type: QuestionType.IS_TREE },
      answer: true,
      currentTurn: 'player2',
    }));

    const guessedGraphId = (await roomsService.getRoom(code)).players[0]!.hand[0].graph.id;
    const guess = await gateway.handleMakeGuess({ guessedGraphId }, guest);
    expect(guess).toMatchObject({ correct: true, finished: true });
    expect((await roomsService.getRoom(code)).status).toBe('FINISHED');
  });

  it('ends the game with the opponent as winner after an incorrect guess', async () => {
    const host = socket('socket-1');
    const guest = socket('socket-2');
    const { code } = await gateway.handleCreateRoom({ username: 'Alice' }, host);
    await gateway.handleJoinRoom({ code, username: 'Bob' }, guest);
    emit.mockClear();

    const room = await roomsService.getRoom(code);
    const actualGraphId = room.players[1]!.hand[0].graph.id;
    const result = await gateway.handleMakeGuess({ guessedGraphId: `${actualGraphId}-wrong` }, host);

    expect(result).toEqual({ correct: false, finished: true, score: 0 });
    expect((await roomsService.getRoom(code)).status).toBe('FINISHED');
    expect(emit).toHaveBeenCalledWith('game:over', {
      winner: 'player2',
      winnerName: 'Bob',
      score: 0,
      correct: false,
    });
  });
});
