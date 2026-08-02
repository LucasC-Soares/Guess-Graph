import { Test } from '@nestjs/testing';
import { GraphPropertiesService } from './graph-properties.service';
import { Graph } from './interfaces/graph.interface';

/**
 * TODO: casos clássicos de grafos pequenos, fáceis de conferir na mão —
 * bom oráculo pra validar cada checagem isoladamente.
 */
describe('GraphPropertiesService', () => {
  let service: GraphPropertiesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GraphPropertiesService],
    }).compile();
    service = moduleRef.get(GraphPropertiesService);
  });

  // TODO: triângulo (0-1, 1-2, 2-0) -> conexo, tem ciclo, NÃO bipartido, sem ponte
  it.todo('detecta corretamente um triângulo (ciclo ímpar)');

  // TODO: caminho 0-1-2-3 -> conexo, árvore, bipartido, todas as arestas são pontes
  it.todo('detecta corretamente um caminho simples (árvore)');

  // TODO: dois componentes desconexos -> isConnected = false
  it.todo('detecta grafo desconexo');

  // TODO: ciclo de tamanho 4 (0-1-2-3-0) -> bipartido, tem ciclo, sem ponte
  it.todo('detecta ciclo par como bipartido');
});
