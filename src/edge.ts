
export enum EdgeType {
    StartNode = 'start-node',
    EndNode = 'end-node',
    Wall = 'wall-node',
    Default = 'basic-node',
    Visited = 'visited-node',
    Path = 'path-node'
}

export class Edge {
    public gVal: number = 0;
    constructor(public row: number, public col: number, public type: EdgeType, public element: HTMLTableCellElement) {}
}
