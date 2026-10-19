import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchTokens } from "../lib/tokens";
import type { Token } from "../lib/types";

export const useTokens = () => {
  const { data, isLoading, error, refetch, isRefetching } = useQuery<Token[]>({
    queryKey: ["tokens"],
    queryFn: fetchTokens,
  });

  const tokens = useMemo(() => data ?? [], [data]);

  const tokenMap = useMemo(
    () => new Map(tokens.map((token) => [token.symbol, token])),
    [tokens]
  );

  return {
    tokens,
    tokenMap,
    loading: isLoading,
    error,
    retry: refetch,
    retrying: isRefetching,
  };
};
