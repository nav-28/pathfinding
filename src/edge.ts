
// this enum corresponds to the class name defined in styles.css
export enum NodeType {
    StartNode = 'start-node',
    EndNode = 'end-node',
    Wall = 'wall-node',
    Default = 'basic-node',
    Visited = 'visited-node',
    Path = 'path-node'
}

export class Node {
    public gVal: number = 0;
    constructor(public row: number, public col: number, public type: NodeType, public element: HTMLTableCellElement) {}
}
