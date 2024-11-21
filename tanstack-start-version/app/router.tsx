import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { convexQuery, ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider } from "convex/react";
import {
  createStore as createJotaiStore,
  Provider as JotaiProvider,
} from "jotai";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;
  if (!CONVEX_URL) {
    console.error("missing envar VITE_CONVEX_URL");
  }
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL);
  const jotaiStore = createJotaiStore();

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  const router = routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      defaultPreload: "intent",
      context: { queryClient, jotaiStore },
      Wrap: ({ children }: { children: React.ReactNode }) => (
        <JotaiProvider store={jotaiStore}>
          <ConvexProvider client={convexQueryClient.convexClient}>
            {children}
          </ConvexProvider>
        </JotaiProvider>
      ),
    }),
    queryClient
  );

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }

  interface HistoryState {
    newBattle: readonly [number, number] | undefined;
  }
}
