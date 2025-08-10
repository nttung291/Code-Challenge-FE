// WalletBalance interface defines the structure for wallet balance data
interface WalletBalance {
  currency: string;
  amount: number;
}

// FormattedWalletBalance should extend WalletBalance to follow DRY principles
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {
}

const WalletPage: React.FC<Props> = (props: Props) => {
  // Props should be destructured directly in the function parameters
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // This function should be moved outside the component for better performance
  // The blockchain parameter should be typed as string
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
      // Zilliqa and Neo cases should be merged for simplicity
      default:
        return -99
    }
  }

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      // Variable name should be balancePriority, not lhsPriority
      // Logic should use && operator for clarity
      if (lhsPriority > -99) {
        // Should check if balance.amount is greater than 0, not less than or equal to 0
        if (balance.amount <= 0) {
          return true;
        }
      }
      return false
      // This could be simplified to: return balance.amount > 0 && getPriority(balance.blockchain) > -99;
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
      // This sort function can be simplified to: .sort((a,b) => getPriority(b.blockchain) - getPriority(a.blockchain));
    });
    // prices is not used in this function and should be removed from the dependency array
  }, [balances, prices]);

  // formattedBalances should be typed and memoized with useMemo
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  // Should use formattedBalances instead of sortedBalances
  // This mapping should be done directly in the return statement
  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        // Use className instead of classes prop for styling
        className={classes.row}
        // Avoid using index as key, use a unique identifier like `${balance.currency}-${balance.blockchain}`
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  // This mapping should be done directly in the return statement below
  return (
    <div {...rest}>
      {rows}
    </div>
  )
}