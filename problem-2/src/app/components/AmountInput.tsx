"use client";

import React from "react";
import { InputNumber } from "antd";

interface AmountInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = "0.0",
  style,
}) => (
  <InputNumber
    placeholder={placeholder}
    value={value === null ? undefined : value}
    onChange={onChange}
    style={{ ...style, color: "white" }}
    controls={false}
    min={0}
    className="white-input"
    addonBefore={null}
  />
);
