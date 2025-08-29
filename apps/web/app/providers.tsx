"use client";
import { Provider, useDispatch } from "react-redux";
import { store } from "../lib/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { authService } from "../services/AuthService";
import { setAuth } from "../lib/store";

function BootstrapAuth({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;
    authService
      .me()
      .then((who) =>
        dispatch(
          setAuth({
            userId: who.userId,
            isAdmin: who.isAdmin,
            name: who.name,
          }),
        ),
      )
      .catch(() => {
        // ignore; user will be asked to login on demand
      });
  }, [dispatch]);
  return children as any;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <Provider store={store}>
      <QueryClientProvider client={qc}>
        <BootstrapAuth>{children}</BootstrapAuth>
      </QueryClientProvider>
    </Provider>
  );
}
