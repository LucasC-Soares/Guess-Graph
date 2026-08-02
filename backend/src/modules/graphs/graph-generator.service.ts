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
  /**
   * Gera `count` grafos aleatórios com `vertexCount` vértices cada.
   */
  generateBatch(count: number, vertexCount: number): Graph[] {
    // TODO 1: pra cada grafo, decidir uma densidade de arestas aleatória
    //   (ex: probabilidade p entre 0.2 e 0.6 de cada aresta possível existir —
    //   modelo Erdős–Rényi simples é suficiente pro MVP).

    // TODO 2: gerar arestas:
    //   const edges: [number, number][] = [];
    //   for (let i = 0; i < vertexCount; i++) {
    //     for (let j = i + 1; j < vertexCount; j++) {
    //       if (Math.random() < p) edges.push([i, j]);
    //     }
    //   }

    // TODO 3 (importante pra jogabilidade): considere garantir variedade
    //   forçada — ex: de cada leva de N grafos, gerar propositalmente pelo
    //   menos 1 bipartido, 1 com ciclo, 1 árvore — senão o jogo fica repetitivo
    //   ou (pior) as perguntas ficam pouco informativas.

    // TODO 4: return edges.map(...) montando { id: randomUUID(), vertexCount, edges }

    throw new Error('GraphGeneratorService.generateBatch: não implementado ainda');
  }
}
