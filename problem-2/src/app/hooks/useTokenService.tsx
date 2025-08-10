import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

export interface TokenData {
  symbol: string;
  price: number;
  imageUrl: string;
}

export const useTokenService = () => {
  const fetchTokenPrices = async (): Promise<TokenPrice[]> => {
    const response = await fetch("https://interview.switcheo.com/prices.json");
    if (!response.ok) {
      throw new Error("Failed to fetch token prices");
    }
    return response.json();
  };

  const { data, isLoading, error } = useQuery<TokenPrice[]>({
    queryKey: ["tokenPrices"],
    queryFn: fetchTokenPrices,
  });

  if (error) {
    console.error("Price fetch error:", error);
  }

  const tokenPrices = useMemo(() => {
    if (!data) return {};

    const priceMap: Record<string, number> = {};
    data.forEach((item: TokenPrice) => {
      if (item.price && item.price > 0) {
        priceMap[item.currency] = item.price;
      }
    });

    return priceMap;
  }, [data]);

  const tokens = useMemo(() => {
    return Object.keys(tokenPrices).sort();
  }, [tokenPrices]);

  const getTokenImageUrl = (symbol: string) => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;
  };

  return { loading: isLoading, tokenPrices, tokens, getTokenImageUrl };
};
