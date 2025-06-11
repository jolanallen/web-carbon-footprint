import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  analyses: defineTable({
    url: v.string(),
    userId: v.optional(v.id("users")),
    bytes: v.number(),
    green: v.boolean(),
    co2: v.number(),
    energy: v.number(),
    cleanerThan: v.number(),
    aiSummary: v.string(),
    suggestions: v.array(v.string()),
    ecoScore: v.string(), // A, B, C, D, E rating
  }).index("by_user", ["userId"]),
  
  ecoTips: defineTable({
    category: v.string(),
    tip: v.string(),
    impact: v.string(),
    difficulty: v.string(), // easy, medium, hard
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
