import { GraphDTO } from '@/types/graph';

interface GraphVisualizationProps {
  graph: GraphDTO;
}

/**
 * Desenho simples do grafo: vértices dispostos em círculo regular,
 * arestas como linhas retas entre eles. Suficiente pro MVP — nada de
 * layout força-dirigida ainda.
 * TODO:
 * 1. calcular posição de cada vértice num círculo de raio R:
 *    const angle = (2 * Math.PI * i) / graph.vertexCount;
 *    const x = cx + R * Math.cos(angle); const y = cy + R * Math.sin(angle);
 * 2. renderizar um <svg> com <line> pra cada aresta e <circle> pra cada vértice.
 */
export function GraphVisualization({ graph }: GraphVisualizationProps) {
  return <svg viewBox="0 0 300 300">{/* TODO */}</svg>;
}
