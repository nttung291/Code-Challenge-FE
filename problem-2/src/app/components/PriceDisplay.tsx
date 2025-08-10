'use client';

import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

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
  <Text style={{ fontSize: 12, color: '#a5b4fc' }}>
    <span className="font-mono">${price.toFixed(4)}</span> per {token}
    {amount && (
      <span style={{ marginLeft: 8, color: '#ff007a' }}>
        ≈ <span className="font-mono">${((amount || 0) * price).toFixed(2)}</span>
      </span>
    )}
  </Text>
);
