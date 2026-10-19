/**
 * Three ways to compute sum_to_n(n) = 1 + 2 + ... + n.
 *
 * Shared contract (all three return identical results):
 * - n must be an integer, otherwise a TypeError is thrown.
 * - n <= 0 returns 0 (the empty sum).
 * - The brief guarantees the result is below Number.MAX_SAFE_INTEGER. Inputs
 *   that would break that guarantee throw a RangeError instead of silently
 *   returning an imprecise number.
 */

/** Largest n whose sum still fits exactly in a JS number: n(n+1)/2 <= 2^53 - 1. */
const MAX_N = Math.floor((Math.sqrt(8 * Number.MAX_SAFE_INTEGER + 1) - 1) / 2);

/** @param {number} n */
function validate(n) {
  if (!Number.isInteger(n)) {
    throw new TypeError(`n must be an integer, received ${n}`);
  }
  if (n > MAX_N) {
    throw new RangeError(`n must be <= ${MAX_N} for an exact result, received ${n}`);
  }
}

/**
 * A: Gauss closed-form formula. O(1) time, O(1) space. The one to use.
 *
 * n * (n + 1) can exceed MAX_SAFE_INTEGER (2^53 - 1), but it is always even and
 * below 2^54, and doubles represent every even integer below 2^54 exactly, so
 * the product and the halving are both exact for every n <= MAX_N.
 *
 * @param {number} n
 * @returns {number}
 */
var sum_to_n_a = function (n) {
  validate(n);
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
};

/**
 * B: Iterative accumulation. O(n) time, O(1) space.
 * Simple and exact, but linear: n near MAX_N takes noticeably long.
 *
 * @param {number} n
 * @returns {number}
 */
var sum_to_n_b = function (n) {
  validate(n);
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/**
 * C: Divide-and-conquer recursion. O(n) time, O(log n) call-stack depth.
 *
 * Plain recursion (n + sum(n - 1)) needs n stack frames and overflows at
 * around n = 9,000 with Node's default stack. Splitting the range in half keeps
 * the depth logarithmic, so even n = MAX_N stays about 27 frames deep.
 *
 * @param {number} n
 * @returns {number}
 */
var sum_to_n_c = function (n) {
  validate(n);
  if (n <= 0) return 0;
  return sumRange(1, n);
};

/**
 * @param {number} lo
 * @param {number} hi
 * @returns {number}
 */
function sumRange(lo, hi) {
  if (lo === hi) return lo;
  const mid = Math.floor((lo + hi) / 2);
  return sumRange(lo, mid) + sumRange(mid + 1, hi);
}

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c, MAX_N };
