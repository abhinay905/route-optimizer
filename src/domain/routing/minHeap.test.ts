import { describe, expect, it } from "vitest";
import { MinHeap } from "./minHeap";

describe("MinHeap", () => {
  it("pops items in ascending order", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    for (const value of [5, 1, 4, 2, 3]) {
      heap.push(value);
    }

    const popped: number[] = [];
    while (heap.size > 0) {
      popped.push(heap.pop()!);
    }

    expect(popped).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns undefined when popping an empty heap", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    expect(heap.pop()).toBeUndefined();
  });

  it("tracks size as items are pushed and popped", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    expect(heap.size).toBe(0);
    heap.push(10);
    heap.push(5);
    expect(heap.size).toBe(2);
    heap.pop();
    expect(heap.size).toBe(1);
  });
});
