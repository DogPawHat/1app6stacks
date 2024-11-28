import type { Doc } from "../../convex/_generated/dataModel";

export default function PokemonSprite(props: {
  pokemon: Doc<"pokemon">;
  className?: string;
  lazy?: boolean;
}) {
  return (
    <img
      src={`/api/sprite/${props.pokemon.dexId}.png`}
      alt={props.pokemon.name}
      className={props.className}
      style={{ imageRendering: "pixelated" }}
      loading={props.lazy ? "lazy" : "eager"}
    />
  );
}
