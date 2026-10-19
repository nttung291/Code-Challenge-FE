import { afterEach, describe, expect, it, vi } from "vitest";
import { buildTokens, fetchTokens, seedBalances, tokenIconUrl } from "./tokens";
import type { PriceRecord } from "./types";

const record = (currency: string, date: string, price?: number): PriceRecord => ({
  currency,
  date,
  price,
});

describe("tokenIconUrl", () => {
  it("points at the Switcheo token-icons repo", () => {
    expect(tokenIconUrl("ETH")).toBe(
      "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg"
    );
  });
});

describe("buildTokens", () => {
  it("keeps the most recent record per currency", () => {
    const tokens = buildTokens([
      record("USDC", "2023-08-29T07:10:30.000Z", 1),
      record("USDC", "2023-08-29T07:10:40.000Z", 0.989832),
      record("USDC", "2023-08-29T07:10:30.000Z", 1),
    ]);
    expect(tokens).toEqual([
      { symbol: "USDC", price: 0.989832, iconUrl: tokenIconUrl("USDC") },
    ]);
  });

  it("prefers the later row when timestamps tie", () => {
    const [token] = buildTokens([
      record("USDC", "2023-08-29T07:10:40.000Z", 0.989832),
      record("USDC", "2023-08-29T07:10:40.000Z", 0.9998782611186441),
    ]);
    expect(token.price).toBe(0.9998782611186441);
  });

  it("drops records without a positive price", () => {
    const tokens = buildTokens([
      record("ETH", "2023-08-29T07:10:40.000Z", 1645.93),
      record("NONE", "2023-08-29T07:10:40.000Z"),
      record("ZERO", "2023-08-29T07:10:40.000Z", 0),
      record("NEG", "2023-08-29T07:10:40.000Z", -1),
    ]);
    expect(tokens.map((t) => t.symbol)).toEqual(["ETH"]);
  });

  it("does not let an unpriced newer record hide an older priced one", () => {
    const [token] = buildTokens([
      record("ETH", "2023-08-29T07:10:40.000Z", 1645.93),
      record("ETH", "2023-08-30T07:10:40.000Z"),
    ]);
    expect(token.price).toBe(1645.93);
  });

  it("returns an empty list for an empty feed", () => {
    expect(buildTokens([])).toEqual([]);
  });

  it("sorts alphabetically", () => {
    const tokens = buildTokens([
      record("USDC", "2023-08-29T07:10:40.000Z", 1),
      record("ATOM", "2023-08-29T07:10:40.000Z", 7.18),
      record("ETH", "2023-08-29T07:10:40.000Z", 1645.93),
    ]);
    expect(tokens.map((t) => t.symbol)).toEqual(["ATOM", "ETH", "USDC"]);
  });
});

describe("fetchTokens", () => {
  afterEach(() => vi.unstubAllGlobals());

  const respondWith = (body: unknown, ok = true, status = 200) =>
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok, status, json: async () => body }) as Response)
    );

  it("fetches and shapes the feed", async () => {
    respondWith([record("ETH", "2023-08-29T07:10:40.000Z", 1645.93)]);
    expect((await fetchTokens()).map((t) => t.symbol)).toEqual(["ETH"]);
  });

  it("throws with the HTTP status on failure", async () => {
    respondWith(null, false, 503);
    await expect(fetchTokens()).rejects.toThrow("503");
  });
});

describe("seedBalances", () => {
  const tokens = buildTokens([
    record("ETH", "2023-08-29T07:10:40.000Z", 1645.93),
    record("SWTH", "2023-08-29T07:10:40.000Z", 0.00404),
  ]);

  it("is deterministic", () => {
    expect(seedBalances(tokens)).toEqual(seedBalances(tokens));
  });

  it("gives every token a plausible USD-sized balance", () => {
    const balances = seedBalances(tokens);
    for (const { symbol, price } of tokens) {
      const usd = balances[symbol] * price;
      expect(usd).toBeGreaterThanOrEqual(49);
      expect(usd).toBeLessThanOrEqual(5001);
    }
  });
});
