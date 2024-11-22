import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import type { Id, Doc } from "./_generated/dataModel";

const MAX_DEX_NUMBER = 1025;

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
      throw new Error(
        `Pokemon not found: ${[args.dexNumber1, args.dexNumber2].join(", ")}`
      );
    }

    return resolvedPokemon as [
      NonNullable<(typeof resolvedPokemon)[0]>,
      NonNullable<(typeof resolvedPokemon)[1]>,
    ];
  },
});

// Get two random pokemon
export const getTwoRandomPokemon = query({
  args: {},
  handler: async (ctx, args) => {
    const red = Math.floor(Math.random() * MAX_DEX_NUMBER) + 1;
    let blue;
    do {
      blue = Math.floor(Math.random() * MAX_DEX_NUMBER) + 1;
    } while (blue === red); 

    const pokemon = [
      ctx.db
        .query("pokemon")
        .withIndex("dexNumber", (q) => q.eq("dexNumber", red))
        .unique(),
      ctx.db
        .query("pokemon")
        .withIndex("dexNumber", (q) => q.eq("dexNumber", blue))
        .unique(),
    ] as const;

    const resolvedPokemon = await Promise.all(pokemon);

    if (resolvedPokemon.some((p) => p === null)) {
      throw new Error(
        `Pokemon not found: ${[red, blue].join(", ")}`
      );
    }

    return resolvedPokemon as [
      NonNullable<(typeof resolvedPokemon)[0]>,
      NonNullable<(typeof resolvedPokemon)[1]>,
    ];
  },
});


export const getRankings = query({
  args: {},
  handler: async (ctx, args) => {
    const pokemonPaginatedList = await ctx.db.query("pokemon").collect();

    const winMap = new Map<Id<"pokemon">, Doc<"votes">[]>();
    const lossMap = new Map<Id<"pokemon">, Doc<"votes">[]>();
    const winKeys = pokemonPaginatedList.flatMap(async (p) => {
      const wins = await ctx.db
        .query("votes")
        .withIndex("votedFor", (q) => q.eq("votedFor", p._id))
        .collect();

      winMap.set(p._id, wins);
    });
    const lossKeys = pokemonPaginatedList.flatMap(async (p) => {
      const losses = await ctx.db
        .query("votes")
        .withIndex("votedAgainst", (q) => q.eq("votedAgainst", p._id))
        .collect();

      lossMap.set(p._id, losses);
    });

    await Promise.all([Promise.all(winKeys), Promise.all(lossKeys)]);

    const stats = pokemonPaginatedList.map((pokemon, index) => {
      const totalWins = winMap.get(pokemon._id)?.length ?? 0;
      const totalLosses = lossMap.get(pokemon._id)?.length ?? 0;
      const totalBattles = totalWins + totalLosses;

      return {
        ...pokemon,
        stats: {
          wins: totalWins,
          losses: totalLosses,
          winRate: totalBattles > 0 ? totalWins / totalBattles : 0,
        },
      };
    });
    return stats.sort((a, b) => {
      const winRateDiff = b.stats.winRate - a.stats.winRate;
      if (winRateDiff !== 0) return winRateDiff;
      return b.stats.wins - a.stats.wins;
    });
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
