const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { MAX_N, sum_to_n_a, sum_to_n_b, sum_to_n_c } = require("./sum-to-n.js");

const implementations = { sum_to_n_a, sum_to_n_b, sum_to_n_c };

/** Reference value in BigInt so the expectation itself cannot lose precision. */
const expected = (n) => Number((BigInt(n) * BigInt(n + 1)) / 2n);

for (const [name, sumToN] of Object.entries(implementations)) {
  describe(name, () => {
    it("returns known sums", () => {
      assert.equal(sumToN(1), 1);
      assert.equal(sumToN(2), 3);
      assert.equal(sumToN(5), 15);
      assert.equal(sumToN(10), 55);
      assert.equal(sumToN(100), 5050);
    });

    it("matches the reference for 0..2000", () => {
      for (let n = 0; n <= 2000; n++) {
        assert.equal(sumToN(n), expected(n), `n = ${n}`);
      }
    });

    it("returns 0 for zero and negative n (the empty sum)", () => {
      assert.equal(sumToN(0), 0);
      assert.equal(sumToN(-1), 0);
      assert.equal(sumToN(-100), 0);
    });

    it("throws a TypeError for non-integers", () => {
      for (const n of [1.5, NaN, Infinity, -Infinity, "5"]) {
        assert.throws(() => sumToN(n), TypeError, `n = ${String(n)}`);
      }
    });

    it("throws a RangeError when the result would exceed MAX_SAFE_INTEGER", () => {
      assert.throws(() => sumToN(MAX_N + 1), RangeError);
    });
  });
}

describe("large inputs", () => {
  it("MAX_N is the largest n with an exact result", () => {
    assert.ok(expected(MAX_N) <= Number.MAX_SAFE_INTEGER);
    assert.ok((BigInt(MAX_N + 1) * BigInt(MAX_N + 2)) / 2n > BigInt(Number.MAX_SAFE_INTEGER));
  });

  it("A is exact at MAX_N even though n * (n + 1) passes MAX_SAFE_INTEGER", () => {
    assert.ok(MAX_N * (MAX_N + 1) > Number.MAX_SAFE_INTEGER);
    assert.equal(sum_to_n_a(MAX_N), expected(MAX_N));
  });

  it("C handles inputs far past where plain recursion overflows the stack", () => {
    assert.equal(sum_to_n_c(1_000_000), expected(1_000_000));
  });

  it("B and C agree with A at 1,000,000", () => {
    assert.equal(sum_to_n_b(1_000_000), sum_to_n_a(1_000_000));
    assert.equal(sum_to_n_c(1_000_000), sum_to_n_a(1_000_000));
  });
});
