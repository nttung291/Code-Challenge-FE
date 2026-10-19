import type { Balances, Side, Token } from "./types";

/** Decimal places kept for amounts; past any precision the mock wallet needs. */
export const AMOUNT_DECIMALS = 8;

export const roundAmount = (n: number, decimals = AMOUNT_DECIMALS) =>
  Number.isFinite(n) ? Number(n.toFixed(decimals)) : 0;

/**
 * Parse what the user typed into an amount field: drop anything that is not a
 * digit or a dot, keep only the first dot, and cap the fraction at `decimals`
 * so a typed value never carries more precision than the math keeps.
 */
export function parseAmountInput(raw: string | undefined, decimals = AMOUNT_DECIMALS): number {
  const cleaned = (raw ?? "").replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  if (!rest.length) return Number(whole);
  return Number(`${whole}.${rest.join("").slice(0, decimals)}`);
}

/** The two tokens chosen in the form. */
export interface Selection {
  from: string;
  to: string;
}

/**
 * Resolve a wanted symbol against the tokens the feed actually has: `wanted`
 * when it is listed, otherwise the first token that is not `avoid`.
 */
export const pickToken = (tokens: Token[], wanted: string | undefined, avoid?: string) =>
  tokens.find((t) => t.symbol === wanted)?.symbol ??
  tokens.find((t) => t.symbol !== avoid)?.symbol;

/** Pick `symbol` for one side. Picking the token already on the other side swaps the two. */
export function selectToken(selection: Selection, side: Side, symbol: string): Selection {
  if (side === "from") {
    return symbol === selection.to
      ? { from: symbol, to: selection.from }
      : { ...selection, from: symbol };
  }
  return symbol === selection.from
    ? { from: selection.to, to: symbol }
    : { ...selection, to: symbol };
}

export const flipSelection = ({ from, to }: Selection): Selection => ({ from: to, to: from });

export const oppositeSide = (side: Side): Side => (side === "from" ? "to" : "from");

/** Units of the `to` token received for 1 unit of the `from` token. */
export const exchangeRate = (fromPrice?: number, toPrice?: number) =>
  fromPrice && toPrice && fromPrice > 0 && toPrice > 0 ? fromPrice / toPrice : 0;

export interface QuoteInput {
  fromPrice?: number;
  toPrice?: number;
  /** The field the amount was typed into. */
  side: Side;
  amount: number | null;
}

export interface Quote {
  rate: number;
  fromAmount: number | null;
  toAmount: number | null;
}

/**
 * Derive both legs of the swap from whichever field the user typed in.
 * Value is conserved in USD: fromAmount * fromPrice === toAmount * toPrice.
 */
export function quote({ fromPrice, toPrice, side, amount }: QuoteInput): Quote {
  const rate = exchangeRate(fromPrice, toPrice);
  if (!rate || amount === null || !Number.isFinite(amount) || amount <= 0) {
    return {
      rate,
      fromAmount: side === "from" ? amount : null,
      toAmount: side === "to" ? amount : null,
    };
  }

  return side === "from"
    ? { rate, fromAmount: amount, toAmount: roundAmount(amount * rate) }
    : { rate, fromAmount: roundAmount(amount / rate), toAmount: amount };
}

export interface ValidationInput {
  fromToken?: string;
  toToken?: string;
  fromAmount: number | null;
  toAmount: number | null;
  rate: number;
  balance: number;
}

export type SwapErrorCode =
  | "NO_TOKEN"
  | "SAME_TOKEN"
  | "NO_PRICE"
  | "NO_AMOUNT"
  | "INSUFFICIENT_BALANCE";

export interface SwapError {
  code: SwapErrorCode;
  message: string;
}

/** First reason the swap cannot be submitted, or null when it can. */
export function validateSwap({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  rate,
  balance,
}: ValidationInput): SwapError | null {
  if (!fromToken || !toToken) return { code: "NO_TOKEN", message: "Select a token" };
  if (fromToken === toToken) {
    return { code: "SAME_TOKEN", message: "Select two different tokens" };
  }
  if (!rate) return { code: "NO_PRICE", message: "Price unavailable for this pair" };
  if (!fromAmount || !toAmount || fromAmount <= 0 || toAmount <= 0) {
    return { code: "NO_AMOUNT", message: "Enter an amount" };
  }
  if (fromAmount > balance) {
    return { code: "INSUFFICIENT_BALANCE", message: `Insufficient ${fromToken} balance` };
  }
  return null;
}

/** Settle a swap against the mock wallet. Returns a new object. */
export function applySwap(
  balances: Balances,
  fromToken: string,
  toToken: string,
  fromAmount: number,
  toAmount: number
): Balances {
  return {
    ...balances,
    [fromToken]: Math.max(roundAmount((balances[fromToken] ?? 0) - fromAmount), 0),
    [toToken]: roundAmount((balances[toToken] ?? 0) + toAmount),
  };
}
