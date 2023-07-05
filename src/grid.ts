import { Edge, EdgeType } from './edge';
import { dijkstra } from './algorithms';

export class Grid {
    private nodes: Edge[][] = [];
    private startNode!: number[];
    private endNode!: number[];
    private gridAnimated: boolean = false;

    private draggingNode: Edge | undefined;
    private draggingType!: EdgeType;

    constructor(public rows: number, public cols: number) {
        this.calculateSpecialNode();
        this.handleNodeDrag = this.handleNodeDrag.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.initialize(rows, cols);
    }

    calculateSpecialNode() {
        const startNodeCol = Math.round(this.cols * 0.25);
        const endNodeCol = Math.round(this.cols * 0.72);
        const nodeRow = Math.round(this.rows / 2);
        this.startNode = [nodeRow, startNodeCol];
        this.endNode = [nodeRow, endNodeCol];
    }

    initialize(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.nodes = [];
        if (this.startNode[0] > rows || this.startNode[1] > cols || this.endNode[0] > rows || this.endNode[1] > cols) {
            this.calculateSpecialNode();
        }
        const container = document.getElementById('container');
        if (!container) return;
        const existingTable = container.querySelector('table');
        if (existingTable) {
            container.innerHTML = '';
        }
        const board = document.createElement('table');
        const boardBody = document.createElement('tbody');
        board.appendChild(boardBody);
        container.appendChild(board);


        for (let row = 0; row < this.rows; row++) {
            this.nodes[row] = [];
            const tableRow = document.createElement('tr');
            tableRow.classList.add(`${row}`);
            for (let col = 0; col < this.cols; col++) {
                const nodeElement = document.createElement('td');
                nodeElement.id = `${row}-${col}`;
                nodeElement.className = EdgeType.Default;
                if (row == this.startNode[0] && col == this.startNode[1]) {
                    nodeElement.className = EdgeType.StartNode;
                    this.nodes[row][col] = new Edge(row, col, EdgeType.StartNode, nodeElement);
                    this.startNode = [row, col];
                    tableRow.appendChild(nodeElement);
                    nodeElement.addEventListener('mousedown', this.handleNodeDrag.bind(null, this.nodes[row][col]));
                    continue;
                }

                if (row == this.endNode[0] && col == this.endNode[1]) {
                    nodeElement.className = EdgeType.EndNode;
                    this.nodes[row][col] = new Edge(row, col, EdgeType.EndNode, nodeElement);
                    this.endNode = [row, col];
                    tableRow.appendChild(nodeElement);
                    nodeElement.addEventListener('mousedown', this.handleNodeDrag.bind(null, this.nodes[row][col]));
                    continue;
                }
                this.nodes[row][col] = new Edge(row, col, EdgeType.Default, nodeElement);
                tableRow.appendChild(nodeElement);
            }
            boardBody.appendChild(tableRow);
        }
    }

    animateNodes(): void {
        this.gridAnimated = true;
        const result = dijkstra(this);
        result.expandedNodes.forEach((node, index) => {
            setTimeout(() => {
                node.element.classList.add(EdgeType.Visited);
            }, index * 50);
        })

        result.path.forEach((node, index) => {
            setTimeout(() => {
                node.element.classList.remove(EdgeType.Visited);
                node.element.classList.add(EdgeType.Path);
            }, (result.expandedNodes.length + index) * 50);
        });
    }


    handleNodeDrag(node: Edge, _: MouseEvent): void {
        this.draggingNode = node;
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseMove(event: MouseEvent): void {
        if (!this.draggingNode) return;

        const newSpecialNode = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
        if (!newSpecialNode || !newSpecialNode.classList.contains(EdgeType.Default)) return;

        const [newRow, newCol] = newSpecialNode.id.split('-').map(Number);
        const newNode = this.getNode(newRow, newCol);
        if (!newNode || newNode.type !== EdgeType.Default) return;

        const previousNodeElement = this.draggingNode.element;
        previousNodeElement.className = EdgeType.Default;

        this.draggingType = this.draggingNode.type;
        if (this.draggingType === EdgeType.StartNode) {
            this.setStartNode(newRow, newCol);
        } else if (this.draggingType === EdgeType.EndNode) {
            this.setEndNode(newRow, newCol);
        }
        this.draggingNode.type = EdgeType.Default
        this.draggingNode = newNode;
        this.draggingNode.type = this.draggingType

        newSpecialNode.className = this.draggingType;
    }

    handleMouseUp(): void {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);

        // add event listener to new special node
        if (!this.draggingNode) return;
        const nodeElement = document.getElementById(`${this.draggingNode.row}-${this.draggingNode.col}`)
        if (nodeElement) {
            nodeElement.addEventListener('mousedown', this.handleNodeDrag.bind(null, this.nodes[this.draggingNode.row][this.draggingNode.col]))
            this.draggingNode = undefined;
        }
    }

    cost(x: number, y: number): number {
        if (x == 0 || y == 0) {
            return 1;
        }
        return 1.5;
    }

    isValidPair(x: number, y: number): boolean {
        if (x < 0 || y < 0) {
            return false;
        }

        if (x >= this.rows || y >= this.cols) {
            return false;
        }

        return true;
    }

    successors(node: Edge): Edge[] {
        const children = [];
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                var x = node.row + i;
                var y = node.col + j;
                if (this.isValidPair(x, y)) {
                    this.nodes[x][y].gVal = this.nodes[x][y].gVal + this.cost(i, j);
                    children.push(this.nodes[x][y]);
                }
            }
        }
        return children;
    }


    getNode(row: number, col: number): Edge | undefined {
        return this.nodes[row] && this.nodes[row][col];
    }

    setStartNode(row: number, col: number) {
        this.startNode = [row, col];
    }

    setEndNode(row: number, col: number) {
        this.endNode = [row, col];
    }
    getStartNode(): Edge {
        return this.nodes[this.startNode[0]][this.startNode[1]];
    }

    getEndNode(): Edge {
        return this.nodes[this.endNode[0]][this.endNode[1]];
    }

}

