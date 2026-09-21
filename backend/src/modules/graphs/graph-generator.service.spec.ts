import { GraphGeneratorService } from './graph-generator.service';

describe('GraphGeneratorService', () => {
  it('gera maos com vertices entre os limites definidos', () => {
    const service = new GraphGeneratorService();
    const hand = service.generateHand();

    expect(hand).toHaveLength(GraphGeneratorService.HAND_SIZE);
    expect(
      hand.every(
        ({ vertexCount }) =>
          vertexCount >= GraphGeneratorService.MIN_HAND_VERTEX_COUNT &&
          vertexCount <= GraphGeneratorService.MAX_HAND_VERTEX_COUNT,
      ),
    ).toBe(true);
  });
});
