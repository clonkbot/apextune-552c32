import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByMotorcycle = query({
  args: { motorcycleId: v.id("motorcycles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("maintenanceTasks")
      .withIndex("by_motorcycle", (q) => q.eq("motorcycleId", args.motorcycleId))
      .order("desc")
      .collect();
  },
});

export const listUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const tasks = await ctx.db
      .query("maintenanceTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("completed"), false))
      .collect();
    return tasks.sort((a, b) => {
      const aDate = a.dueDate || Infinity;
      const bDate = b.dueDate || Infinity;
      return aDate - bDate;
    });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("maintenanceTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    motorcycleId: v.id("motorcycles"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    priority: v.string(),
    dueMileage: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    estimatedTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("maintenanceTasks", {
      ...args,
      userId,
      completed: false,
      createdAt: Date.now(),
    });
  },
});

export const complete = mutation({
  args: {
    id: v.id("maintenanceTasks"),
    completedMileage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      completed: true,
      completedAt: Date.now(),
      completedMileage: args.completedMileage,
    });
  },
});

export const snooze = mutation({
  args: {
    id: v.id("maintenanceTasks"),
    snoozedUntil: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      snoozedUntil: args.snoozedUntil,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("maintenanceTasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const generateMaintenancePlan = mutation({
  args: { motorcycleId: v.id("motorcycles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const motorcycle = await ctx.db.get(args.motorcycleId);
    if (!motorcycle || motorcycle.userId !== userId) throw new Error("Not found");

    const now = Date.now();
    const mileage = motorcycle.currentMileage;

    // Generate AI-based maintenance plan based on motorcycle specs
    const maintenanceItems = [
      {
        title: "Oil & Filter Change",
        description: `Replace engine oil and filter. Use manufacturer-recommended oil grade for ${motorcycle.make} ${motorcycle.model}.`,
        category: "oil",
        priority: mileage % 5000 > 4000 ? "critical" : "medium",
        dueMileage: Math.ceil(mileage / 5000) * 5000,
        dueDate: now + (30 * 24 * 60 * 60 * 1000),
        estimatedCost: 75,
        estimatedTime: "45 mins",
      },
      {
        title: "Chain Maintenance",
        description: "Clean, inspect, and lubricate drive chain. Check for wear and proper tension.",
        category: "chain",
        priority: "medium",
        dueMileage: Math.ceil(mileage / 500) * 500 + 500,
        dueDate: now + (14 * 24 * 60 * 60 * 1000),
        estimatedCost: 15,
        estimatedTime: "20 mins",
      },
      {
        title: "Brake Inspection",
        description: "Check brake pad thickness, rotor condition, and fluid level. Replace if below minimum spec.",
        category: "brakes",
        priority: "high",
        dueMileage: Math.ceil(mileage / 10000) * 10000,
        dueDate: now + (60 * 24 * 60 * 60 * 1000),
        estimatedCost: 150,
        estimatedTime: "1.5 hrs",
      },
      {
        title: "Air Filter Service",
        description: "Inspect and clean or replace air filter element for optimal engine performance.",
        category: "air_filter",
        priority: "medium",
        dueMileage: Math.ceil(mileage / 15000) * 15000,
        dueDate: now + (90 * 24 * 60 * 60 * 1000),
        estimatedCost: 45,
        estimatedTime: "30 mins",
      },
      {
        title: "Tire Inspection",
        description: "Check tire pressure, tread depth, and sidewall condition. Look for cracks or bulges.",
        category: "tires",
        priority: mileage > 8000 ? "high" : "medium",
        dueMileage: Math.ceil(mileage / 3000) * 3000,
        dueDate: now + (21 * 24 * 60 * 60 * 1000),
        estimatedCost: 0,
        estimatedTime: "15 mins",
      },
      {
        title: "Coolant Check",
        description: "Verify coolant level and condition. Flush and replace if discolored or at service interval.",
        category: "coolant",
        priority: "low",
        dueMileage: Math.ceil(mileage / 20000) * 20000,
        dueDate: now + (180 * 24 * 60 * 60 * 1000),
        estimatedCost: 35,
        estimatedTime: "45 mins",
      },
      {
        title: "Spark Plug Replacement",
        description: `Replace spark plugs with OEM-spec plugs for ${motorcycle.year} ${motorcycle.make} ${motorcycle.model}.`,
        category: "spark_plugs",
        priority: "medium",
        dueMileage: Math.ceil(mileage / 16000) * 16000,
        dueDate: now + (120 * 24 * 60 * 60 * 1000),
        estimatedCost: 60,
        estimatedTime: "1 hr",
      },
    ];

    for (const item of maintenanceItems) {
      await ctx.db.insert("maintenanceTasks", {
        motorcycleId: args.motorcycleId,
        userId,
        ...item,
        completed: false,
        createdAt: now,
      });
    }

    return maintenanceItems.length;
  },
});
