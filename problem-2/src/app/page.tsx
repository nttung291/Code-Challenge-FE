"use client";

import React from "react";
import { Card, Button, Typography, Spin, Col, Statistic } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { useTokenService } from "./hooks/useTokenService";
import { useSwap } from "./hooks/useSwap";
import { CurrencyInputBox } from "./components/CurrencyInputBox";
import "./styles/swap.css";

const { Title, Text } = Typography;

export default function Home() {
  const {
    loading: pricesLoading,
    tokenPrices,
    tokens,
    getTokenImageUrl,
  } = useTokenService();

  const {
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
  } = useSwap(tokenPrices);

  return (
    <div className="swap-container">
      <Card className="swap-card">
        <Title level={2} className="swap-title">
          Token Swap
        </Title>

        {pricesLoading ? (
          <div className="loading-container">
            <Spin size="large" spinning />
          </div>
        ) : (
          <div style={{ marginTop: 3 }}>
            <CurrencyInputBox
              label="SELL"
              amount={fromAmount}
              token={fromToken}
              tokens={tokens}
              tokenPrices={tokenPrices}
              onAmountChange={handleFromAmountChange}
              onTokenChange={handleFromTokenChange}
              getTokenImageUrl={getTokenImageUrl}
              style={{
                marginBottom: -30,
              }}
            />

            <div className="swap-button-container">
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  type="text"
                  icon={<SwapOutlined rotate={90} />}
                  onClick={handleSwapTokens}
                  size="large"
                  className="swap-button"
                />
              </div>
            </div>

            <CurrencyInputBox
              label="BUY"
              amount={toAmount}
              token={toToken}
              tokens={tokens}
              tokenPrices={tokenPrices}
              onAmountChange={handleToAmountChange}
              onTokenChange={handleToTokenChange}
              getTokenImageUrl={getTokenImageUrl}
              style={{
                marginTop: -30,
                marginBottom: 8,
              }}
            />

            <Col span={24} className="exchange-rate-card">
              <Statistic
                title={
                  <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                    Exchange Rate
                  </Text>
                }
                value={getExchangeRate()}
                suffix={`${toToken}/${fromToken}`}
                precision={6}
                valueStyle={{ fontSize: 14, color: "#667eea" }}
                className="exchange-rate-value font-mono"
              />
            </Col>

            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={!fromAmount || !toAmount || fromToken === toToken}
              className="submit-button"
            >
              {loading
                ? "Swapping..."
                : !fromAmount || !toAmount
                ? "Swap"
                : fromToken === toToken
                ? "Select different tokens"
                : `Swap ${fromToken} for ${toToken}`}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
