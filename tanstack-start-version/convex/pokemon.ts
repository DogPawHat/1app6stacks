import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get two pokemon by their dex numbers
// as convex does caching we don't want the random numbers to be generated inside the query
export const getTwoPokemon = query({
  args: {
    dexNumber1: v.number(),
    dexNumber2: v.number(),
  },
  handler: async (ctx, args) => {
    const pokemon = [
      ctx.db
        .query("pokemon")
        .withIndex("dexNumber", (q) => q.eq("dexNumber", args.dexNumber1))
        .unique(),
      ctx.db
        .query("pokemon")
        .withIndex("dexNumber", (q) => q.eq("dexNumber", args.dexNumber2))
        .unique(),
    ] as const;

    const resolvedPokemon = await Promise.all(pokemon);

    if (resolvedPokemon.some((p) => p === null)) {
      throw new Error("Pokemon not found");
    }

    return resolvedPokemon as [
      NonNullable<(typeof resolvedPokemon)[0]>,
      NonNullable<(typeof resolvedPokemon)[1]>,
    ];
  },
});

export const recordBattle = mutation({
  args: {
    winnerId: v.id("pokemon"),
    loserId: v.id("pokemon"),
  },
  handler: async (ctx, args) => {
    const pokemon = [
      ctx.db.get(args.winnerId),
      ctx.db.get(args.loserId),
    ] as const;

    const [winner, loser] = await Promise.all(pokemon);

    if (!winner || !loser) {
      throw new Error("Pokemon not found");
    }

    return await ctx.db.insert("votes", {
      votedFor: winner._id,
      votedAgainst: loser._id,
    });
  },
});

export const batchCreate = mutation({
  args: {
    pokemon: v.array(
      v.object({
        dexNumber: v.number(),
        name: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const pokemon of args.pokemon) {
      await ctx.db.insert("pokemon", pokemon);
    }
  },
});
