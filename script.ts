class Stem {
  constructor(public row: number, public col: number, public type: string) { }
}

class Grid {
  public nodes: Stem[][];
  private startNode: number[];
  private endNode: number[];

  constructor(public rows: number, public cols: number) {
    this.nodes = [];

    for (let row = 0; row < this.rows; row++) {
      this.nodes[row] = [];
      for (let col = 0; col < this.cols; col++) {
        if (row == kStartNode[0] && col == kStartNode[1]) {
          this.nodes[row][col] = new Stem(row, col, 'start-node');
          this.startNode = [row, col];
          continue;
        }

        if (row == kEndNode[0] && col == kEndNode[1]) {
          this.nodes[row][col] = new Stem(row, col, 'end-node');
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
  const board = document.createElement('table');
  const boardBody = document.createElement('tbody');
  board.appendChild(boardBody)
  container.appendChild(board);
  for (let row = 0; row < grid.rows; row++) {
    const tableRow = document.createElement('tr');
    tableRow.classList.add(`${row}`);
    for (let col = 0; col < grid.cols; col++) {
      const node = grid.getNode(row, col);

      const nodeElement = document.createElement('td');
      nodeElement.id = `${row}-${col}`;
      nodeElement.className = 'node';
      if (node.type === 'start-node') {
        nodeElement.classList.add('start-node')
        nodeElement.addEventListener('mousedown', handleNodeDrag.bind(null, node))
      }
      if (node.type === 'end-node') {
        nodeElement.classList.add('end-node')
        nodeElement.addEventListener('mousedown', handleNodeDrag.bind(null, node))
      }
      tableRow.appendChild(nodeElement);
    }
    boardBody.appendChild(tableRow);
  }
}


let draggingNode: Stem | null = null;
let draggingType: string;

function handleNodeDrag(node: Stem, _: MouseEvent): void {
  draggingNode = node;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

function handleMouseMove(event: MouseEvent): void {
  if (!draggingNode) return;

  const newStartNode = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
  if (!newStartNode || !newStartNode.classList.contains('node')) return;

  const [newRow, newCol] = newStartNode.id.split('-').map(Number);
  const newNode = grid.getNode(newRow, newCol);
  if (!newNode || newNode.type !== 'default') return;

  // Remove previous node type class
  const previousNodeElement = document.getElementById(`${draggingNode.row}-${draggingNode.col}`);
  if (previousNodeElement) {
    previousNodeElement.classList.remove(draggingNode.type.toLowerCase());
  }

  let draggingType = draggingNode.type;
  draggingNode.type = 'default'
  draggingNode = newNode;
  draggingNode.type = draggingType

  // Update node and its corresponding element
  newStartNode.classList.add(draggingType);


}

function handleMouseUp(): void {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);

  const nodeElement = document.getElementById(`${draggingNode.row}-${draggingNode.col}`)
  nodeElement.addEventListener('mousedown', handleNodeDrag.bind(null, grid.getNode(draggingNode.row, draggingNode.col)))
  draggingNode = null
}


const kStartNode = [5, 3]
const kEndNode = [9, 9]
const grid = new Grid(15, 20);
initializeGrid();
