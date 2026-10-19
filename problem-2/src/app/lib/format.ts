export const formatUsd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n > 0 && n < 1 ? 6 : 2,
  });

export const formatAmount = (n: number) => {
  if (!Number.isFinite(n) || n === 0) return "0";
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { maximumSignificantDigits: 6 });
};

/** "1 ETH = 1,645.93 USDC" */
export const formatRate = (from: string, to: string, rate: number) =>
  `1 ${from} = ${formatAmount(rate)} ${to}`;
