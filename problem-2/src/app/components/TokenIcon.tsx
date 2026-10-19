"use client";

import React from "react";
import { Avatar } from "antd";

interface TokenIconProps {
  symbol?: string;
  src?: string;
  size?: "small" | "default" | "large" | number;
}

/** Remote SVG icon; antd's Avatar falls back to the first letter when the image 404s. */
export const TokenIcon: React.FC<TokenIconProps> = ({
  symbol = "?",
  src,
  size = "small",
}) => (
  <Avatar size={size} src={src} alt={symbol} className="token-icon">
    {symbol.charAt(0)}
  </Avatar>
);
