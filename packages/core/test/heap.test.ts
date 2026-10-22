import { describe, expect, it } from 'vitest';
import { MinHeap } from '../src/heap.js';

/** Pops everything, which is the only way to observe the ordering from outside. */
function drain(heap: MinHeap): number[] {
  const out: number[] = [];
  while (heap.size > 0) out.push(heap.pop());
  return out;
}

describe('MinHeap', () => {
  it('pops nodes in ascending key order', () => {
    const heap = new MinHeap();
    for (const [node, key] of [
      [10, 5],
      [20, 1],
      [30, 9],
      [40, 3],
    ]) {
      heap.push(node!, key!);
    }
    expect(drain(heap)).toEqual([20, 40, 10, 30]);
  });

  it('breaks ties with the tie value, lower first', () => {
    const heap = new MinHeap();
    heap.push(1, 7, 99);
    heap.push(2, 7, 3);
    heap.push(3, 7, 50);
    expect(drain(heap)).toEqual([2, 3, 1]);
  });

  it('tracks its size as entries are added and removed', () => {
    const heap = new MinHeap();
    expect(heap.size).toBe(0);
    heap.push(1, 1);
    heap.push(2, 2);
    expect(heap.size).toBe(2);
    heap.pop();
    expect(heap.size).toBe(1);
  });

  it('accepts the same node more than once, as lazy deletion requires', () => {
    const heap = new MinHeap();
    heap.push(7, 10);
    heap.push(7, 2);
    expect(heap.size).toBe(2);
    expect(drain(heap)).toEqual([7, 7]);
  });

  it('handles interleaved pushes and pops', () => {
    const heap = new MinHeap();
    heap.push(1, 5);
    heap.push(2, 3);
    expect(heap.pop()).toBe(2);
    heap.push(3, 1);
    heap.push(4, 4);
    expect(drain(heap)).toEqual([3, 4, 1]);
  });

  it('matches a sorted array on a large deterministic workload', () => {
    const heap = new MinHeap();
    const expected: Array<{ node: number; key: number }> = [];
    // A simple spread-out sequence, so insertions arrive in no particular order.
    for (let node = 0; node < 500; node++) {
      const key = (node * 37) % 500;
      heap.push(node, key, node);
      expected.push({ node, key });
    }
    expected.sort((a, b) => a.key - b.key || a.node - b.node);
    expect(drain(heap)).toEqual(expected.map((e) => e.node));
  });
});
