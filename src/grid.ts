import { Node, NodeType } from "./edge";
import { dijkstra } from "./algorithms";

export class Grid {
  private nodes: Node[][] = [];
  private startNode!: number[];
  private endNode!: number[];
  private gridAnimated: boolean = false;
  private visitedNodes: Node[] = [];
  private pathNodes: Node[] = [];
  private animatationSpeed: number = 50;
  private draggingNode: Node | undefined;
  private draggingType!: NodeType;

  public animationRunning: boolean = false;

  constructor(
    public rows: number,
    public cols: number,
  ) {
    this.calculateSpecialNodesPosition();
    this.handleNodeDrag = this.handleNodeDrag.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.initialize(rows, cols);
  }

  calculateSpecialNodesPosition() {
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
    this.visitedNodes = [];
    this.pathNodes = [];
    this.gridAnimated = false;
    // recalculate special nodes if window is smaller
    if (
      this.startNode[0] > rows ||
      this.startNode[1] > cols ||
      this.endNode[0] > rows ||
      this.endNode[1] > cols
    ) {
      this.calculateSpecialNodesPosition();
    }
    const container = document.getElementById("container");
    if (!container) return;
    const existingTable = container.querySelector("table");
    if (existingTable) {
      container.innerHTML = "";
    }
    const board = document.createElement("table");
    const boardBody = document.createElement("tbody");
    board.appendChild(boardBody);
    container.appendChild(board);

    for (let row = 0; row < this.rows; row++) {
      this.nodes[row] = [];
      const tableRow = document.createElement("tr");
      tableRow.classList.add(`${row}`);
      for (let col = 0; col < this.cols; col++) {
        const nodeElement = document.createElement("td");
        nodeElement.id = `${row}-${col}`;
        nodeElement.className = NodeType.Default;
        if (row == this.startNode[0] && col == this.startNode[1]) {
          nodeElement.className = NodeType.StartNode;
          this.nodes[row][col] = new Node(
            row,
            col,
            NodeType.StartNode,
            nodeElement,
          );
          this.startNode = [row, col];
          tableRow.appendChild(nodeElement);
          nodeElement.addEventListener(
            "mousedown",
            this.handleNodeDrag.bind(null, this.nodes[row][col]),
          );
          nodeElement.addEventListener(
            "touchstart",
            this.handleNodeDrag.bind(null, this.nodes[row][col])
          );
          continue;
        }

        if (row == this.endNode[0] && col == this.endNode[1]) {
          nodeElement.className = NodeType.EndNode;
          this.nodes[row][col] = new Node(
            row,
            col,
            NodeType.EndNode,
            nodeElement,
          );
          this.endNode = [row, col];
          tableRow.appendChild(nodeElement);
          nodeElement.addEventListener(
            "mousedown",
            this.handleNodeDrag.bind(null, this.nodes[row][col]),
          );
          nodeElement.addEventListener('touchstart', this.handleNodeDrag.bind(null, this.nodes[row][col]));
          continue;
        }
        this.nodes[row][col] = new Node(
          row,
          col,
          NodeType.Default,
          nodeElement,
        );
        tableRow.appendChild(nodeElement);
      }
      boardBody.appendChild(tableRow);
    }
  }

  clearPath(): void {
    if (this.gridAnimated) {
      this.visitedNodes.forEach((node) => {
        node.element.classList.remove(NodeType.Visited);
      });
      this.pathNodes.forEach((node) => {
        node.element.classList.remove(NodeType.Path);
      });
      this.visitedNodes = [];
      this.pathNodes = [];
      this.gridAnimated = false;
    }
  }

  animateNodes(): void {
    this.clearPath();
    this.gridAnimated = true;
    this.animationRunning = true;
    const result = dijkstra(this);
    this.visitedNodes = result.expandedNodes;
    this.pathNodes = result.path;
    this.visitedNodes.forEach((node, index) => {
      setTimeout(() => {
        node.element.classList.add(NodeType.Visited);
      }, index * this.animatationSpeed);
    });

    this.pathNodes.forEach((node, index) => {
      setTimeout(
        () => {
          node.element.classList.remove(NodeType.Visited);
          node.element.classList.add(NodeType.Path);
          if (index == this.pathNodes.length - 1) {
            this.animationRunning = false;
          }
        },
        (result.expandedNodes.length + index) * this.animatationSpeed,
      );
    });
  }

  showPath(): void {
    this.visitedNodes.forEach((node) => {
      node.element.classList.remove(NodeType.Visited);
    });
    this.pathNodes.forEach((node) => {
      node.element.classList.remove(NodeType.Path);
    });

    const result = dijkstra(this);
    this.visitedNodes = result.expandedNodes;
    this.pathNodes = result.path;
    result.expandedNodes.forEach((node) => {
      node.element.classList.add(NodeType.Visited);
    });
    result.path.forEach((node) => {
      node.element.classList.remove(NodeType.Visited);
      node.element.classList.add(NodeType.Path);
    });
  }


  handleNodeDrag(node: Node, event: MouseEvent | TouchEvent): void {
    if (this.animationRunning) {
      return;
    }

    if (event instanceof MouseEvent) {
      // Mouse event handling
      this.draggingNode = node;
      document.addEventListener("mousemove", this.handleMouseMove);
      document.addEventListener("mouseup", this.handleMouseUp);
    } else if (event instanceof TouchEvent) {
      // Touch event handling
      const touch = event.touches[0];
      this.draggingNode = node;
      event.preventDefault();
      document.addEventListener("touchmove", this.handleTouchMove, { passive: false });
      document.addEventListener("touchend", this.handleTouchEnd);
      document.addEventListener("touchcancel", this.handleTouchEnd);
      this.handleTouchMove(event);
    }
  }

  handleMouseMove(event: MouseEvent): void {
    if (!this.draggingNode) return;

    const newSpecialNode = document.elementFromPoint(
      event.clientX,
      event.clientY
    ) as HTMLElement;

    this.handleSpecialNodeUpdate(newSpecialNode);
  }

  handleTouchMove(event: TouchEvent): void {
    if (!this.draggingNode) return;

    const touch = event.touches[0];
    const newSpecialNode = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    ) as HTMLElement;

    if (!newSpecialNode || !newSpecialNode.classList.contains(NodeType.Default)) return;

    this.handleSpecialNodeUpdate(newSpecialNode);
  }

  handleSpecialNodeUpdate(newSpecialNode: HTMLElement | null): void {
    if (!newSpecialNode || !newSpecialNode.classList.contains(NodeType.Default))
      return;

    const [newRow, newCol] = newSpecialNode.id.split("-").map(Number);
    const newNode = this.getNode(newRow, newCol);
    if (!newNode || newNode.type !== NodeType.Default) return;

    if (!this.draggingNode) {
      return;
    }

    const previousNodeElement = this.draggingNode.element;
    previousNodeElement.className = NodeType.Default;

    this.draggingType = this.draggingNode.type;
    if (this.draggingType === NodeType.StartNode) {
      this.setStartNode(newRow, newCol);
    } else if (this.draggingType === NodeType.EndNode) {
      this.setEndNode(newRow, newCol);
    }
    this.draggingNode.type = NodeType.Default;
    this.draggingNode = newNode;
    this.draggingNode.type = this.draggingType;

    newSpecialNode.className = this.draggingType;
    if (this.gridAnimated) {
      this.showPath();
    }
  }

  handleMouseUp(): void {
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);

    this.handleDragEnd();
  }

  handleTouchEnd(): void {
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
    document.removeEventListener("touchcancel", this.handleTouchEnd);

    this.handleDragEnd();
  }

  handleDragEnd(): void {
    // Add event listener to new special node
    if (!this.draggingNode) return;
    const nodeElement = document.getElementById(
      `${this.draggingNode.row}-${this.draggingNode.col}`
    );
    if (nodeElement) {
      nodeElement.addEventListener(
        "mousedown",
        this.handleNodeDrag.bind(
          null,
          this.nodes[this.draggingNode.row][this.draggingNode.col]
        )
      );
      nodeElement.addEventListener('touchstart', this.handleNodeDrag.bind(null, this.nodes[this.draggingNode.row][this.draggingNode.col]))
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

  successors(node: Node): Node[] {
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

  getNode(row: number, col: number): Node | undefined {
    return this.nodes[row] && this.nodes[row][col];
  }

  setStartNode(row: number, col: number) {
    this.startNode = [row, col];
  }

  setEndNode(row: number, col: number) {
    this.endNode = [row, col];
  }
  getStartNode(): Node {
    return this.nodes[this.startNode[0]][this.startNode[1]];
  }

  getEndNode(): Node {
    return this.nodes[this.endNode[0]][this.endNode[1]];
  }

  setAnimationSpeed(speed: number): void {
    this.animatationSpeed = speed;
  }
}
