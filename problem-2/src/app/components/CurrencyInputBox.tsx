"use client";

import React from "react";
import { Row, Col, Typography } from "antd";
import { AmountInput } from "./AmountInput";
import { TokenSelect } from "./TokenSelect";
import { PriceDisplay } from "./PriceDisplay";
import "../styles/input.css";

const { Text } = Typography;

interface CurrencyInputBoxProps {
  label: string;
  amount: number | null;
  token: string;
  tokens: string[];
  tokenPrices: Record<string, number>;
  onAmountChange: (value: number | null) => void;
  onTokenChange: (value: string) => void;
  getTokenImageUrl: (symbol: string) => string;
  style?: React.CSSProperties;
}

export const CurrencyInputBox: React.FC<CurrencyInputBoxProps> = ({
  label,
  amount,
  token,
  tokens,
  tokenPrices,
  onAmountChange,
  onTokenChange,
  getTokenImageUrl,
  style = {},
}) => (
  <div style={{ ...styles.container, ...style }}>
    <Row gutter={16} align="middle">
      <Col span={24} style={{ marginBottom: 8 }}>
        <Text strong style={{ color: "white", fontSize: 12 }}>
          {label}
        </Text>
      </Col>
      <Col span={14}>
        <AmountInput
          value={amount}
          onChange={onAmountChange}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            fontSize: 24,
            fontWeight: "bold",
            color: "white",
          }}
        />
      </Col>
      <Col span={10}>
        <TokenSelect
          value={token}
          onChange={onTokenChange}
          tokens={tokens}
          tokenPrices={tokenPrices}
          getTokenImageUrl={getTokenImageUrl}
        />
      </Col>
      {tokenPrices[token] && (
        <Col span={24} style={{ marginTop: 8 }}>
          <PriceDisplay
            token={token}
            amount={amount}
            price={tokenPrices[token]}
          />
        </Col>
      )}
    </Row>
  </div>
);

const styles = {
  container: {
    background: "#2c2f36",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #40444f",
  },
};
