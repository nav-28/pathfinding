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
        constructor(row, col, type) {
            this.row = row;
            this.col = col;
            this.type = type;
        }
    }

    class Grid {
        constructor(rows, cols) {
            this.rows = rows;
            this.cols = cols;
            this.nodes = [];
            for (let row = 0; row < this.rows; row++) {
                this.nodes[row] = [];
                for (let col = 0; col < this.cols; col++) {
                    if (row == kStartNode[0] && col == kStartNode[1]) {
                        this.nodes[row][col] = new Edge(row, col, EdgeType.StartNode);
                        this.startNode = [row, col];
                        continue;
                    }
                    if (row == kEndNode[0] && col == kEndNode[1]) {
                        this.nodes[row][col] = new Edge(row, col, EdgeType.EndNode);
                        this.endNode = [row, col];
                        continue;
                    }
                    this.nodes[row][col] = new Edge(row, col, EdgeType.Default);
                }
            }
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
    function initializeGrid() {
        const container = document.getElementById('container');
        if (!container)
            return;
        const existingTable = container.querySelector('table');
        if (existingTable) {
            container.innerHTML = '';
        }
        const board = document.createElement('table');
        const boardBody = document.createElement('tbody');
        board.appendChild(boardBody);
        container.appendChild(board);
        for (let row = 0; row < grid.rows; row++) {
            const tableRow = document.createElement('tr');
            tableRow.classList.add(`${row}`);
            for (let col = 0; col < grid.cols; col++) {
                const node = grid.getNode(row, col);
                const nodeElement = document.createElement('td');
                nodeElement.id = `${row}-${col}`;
                nodeElement.className = 'node';
                if (node.type === EdgeType.StartNode) {
                    nodeElement.classList.add('start-node');
                    nodeElement.addEventListener('mousedown', handleNodeDrag.bind(null, node));
                }
                if (node.type === EdgeType.EndNode) {
                    nodeElement.classList.add('end-node');
                    nodeElement.addEventListener('mousedown', handleNodeDrag.bind(null, node));
                }
                tableRow.appendChild(nodeElement);
            }
            boardBody.appendChild(tableRow);
        }
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Debug';
        debugButton.addEventListener('click', handleDebugButtonClick);
        container.appendChild(debugButton);
    }
    function handleDebugButtonClick() {
        console.log(grid.getStartNode());
        console.log(grid.getEndNode());
    }
    let draggingNode = null;
    function handleNodeDrag(node, _) {
        draggingNode = node;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    function handleMouseMove(event) {
        if (!draggingNode)
            return;
        const newSpecialNode = document.elementFromPoint(event.clientX, event.clientY);
        if (!newSpecialNode || !newSpecialNode.classList.contains('node'))
            return;
        const [newRow, newCol] = newSpecialNode.id.split('-').map(Number);
        const newNode = grid.getNode(newRow, newCol);
        if (!newNode || newNode.type !== EdgeType.Default)
            return;
        const previousNodeElement = document.getElementById(`${draggingNode.row}-${draggingNode.col}`);
        if (previousNodeElement) {
            previousNodeElement.classList.remove(draggingNode.type.toLowerCase());
        }
        let draggingType = draggingNode.type;
        if (draggingType === EdgeType.StartNode) {
            grid.setStartNode(newRow, newCol);
        }
        else if (draggingType === EdgeType.EndNode) {
            grid.setEndNode(newRow, newCol);
        }
        draggingNode.type = EdgeType.Default;
        draggingNode = newNode;
        draggingNode.type = draggingType;
        newSpecialNode.classList.add(draggingType);
    }
    function handleMouseUp() {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        // add event listener to new special node
        const nodeElement = document.getElementById(`${draggingNode.row}-${draggingNode.col}`);
        nodeElement.addEventListener('mousedown', handleNodeDrag.bind(null, grid.getNode(draggingNode.row, draggingNode.col)));
        draggingNode = null;
    }
    function updateGridSize() {
        grid = new Grid(window.innerHeight / (25 * 2), window.innerWidth / 25);
        initializeGrid();
    }
    const kStartNode = [5, 3];
    const kEndNode = [9, 9];
    var grid = new Grid(window.innerHeight / (25 * 2), window.innerWidth / 25);
    window.addEventListener('resize', updateGridSize);
    initializeGrid();

})();
