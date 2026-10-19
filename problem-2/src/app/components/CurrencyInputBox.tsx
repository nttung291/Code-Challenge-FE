"use client";

import React, { useId } from "react";
import { Button, InputNumber } from "antd";
import { TokenSelect } from "./TokenSelect";
import { PriceDisplay } from "./PriceDisplay";
import { formatAmount } from "../lib/format";
import { parseAmountInput } from "../lib/swap";
import type { Balances, Token } from "../lib/types";

interface CurrencyInputBoxProps {
  label: string;
  amount: number | null;
  token?: string;
  tokens: Token[];
  tokenMap: Map<string, Token>;
  balance: number;
  balances: Balances;
  onAmountChange: (value: number | null) => void;
  onTokenChange: (symbol: string) => void;
  onMax?: () => void;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CurrencyInputBox: React.FC<CurrencyInputBoxProps> = ({
  label,
  amount,
  token,
  tokens,
  tokenMap,
  balance,
  balances,
  onAmountChange,
  onTokenChange,
  onMax,
  invalid,
  disabled,
  className = "",
}) => {
  const inputId = useId();
  const price = token ? tokenMap.get(token)?.price : undefined;

  return (
    <div className={`currency-box ${invalid ? "currency-box-invalid" : ""} ${className}`}>
      <div className="currency-box-header">
        <label htmlFor={inputId} className="currency-box-label">
          {label}
        </label>
        <span className="currency-box-balance">
          Balance: <span className="font-mono">{formatAmount(balance)}</span>
          {onMax && balance > 0 && (
            <Button type="link" size="small" onClick={onMax} disabled={disabled} className="max-button">
              MAX
            </Button>
          )}
        </span>
      </div>

      <div className="currency-box-row">
        <InputNumber<number>
          id={inputId}
          placeholder="0.0"
          value={amount}
          onChange={onAmountChange}
          min={0}
          controls={false}
          variant="borderless"
          disabled={disabled}
          inputMode="decimal"
          className="amount-input font-mono"
          aria-invalid={invalid}
          parser={(raw) => parseAmountInput(raw)}
        />
        <div className="currency-box-token">
          <TokenSelect
            value={token}
            onChange={onTokenChange}
            tokens={tokens}
            tokenMap={tokenMap}
            balances={balances}
            disabled={disabled}
          />
        </div>
      </div>

      {token && price !== undefined && (
        <div className="currency-box-footer">
          <PriceDisplay token={token} amount={amount} price={price} />
        </div>
      )}
    </div>
  );
};
