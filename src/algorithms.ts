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


export function bidirectionalAStar(grid: Grid, heuristic: HeuristicFunc): SearchResult {
  const startNode = grid.getStartNode();
  const endNode = grid.getEndNode();

  const forwardOpenSet: Set<Node> = new Set();
  const forwardClosedSet: Set<Node> = new Set();
  const forwardGScore: Map<Node, number> = new Map();
  const forwardFScore: Map<Node, number> = new Map();
  const forwardPrevious: Map<Node, Node | undefined> = new Map();

  const backwardOpenSet: Set<Node> = new Set();
  const backwardClosedSet: Set<Node> = new Set();
  const backwardGScore: Map<Node, number> = new Map();
  const backwardFScore: Map<Node, number> = new Map();
  const backwardPrevious: Map<Node, Node | undefined> = new Map();

  forwardGScore.set(startNode, 0);
  forwardFScore.set(startNode, heuristic(startNode, endNode));
  forwardOpenSet.add(startNode);

  backwardGScore.set(endNode, 0);
  backwardFScore.set(endNode, heuristic(endNode, startNode));
  backwardOpenSet.add(endNode);

  let meetingNode: Node | undefined = undefined;
  let minPathLength = Infinity;

  while (forwardOpenSet.size > 0 && backwardOpenSet.size > 0) {
    const forwardCurrentNode = getLowestFScoreNodeBi(forwardOpenSet, forwardFScore);
    forwardOpenSet.delete(forwardCurrentNode);

    const backwardCurrentNode = getLowestFScoreNodeBi(backwardOpenSet, backwardFScore);
    backwardOpenSet.delete(backwardCurrentNode);

    if (forwardCurrentNode === backwardCurrentNode) {
      meetingNode = forwardCurrentNode;
      break;
    }

    forwardClosedSet.add(forwardCurrentNode);
    backwardClosedSet.add(backwardCurrentNode);

    const forwardNeighbors = grid.successors(forwardCurrentNode);
    const backwardNeighbors = grid.successors(backwardCurrentNode);


    [meetingNode, minPathLength] = updateNeighbors(
      forwardNeighbors,
      forwardCurrentNode,
      forwardOpenSet,
      forwardClosedSet,
      forwardGScore,
      forwardFScore,
      forwardPrevious,
      backwardGScore,
      endNode,
      heuristic,
      meetingNode,
      minPathLength,
      grid
    );

    [meetingNode, minPathLength] = updateNeighbors(
      backwardNeighbors,
      backwardCurrentNode,
      backwardOpenSet,
      backwardClosedSet,
      backwardGScore,
      backwardFScore,
      backwardPrevious,
      forwardGScore,
      startNode,
      heuristic,
      meetingNode,
      minPathLength,
      grid
    );

    const pathLength =
      forwardGScore.get(forwardCurrentNode)! + backwardGScore.get(backwardCurrentNode)!;
    if (pathLength < minPathLength) {
      minPathLength = pathLength;
      meetingNode = forwardCurrentNode;
    }
  }

  if (!meetingNode) {
    return { expandedNodes: [], path: [] };
  }

  const expandedNodes = Array.from(new Set([...forwardClosedSet, ...backwardClosedSet]));

  const path: Node[] = [];
  let currentNode: Node | undefined = meetingNode;
  while (currentNode !== undefined) {
    path.unshift(currentNode);
    currentNode = forwardPrevious.get(currentNode);
  }

  currentNode = backwardPrevious.get(meetingNode);
  while (currentNode !== undefined) {
    path.push(currentNode);
    currentNode = backwardPrevious.get(currentNode);
  }

  return { expandedNodes, path };
}

function getLowestFScoreNodeBi(nodes: Set<Node>, fScore: Map<Node, number>): Node {
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
function updateNeighbors(
  neighbors: Node[],
  currentNode: Node,
  openSet: Set<Node>,
  closedSet: Set<Node>,
  gScore: Map<Node, number>,
  fScore: Map<Node, number>,
  previous: Map<Node, Node | undefined>,
  otherGScore: Map<Node, number>,
  targetNode: Node,
  heuristic: HeuristicFunc,
  meetingNode: Node | undefined,
  minPathLength: number,
  grid: Grid,
): [Node | undefined, number] {
  let newMeetingNode = meetingNode;
  let newMinPathLength = minPathLength;

  for (const neighbor of neighbors) {
    if (closedSet.has(neighbor)) {
      continue;
    }

    const tentativeGScore =
      gScore.get(currentNode)! +
      grid.cost(neighbor.row - currentNode.row, neighbor.col - currentNode.col);

    if (!openSet.has(neighbor) || tentativeGScore < gScore.get(neighbor)!) {
      previous.set(neighbor, currentNode);
      gScore.set(neighbor, tentativeGScore);
      fScore.set(neighbor, tentativeGScore + heuristic(neighbor, targetNode));

      if (!openSet.has(neighbor)) {
        openSet.add(neighbor);
      }

      const otherNodeGScore = otherGScore.get(neighbor);
      if (otherNodeGScore !== undefined && tentativeGScore + otherNodeGScore < newMinPathLength) {
        newMinPathLength = tentativeGScore + otherNodeGScore;
        newMeetingNode = neighbor;
      }
    }
  }

  return [newMeetingNode, newMinPathLength];
}
