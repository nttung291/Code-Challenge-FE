# Problem 2 — Fancy Form (Token Swap)

A currency swap form built with **Next.js 16 (App Router) + React 19 + Ant Design 6 + TanStack Query**.

## Run

```bash
cd problem-2
yarn install
yarn dev          # http://localhost:3000
yarn test         # vitest: 62 unit tests over the swap logic, price feed and formatting
yarn lint         # eslint (next core-web-vitals + typescript)
yarn typecheck    # tsc --noEmit
yarn build        # production build
```

Requires Node ≥ 20.9.

## Features

- **Live prices** from `https://interview.switcheo.com/prices.json`. The feed has
  duplicate currencies (USDC ×4, BUSD ×2); the most recent record wins, and
  records without a positive price are dropped.
- **Token icons** from `Switcheo/token-icons`, falling back to a letter avatar when
  an icon does not exist.
- **Two-way entry**: type in either *You pay* or *You receive* and the other side
  is derived. Only the typed amount and its side are stored in state; the other
  leg is computed on render, so it can't fall out of sync when a token changes.
- **Searchable token picker** (modal, autofocused search, Enter picks the first
  match, shows price and balance). Choosing the token already on the other side
  swaps the two.
- **Direction switch**: flips the tokens and keeps the typed amount attached to
  its token.
- **Validation and error messages**: no token, same token, missing price, empty
  amount, insufficient balance (flagged inline on the field). The submit button
  always shows the current blocker.
- **Mock wallet** with deterministic per-token balances, a MAX button, and
  balances that update after each swap.
- **Simulated backend**: submitting shows a loading state for 1.5 s, then a
  success toast.
- **Price feed failure** shows an error alert with a Retry button.

## Structure

```
src/app/
  page.tsx                 view: loading / error / form states
  hooks/
    useTokens.ts           fetch + cache the price feed (TanStack Query)
    useSwapForm.ts         form state, derived quote, validation, submit
  lib/                     pure, framework-free, unit-tested
    swap.ts                quote math, validation, settlement, token selection, input parsing
    tokens.ts              price feed -> Token[] (dedupe), mock balances
    format.ts              USD / amount / rate formatting
    types.ts
  components/
    CurrencyInputBox.tsx   one side of the swap
    TokenSelect.tsx        trigger button + searchable modal
    TokenIcon.tsx          icon with letter fallback
    PriceDisplay.tsx       unit price + USD value
  services/providers.tsx   QueryClient, AntdRegistry (SSR styles), dark theme, App
```

## Exchange rate

```
rate     = fromPrice / toPrice        // units of `to` per 1 `from`
toAmount = fromAmount * rate
```

USD value is conserved: `fromAmount * fromPrice === toAmount * toPrice`.
The previous version used `toPrice / fromPrice`, which quoted 1 ETH ≈ 0.0006 USDC.
`lib/swap.test.ts` pins this with a regression test.

## Changes from v0.1

| Area | Before | After |
| --- | --- | --- |
| Deps | Next 15.4, antd 5 + React 19 patch | Next 16, antd 6 (native React 19), explicit `@ant-design/icons` |
| Exchange math | Inverted rate when typing in *pay* or changing the *receive* token | One `quote()` function, tested |
| Price feed | Duplicate currencies, last row overwrote others at random | Latest record wins |
| State | Both amounts stored and synced by hand in 4 handlers | Typed amount + side; other leg derived |
| Validation | Button disabled with no reason for most cases | Typed error codes, inline and button messages |
| SSR styles | `AntdRegistry` installed but not used (flash of unstyled antd) | Wired into providers |
| Feed error | `console.error` only | Error alert with Retry |
| `PriceDisplay` | `{amount && …}` rendered a literal `0` | Explicit `amount > 0` check |
| Styling | Many `!important` overrides | antd dark theme tokens + CSS variables |
| App icon | Default Next.js favicon | `src/app/icon.svg`, a swap mark in the app's colours |
| Tooling | No lint config (`next lint` removed in Next 16), no tests | ESLint flat config, Vitest |

## Tests

```bash
yarn test
```

62 tests, all on code with no UI: the swap math in both directions, validation
codes, settlement, token selection (default fallback, picking the other side's
token swaps the two, flipping keeps the typed amount on its token), amount input
parsing, price-feed dedupe and filtering, and number formatting.
Components are kept thin so that behaviour lives in `lib/` and can be tested
without a DOM.

## Assumptions

- No fee or slippage is simulated; the swap is a straight USD-value conversion.
- Balances are mock and reset on reload.
- Amounts keep 8 decimal places.
