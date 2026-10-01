import { Injectable } from '@nestjs/common';
import { Graph } from './interfaces/graph.interface';
import { GraphPropertiesService } from './graph-properties.service';

@Injectable()
export class GraphGeneratorService {
  static readonly HAND_SIZE = 12;
  static readonly MIN_HAND_VERTEX_COUNT = 3;
  static readonly MAX_HAND_VERTEX_COUNT = 10;
  private static readonly MAX_UNIQUE_ATTEMPTS = 200;

  constructor(
    private readonly graphPropertiesService: GraphPropertiesService,
  ) {}

  generateHand(): Graph[] {
    const seenSignatures = new Set<string>();
    const hand: Graph[] = [];

    while (hand.length < GraphGeneratorService.HAND_SIZE) {
      const graph = this.generateWithUniqueSignature(seenSignatures);
      seenSignatures.add(this.computeSignature(graph));
      hand.push(graph);
    }

    return hand;
  }

  private randomHandVertexCount(): number {
    return (
      GraphGeneratorService.MIN_HAND_VERTEX_COUNT +
      Math.floor(
        Math.random() *
          (GraphGeneratorService.MAX_HAND_VERTEX_COUNT -
            GraphGeneratorService.MIN_HAND_VERTEX_COUNT +
            1),
      )
    );
  }

  private generateWithUniqueSignature(seenSignatures: Set<string>): Graph {
    for (
      let attempt = 0;
      attempt < GraphGeneratorService.MAX_UNIQUE_ATTEMPTS;
      attempt += 1
    ) {
      const vertexCount = this.randomHandVertexCount();
      const [candidate] = this.generateBatch(1, vertexCount);
      if (!seenSignatures.has(this.computeSignature(candidate))) {
        return candidate;
      }
    }
    throw new Error(
      `Não foi possível gerar assinatura única após ${GraphGeneratorService.MAX_UNIQUE_ATTEMPTS} tentativas`,
    );
  }

  private computeSignature(graph: Graph): string {
    const { isConnected, isBipartite, hasCycle, hasBridge, maxDegree } =
      this.graphPropertiesService.computeAll(graph);
    return JSON.stringify([
      isConnected,
      isBipartite,
      hasCycle,
      hasBridge,
      maxDegree,
    ]);
  }

  generateBatch(count: number, vertexCount: number): Graph[] {
    if (
      !Number.isInteger(count) ||
      count < 0 ||
      !Number.isInteger(vertexCount) ||
      vertexCount < 1
    ) {
      throw new Error('count e vertexCount precisam ser inteiros válidos');
    }
    return Array.from({ length: count }, () => {
      const edges: [number, number][] = [];
      const probability = 0.2 + Math.random() * 0.4;
      for (let first = 0; first < vertexCount; first += 1) {
        for (let second = first + 1; second < vertexCount; second += 1) {
          if (Math.random() < probability) edges.push([first, second]);
        }
      }
      return { id: this.generateId(), vertexCount, edges };
    });
  }

  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `${timestamp}-${random}`;
  }
}
