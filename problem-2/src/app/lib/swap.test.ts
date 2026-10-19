import { describe, expect, it } from "vitest";
import {
  applySwap,
  exchangeRate,
  flipSelection,
  oppositeSide,
  parseAmountInput,
  pickToken,
  quote,
  roundAmount,
  selectToken,
  validateSwap,
} from "./swap";
import type { Token } from "./types";

// Real values from the price feed.
const ETH = 1645.9337373737374;
const USDC = 1;
const SWTH = 0.004039850455012084;

describe("exchangeRate", () => {
  it("is units of `to` received per 1 unit of `from`", () => {
    expect(exchangeRate(ETH, USDC)).toBeCloseTo(1645.93, 2);
    expect(exchangeRate(USDC, ETH)).toBeCloseTo(1 / 1645.93, 8);
  });

  it.each([
    [0, 1],
    [1, 0],
    [-5, 1],
    [undefined, 1],
    [1, undefined],
  ])("is 0 for invalid prices (%p, %p)", (from, to) => {
    expect(exchangeRate(from, to)).toBe(0);
  });
});

describe("quote", () => {
  // Regression: the original code used toPrice / fromPrice, so 1 ETH quoted
  // ~0.0006 USDC instead of ~1645 USDC.
  it("selling 1 ETH yields ~1645 USDC", () => {
    const q = quote({ fromPrice: ETH, toPrice: USDC, side: "from", amount: 1 });
    expect(q.fromAmount).toBe(1);
    expect(q.toAmount).toBeCloseTo(1645.93, 2);
  });

  it("buying 1645.93 USDC costs ~1 ETH", () => {
    const q = quote({ fromPrice: ETH, toPrice: USDC, side: "to", amount: 1645.9337373737374 });
    expect(q.toAmount).toBeCloseTo(1645.93, 2);
    expect(q.fromAmount).toBeCloseTo(1, 6);
  });

  it("conserves USD value in both directions", () => {
    for (const side of ["from", "to"] as const) {
      const q = quote({ fromPrice: SWTH, toPrice: ETH, side, amount: 10_000 });
      expect(q.fromAmount! * SWTH).toBeCloseTo(q.toAmount! * ETH, 4);
    }
  });

  it("round-trips: quoting the result back gives the original amount", () => {
    const forward = quote({ fromPrice: ETH, toPrice: SWTH, side: "from", amount: 2.5 });
    const back = quote({ fromPrice: ETH, toPrice: SWTH, side: "to", amount: forward.toAmount });
    expect(back.fromAmount).toBeCloseTo(2.5, 6);
  });

  it("keeps the typed side and blanks the derived side for empty input", () => {
    expect(quote({ fromPrice: ETH, toPrice: USDC, side: "from", amount: null })).toEqual({
      rate: exchangeRate(ETH, USDC),
      fromAmount: null,
      toAmount: null,
    });
    expect(quote({ fromPrice: ETH, toPrice: USDC, side: "to", amount: 0 }).fromAmount).toBeNull();
  });

  it("does not derive anything when a price is missing", () => {
    const q = quote({ fromPrice: undefined, toPrice: USDC, side: "from", amount: 5 });
    expect(q).toEqual({ rate: 0, fromAmount: 5, toAmount: null });
  });
});

describe("roundAmount", () => {
  it("rounds to 8 decimals and maps non-finite values to 0", () => {
    expect(roundAmount(0.123456789123)).toBe(0.12345679);
    expect(roundAmount(NaN)).toBe(0);
    expect(roundAmount(Infinity)).toBe(0);
  });
});

describe("validateSwap", () => {
  const valid = {
    fromToken: "ETH",
    toToken: "USDC",
    fromAmount: 1,
    toAmount: 1645,
    rate: 1645,
    balance: 2,
  };

  it("accepts a valid swap", () => {
    expect(validateSwap(valid)).toBeNull();
  });

  it("accepts spending the exact balance", () => {
    expect(validateSwap({ ...valid, fromAmount: 2 })).toBeNull();
  });

  it.each([
    ["NO_TOKEN", { fromToken: undefined }],
    ["SAME_TOKEN", { toToken: "ETH" }],
    ["NO_PRICE", { rate: 0 }],
    ["NO_AMOUNT", { fromAmount: null }],
    ["NO_AMOUNT", { toAmount: 0 }],
    ["INSUFFICIENT_BALANCE", { fromAmount: 2.0001 }],
  ])("reports %s", (code, override) => {
    expect(validateSwap({ ...valid, ...override })?.code).toBe(code);
  });

  it("names the token in the insufficient balance message", () => {
    expect(validateSwap({ ...valid, balance: 0 })?.message).toBe("Insufficient ETH balance");
  });
});

describe("applySwap", () => {
  const wallet = { ETH: 3, USDC: 500, ATOM: 12 };

  it("debits the sold token and credits the bought one", () => {
    expect(applySwap(wallet, "ETH", "USDC", 1, 1645.93)).toEqual({
      ETH: 2,
      USDC: 2145.93,
      ATOM: 12,
    });
  });

  it("does not mutate the input", () => {
    applySwap(wallet, "ETH", "USDC", 1, 1);
    expect(wallet.ETH).toBe(3);
  });

  it("credits a token not yet held and never goes negative", () => {
    const next = applySwap(wallet, "ETH", "SWTH", 99, 10);
    expect(next.ETH).toBe(0);
    expect(next.SWTH).toBe(10);
  });
});

describe("parseAmountInput", () => {
  it.each([
    ["12.5", 12.5],
    ["1,234.5", 1234.5],
    ["1a2b3", 123],
    ["-42", 42],
    ["1.2.3", 1.23],
    [".5", 0.5],
    ["0.123456789123", 0.12345678],
    ["", 0],
    [undefined, 0],
  ])("%p -> %p", (raw, want) => {
    expect(parseAmountInput(raw)).toBe(want);
  });

  it("honours a custom decimal cap", () => {
    expect(parseAmountInput("1.23456", 2)).toBe(1.23);
  });
});

describe("pickToken", () => {
  const tokens = ["ATOM", "ETH", "USDC"].map(
    (symbol): Token => ({ symbol, price: 1, iconUrl: "" })
  );

  it("returns the wanted symbol when the feed has it", () => {
    expect(pickToken(tokens, "ETH")).toBe("ETH");
  });

  it("falls back to the first token when the wanted one is missing", () => {
    expect(pickToken(tokens, "SWTH")).toBe("ATOM");
  });

  it("skips the token already used on the other side", () => {
    expect(pickToken(tokens, "SWTH", "ATOM")).toBe("ETH");
  });

  it("returns undefined when there are no tokens", () => {
    expect(pickToken([], "ETH")).toBeUndefined();
  });
});

describe("selectToken", () => {
  const selection = { from: "ETH", to: "USDC" };

  it("changes only the side that was picked", () => {
    expect(selectToken(selection, "from", "ATOM")).toEqual({ from: "ATOM", to: "USDC" });
    expect(selectToken(selection, "to", "ATOM")).toEqual({ from: "ETH", to: "ATOM" });
  });

  it("swaps the two when the other side's token is picked", () => {
    expect(selectToken(selection, "from", "USDC")).toEqual({ from: "USDC", to: "ETH" });
    expect(selectToken(selection, "to", "ETH")).toEqual({ from: "USDC", to: "ETH" });
  });

  it("never produces the same token on both sides", () => {
    for (const side of ["from", "to"] as const) {
      for (const symbol of ["ETH", "USDC", "ATOM"]) {
        const next = selectToken(selection, side, symbol);
        expect(next.from).not.toBe(next.to);
      }
    }
  });

  it("is a no-op when re-picking the same token", () => {
    expect(selectToken(selection, "from", "ETH")).toEqual(selection);
  });
});

describe("flipping direction", () => {
  it("swaps the tokens and the typed side", () => {
    expect(flipSelection({ from: "ETH", to: "USDC" })).toEqual({ from: "USDC", to: "ETH" });
    expect(oppositeSide("from")).toBe("to");
    expect(oppositeSide("to")).toBe("from");
  });

  // The form keeps the typed amount on its token: typing 2 ETH then flipping
  // must still mean 2 ETH, now on the receive side.
  it("keeps the typed amount attached to its token", () => {
    const before = quote({ fromPrice: ETH, toPrice: USDC, side: "from", amount: 2 });
    const after = quote({ fromPrice: USDC, toPrice: ETH, side: oppositeSide("from"), amount: 2 });
    expect(after.toAmount).toBe(2);
    expect(after.fromAmount).toBeCloseTo(before.toAmount!, 6);
  });
});
