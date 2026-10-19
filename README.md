# 99Tech Code Challenge — Frontend

Submission for the frontend track: problems 1–3.

```
problem-1/   Three ways to sum to n
problem-2/   Fancy form — token swap
problem-3/   Messy React
```

Each folder has its own README with the reasoning; this file is the map.

## Problem 1 — Three ways to sum to n

[`problem-1`](./problem-1) · [README](./problem-1/README.md)

The Gauss formula, a loop, and divide-and-conquer recursion. All three share one
input contract, so they are interchangeable: `n <= 0` returns `0` (the empty sum),
non-integers throw a `TypeError`, and any `n` whose result would pass
`Number.MAX_SAFE_INTEGER` throws a `RangeError` instead of returning a silently
wrong number. The recursion splits the range in half, so its stack depth is
`O(log n)` and it can't overflow where plain recursion would (around `n = 9,000`).

```bash
cd problem-1
node --test          # 19 tests, no dependencies
```

## Problem 2 — Fancy Form (Token Swap)

[`problem-2`](./problem-2) · [README](./problem-2/README.md)

A token swap form on Next.js 16 + React 19 + Ant Design 6 + TanStack Query. Live
prices from `interview.switcheo.com` (deduplicated, latest record wins), icons
from `Switcheo/token-icons` with a letter fallback, two-way amount entry, a
searchable token picker, a mock wallet with MAX, validation messages on the
field and the submit button, and a simulated swap with a loading state and a
success toast.

The swap math lives in [`lib/swap.ts`](./problem-2/src/app/lib/swap.ts) as pure
functions. The first version had the exchange rate inverted (1 ETH quoted about
0.0006 USDC); that is now pinned by a regression test. Only the typed amount is
stored in state, and the other side is derived, so the two fields can't drift
apart.

```bash
cd problem-2
yarn install
yarn dev             # http://localhost:3000
yarn build           # production build
yarn test            # 62 tests
yarn lint && yarn typecheck
```

## Problem 3 — Messy React

[`problem-3`](./problem-3) · [README](./problem-3/README.md)

[`original.tsx`](./problem-3/original.tsx) keeps the code as given and marks each
issue inline with `[n]`; [`refactored.tsx`](./problem-3/refactored.tsx) is the
rewrite, and it type-checks on its own under `strict`. 20 issues in four groups
(correctness bugs, React anti-patterns, efficiency, typing), plus the trade-offs
the refactor deliberately kept.

## Tooling note

I used **Claude Code** (Anthropic's CLI) throughout this challenge. The split
was roughly: I set direction — what to build, which changes were worth making,
how it should look — and the assistant did most of the writing.

Problem 2's direction was my call: using Next.js 16 and Ant Design 6,
refactoring the swap logic out of the components, and the visual details, such
as keeping the original look over a flashier redesign and getting the switch
button to a true circle with the right hover colour. Claude Code did the
refactor, and on a review pass over code I had considered finished it caught
that the exchange rate was inverted (1 ETH quoted about 0.0006 USDC) and that
the price feed has duplicate records for the same currency.

Problem 3 is where it was fastest. Auditing a deliberately messy component is a
wide, mechanical sweep: it surfaced most of the 20 issues in one pass — including
ones easy to read straight past, like the comparator with no equal-case branch or
`prices` sitting in a dependency array the memo never reads — and carried much of
the refactor.

Problem 1 was a useful check in the other direction: the tests showed that a
"halve the even factor first" trick from a reference solution isn't needed,
because `n * (n + 1)` stays exact up to `MAX_N`, so the simpler formula stayed.

Happy to walk through any of it live.
