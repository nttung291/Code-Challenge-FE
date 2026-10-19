# Problem 1 — Three ways to sum to n

- [`sum-to-n.js`](./sum-to-n.js): three implementations of `sum_to_n(n) = 1 + 2 + ... + n`.
- [`sum-to-n.test.js`](./sum-to-n.test.js): tests that run every case against all three. No dependencies.

## Run

```bash
cd problem-1
node --test
```

Uses Node's built-in test runner, so there's nothing to install.

## Shared contract

All three implementations behave identically, so they can be swapped freely:

| Input | Result |
|---|---|
| positive integer up to `MAX_N` | the sum, e.g. `sum_to_n(5) === 15` |
| `0` or a negative integer | `0` (the empty sum) |
| non-integer, `NaN`, `±Infinity`, non-number | throws `TypeError` |
| integer above `MAX_N` | throws `RangeError` |

`MAX_N = 134,217,727` is the largest `n` whose sum still fits in `Number.MAX_SAFE_INTEGER`. The brief says the result will stay below that limit; past it, the answer would silently lose precision, so the functions throw instead of returning a wrong number.

**Assumption:** the brief says the input can be "any integer" but only defines the sum for positive `n`. For `n <= 0` the range `1..n` is empty, so the result is `0`.

## The three approaches

| | Approach | Time | Space | When to use |
|---|---|---|---|---|
| `sum_to_n_a` | Gauss formula `n(n+1)/2` | O(1) | O(1) | Always. This is the one to ship. |
| `sum_to_n_b` | Loop that adds `1..n` | O(n) | O(1) | The most obvious version; slow for large `n`. |
| `sum_to_n_c` | Divide-and-conquer recursion | O(n) | O(log n) stack | Shows recursion that can't overflow the stack. |

### Why the formula stays exact

At `MAX_N`, the intermediate product `n * (n + 1)` is larger than `Number.MAX_SAFE_INTEGER`, which looks risky. It is still exact: the product is always even and below 2^54, and JS numbers represent every even integer in that range exactly. Halving it is exact too. A test pins this at `MAX_N`.

### Why the recursion splits the range

The textbook version, `n + sum(n - 1)`, uses one stack frame per number and overflows at around `n = 9,000` with Node's default stack. `sum_to_n_c` instead adds the sums of the two halves of the range, so the stack depth is about `log2(n)`, around 27 frames even at `MAX_N`. It still does O(n) additions, so it's no faster than the loop; the point is that it can't crash.

## Changes from the first version

- **Negative input:** the three versions disagreed. For `-5` the formula returned `10`, the loop `0`, and the recursion `-5`. All three now return `0`.
- **Stack overflow:** the recursive version crashed with a `RangeError` at around `n = 9,000`. It now splits the range, so its depth is logarithmic.
- **Bad input:** non-integers were silently accepted, and each version gave a different answer (`2.5` gave `4.375`, `3` and `4.5`). They now throw a `TypeError`.
- **Precision:** results above `Number.MAX_SAFE_INTEGER` were returned imprecisely. They now throw a `RangeError`.
- **Packaging:** the functions are exported and covered by tests. Before, nothing exported them.
