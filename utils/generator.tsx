
export function GroupScoreAverage(strengths: number[]): number {
  return GroupScoreSum(strengths) / strengths.length
}

export function GroupScoreSum(strengths: number[]): number {
  return strengths.reduce((v, acc) => v + acc, 0)
}
export class Matcher {
  private scoreGrid: number[][]
  private groupSize: number
  private bestScore: number
  private bestMatches: Array<Array<Array<number>>>

  private computeGroupScore: ((_: number[]) => number) = GroupScoreSum 

  static match(scoreGrid:number[][], groupSize: number, groupScore=GroupScoreSum): Array<Array<Array<number>>> {
    return new Matcher(scoreGrid, groupSize, groupScore).match()
  }

  private constructor(scoreGrid:number[][], groupSize: number, computeGroupScore: ((_: number[]) => number)) {
    this.scoreGrid = scoreGrid
    this.groupSize = groupSize
    this.bestScore = Number.POSITIVE_INFINITY
    this.bestMatches = new Array()
    this.computeGroupScore = computeGroupScore
  }

  private match(): Array<Array<Array<number>>> {
    var allIndices = new Array(this.scoreGrid.length).fill(0).map((_, i:number) => i)
    this.matchRecursive(allIndices, [], 0)
    return this.bestMatches
  }

  private computeGroupSizes(remainingMembers: number): Iterable<number> {
    if (remainingMembers % this.groupSize == 0) {
      return [this.groupSize]
    } else if (this.groupSize == 2) {
      return [2, 3]
    } else {
      // return [] // TODO
      throw new Error("not implemented")
    }
  }

  private matchRecursive(remIndices: Array<number>, partialMatch: Array<Array<number>>, partialScore: number) {
    // console.log("matchRecursive(%s, %s, %s)", remIndices, partialMatch.map(group => `(${group.join(', ')})`).join(" | "), partialScore)
    const groupSizes = this.computeGroupSizes(remIndices.length)
    for (const groupSize of groupSizes) {
      const maxGroupIndex = groupSize - 1
      const currGroup = new Array<number>(groupSize)
      currGroup[0] = remIndices.length - 1
      currGroup[1] = currGroup[0]
      for (var i = 1; i >= 1;) {
        const currValue = --currGroup[i]
        if (currValue >= maxGroupIndex - i) {
          // the current group value can be part of a valid group
          if (i == maxGroupIndex) {
            // base case, group has been fully populated
            let currScore = partialScore + this.computeGroupScore([...this.getWeights(remIndices, currGroup)])
            if (currScore > this.bestScore) {
              // console.log("Skipping group %s due to bad score (%d > %d)", currGroup, currScore, this.bestScore)
              continue
            }
            const resolvedGroup = currGroup.map(v => remIndices[v])
            const currMatch = partialMatch.concat([resolvedGroup])
            if (remIndices.length == resolvedGroup.length) {
              if (currScore < this.bestScore) {
                this.bestScore = currScore
                this.bestMatches = new Array()
              }
              this.bestMatches.push(currMatch)
              console.log("%s -> %d", currMatch.map(group => `(${group.join(', ')})`).join(" | "), currScore)
            } else {
              this.matchRecursive(remIndices.filter(v => !resolvedGroup.includes(v)), currMatch, currScore)
            }
          } else {
            // initialize the member to the right, travel to the right
            currGroup[++i] = currValue
          }
        } else {
          // value is invalid, travel left (and break if we are i == 0)
          i--
        }
      }
    }
  }

  private *getWeights(indices: Array<number>, group: Array<number>): Generator<number, any, undefined> {
    for (let i = group.length - 1; i >= 1; i--) {
      for (let j = i - 1; j >= 0; j--) {
        yield this.lookupScore(indices[group[j]], indices[group[i]])
      }
    }
  }

  private lookupScore(p1: number, p2: number): number {
    return this.scoreGrid[this.scoreGrid.length - 1 - p1][p2]
  }
}

export class TeamMatcher {
  private labels:string[];
  private count:number;
  private fam:number[][];

  constructor(labels: string[], connectedness: number[][]) {
    this.labels = labels
    this.count = labels.length
    this.fam = Object.assign([], connectedness.map(row => Object.assign([], row)))
  }

  public match(groupSize: number): Array<Array<Array<String>>> {
    const matchedIndices = Matcher.match(this.fam, groupSize)
    return matchedIndices.map(m => m.map(g => g.map(i => this.labels[i])))
  }

}
