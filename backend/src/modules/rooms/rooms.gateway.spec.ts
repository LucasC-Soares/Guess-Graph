import { Socket } from 'socket.io';
import { GraphGeneratorService } from '../graphs/graph-generator.service';
import { GraphPropertiesService } from '../graphs/graph-properties.service';
import { QuestionType } from '../questions/question-catalog';
import { RoomsGateway } from './rooms.gateway';
import { RoomsService } from './rooms.service';

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

  const socket = (id: string) => ({
    id,
    join: jest.fn().mockResolvedValue(undefined),
  }) as unknown as Socket;

  beforeEach(() => {
    roomsService = new RoomsService();
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

  it('sends each player only the opponent hand when the game starts', () => {
    const host = socket('socket-1');
    const guest = socket('socket-2');
    const { code } = gateway.handleCreateRoom({ username: 'Alice' }, host);
    gateway.handleJoinRoom({ code, username: 'Bob' }, guest);

    expect(emit).toHaveBeenCalledTimes(2);
    const firstPayload = emit.mock.calls[0][1];
    expect(firstPayload.opponentHand).toHaveLength(1);
    expect(firstPayload.opponentHand[0]).not.toHaveProperty('properties');
    expect(firstPayload.yourRole).toBe('player1');
    expect(emit.mock.calls[1][1].yourRole).toBe('player2');
  });

  it('answers a question from the opponent graph and alternates the turn', () => {
    const host = socket('socket-1');
    const guest = socket('socket-2');
    const { code } = gateway.handleCreateRoom({ username: 'Alice' }, host);
    gateway.handleJoinRoom({ code, username: 'Bob' }, guest);
    emit.mockClear();
    const room = roomsService.getRoom(code);
    const targetGraphId = room.players[1]!.hand[0].graph.id;

    const result = gateway.handleAskQuestion(
      { code, graphId: targetGraphId, question: { type: QuestionType.IS_TREE } },
      host,
    );

    expect(result).toEqual({ answer: true, currentTurn: 'player2' });
    expect(emit).toHaveBeenCalledWith('game:question-answered', expect.objectContaining({
      graphId: targetGraphId,
      answer: true,
      currentTurn: 'player2',
    }));
    expect(() => gateway.handleAskQuestion(
      { code, graphId: targetGraphId, question: { type: QuestionType.IS_TREE } },
      host,
    )).toThrow('Não é a vez');
  });
});