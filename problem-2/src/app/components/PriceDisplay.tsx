"use client";

import React from "react";
import { formatUsd } from "../lib/format";

interface PriceDisplayProps {
  token: string;
  amount: number | null;
  price: number;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  token,
  amount,
  price,
}) => (
  <span className="price-display">
    <span className="font-mono">{formatUsd(price)}</span> per {token}
    {/* `amount > 0`, not `amount &&`, so a 0 is never rendered as text */}
    {amount !== null && amount > 0 && (
      <span className="price-display-total">
        ≈ <span className="font-mono">{formatUsd(amount * price)}</span>
      </span>
    )}
  </span>
);
