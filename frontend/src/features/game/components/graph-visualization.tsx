import { GraphDTO } from '@/types/graph';

interface GraphVisualizationProps {
  graph: GraphDTO;
  graphNumber?: number;
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
export function GraphVisualization({ graph, graphNumber }: GraphVisualizationProps) {
  const center = 150;
  const radius = Math.max(48, Math.min(112, 108 - graph.vertexCount * 2));
  const points = Array.from({ length: graph.vertexCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / graph.vertexCount - Math.PI / 2;
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
  });
  return <svg aria-label={`Graph ${graphNumber ?? graph.id}`} className="graph-svg" viewBox="0 0 300 300">
    {graph.edges.map(([from, to], index) => <line key={`${from}-${to}-${index}`} x1={points[from]?.x} y1={points[from]?.y} x2={points[to]?.x} y2={points[to]?.y} />)}
    {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={Math.max(4, 8 - graph.vertexCount / 8)} />)}
  </svg>;
}
