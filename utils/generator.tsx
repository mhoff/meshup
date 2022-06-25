/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
import { v4 as genID } from 'uuid';

export function GroupScoreSum(strengths: number[]): number {
  return strengths.reduce((v, acc) => v + acc, 0);
}

export function GroupScoreAverage(strengths: number[]): number {
  return GroupScoreSum(strengths) / strengths.length;
}

export class Matcher {
  private scoreGrid: number[][];

  private groupSize: number;

  private bestScore: number;

  private bestMatches: Array<Array<Array<number>>>;

  private computeGroupScore: ((_: number[]) => number) = GroupScoreSum;

  private alternateGroupSizeFilter: ((_: number) => boolean);

  static match(
    scoreGrid:number[][],
    groupSize: number,
    groupScore = GroupScoreSum,
    alternateGroupSizeFilter = ((_: number) => true),
  ): Matcher {
    return new Matcher(scoreGrid, groupSize, groupScore, alternateGroupSizeFilter);
  }

  private constructor(
    scoreGrid:number[][],
    groupSize: number,
    computeGroupScore: ((_: number[]) => number),
    alternateGroupSizeFilter: ((_: number) => boolean),
  ) {
    this.scoreGrid = scoreGrid;
    this.groupSize = groupSize;
    this.bestScore = Number.POSITIVE_INFINITY;
    this.bestMatches = [];
    this.computeGroupScore = computeGroupScore;
    this.alternateGroupSizeFilter = alternateGroupSizeFilter;
  }

  public* match(): Generator<unknown, any, unknown> {
    const allIndices = new Array(this.scoreGrid.length).fill(0).map((_, i:number) => i);
    yield* this.matchRecursive(allIndices, [], 0);
  }

  public getBestMatches(): Array<Array<Array<number>>> {
    return this.bestMatches;
  }

  private* computeGroupSizes(remainingMembers: number): Generator<number, any, undefined> {
    const diff = remainingMembers % this.groupSize;
    for (let i = this.groupSize + diff; i >= Math.max(this.groupSize - diff, 1); i--) {
      if (this.alternateGroupSizeFilter(i)) {
        yield i;
      }
    }
  }

  private* matchRecursive(
    remIndices: Array<number>,
    partialMatch: Array<Array<number>>,
    partialScore: number,
  ): Generator<unknown, any, unknown> {
    const groupSizes = [...this.computeGroupSizes(remIndices.length)];
    for (let g = groupSizes.length - 1; g >= 0; g--) {
      const groupSize = groupSizes[g];
      const maxGroupIndex = groupSize - 1;
      const currGroup = new Array<number>(groupSize);
      currGroup[0] = remIndices.length - 1;
      currGroup[1] = currGroup[0];
      for (let i = 1; i >= 1;) {
        const currValue = --currGroup[i];
        if (currValue >= maxGroupIndex - i) {
          // the current group value can be part of a valid group
          if (i === maxGroupIndex) {
            // base case, group has been fully populated
            const currScore = partialScore + this.computeGroupScore([...this.getWeights(remIndices, currGroup)]);
            if (currScore > this.bestScore) {
              // console.log("Skipping group %s due to bad score (%d > %d)", currGroup, currScore, this.bestScore)
              // eslint-disable-next-line no-continue
              continue;
            }
            const resolvedGroup = currGroup.map((v) => remIndices[v]);
            const currMatch = partialMatch.concat([resolvedGroup]);
            if (remIndices.length === resolvedGroup.length) {
              if (currScore < this.bestScore) {
                this.bestScore = currScore;
                this.bestMatches = [];
              }
              this.bestMatches.push(currMatch);
              // console.log('%s -> %d', currMatch.map((group) => `(${group.join(', ')})`).join(' | '), currScore);
            } else {
              yield* this.matchRecursive(remIndices.filter((v) => !resolvedGroup.includes(v)), currMatch, currScore);
            }
          } else {
            // initialize the member to the right, travel to the right
            currGroup[++i] = currValue;
          }
        } else {
          // value is invalid, travel left (and break if we are i == 0)
          i--;
        }
      }
      yield;
    }
  }

  private* getWeights(indices: Array<number>, group: Array<number>): Generator<number, any, undefined> {
    for (let i = group.length - 1; i >= 1; i--) {
      for (let j = i - 1; j >= 0; j--) {
        yield this.lookupScore(indices[group[j]], indices[group[i]]);
      }
    }
  }

  private lookupScore(p1: number, p2: number): number {
    return this.scoreGrid[this.scoreGrid.length - 1 - p1][p2];
  }
}

export interface MatchResult<Node> {
  pairings: Node[][]
  id: string
}

export interface MatcherRunner<Node> {
  tick: (ms: number) => MatchResult<Node>[] | null
}

export function matchTeamTickable<T>(
  nodes: T[],
  connectedness: number[][],
  groupSize: number,
  alternateGroupSizes: number[],
): MatcherRunner<T> {
  const matcher = Matcher.match(
    connectedness,
    groupSize,
    GroupScoreSum,
    alternateGroupSizes.includes.bind(alternateGroupSizes),
  );
  const gen = matcher.match();

  return ({
    tick: (ms: number) => {
      const before = Date.now();
      // eslint-disable-next-line no-empty
      do {
        if ((Date.now() - before) < ms) {
          return null;
        }
      } while ((gen.next().done !== true));
      return matcher.getBestMatches().map((m) => ({
        pairings: m.map((g) => g.map((i) => nodes[i])),
        id: genID(),
      }));
    },
  });
}

export function matchTeam(
  connectedness: number[][],
  groupSize: number,
  alternateGroupSizes: number[],
): number[][][] {
  const matcher = Matcher.match(
    connectedness,
    groupSize,
    GroupScoreSum,
    alternateGroupSizes.includes.bind(alternateGroupSizes),
  );
  const gen = matcher.match();
  // eslint-disable-next-line no-empty
  while (!gen.next().done) {}
  return matcher.getBestMatches();
}

export function evalResult<T>(nodes: T[], match: number[][]): MatchResult<T> {
  return {
    pairings: match.map((g) => g.map((i) => nodes[i])),
    id: genID(),
  };
}
