import { createFileRoute, Outlet } from "@tanstack/react-router";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/battle")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex justify-center gap-16 items-center min-h-[80vh]">
      <Outlet />
    </div>
  );
}
