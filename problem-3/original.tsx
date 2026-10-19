// Original WalletPage from the brief, unchanged except for review comments.
// [n] markers match the numbered issues in README.md.
// [8] Nothing here is imported: BoxProps, WalletRow, classes, useWalletBalances,
//     usePrices and useMemo are all undefined, so the file cannot compile as is.

interface WalletBalance {
  currency: string;
  amount: number;
  // [7] `blockchain` is missing, yet getPriority(balance.blockchain) reads it below.
}

// [18] Repeats WalletBalance's fields instead of `extends WalletBalance`.
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

// [19] Empty interface; `type Props = BoxProps` says the same thing.
interface Props extends BoxProps {
}

// [20] Props are annotated twice (React.FC<Props> and props: Props).
const WalletPage: React.FC<Props> = (props: Props) => {
  // [13] `children` is extracted here but never rendered.
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // [14] Recreated on every render though it uses no props or state.
  // [16] A switch for a fixed lookup table; an object map is shorter and safer.
  // [17] `any` turns off type checking for chain names.
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100
      case 'Ethereum':
        return 50
      case 'Arbitrum':
        return 30
      case 'Zilliqa':
        return 20
      case 'Neo':
        return 20
      default:
        return -99
    }
  }

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      // [1] `lhsPriority` is not defined; this throws a ReferenceError.
      if (lhsPriority > -99) {
        // [2] Inverted: keeps empty/negative balances and drops the real ones.
        if (balance.amount <= 0) {
          return true;
        }
      }
      return false
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      // [15] getPriority runs twice per comparison.
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
      // [3] Returns undefined when priorities are equal (e.g. Zilliqa vs Neo).
    });
  // [10] `prices` is not used inside this memo, so it re-sorts on every price update.
  }, [balances, prices]);

  // [11] Rebuilt every render without useMemo, then never used.
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      // [4] toFixed() with no argument rounds to 0 decimals.
      formatted: balance.amount.toFixed()
    }
  })

  // [12] Rebuilt on every render.
  // [6] Maps sortedBalances (no `formatted` field) but types items as FormattedWalletBalance,
  //     so balance.formatted is undefined at runtime.
  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    // [5] An unknown currency gives undefined * amount = NaN.
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        // [8] `classes` is not defined anywhere.
        className={classes.row}
        // [9] Index key on a sorted list; rows get matched to the wrong balance on reorder.
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}
