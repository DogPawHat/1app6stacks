import { createFileRoute } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PokemonSprite } from "~/utils/sprite";

export const Route = createFileRoute("/results")({
  loader: async ({ context }) => {
    context.queryClient.prefetchQuery(convexQuery(api.pokemon.results, {}));
  },
  pendingComponent: () => (
    <ResultsContainerComponent>
      <ResultsFallback />
    </ResultsContainerComponent>
  ),
  component: ResultsRouteComponent,
});

function ResultsContainerComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function ResultsFallback() {
  return (
    <div className="grid gap-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 p-6 bg-gray-800/40 rounded-lg shadow animate-pulse"
        />
      ))}
    </div>
  );
}

function ResultsRouteComponent() {
  return (
    <ResultsContainerComponent>
      <Results />
    </ResultsContainerComponent>
  );
}

function Results() {
  const { data: rankings } = useSuspenseQuery(
    convexQuery(api.pokemon.results, {}),
  );

  return (
    <div className="contents" key="results">
      {rankings.map((pokemon, index) => (
        <div
          key={pokemon.dexId}
          className="flex items-center gap-6 p-6 bg-gray-800/40 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="text-2xl font-bold text-gray-400 w-8">
            #{index + 1}
          </div>

          <PokemonSprite dexId={pokemon.dexId} className="w-20 h-20" />
          <div className="flex-grow">
            <div className="text-gray-400 text-sm">#{pokemon.dexId}</div>
            <h2 className="text-xl font-semibold capitalize">{pokemon.name}</h2>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">
              {pokemon.tally.winPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">
              {pokemon.tally.upVotes}W - {pokemon.tally.downVotes}L
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
