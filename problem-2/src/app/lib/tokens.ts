import type { Balances, PriceRecord, Token } from "./types";

export const PRICES_URL = "https://interview.switcheo.com/prices.json";

const ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export const tokenIconUrl = (symbol: string) => `${ICON_BASE}/${symbol}.svg`;

/**
 * Shape the raw price feed into a token list.
 *
 * The feed contains duplicate currencies (e.g. USDC appears four times), so the
 * most recent record wins; on an identical timestamp the later row wins.
 * Records without a positive price are dropped, as the brief allows.
 */
export function buildTokens(records: PriceRecord[]): Token[] {
  const latest = new Map<string, PriceRecord & { price: number }>();

  for (const record of records) {
    const { currency, price, date } = record;
    if (!currency || typeof price !== "number" || !(price > 0)) continue;

    const prev = latest.get(currency);
    if (!prev || Date.parse(date) >= Date.parse(prev.date)) {
      latest.set(currency, { ...record, price });
    }
  }

  return [...latest.values()]
    .map((r) => ({
      symbol: r.currency,
      price: r.price,
      iconUrl: tokenIconUrl(r.currency),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export async function fetchTokens(): Promise<Token[]> {
  const response = await fetch(PRICES_URL);
  if (!response.ok) {
    throw new Error(`Price feed responded with ${response.status}`);
  }
  return buildTokens((await response.json()) as PriceRecord[]);
}

/**
 * Deterministic mock wallet so a reload shows the same balances without
 * persisting anything: roughly $50 – $5,000 worth of every token.
 */
export function seedBalances(tokens: Token[]): Balances {
  const balances: Balances = {};
  for (const { symbol, price } of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < symbol.length; i++) {
      hash = Math.imul(hash ^ symbol.charCodeAt(i), 16777619);
    }
    const usd = 50 + (Math.abs(hash % 1000) / 1000) * 4950;
    balances[symbol] = Number((usd / price).toFixed(6));
  }
  return balances;
}
