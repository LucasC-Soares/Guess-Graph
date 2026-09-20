import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Graph } from './interfaces/graph.interface';

/**
 * Gera grafos aleatórios simples pra popular a "mão" de cada jogador.
 * Mantenha isso determinístico o suficiente pra dar variedade de
 * propriedades (não adianta gerar 5 grafos todos conexos, por exemplo).
 */
@Injectable()
export class GraphGeneratorService {
  static readonly HAND_SIZE = 12;
  static readonly MIN_HAND_VERTEX_COUNT = 3;
  static readonly MAX_HAND_VERTEX_COUNT = 20;

  generateHand(): Graph[] {
    return Array.from({ length: GraphGeneratorService.HAND_SIZE }, () => {
      const vertexCount = GraphGeneratorService.MIN_HAND_VERTEX_COUNT
        + Math.floor(Math.random() * (
          GraphGeneratorService.MAX_HAND_VERTEX_COUNT
          - GraphGeneratorService.MIN_HAND_VERTEX_COUNT
          + 1
        ));
      return this.generateBatch(1, vertexCount)[0];
    });
  }

  /**
   * Gera `count` grafos aleatórios com `vertexCount` vértices cada.
   */
  generateBatch(count: number, vertexCount: number): Graph[] {
    if (!Number.isInteger(count) || count < 0 || !Number.isInteger(vertexCount) || vertexCount < 1) {
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
      return { id: randomUUID(), vertexCount, edges };
    });
  }
}
