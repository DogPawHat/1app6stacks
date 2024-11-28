import { createFileRoute } from "@tanstack/react-router";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/_battleLayout/turbo")({
  head: () => ({
    meta: [
      ...seo({
        title: "Over-Optimized Version | Roundest (Tanstack Start + Convex)",
        description: "Roundest, but implemented with Tanstack Start and Convex",
      }),
    ],
  }),
});
