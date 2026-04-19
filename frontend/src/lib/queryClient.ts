import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit
      gcTime: 1000 * 60 * 10, // 10 menit di cache
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Refetch saat online kembali
    },
    mutations: {
      retry: 1,
    },
  },
});
