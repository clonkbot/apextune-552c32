import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("motorcycles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("motorcycles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const motorcycle = await ctx.db.get(args.id);
    if (!motorcycle || motorcycle.userId !== userId) return null;
    return motorcycle;
  },
});

export const create = mutation({
  args: {
    make: v.string(),
    model: v.string(),
    year: v.number(),
    currentMileage: v.number(),
    nickname: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("motorcycles", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("motorcycles"),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    currentMileage: v.optional(v.number()),
    nickname: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const { id, ...updates } = args;
    const motorcycle = await ctx.db.get(id);
    if (!motorcycle || motorcycle.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("motorcycles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const motorcycle = await ctx.db.get(args.id);
    if (!motorcycle || motorcycle.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
