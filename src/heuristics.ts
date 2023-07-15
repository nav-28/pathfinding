import { HeuristicFunc } from './types';



export const manhattanDistance: HeuristicFunc = (nodeA, nodeB) => {
    const dx = Math.abs(nodeA.col - nodeB.col);
    const dy = Math.abs(nodeA.row - nodeB.row);
    return dx + dy;
}
