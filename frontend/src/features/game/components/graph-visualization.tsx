import { GraphDTO } from '@/types/graph';

interface GraphVisualizationProps {
  graph: GraphDTO;
  graphNumber?: number;
}

/** Draws vertices around a circle and connects them with straight edges. */
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
