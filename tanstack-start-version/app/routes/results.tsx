import { Suspense } from "react";
import { createFileRoute } from '@tanstack/react-router'
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PokemonSprite } from "~/utils/sprite";
export const Route = createFileRoute('/results')({
  loader: async ({context}) => {
    void context.queryClient.ensureQueryData(convexQuery(api.pokemon.getRankings, {}))
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="grid gap-4">
        <Suspense
          fallback={
            <div className="grid gap-4">
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
            </div>
          }
        >
          <Results />
        </Suspense>
      </div>
    </div>
  );
}


function Results() {
  const { data: rankings } = useSuspenseQuery(convexQuery(api.pokemon.getRankings, {}))

  return (
    <div className="contents" key="results">
      {rankings.map((pokemon, index) => (
        <div
          key={pokemon.dexNumber}
          className="flex items-center gap-6 p-6 bg-gray-800/40 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="text-2xl font-bold text-gray-400 w-8">
            #{index + 1}
          </div>

          <PokemonSprite dexId={pokemon.dexNumber} className="w-20 h-20" />
          <div className="flex-grow">
            <div className="text-gray-400 text-sm">#{pokemon.dexNumber}</div>
            <h2 className="text-xl font-semibold capitalize">{pokemon.name}</h2>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">
              {(pokemon.stats.winRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">
              {pokemon.stats.wins}W - {pokemon.stats.losses}L
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResultsPage() {
  
}
