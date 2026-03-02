import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByTask = query({
  args: { taskId: v.id("maintenanceTasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("parts")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("parts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    taskId: v.id("maintenanceTasks"),
    name: v.string(),
    partNumber: v.optional(v.string()),
    quantity: v.number(),
    estimatedPrice: v.optional(v.number()),
    supplier: v.optional(v.string()),
    supplierUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("parts", {
      ...args,
      userId,
      ordered: false,
      delivered: false,
      createdAt: Date.now(),
    });
  },
});

export const markOrdered = mutation({
  args: { id: v.id("parts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const part = await ctx.db.get(args.id);
    if (!part || part.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      ordered: true,
      orderedAt: Date.now(),
    });
  },
});

export const markDelivered = mutation({
  args: { id: v.id("parts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const part = await ctx.db.get(args.id);
    if (!part || part.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      delivered: true,
      deliveredAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("parts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const part = await ctx.db.get(args.id);
    if (!part || part.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const generatePartsForTask = mutation({
  args: { taskId: v.id("maintenanceTasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) throw new Error("Not found");

    const partsByCategory: Record<string, Array<{
      name: string;
      partNumber?: string;
      quantity: number;
      estimatedPrice: number;
      supplier: string;
    }>> = {
      oil: [
        { name: "Engine Oil 10W-40 (4L)", partNumber: "MOT-OIL-1040", quantity: 1, estimatedPrice: 45, supplier: "RevZilla" },
        { name: "Oil Filter", partNumber: "OIL-FLT-001", quantity: 1, estimatedPrice: 15, supplier: "RevZilla" },
        { name: "Crush Washer", partNumber: "CW-14MM", quantity: 1, estimatedPrice: 2, supplier: "RevZilla" },
      ],
      chain: [
        { name: "Chain Lubricant", partNumber: "CHN-LUB-500", quantity: 1, estimatedPrice: 12, supplier: "Cycle Gear" },
        { name: "Chain Cleaner", partNumber: "CHN-CLN-500", quantity: 1, estimatedPrice: 10, supplier: "Cycle Gear" },
      ],
      brakes: [
        { name: "Front Brake Pads", partNumber: "BRK-FRT-001", quantity: 1, estimatedPrice: 55, supplier: "BikeBandit" },
        { name: "Rear Brake Pads", partNumber: "BRK-RR-001", quantity: 1, estimatedPrice: 45, supplier: "BikeBandit" },
        { name: "Brake Fluid DOT4", partNumber: "BRK-FLD-D4", quantity: 1, estimatedPrice: 15, supplier: "BikeBandit" },
      ],
      air_filter: [
        { name: "Air Filter Element", partNumber: "AIR-FLT-001", quantity: 1, estimatedPrice: 35, supplier: "RevZilla" },
      ],
      tires: [
        { name: "Tire Pressure Gauge", partNumber: "TPG-DIG-01", quantity: 1, estimatedPrice: 20, supplier: "Amazon" },
      ],
      coolant: [
        { name: "Motorcycle Coolant (2L)", partNumber: "COOL-2L-01", quantity: 1, estimatedPrice: 25, supplier: "Cycle Gear" },
      ],
      spark_plugs: [
        { name: "Iridium Spark Plug", partNumber: "SPK-IRD-01", quantity: 4, estimatedPrice: 12, supplier: "RevZilla" },
      ],
    };

    const partsToAdd = partsByCategory[task.category] || [];

    for (const part of partsToAdd) {
      await ctx.db.insert("parts", {
        taskId: args.taskId,
        userId,
        name: part.name,
        partNumber: part.partNumber,
        quantity: part.quantity,
        estimatedPrice: part.estimatedPrice,
        supplier: part.supplier,
        ordered: false,
        delivered: false,
        createdAt: Date.now(),
      });
    }

    return partsToAdd.length;
  },
});
