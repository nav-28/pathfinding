(function () {
    'use strict';

    var EdgeType;
    (function (EdgeType) {
        EdgeType["StartNode"] = "start-node";
        EdgeType["EndNode"] = "end-node";
        EdgeType["Wall"] = "wall";
        EdgeType["Default"] = "default";
    })(EdgeType || (EdgeType = {}));
    class Edge {
        constructor(row, col, type, element) {
            this.row = row;
            this.col = col;
            this.type = type;
            this.element = element;
        }
    }

    class Grid {
        constructor(rows, cols) {
            this.rows = rows;
            this.cols = cols;
            const container = document.getElementById('container');
            if (!container)
                return;
            const existingTable = container.querySelector('table');
            if (existingTable) {
                container.innerHTML = '';
            }
            this.draggingNode = undefined;
            this.draggingType = EdgeType.Default;
            this.handleNodeDrag = this.handleNodeDrag.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            const board = document.createElement('table');
            const boardBody = document.createElement('tbody');
            board.appendChild(boardBody);
            container.appendChild(board);
            this.nodes = [];
            for (let row = 0; row < this.rows; row++) {
                this.nodes[row] = [];
                const tableRow = document.createElement('tr');
                tableRow.classList.add(`${row}`);
                for (let col = 0; col < this.cols; col++) {
                    const nodeElement = document.createElement('td');
                    nodeElement.id = `${row}-${col}`;
                    nodeElement.className = 'node';
                    if (row == kStartNode[0] && col == kStartNode[1]) {
                        nodeElement.classList.add(EdgeType.StartNode);
                        this.nodes[row][col] = new Edge(row, col, EdgeType.StartNode, nodeElement);
                        this.startNode = [row, col];
                        tableRow.appendChild(nodeElement);
                        nodeElement.addEventListener('mousedown', this.handleNodeDrag.bind(null, this.nodes[row][col]));
                        continue;
                    }
                    if (row == kEndNode[0] && col == kEndNode[1]) {
                        nodeElement.classList.add(EdgeType.EndNode);
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
            const debugButton = document.createElement('button');
            debugButton.textContent = 'Debug';
            debugButton.addEventListener('click', handleDebugButtonClick);
            container.appendChild(debugButton);
        }
        handleNodeDrag(node, _) {
            this.draggingNode = node;
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
        }
        handleMouseMove(event) {
            if (!this.draggingNode)
                return;
            const newSpecialNode = document.elementFromPoint(event.clientX, event.clientY);
            if (!newSpecialNode || !newSpecialNode.classList.contains('node'))
                return;
            const [newRow, newCol] = newSpecialNode.id.split('-').map(Number);
            const newNode = this.getNode(newRow, newCol);
            if (!newNode || newNode.type !== EdgeType.Default)
                return;
            const previousNodeElement = this.draggingNode.element;
            previousNodeElement.classList.remove(this.draggingNode.type);
            this.draggingType = this.draggingNode.type;
            if (this.draggingType === EdgeType.StartNode) {
                this.setStartNode(newRow, newCol);
            }
            else if (this.draggingType === EdgeType.EndNode) {
                grid.setEndNode(newRow, newCol);
            }
            this.draggingNode.type = EdgeType.Default;
            this.draggingNode = newNode;
            this.draggingNode.type = this.draggingType;
            newSpecialNode.classList.add(this.draggingType);
        }
        handleMouseUp() {
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
            // add event listener to new special node
            const nodeElement = document.getElementById(`${this.draggingNode.row}-${this.draggingNode.col}`);
            nodeElement.addEventListener('mousedown', this.handleNodeDrag.bind(null, this.nodes[this.draggingNode.row][this.draggingNode.col]));
            this.draggingNode = undefined;
        }
        getNode(row, col) {
            return this.nodes[row] && this.nodes[row][col];
        }
        setStartNode(row, col) {
            this.startNode = [row, col];
        }
        setEndNode(row, col) {
            this.endNode = [row, col];
        }
        getStartNode() {
            return this.nodes[this.startNode[0]][this.startNode[1]];
        }
        getEndNode() {
            return this.nodes[this.endNode[0]][this.endNode[1]];
        }
    }
    function handleDebugButtonClick() {
        for (var i = 0; i < grid.rows; i++) {
            for (var j = 0; j < grid.cols; j++) {
                if (grid.nodes[i][j].type !== EdgeType.Default) {
                    console.log(grid.nodes[i][j]);
                }
            }
        }
    }
    function updateGridSize() {
        grid = new Grid(window.innerHeight / (25 * 2), window.innerWidth / 25);
    }
    const kStartNode = [5, 3];
    const kEndNode = [9, 9];
    var grid = new Grid(window.innerHeight / (25 * 2), window.innerWidth / 25);
    window.addEventListener('resize', updateGridSize);

})();
