import { getTwoRandomPokemon } from "@/sdk/pokeapi";
import { recordBattle } from "@/sdk/vote";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import PokemonSprite from "@/utils/pokemon-sprite";
import VoteFallback from "@/utils/vote-fallback";
import { VoteButton } from "@/utils/vote-button";

async function VoteContent() {
  const twoPokemon = await getTwoRandomPokemon();

  return (
    <div className="flex justify-center gap-16 items-center min-h-[80vh]">
      {twoPokemon.map((pokemon, index) => (
        <div
          key={pokemon.dexNumber}
          className="flex flex-col items-center gap-4"
        >
          <PokemonSprite pokemon={pokemon} className="w-64 h-64" />
          <div className="text-center">
            <span className="text-gray-500 text-lg">#{pokemon.dexNumber}</span>
            <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
            <form className="mt-4">
              <VoteButton
                winnerDexNumber={pokemon.dexNumber}
                loserDexNumber={twoPokemon[index === 0 ? 1 : 0].dexNumber}
                voteAction={async () => {
                  "use server";
                  console.log("voted for", pokemon.name);

                  const loser = twoPokemon[index === 0 ? 1 : 0];

                  recordBattle(pokemon.dexNumber, loser.dexNumber);
                  revalidatePath("/");
                }}
              />
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={<VoteFallback />}>
        <VoteContent />
      </Suspense>
    </div>
  );
}
