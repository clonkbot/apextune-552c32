import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByMotorcycle = query({
  args: { motorcycleId: v.id("motorcycles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("serviceHistory")
      .withIndex("by_motorcycle", (q) => q.eq("motorcycleId", args.motorcycleId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    motorcycleId: v.id("motorcycles"),
    taskId: v.optional(v.id("maintenanceTasks")),
    title: v.string(),
    description: v.optional(v.string()),
    mileage: v.number(),
    cost: v.optional(v.number()),
    serviceDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("serviceHistory", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("serviceHistory") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const record = await ctx.db.get(args.id);
    if (!record || record.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
