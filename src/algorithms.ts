import { Edge } from './edge';
import { Heap } from 'heap-js';

export function dijkstra(startNode: Edge, goal: Edge) {

    const open = new Heap<Edge>((a: Edge, b: Edge) => a.gVal - b.gVal);
    const close = [];
    startNode.gVal = 20;
    goal.gVal = 10;
    open.push(startNode);
    open.push(goal);
    console.log(open.peek());

}
