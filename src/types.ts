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
}


export type HeuristicFunc = (nodeA: Node, nodeB: Node) => number;
