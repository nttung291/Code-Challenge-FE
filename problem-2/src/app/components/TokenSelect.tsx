"use client";

import React, { useMemo, useState } from "react";
import { Button, Empty, Input, Modal } from "antd";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { TokenIcon } from "./TokenIcon";
import { formatAmount, formatUsd } from "../lib/format";
import type { Balances, Token } from "../lib/types";
import "../styles/tokenSelect.css";

interface TokenSelectProps {
  value?: string;
  onChange: (symbol: string) => void;
  tokens: Token[];
  tokenMap: Map<string, Token>;
  balances?: Balances;
  disabled?: boolean;
}

export const TokenSelect: React.FC<TokenSelectProps> = ({
  value,
  onChange,
  tokens,
  tokenMap,
  balances,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTokens = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? tokens.filter((token) => token.symbol.toLowerCase().includes(term))
      : tokens;
  }, [tokens, search]);

  const openModal = () => {
    setSearch("");
    setOpen(true);
  };

  const select = (symbol: string) => {
    onChange(symbol);
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={openModal}
        size="large"
        disabled={disabled}
        className="token-select-trigger"
        aria-label={value ? `Selected token ${value}, change token` : "Select token"}
      >
        <span className="token-select-trigger-label">
          <TokenIcon symbol={value} src={value ? tokenMap.get(value)?.iconUrl : undefined} />
          <span>{value ?? "Select"}</span>
        </span>
        <DownOutlined className="token-select-trigger-caret" />
      </Button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        title="Select a token"
        width={460}
        centered
        className="token-select-modal"
      >
        <Input
          autoFocus
          placeholder="Search by symbol"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={() => filteredTokens[0] && select(filteredTokens[0].symbol)}
          prefix={<SearchOutlined />}
          size="large"
          allowClear
          className="token-search"
        />

        {filteredTokens.length === 0 ? (
          <Empty description="No tokens found" className="token-empty" />
        ) : (
          <ul className="token-list" role="listbox" aria-label="Tokens">
            {filteredTokens.map((token) => (
              <li key={token.symbol}>
                <button
                  type="button"
                  role="option"
                  aria-selected={token.symbol === value}
                  className="token-list-item"
                  onClick={() => select(token.symbol)}
                >
                  <TokenIcon symbol={token.symbol} src={token.iconUrl} size="large" />
                  <span className="token-list-meta">
                    <span className="token-list-symbol">{token.symbol}</span>
                    <span className="token-list-price font-mono">
                      {formatUsd(token.price)}
                    </span>
                  </span>
                  {balances && (
                    <span className="token-list-balance font-mono">
                      {formatAmount(balances[token.symbol] ?? 0)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
};
