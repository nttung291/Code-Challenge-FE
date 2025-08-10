import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

export type SwapParams = {
  fromAmount: number;
  toAmount: number;
  fromToken: string;
  toToken: string;
};

export const useSwap = (tokenPrices: Record<string, number>) => {
  const [fromAmount, setFromAmount] = useState<number | null>(null);
  const [toAmount, setToAmount] = useState<number | null>(null);
  const [fromToken, setFromToken] = useState("SWTH");
  const [toToken, setToToken] = useState("ETH");

  const calculateExchange = useCallback(
    (amount: number, from: string, to: string, isFromToTo: boolean) => {
      if (!tokenPrices[from] || !tokenPrices[to] || amount <= 0) {
        return 0;
      }

      const fromPrice = tokenPrices[from];
      const toPrice = tokenPrices[to];
      const rate = toPrice / fromPrice;

      return isFromToTo ? amount * rate : amount / rate;
    },
    [tokenPrices]
  );

  const getExchangeRate = useCallback(() => {
    if (!tokenPrices[fromToken] || !tokenPrices[toToken]) return undefined;

    const fromPrice = tokenPrices[fromToken];
    const toPrice = tokenPrices[toToken];
    return toPrice / fromPrice;
  }, [fromToken, toToken, tokenPrices]);

  const handleFromAmountChange = useCallback(
    (value: number | null) => {
      setFromAmount(value);
      if (value && tokenPrices[fromToken] && tokenPrices[toToken]) {
        const calculated = calculateExchange(value, fromToken, toToken, true);
        setToAmount(Number(calculated.toFixed(6)));
      } else {
        setToAmount(null);
      }
    },
    [fromToken, toToken, tokenPrices, calculateExchange]
  );

  const handleToAmountChange = useCallback(
    (value: number | null) => {
      setToAmount(value);
      if (value && tokenPrices[fromToken] && tokenPrices[toToken]) {
        const calculated = calculateExchange(value, toToken, fromToken, false);
        setFromAmount(Number(calculated.toFixed(6)));
      } else {
        setFromAmount(null);
      }
    },
    [fromToken, toToken, tokenPrices, calculateExchange]
  );

  const handleFromTokenChange = useCallback(
    (value: string) => {
      setFromToken(value);
      if (toAmount && tokenPrices[value] && tokenPrices[toToken]) {
        const calculated = calculateExchange(toAmount, toToken, value, false);
        setFromAmount(Number(calculated.toFixed(6)));
      }
    },
    [toAmount, toToken, tokenPrices, calculateExchange]
  );

  const handleToTokenChange = useCallback(
    (value: string) => {
      setToToken(value);
      if (fromAmount && tokenPrices[fromToken] && tokenPrices[value]) {
        const calculated = calculateExchange(
          fromAmount,
          fromToken,
          value,
          true
        );
        setToAmount(Number(calculated.toFixed(6)));
      }
    },
    [fromAmount, fromToken, tokenPrices, calculateExchange]
  );

  const handleSwapTokens = useCallback(() => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;

    setFromToken(toToken);
    setToToken(tempToken);

    setFromAmount(toAmount);
    setToAmount(tempAmount);
  }, [fromToken, toToken, fromAmount, toAmount]);

  const { mutate, isPending: loading } = useMutation({
    mutationFn: async (params: SwapParams) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return params;
    },
    onSuccess: (data) => {
      setFromAmount(null);
      setToAmount(null);
    },
    onError: () => {},
  });

  const handleSubmit = useCallback(() => {
    if (fromAmount && toAmount && fromToken !== toToken) {
      mutate({
        fromAmount,
        toAmount,
        fromToken,
        toToken,
      });
    }
  }, [fromAmount, toAmount, fromToken, toToken, mutate]);

  return {
    fromAmount,
    toAmount,
    fromToken,
    toToken,
    loading,
    handleFromAmountChange,
    handleToAmountChange,
    handleFromTokenChange,
    handleToTokenChange,
    handleSwapTokens,
    handleSubmit,
    getExchangeRate,
  };
};
