import { Test } from '@nestjs/testing';
import { GraphPropertiesService } from './graph-properties.service';
import { Graph } from './interfaces/graph.interface';

describe('GraphPropertiesService', () => {
  let service: GraphPropertiesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GraphPropertiesService],
    }).compile();
    service = moduleRef.get(GraphPropertiesService);
  });

  it('detecta corretamente um triângulo (ciclo ímpar)', () => {
    const graph: Graph = {
      id: 'triangle',
      vertexCount: 3,
      edges: [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
    };

    expect(service.computeAll(graph)).toEqual({
      isConnected: true,
      isBipartite: false,
      hasCycle: true,
      isTree: false,
      hasBridge: false,
      maxDegree: 2,
      minDegree: 2,
    });
  });

  it('detecta corretamente um caminho simples (árvore)', () => {
    const graph: Graph = {
      id: 'path',
      vertexCount: 4,
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
      ],
    };

    expect(service.computeAll(graph)).toEqual({
      isConnected: true,
      isBipartite: true,
      hasCycle: false,
      isTree: true,
      hasBridge: true,
      maxDegree: 2,
      minDegree: 1,
    });
  });

  it('detecta grafo desconexo', () => {
    const graph: Graph = {
      id: 'disconnected',
      vertexCount: 4,
      edges: [
        [0, 1],
        [2, 3],
      ],
    };

    expect(service.computeAll(graph)).toEqual({
      isConnected: false,
      isBipartite: true,
      hasCycle: false,
      isTree: false,
      hasBridge: true,
      maxDegree: 1,
      minDegree: 1,
    });
  });

  it('detecta ciclo par como bipartido', () => {
    const graph: Graph = {
      id: 'even-cycle',
      vertexCount: 4,
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
    };

    expect(service.computeAll(graph)).toEqual({
      isConnected: true,
      isBipartite: true,
      hasCycle: true,
      isTree: false,
      hasBridge: false,
      maxDegree: 2,
      minDegree: 2,
    });
  });
});
