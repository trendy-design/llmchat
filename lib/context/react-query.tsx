"use client";
import { Spinner } from "@/ui";
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

  const renderLoader = () => {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    );
  };

  if (!isDBReady) return renderLoader();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
