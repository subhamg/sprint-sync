"use client";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { store } from "../lib/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <Provider store={store}>
      <QueryClientProvider client={qc}>
        <MantineProvider>{children}</MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
}
