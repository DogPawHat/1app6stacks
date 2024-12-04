import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_battleLayout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex justify-center gap-16 items-center min-h-[80vh]">
			<Outlet />
		</div>
	);
}
