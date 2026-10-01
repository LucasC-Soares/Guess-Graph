import { Injectable } from '@nestjs/common';
import { Graph, GraphProperties } from './interfaces/graph.interface';

@Injectable()
export class GraphPropertiesService {
  computeAll(graph: Graph): GraphProperties {
    const adj: number[][] = Array.from({ length: graph.vertexCount }, () => []);
    for (const [u, v] of graph.edges) {
      adj[u].push(v);
      adj[v].push(u);
    }

    const isConnected = this.checkConnected(graph, adj);
    const isBipartite = this.checkBipartite(graph, adj);
    const hasCycle = this.checkHasCycle(graph, adj);
    const hasBridge = this.checkHasBridge(graph, adj);

    return {
      isConnected,
      isBipartite,
      hasCycle,
      isTree: isConnected && !hasCycle,
      hasBridge,
      maxDegree: this.computeMaxDegree(graph),
      minDegree: this.computeMinDegree(graph),
    };
  }
  private checkConnected(graph: Graph, adj: number[][]): boolean {
    if (graph.vertexCount <= 1) return true;

    function dfs(v: number, visited: boolean[], adj: number[][]) {
      visited[v] = true;
      for (const neighbor of adj[v]) {
        if (!visited[neighbor]) {
          dfs(neighbor, visited, adj);
        }
      }
    }

    const visited: boolean[] = Array(graph.vertexCount).fill(false);
    dfs(0, visited, adj);

    return visited.every((v) => v);
  }

  private checkBipartite(graph: Graph, adj: number[][]): boolean {
    if (graph.vertexCount <= 1) return true;

    function bfs(start: number, colors: number[], adj: number[][]): boolean {
      const queue: number[] = [start];
      colors[start] = 0;

      while (queue.length > 0) {
        const v = queue.shift()!;
        for (const neighbor of adj[v]) {
          if (colors[neighbor] === -1) {
            colors[neighbor] = 1 - colors[v];
            queue.push(neighbor);
          } else if (colors[neighbor] === colors[v]) {
            return false;
          }
        }
      }
      return true;
    }

    const colors: number[] = Array(graph.vertexCount).fill(-1);

    for (let i = 0; i < graph.vertexCount; i++) {
      if (colors[i] === -1) {
        if (!bfs(i, colors, adj)) {
          return false;
        }
      }
    }

    return true;
  }

  private checkHasCycle(graph: Graph, adj: number[][]): boolean {
    if (graph.vertexCount <= 1) return false;

    function dfs(
      v: number,
      parent: number,
      visited: boolean[],
      adj: number[][],
    ): boolean {
      visited[v] = true;
      for (const neighbor of adj[v]) {
        if (!visited[neighbor]) {
          if (dfs(neighbor, v, visited, adj)) {
            return true;
          }
        } else if (neighbor !== parent) {
          return true;
        }
      }
      return false;
    }

    const visited: boolean[] = Array(graph.vertexCount).fill(false);

    for (let i = 0; i < graph.vertexCount; i++) {
      if (!visited[i]) {
        if (dfs(i, -1, visited, adj)) {
          return true;
        }
      }
    }

    return false;
  }

  private checkHasBridge(graph: Graph, adj: number[][]): boolean {
    if (graph.vertexCount <= 1) return false;

    function dfs(
      v: number,
      parent: number,
      visited: boolean[],
      tin: number[],
      low: number[],
      timer: { value: number },
      adj: number[][],
    ): boolean {
      visited[v] = true;
      tin[v] = low[v] = timer.value++;
      for (const neighbor of adj[v]) {
        if (neighbor === parent) continue;
        if (!visited[neighbor]) {
          if (dfs(neighbor, v, visited, tin, low, timer, adj)) {
            return true;
          }
          low[v] = Math.min(low[v], low[neighbor]);
          if (low[neighbor] > tin[v]) {
            return true;
          }
        } else {
          low[v] = Math.min(low[v], tin[neighbor]);
        }
      }
      return false;
    }

    const visited: boolean[] = Array(graph.vertexCount).fill(false);
    const tin: number[] = Array(graph.vertexCount).fill(-1);
    const low: number[] = Array(graph.vertexCount).fill(-1);
    const timer = { value: 0 };

    for (let i = 0; i < graph.vertexCount; i++) {
      if (!visited[i]) {
        if (dfs(i, -1, visited, tin, low, timer, adj)) {
          return true;
        }
      }
    }

    return false;
  }

  private computeMaxDegree(graph: Graph): number {
    if (graph.vertexCount <= 1) return 0;

    const degree: number[] = Array(graph.vertexCount).fill(0);
    for (const [u, v] of graph.edges) {
      degree[u]++;
      degree[v]++;
    }

    return Math.max(...degree);
  }

  private computeMinDegree(graph: Graph): number {
    if (graph.vertexCount <= 1) return 0;

    const degree: number[] = Array(graph.vertexCount).fill(0);
    for (const [u, v] of graph.edges) {
      degree[u]++;
      degree[v]++;
    }

    return Math.min(...degree);
  }
}
