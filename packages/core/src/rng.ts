/**
 * Seeded pseudo-random number generator (mulberry32).
 *
 * Map generation must be reproducible: the same seed has to produce the same map on any
 * machine, so a scenario can be shared as a seed instead of a full grid, and so benchmarks
 * can be rerun on identical inputs. `Math.random` cannot do that, since it cannot be seeded.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** A number in `[0, 1)`. */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** An integer in `[0, maxExclusive)`. */
  int(maxExclusive: number): number {
    return Math.floor(this.next() * maxExclusive);
  }

  /** True with probability `p`, where `p` is in `[0, 1]`. */
  chance(p: number): boolean {
    return this.next() < p;
  }
}

/** A seed derived from the current time, for when the user asks for "another one". */
export function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}
