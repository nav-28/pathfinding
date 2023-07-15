import { Node, HeuristicFunc, SearchResult, Algo } from "./types";
import { Grid } from "./grid";


export function dijkstra(grid: Grid): SearchResult {
  const startNode = grid.getStartNode();
  const endNode = grid.getEndNode();

  const queue: Node[] = [];
  const visited: Set<Node> = new Set();
  const previous: Map<Node, Node | undefined> = new Map();
  const distance: Map<Node, number> = new Map();

  distance.set(startNode, 0);
  queue.push(startNode);

  while (queue.length > 0) {
    queue.sort((a, b) => distance.get(a)! - distance.get(b)!);
    const currentNode = queue.shift();
    visited.add(currentNode!);
    if (currentNode === endNode) {
      break;
    }

    const neighbors = grid.successors(currentNode!);
    for (const neighbour of neighbors) {
      const tentativeDistance =
        distance.get(currentNode!)! +
        grid.cost(
          neighbour.row - currentNode!.row,
          neighbour.col - currentNode!.col,
        );
      if (
        !visited.has(neighbour) &&
        (distance.get(neighbour) === undefined ||
          tentativeDistance < distance.get(neighbour)!)
      ) {
        distance.set(neighbour, tentativeDistance);
        previous.set(neighbour, currentNode);
        queue.push(neighbour);
      }
    }
  }

  return getPath(visited, previous, endNode);
}


export function bfs(grid: Grid): SearchResult {
  const startNode = grid.getStartNode();
  const endNode = grid.getEndNode();

  const queue: Node[] = [];
  const visited: Set<Node> = new Set();
  const previous: Map<Node, Node | undefined> = new Map();

  queue.push(startNode);
  visited.add(startNode);

  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (currentNode === endNode) {
      break;
    }

    const neighbors = grid.successors(currentNode!);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
        visited.add(neighbor);
        previous.set(neighbor, currentNode);
      }
    }
  }

  return getPath(visited, previous, endNode);
}

export function dfs(grid: Grid): SearchResult {
  const startNode = grid.getStartNode();
  const endNode = grid.getEndNode();

  const visited: Set<Node> = new Set();
  const previous: Map<Node, Node | undefined> = new Map();

  function dfsRecursive(node: Node) {
    visited.add(node);

    if (node === endNode) {
      return true;
    }

    const neighbors = grid.successors(node);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        previous.set(neighbor, node);
        if (dfsRecursive(neighbor)) {
          return true;
        }
      }
    }

    return false;
  }

  dfsRecursive(startNode);

  return getPath(visited, previous, endNode);
}


export function aStar(grid: Grid, heuristic: HeuristicFunc): SearchResult {
  const startNode = grid.getStartNode();
  const endNode = grid.getEndNode();

  const openSet: Set<Node> = new Set();
  const closedSet: Set<Node> = new Set();
  const gScore: Map<Node, number> = new Map();
  const fScore: Map<Node, number> = new Map();
  const previous: Map<Node, Node | undefined> = new Map();

  gScore.set(startNode, 0);
  fScore.set(startNode, heuristic(startNode, endNode));
  openSet.add(startNode);

  while (openSet.size > 0) {
    const currentNode = getLowestFScoreNode(openSet, fScore);
    openSet.delete(currentNode);

    if (currentNode === endNode) {
      break;
    }

    closedSet.add(currentNode);

    const neighbors = grid.successors(currentNode);
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor)) {
        continue;
      }

      const tentativeGScore =
        gScore.get(currentNode)! +
        grid.cost(
          neighbor.row - currentNode.row,
          neighbor.col - currentNode.col
        );

      if (!openSet.has(neighbor)) {
        openSet.add(neighbor);
      } else if (tentativeGScore >= gScore.get(neighbor)!) {
        continue;
      }

      previous.set(neighbor, currentNode);
      gScore.set(neighbor, tentativeGScore);
      fScore.set(
        neighbor,
        tentativeGScore + heuristic(neighbor, endNode)
      );
    }
  }

  const expandedNodes = Array.from(closedSet);

  const path: Node[] = [];
  let currentNode: Node | undefined = endNode;
  while (currentNode !== undefined) {
    path.unshift(currentNode);
    currentNode = previous.get(currentNode);
  }

  return { expandedNodes, path };
}

function getLowestFScoreNode(
  nodes: Set<Node>,
  fScore: Map<Node, number>
): Node {
  let lowestFScoreNode: Node | undefined;
  let lowestFScore = Infinity;

  for (const node of nodes) {
    const nodeFScore = fScore.get(node)!;
    if (nodeFScore < lowestFScore) {
      lowestFScore = nodeFScore;
      lowestFScoreNode = node;
    }
  }

  return lowestFScoreNode!;
}



function getPath(visited: Set<Node>, previous: Map<Node, Node | undefined>, endNode: Node): SearchResult {
  const expandedNodes = Array.from(visited);
  const path: Node[] = [];
  let currentNode: Node | undefined = endNode;
  while (currentNode !== undefined) {
    path.unshift(currentNode);
    currentNode = previous.get(currentNode);
  }

  return { expandedNodes, path };
}
