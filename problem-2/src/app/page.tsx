"use client";

import React from "react";
import { Alert, App, Button, Card, Skeleton, Typography } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { useTokens } from "./hooks/useTokens";
import { useSwapForm, type SwapParams } from "./hooks/useSwapForm";
import { CurrencyInputBox } from "./components/CurrencyInputBox";
import { formatAmount, formatRate } from "./lib/format";
import "./styles/swap.css";

const { Title } = Typography;

export default function Home() {
  const { message } = App.useApp();
  const { tokens, tokenMap, loading, error: feedError, retry, retrying } = useTokens();

  const onSwapped = ({ fromAmount, fromToken, toAmount, toToken }: SwapParams) =>
    message.success(
      `Swapped ${formatAmount(fromAmount)} ${fromToken} for ${formatAmount(toAmount)} ${toToken}`
    );

  const form = useSwapForm(tokens, tokenMap, onSwapped);

  // Only "insufficient balance" is flagged on the field; every error also labels the button.
  const amountInvalid = form.error?.code === "INSUFFICIENT_BALANCE";

  const renderBody = () => {
    if (loading) {
      return <Skeleton active paragraph={{ rows: 6 }} className="loading-container" />;
    }

    if (feedError || tokens.length === 0) {
      return (
        <Alert
          type="error"
          showIcon
          title="Couldn't load token prices"
          description={feedError?.message ?? "The price feed returned no tokens."}
          action={
            <Button size="small" onClick={() => retry()} loading={retrying}>
              Retry
            </Button>
          }
        />
      );
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        noValidate
      >
        <CurrencyInputBox
          label="You pay"
          amount={form.fromAmount}
          token={form.fromToken}
          tokens={tokens}
          tokenMap={tokenMap}
          balance={form.fromBalance}
          balances={form.balances}
          onAmountChange={form.handleFromAmountChange}
          onTokenChange={form.handleFromTokenChange}
          onMax={form.handleMax}
          invalid={amountInvalid}
          disabled={form.submitting}
        />

        <div className="swap-button-container">
          <Button
            type="text"
            shape="circle"
            icon={<SwapOutlined rotate={90} />}
            onClick={form.handleSwapTokens}
            disabled={form.submitting}
            aria-label="Switch tokens"
            className="swap-button"
          />
        </div>

        <CurrencyInputBox
          label="You receive"
          amount={form.toAmount}
          token={form.toToken}
          tokens={tokens}
          tokenMap={tokenMap}
          balance={form.toBalance}
          balances={form.balances}
          onAmountChange={form.handleToAmountChange}
          onTokenChange={form.handleToTokenChange}
          disabled={form.submitting}
        />

        {amountInvalid && (
          <p role="alert" className="error-text">
            {form.error?.message}
          </p>
        )}

        {form.fromToken && form.toToken && form.rate > 0 && (
          <p className="exchange-rate font-mono">
            {formatRate(form.fromToken, form.toToken, form.rate)}
          </p>
        )}

        <Button
          type="primary"
          htmlType="submit"
          loading={form.submitting}
          disabled={!!form.error}
          className="submit-button"
        >
          {form.submitting
            ? "Swapping..."
            : form.error?.message ?? `Swap ${form.fromToken} for ${form.toToken}`}
        </Button>
      </form>
    );
  };

  return (
    <main className="swap-container">
      <Card className="swap-card">
        <Title level={2} className="swap-title">
          Token Swap
        </Title>
        {renderBody()}
      </Card>
    </main>
  );
}
