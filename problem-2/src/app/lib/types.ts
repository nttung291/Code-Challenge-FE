/** One row of https://interview.switcheo.com/prices.json */
export interface PriceRecord {
  currency: string;
  date: string;
  price?: number;
}

export interface Token {
  symbol: string;
  /** USD price of one unit. Always > 0. */
  price: number;
  iconUrl: string;
}

/** Mock wallet: symbol -> quantity held. */
export type Balances = Record<string, number>;

/** Which amount field the user last typed in; the other side is derived from it. */
export type Side = "from" | "to";
