class Stem {
  constructor(public row: number, public col: number, public type: string) { }
}

class Grid {
  private nodes: Stem[][];
  private startNode: number[];
  private endNode: number[];

  constructor(public rows: number, public cols: number) {
    this.nodes = [];

    for (let row = 0; row < this.rows; row++) {
      this.nodes[row] = [];
      for (let col = 0; col < this.cols; col++) {
        if (row == kStartNode[0] && col == kStartNode[1]) {
          this.nodes[row][col] = new Stem(row, col, 'startNode');
          this.startNode = [row, col];
          continue;
        }

        if (row == kEndNode[0] && col == kEndNode[1]) {
          this.nodes[row][col] = new Stem(row, col, 'endNode');
          this.endNode = [row, col];
          continue;
        }
        this.nodes[row][col] = new Stem(row, col, 'default');
      }
    }

  }

  getNode(row: number, col: number): Stem | undefined {
    return this.nodes[row] && this.nodes[row][col];
  }

  getStartNode(): Stem {
    return this.nodes[this.startNode[0]][this.startNode[1]];
  }

  getEndNode(): Stem {
    return this.nodes[this.endNode[0]][this.startNode[1]];
  }

}

function initializeGrid(): void {
  const container = document.getElementById('container');
  if (!container) return;



  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const node = grid.getNode(row, col);

      if (!node) continue;
      const nodeElement = document.createElement('div');

      nodeElement.className = 'node';
      if (node.type === 'startNode') {
        nodeElement.classList.add('start-node')
      }
      if (node.type === 'endNode') {
        nodeElement.classList.add('end-node')
      }
      container.appendChild(nodeElement);
    }
  }
}

const kStartNode = [3, 5]
const kEndNode = [9, 9]
const grid = new Grid(10, 10);
initializeGrid();
