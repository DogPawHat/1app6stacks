import { createFileRoute } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";
import { Outlet } from "@tanstack/react-router";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      ...seo({
        title: "Results | Roundest (Tanstack Start + Convex)",
        description: "See the results",
      }),
    ],
  }),
  loader: async ({ context }) => {
    context.queryClient.prefetchQuery(convexQuery(api.pokemon.results, {}));
  },
  component: ResultsRouteComponent,
});

function ResultsRouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="grid gap-4">
        <Outlet />
      </div>
    </div>
  );
}
