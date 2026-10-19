import React, { useMemo } from "react";

/*
 * External bindings the original snippet uses without importing. In the real
 * codebase these are plain imports; declaring them here lets this file
 * type-check on its own.
 */
type BoxProps = React.HTMLAttributes<HTMLDivElement>;
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;
declare const WalletRow: React.FC<{
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}>;
declare const classes: { row: string };

/** Higher value = shown first. Single source of truth for supported chains. */
const BLOCKCHAIN_PRIORITY = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

type Blockchain = keyof typeof BLOCKCHAIN_PRIORITY;

const UNKNOWN_PRIORITY = -99;

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

/** Pure lookup, hoisted out of the component so it is not recreated per render. */
// Takes `string` because balances come from a network payload and may contain
// chains we don't know about; the fallback must stay reachable.
const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY[blockchain as Blockchain] ?? UNKNOWN_PRIORITY;

type Props = BoxProps;

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Depends only on balances; prices changing must not re-sort.
  const formattedBalances = useMemo<FormattedWalletBalance[]>(
    () =>
      balances
        // Compute each priority once instead of twice per sort comparison.
        .map((balance) => ({ balance, priority: getPriority(balance.blockchain) }))
        .filter(({ balance, priority }) => priority > UNKNOWN_PRIORITY && balance.amount > 0)
        .sort((a, b) => b.priority - a.priority)
        .map(({ balance }) => ({ ...balance, formatted: balance.amount.toFixed(2) })),
    [balances]
  );

  const rows = useMemo(
    () =>
      formattedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          // Stable identity: the list is re-sorted, so an index key would be wrong.
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={(prices[balance.currency] ?? 0) * balance.amount}
          formattedAmount={balance.formatted}
        />
      )),
    [formattedBalances, prices]
  );

  return (
    <div {...rest}>
      {rows}
      {children}
    </div>
  );
};

export default WalletPage;
