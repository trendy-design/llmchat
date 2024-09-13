"use client";
import { FullPageLoader } from "@/components/full-page-loader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { getDB } from "../database/client";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [isDBReady, setIsDBReady] = useState(false);
  useEffect(() => {
    const init = async () => {
      await getDB();
      setIsDBReady(true);
    };
    init();
  }, []);

  if (!isDBReady) return <FullPageLoader label="Initializing DB" />;
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
