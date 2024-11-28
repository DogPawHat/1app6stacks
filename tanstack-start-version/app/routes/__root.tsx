import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Link,
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => {
    return {
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        ...seo({
          title: "Roundest (Tanstack Start + Convex)",
          description:
            "A web app for voting on which Pokemon is the most round",
        }),
      ],
      links: [{ rel: "stylesheet", href: appCss }],
    };
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <Meta />
      </head>
      <body
        className={`antialiased bg-gray-950 text-white flex flex-col justify-between min-h-screen border-t-2 border-blue-300`}
      >
        <header className="py-4 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline">
              <Link href="/" className="font-bold text-3xl">
                round<span className="text-cyan-500">est</span>
                <span className="text-gray-400 font-extralight pl-2 text-2xl">
                  (Tanstack Start + Convex)
                </span>
              </Link>
            </div>
            <nav className="flex flex-row items-center gap-8">
              <Link to="/turbo" className="hover:underline text-lg">
                Turbo Version
              </Link>
              <Link to="/results" className="hover:underline text-lg">
                Results
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="font-light text-center py-3 text-gray-500">
          <a
            href="https://github.com/dogpawhat/1app6stacks"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </footer>
        <ScrollRestoration />
        <ReactQueryDevtools />
        <TanStackRouterDevtools />
        <Scripts />
      </body>
    </html>
  );
}
