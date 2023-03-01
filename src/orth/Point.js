import { Key } from './util'

class Point {
  G // : number;
  H // : number;
  parent // : Point | null;
  xy // : number[];
  key // : string;
  F // : number;

  /**
   *
   * @param {number[]} xy
   * @param {number} G
   * @param {Point | null} parent
   */
  constructor(xy, G = 0, parent = null) {
    this.G = G
    this.H = 0
    this.parent = parent
    this.xy = xy
    this.key = Key(xy)
    this.F = G
  }

  /**
   *
   * @param {Point} parent
   */
  setParent(parent) {
    this.parent = parent
  }

  /**
   *
   * @param {number} G
   */
  setG(G) {
    this.G = G
    this.F = this.H + this.G
  }

  /**
   *
   * @param {number} H
   */
  setH(H) {
    this.H = H
    this.F = this.H + this.G
  }

  /**
   *
   * @param {Point} other
   * @return {number}
   */
  compare(other) {
    return this.F - other.F
  }
}

export default Point
