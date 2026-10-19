"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, theme } from "antd";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Extracts antd's CSS-in-JS on the server so there is no unstyled flash. */}
      <AntdRegistry>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorPrimary: "#fa89b0",
              colorBgContainer: "#191b1f",
              colorBgElevated: "#191b1f",
              borderRadius: 12,
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            },
          }}
        >
          {/* <App> gives `App.useApp()` a context-aware message API. */}
          <App>{children}</App>
        </ConfigProvider>
      </AntdRegistry>
    </QueryClientProvider>
  );
}
