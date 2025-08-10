"use client";

import React, { useState } from "react";
import { Button, Modal, Input, List, Avatar, Space } from "antd";
import { SearchOutlined, DownOutlined } from "@ant-design/icons";
import "../styles/tokenSelect.css";

interface TokenSelectProps {
  value: string;
  onChange: (value: string) => void;
  tokens: string[];
  tokenPrices: Record<string, number>;
  getTokenImageUrl: (symbol: string) => string;
}

export const TokenSelect: React.FC<TokenSelectProps> = ({
  value,
  onChange,
  tokens,
  tokenPrices,
  getTokenImageUrl,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const showModal = () => {
    setIsModalOpen(true);
    setSearchTerm("");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleTokenSelect = (token: string) => {
    onChange(token);
    setIsModalOpen(false);
  };

  const filteredTokens = tokens
    .filter((token) => tokenPrices[token])
    .filter((token) => token.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <Button
        onClick={showModal}
        size="large"
        style={{
          width: "100%",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 11px",
          backgroundColor: "#2c2f36",
          border: "1px solid #40444f",
          borderRadius: "4px",
          color: "white",
        }}
      >
        <Space>
          <Avatar
            size="small"
            src={getTokenImageUrl(value)}
            style={{ backgroundColor: "#2c2f36" }}
          >
            {value.charAt(0)}
          </Avatar>
          <span style={{ fontWeight: "bold", color: "white" }}>{value}</span>
        </Space>
        <DownOutlined style={{ fontSize: "12px", color: "#a0a0a0" }} />
      </Button>

      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
        styles={{
          body: { padding: "24px", backgroundColor: "#191b1f" },
        }}
        centered
        className="token-select-modal"
      >
        <Input
          placeholder="Search token by name or symbol"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={
            <SearchOutlined style={{ color: "#a0a0a0", fontSize: "16px" }} />
          }
          style={{
            marginBottom: 24,
            backgroundColor: "#2c2f36",
            color: "white",
            border: "1px solid #40444f",
            height: "48px",
            fontSize: "16px",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
          size="large"
        />
        <List
          dataSource={filteredTokens}
          renderItem={(token) => (
            <List.Item
              onClick={() => handleTokenSelect(token)}
              style={{
                cursor: "pointer",
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: token === value ? "#333456" : "transparent",
                transition: "background-color 0.3s",
                marginBottom: "8px",
                border: "none",
              }}
              className="token-list-item"
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size="large"
                    src={getTokenImageUrl(token)}
                    style={{ backgroundColor: "#2c2f36" }}
                  >
                    {token.charAt(0)}
                  </Avatar>
                }
                title={
                  <span
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    {token}
                  </span>
                }
                description={
                  tokenPrices[token] ? (
                    <span style={{ color: "#a0a0a0", fontSize: "14px" }}>
                      <span className="font-mono">${tokenPrices[token].toFixed(4)}</span>
                    </span>
                  ) : (
                    <span style={{ color: "#a0a0a0", fontSize: "14px" }}>
                      Price unavailable
                    </span>
                  )
                }
              />
            </List.Item>
          )}
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            paddingRight: "8px",
          }}
        />
      </Modal>
    </>
  );
};
