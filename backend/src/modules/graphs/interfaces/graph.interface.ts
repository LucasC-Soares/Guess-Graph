export interface Graph {
  id: string;
  vertexCount: number;
  edges: [number, number][];
}

export interface GraphProperties {
  isConnected: boolean;
  isBipartite: boolean;
  hasCycle: boolean;
  isTree: boolean;
  hasBridge: boolean;
  maxDegree: number;
  minDegree: number;
}

export interface GraphWithProperties {
  graph: Graph;
  properties: GraphProperties;
}
