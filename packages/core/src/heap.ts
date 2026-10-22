/**
 * Binary min-heap of node ids, ordered by `key` and then by `tie` (lower first).
 *
 * Search algorithms pop the most promising node thousands of times per run, so this is the
 * data structure that keeps Dijkstra and A\* at O(log n) per operation instead of O(n).
 *
 * There is no decrease-key operation. When a cheaper route to a node is found the node is
 * pushed again, and the stale entry is skipped when it is popped (lazy deletion). That costs
 * some memory but keeps every operation simple and fast.
 */
export class MinHeap {
  /** Parallel arrays rather than an array of objects: fewer allocations, better cache locality. */
  private nodes: number[] = [];
  private keys: number[] = [];
  private ties: number[] = [];

  get size(): number {
    return this.nodes.length;
  }

  push(node: number, key: number, tie = 0): void {
    this.nodes.push(node);
    this.keys.push(key);
    this.ties.push(tie);
    this.siftUp(this.nodes.length - 1);
  }

  /** Removes and returns the node with the smallest key. The heap must not be empty. */
  pop(): number {
    const top = this.nodes[0]!;
    // Move the last entry to the root, then let it sink to its place.
    const node = this.nodes.pop()!;
    const key = this.keys.pop()!;
    const tie = this.ties.pop()!;
    if (this.nodes.length > 0) {
      this.nodes[0] = node;
      this.keys[0] = key;
      this.ties[0] = tie;
      this.siftDown(0);
    }
    return top;
  }

  private less(i: number, j: number): boolean {
    const ki = this.keys[i]!;
    const kj = this.keys[j]!;
    return ki < kj || (ki === kj && this.ties[i]! < this.ties[j]!);
  }

  private swap(i: number, j: number): void {
    [this.nodes[i], this.nodes[j]] = [this.nodes[j]!, this.nodes[i]!];
    [this.keys[i], this.keys[j]] = [this.keys[j]!, this.keys[i]!];
    [this.ties[i], this.ties[j]] = [this.ties[j]!, this.ties[i]!];
  }

  private siftUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(i, parent)) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  private siftDown(index: number): void {
    let i = index;
    const n = this.nodes.length;
    for (;;) {
      const left = 2 * i + 1;
      const right = left + 1;
      let smallest = i;
      if (left < n && this.less(left, smallest)) smallest = left;
      if (right < n && this.less(right, smallest)) smallest = right;
      if (smallest === i) break;
      this.swap(i, smallest);
      i = smallest;
    }
  }
}
