
export enum EdgeType {
    StartNode = 'start-node',
    EndNode = 'end-node',
    Wall = 'wall',
    Default = 'default',
}

export class Edge {
    constructor(public row: number, public col: number, public type: EdgeType) {}
}
