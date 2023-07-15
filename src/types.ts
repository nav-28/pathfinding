// this enum corresponds to the class name defined in styles.css
export enum NodeType {
  StartNode = "start-node special-node",
  EndNode = "end-node special-node",
  Wall = "wall-node",
  Default = "basic-node",
  Visited = "visited-node",
  Path = "path-node",
}

export class Node {
  public gVal: number = 0;
  constructor(
    public row: number,
    public col: number,
    public type: NodeType,
    public element: HTMLTableCellElement,
  ) {}

  isSpecialNode(): boolean {
    return this.type == NodeType.StartNode || this.type == NodeType.EndNode;
  }

  isWallNode(): boolean {
    return this.type == NodeType.Wall;
  }
}

export interface SearchResult {
  expandedNodes: Node[];
  path: Node[];
}

export enum Algo {
  Dijkstra = "Dijkstra",
  Bfs = "Breath First Search",
  Dfs = "Depth First Search",
  AStar = "A*",
  BiA = "Bidirectional A*",
}

export const AlgoDesc: Record<Algo, string> = {
  [Algo.Dijkstra]: "<b>Dijkstra algorithm</b> is a popular pathfinding algorithm that finds the shortest path between two nodes in a graph",
  [Algo.Bfs]: "<b>Breadth First Search (BFS)</b> is a graph traversal algorithm that explores all the vertices of a graph in breadth-first order",
  [Algo.Dfs]: "<b>Depth First Search (DFS)</b> is a graph traversal algorithm that explores as far as possible along each branch before backtracking",
  [Algo.AStar]: "<b>A* (A-star)</b> algorithm is an informed search algorithm that finds the shortest path between two nodes in a graph",
  [Algo.BiA]: "<b>Bidirectional A*</b> algorithm is an optimized version of A* that searches from both the start and end nodes simultaneously to find the shortest path",
};


export type HeuristicFunc = (nodeA: Node, nodeB: Node) => number;
