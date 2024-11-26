
import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/turbo")({
  component: TurboVoteComponent,
});


function TurboVoteComponent() {
  return (
    <div className="flex justify-center gap-16 items-center min-h-[80vh]">
      <Outlet />
    </div>
  );
}
