import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pokemon: defineTable({
    dexNumber: v.number(),
    name: v.string(),
  }).index("dexNumber", ["dexNumber"]),
  votes: defineTable({
    votedFor: v.id("pokemon"),
    votedAgainst: v.id("pokemon"),
  })
    .index("votedFor", ["votedFor"])
    .index("votedAgainst", ["votedAgainst"]),
});
