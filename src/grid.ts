import { Node, NodeType } from "./node";
import { SearchResult, dijkstra } from "./algorithms";

export class Grid {
  private nodes: Node[][] = [];
  private startNode!: number[];
  private endNode!: number[];
  private gridAnimated: boolean = false;
  private visitedNodes: Node[] = [];
  private pathNodes: Node[] = [];
  private animatationSpeed: number = 50;
  private draggingNode: Node | undefined;
  private clickedNode: Node | undefined;
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
        let nodeType = NodeType.Default;

        if (row == this.startNode[0] && col == this.startNode[1]) {
          nodeElement.className = NodeType.StartNode;
          nodeType = NodeType.StartNode;
          this.startNode = [row, col];
        }
        if (row == this.endNode[0] && col == this.endNode[1]) {
          nodeElement.className = NodeType.EndNode;
          nodeType = NodeType.EndNode;
          this.endNode = [row, col];
        }
        this.nodes[row][col] = new Node(
          row,
          col,
          nodeType,
          nodeElement,
        );
        nodeElement.addEventListener(
          "mousedown",
          this.handleNodeDrag.bind(null, this.nodes[row][col]),
        );
        nodeElement.addEventListener(
          "touchstart",
          this.handleNodeDrag.bind(null, this.nodes[row][col])
        );

        tableRow.appendChild(nodeElement);
      }
      boardBody.appendChild(tableRow);
    }
  }

  clearPath(): void {
    if (this.gridAnimated) {
      this.visitedNodes.forEach((node) => {
        if (node.isSpecialNode()) return;
        node.element.className = NodeType.Default;
      });
      this.pathNodes.forEach((node) => {
        if (node.isSpecialNode()) return;
        node.element.className = NodeType.Default;
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
    const result = this.runAlgorithm();
    this.visitedNodes = result.expandedNodes;
    this.pathNodes = result.path;
    this.visitedNodes.forEach((node, index) => {
      setTimeout(() => {
        if (node.isSpecialNode() || node.isWallNode()) return;
        node.element.className = NodeType.Visited;
      }, index * this.animatationSpeed);
    });

    this.pathNodes.forEach((node, index) => {
      setTimeout(
        () => {
          if (index == this.pathNodes.length - 1) {
            this.animationRunning = false;
          }

          if (node.isSpecialNode()) return;
          node.element.className = NodeType.Path;
        },
        (result.expandedNodes.length + index) * this.animatationSpeed,
      );
    });
  }

  showPath(): void {
    this.visitedNodes.forEach((node) => {
      if (node.isSpecialNode() || node.isWallNode()) return;
      node.element.className = NodeType.Default;
    });
    this.pathNodes.forEach((node) => {
      if (node.isSpecialNode()) return;
      node.element.classList.remove(NodeType.Path);
    });

    const result = this.runAlgorithm();
    this.visitedNodes = result.expandedNodes;
    this.pathNodes = result.path;
    result.expandedNodes.forEach((node) => {
      if (node.isSpecialNode() || node.isWallNode()) return;
      node.element.className = NodeType.Visited;
    });
    result.path.forEach((node) => {
      if (node.isSpecialNode()) return;
      node.element.className = NodeType.Path;
    });
  }


  handleNodeDrag(node: Node, event: MouseEvent | TouchEvent): void {
    if (this.animationRunning) {
      return;
    }
    this.draggingNode = node;
    this.clickedNode = node;
    if (event instanceof MouseEvent) {
      document.addEventListener("mousemove", this.handleMouseMove);
      document.addEventListener("mouseup", this.handleMouseUp);
      this.handleMouseMove(event);
    } else if (event instanceof TouchEvent) {
      event.preventDefault();
      document.addEventListener("touchmove", this.handleTouchMove, { passive: false });
      document.addEventListener("touchend", this.handleTouchEnd);
      document.addEventListener("touchcancel", this.handleTouchEnd);
      this.handleTouchMove(event);
    }
  }

  handleMouseMove(event: MouseEvent): void {
    if (!this.draggingNode) return;
    const clickedNode = document.elementFromPoint(
      event.clientX,
      event.clientY
    ) as HTMLElement;

    if (this.draggingNode.type == NodeType.StartNode || this.draggingNode.type == NodeType.EndNode) {
      this.handleSpecialNodeUpdate(clickedNode);
    } else {
      this.handleDefaultOrWallNodeUpdate(clickedNode);
    }
  }

  handleTouchMove(event: TouchEvent): void {
    if (!this.draggingNode) return;

    const touch = event.touches[0];
    const touchedNode = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    ) as HTMLElement;
    if (this.draggingNode.type == NodeType.StartNode || this.draggingNode.type == NodeType.EndNode) {

      if (!touchedNode || !touchedNode.classList.contains(NodeType.Default)) return;
      this.handleSpecialNodeUpdate(touchedNode);
    }
    else {
      this.handleDefaultOrWallNodeUpdate(touchedNode);
    }
  }

  handleDefaultOrWallNodeUpdate(newNodeElement: HTMLElement | null): void {
    if (!newNodeElement || newNodeElement.classList.contains(NodeType.StartNode) || newNodeElement.classList.contains(NodeType.EndNode)) return;

    const [row, col] = newNodeElement.id.split("-").map(Number);
    const newNode = this.getNode(row, col);
    if (!newNode) return;

    if (this.clickedNode && this.clickedNode.row == row && this.clickedNode.col == col) {
      this.changeWallAndDefaultNode(newNode);
      this.clickedNode = undefined;
      return;
    }

    if (!this.draggingNode) return;
    if (this.draggingNode.row == row && this.draggingNode.col == col) {
      return;
    }

    this.changeWallAndDefaultNode(newNode);
    this.draggingNode = newNode;
  }

  changeWallAndDefaultNode(newNode: Node): void {
    if (newNode.type == NodeType.Wall) {
      newNode.type = NodeType.Default;
      newNode.element.className = NodeType.Default;
    }
    else if (newNode.type == NodeType.Default) {
      newNode.type = NodeType.Wall;
      newNode.element.className = NodeType.Wall;
    }

  }

  handleSpecialNodeUpdate(newSpecialNode: HTMLElement | null): void {
    if (!newSpecialNode || newSpecialNode.classList.contains(NodeType.EndNode) || newSpecialNode.classList.contains(NodeType.StartNode))
      return;

    const [newRow, newCol] = newSpecialNode.id.split("-").map(Number);
    const newNode = this.getNode(newRow, newCol);
    if (!newNode) return;

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
    this.draggingNode = undefined;
    this.clickedNode = undefined;
  }


  runAlgorithm(): SearchResult {
    return dijkstra(this);
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
        if (this.isValidPair(x, y) && node.type != NodeType.Wall) {
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
