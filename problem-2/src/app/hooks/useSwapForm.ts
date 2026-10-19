import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  applySwap,
  flipSelection,
  oppositeSide,
  pickToken,
  quote,
  selectToken,
  validateSwap,
  type Selection,
} from "../lib/swap";
import { seedBalances } from "../lib/tokens";
import type { Balances, Side, Token } from "../lib/types";

export type SwapParams = {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
};

const DEFAULT_FROM = "SWTH";
const DEFAULT_TO = "ETH";
/** Simulated backend latency for the swap request. */
export const SWAP_DELAY_MS = 1500;

const simulateSwap = (params: SwapParams) =>
  new Promise<SwapParams>((resolve) =>
    setTimeout(() => resolve(params), SWAP_DELAY_MS)
  );

export const useSwapForm = (
  tokens: Token[],
  tokenMap: Map<string, Token>,
  onSwapped?: (params: SwapParams) => void
) => {
  // Only the typed amount and its side are state; the other side is derived,
  // so it can never drift out of sync when tokens or prices change.
  const [side, setSide] = useState<Side>("from");
  const [amount, setAmount] = useState<number | null>(null);
  const [selected, setSelected] = useState<Selection>({ from: DEFAULT_FROM, to: DEFAULT_TO });
  const [balanceOverrides, setBalanceOverrides] = useState<Balances | null>(null);

  // The defaults may not be in the feed, so resolve against what was loaded.
  const fromToken = pickToken(tokens, selected.from);
  const toToken = pickToken(tokens, selected.to, fromToken);
  const current: Selection = { from: fromToken ?? DEFAULT_FROM, to: toToken ?? DEFAULT_TO };

  const balances = useMemo(
    () => balanceOverrides ?? seedBalances(tokens),
    [balanceOverrides, tokens]
  );

  const { rate, fromAmount, toAmount } = quote({
    fromPrice: fromToken ? tokenMap.get(fromToken)?.price : undefined,
    toPrice: toToken ? tokenMap.get(toToken)?.price : undefined,
    side,
    amount,
  });

  const fromBalance = fromToken ? balances[fromToken] ?? 0 : 0;
  const toBalance = toToken ? balances[toToken] ?? 0 : 0;

  const error = validateSwap({
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    rate,
    balance: fromBalance,
  });

  const handleFromAmountChange = useCallback((value: number | null) => {
    setSide("from");
    setAmount(value);
  }, []);

  const handleToAmountChange = useCallback((value: number | null) => {
    setSide("to");
    setAmount(value);
  }, []);

  const handleFromTokenChange = (symbol: string) =>
    setSelected(selectToken(current, "from", symbol));

  const handleToTokenChange = (symbol: string) =>
    setSelected(selectToken(current, "to", symbol));

  /** Flip direction; the typed amount stays attached to its token. */
  const handleSwapTokens = () => {
    setSelected(flipSelection(current));
    setSide(oppositeSide);
  };

  const handleMax = useCallback(() => {
    setSide("from");
    setAmount(fromBalance);
  }, [fromBalance]);

  const { mutate, isPending } = useMutation({
    mutationFn: simulateSwap,
    onSuccess: (params) => {
      setBalanceOverrides(
        applySwap(
          balances,
          params.fromToken,
          params.toToken,
          params.fromAmount,
          params.toAmount
        )
      );
      setAmount(null);
      onSwapped?.(params);
    },
  });

  const handleSubmit = useCallback(() => {
    if (error || !fromToken || !toToken || !fromAmount || !toAmount) return;
    mutate({ fromToken, toToken, fromAmount, toAmount });
  }, [error, fromToken, toToken, fromAmount, toAmount, mutate]);

  return {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    balances,
    fromBalance,
    toBalance,
    rate,
    error,
    submitting: isPending,
    handleFromAmountChange,
    handleToAmountChange,
    handleFromTokenChange,
    handleToTokenChange,
    handleSwapTokens,
    handleMax,
    handleSubmit,
  };
};
