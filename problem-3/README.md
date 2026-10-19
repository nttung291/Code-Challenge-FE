# Problem 3 — Messy React

- [`original.tsx`](./original.tsx): the original `WalletPage` from the brief, with inline review comments marked `[n]`.
- [`refactored.tsx`](./refactored.tsx): the cleaned-up version.

The list below is the full review. Each `[n]` marker in `original.tsx` shows where that issue is.

## Issues found

### Correctness bugs

1. **`lhsPriority` is never defined.** The filter stores the result in `balancePriority` and then checks `lhsPriority`, so it throws a `ReferenceError` the first time it runs.
   **Fix:** use the variable that was computed.

2. **The filter keeps the wrong balances.** It returns `true` when `amount <= 0`, so the wallet shows only empty or negative balances and hides every real one.
   **Fix:** `priority > -99 && amount > 0`.

3. **The sort comparator returns nothing for equal priorities.** When two chains have the same priority (Zilliqa and Neo are both 20), the callback returns `undefined`, which isn't a valid comparator result.
   **Fix:** `b.priority - a.priority` covers all three cases.

4. **`toFixed()` without an argument rounds to 0 decimals.** `1.75` is shown as `"2"`.
   **Fix:** pass the intended precision, e.g. `toFixed(2)`.

5. **Unknown currencies produce `NaN`.** `prices[balance.currency]` is `undefined` for a currency with no price, so `usdValue` becomes `NaN` and is rendered.
   **Fix:** `prices[balance.currency] ?? 0`.

6. **The rows read `formatted` from data that doesn't have it.** `rows` maps over `sortedBalances` (plain `WalletBalance`) but types each item as `FormattedWalletBalance`, so `balance.formatted` is `undefined` at runtime. Meanwhile `formattedBalances`, which does have the field, is never used.
   **Fix:** build the rows from the formatted list.

7. **`WalletBalance` has no `blockchain` field.** Every `getPriority(balance.blockchain)` call reads a property the interface doesn't declare.
   **Fix:** add `blockchain` to the interface.

8. **Several names are never imported or defined:** `BoxProps`, `WalletRow`, `classes`, `useWalletBalances`, `usePrices`, `useMemo`. The snippet can't compile as written.
   **Fix:** `refactored.tsx` declares them at the top so it type-checks on its own. In the real codebase they would be normal imports.

### React anti-patterns

9. **`key={index}` on a sorted list.** After a re-sort, React matches rows by position, so component state and DOM nodes attach to the wrong balance.
   **Fix:** a stable key, `${blockchain}-${currency}`.

10. **Wrong `useMemo` dependencies.** `prices` is listed but never read inside the memo, so the list is re-filtered and re-sorted on every price update.
    **Fix:** depend on `[balances]` only. Hoisting `getPriority` removes it as a dependency.

11. **`formattedBalances` is wasted work.** It is rebuilt on every render without memoisation and then thrown away.
    **Fix:** make it the memoised list the rows use.

12. **`rows` is rebuilt on every render**, even when neither balances nor prices changed.
    **Fix:** `useMemo` on `[formattedBalances, prices]`.

13. **`children` is pulled out of props and then dropped.** Anything a caller nests inside `WalletPage` silently disappears.
    **Fix:** render `{children}`.

### Efficiency

14. **`getPriority` is recreated on every render** even though it uses nothing from props or state.
    **Fix:** move it to module scope.

15. **`getPriority` runs twice per sort comparison**, which is O(n log n) extra lookups.
    **Fix:** compute each priority once (`map` to `{ balance, priority }`), then filter and sort on that.

16. **A `switch` is used for a fixed lookup table.** It's verbose and easy to get out of sync.
    **Fix:** a `BLOCKCHAIN_PRIORITY` object, which also defines the `Blockchain` type.

### Typing and structure

17. **`blockchain: any`** in `getPriority` turns off type checking for chain names.
    **Fix:** a `Blockchain` union derived from the priority table.

18. **`FormattedWalletBalance` repeats `WalletBalance`'s fields** instead of extending it, so the two can drift apart.
    **Fix:** `interface FormattedWalletBalance extends WalletBalance`.

19. **`interface Props extends BoxProps {}`** is an empty interface, which lint rejects and which adds nothing.
    **Fix:** `type Props = BoxProps`.

20. **`React.FC<Props>` and `(props: Props)` both annotate the props**, which is redundant.
    **Fix:** destructure in the parameter list and rely on `React.FC<Props>`.

## Trade-offs

**`getPriority` accepts `string`, not `Blockchain`.** Balances come from a network payload, so an unknown chain is a real possibility at runtime. If the parameter were typed as `Blockchain`, TypeScript would treat the fallback as unreachable. Taking `string` keeps the fallback meaningful.

**`map → filter → sort → map` creates a few short-lived arrays.** A single `reduce` would allocate less, but a wallet holds tens of balances, so the readability of four clear steps is worth more. The real cost in the original was calling `getPriority` twice per comparison, and that is fixed.

**The priority is dropped after sorting.** Nothing downstream needs it, so the result goes back to the plain balance shape instead of passing the sort's working data to the rows.

## Verifying

`refactored.tsx` type-checks on its own under `strict`, using the TypeScript and React installed in `problem-2`:

```bash
cd problem-2
cp ../problem-3/refactored.tsx ./__check.tsx
npx tsc --noEmit --jsx react-jsx --strict --target ES2020 \
  --moduleResolution bundler --module ESNext --skipLibCheck __check.tsx
rm __check.tsx
```
