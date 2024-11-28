import { createFileRoute } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import PokemonSprite from "~/utils/pokemon-sprite";

export const Route = createFileRoute("/results/")({
  pendingComponent: ResultsFallback,
  component: ResultsIndexRouteComponent,
});

function ResultsFallback() {
  return (
    <>
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 p-6 bg-gray-800/40 rounded-lg shadow animate-pulse"
        >
          <div className="w-8 h-8 bg-gray-700/40 rounded" />
          <div className="w-20 h-20 bg-gray-700/40 rounded" />
          <div className="flex-grow">
            <div className="w-16 h-4 bg-gray-700/40 rounded mb-2" />
            <div className="w-32 h-6 bg-gray-700/40 rounded" />
          </div>
          <div className="text-right">
            <div className="w-16 h-8 bg-gray-700/40 rounded mb-2" />
            <div className="w-24 h-4 bg-gray-700/40 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

function ResultsIndexRouteComponent() {
  const { data: rankings } = useSuspenseQuery(
    convexQuery(api.pokemon.results, {})
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

          <PokemonSprite pokemon={pokemon} className="w-20 h-20" lazy />
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
