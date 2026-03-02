import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  motorcycles: defineTable({
    userId: v.id("users"),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    currentMileage: v.number(),
    nickname: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  maintenanceTasks: defineTable({
    motorcycleId: v.id("motorcycles"),
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(), // oil, brakes, chain, tires, air_filter, spark_plugs, coolant, general
    priority: v.string(), // critical, high, medium, low
    dueMileage: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    estimatedTime: v.optional(v.string()),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    completedMileage: v.optional(v.number()),
    snoozedUntil: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_motorcycle", ["motorcycleId"])
    .index("by_user", ["userId"])
    .index("by_completed", ["completed"]),

  reminders: defineTable({
    taskId: v.id("maintenanceTasks"),
    userId: v.id("users"),
    type: v.string(), // push, sms, email
    scheduledFor: v.number(),
    sent: v.boolean(),
    sentAt: v.optional(v.number()),
    acknowledged: v.boolean(),
    acknowledgedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_task", ["taskId"])
    .index("by_scheduled", ["scheduledFor"]),

  parts: defineTable({
    taskId: v.id("maintenanceTasks"),
    userId: v.id("users"),
    name: v.string(),
    partNumber: v.optional(v.string()),
    quantity: v.number(),
    estimatedPrice: v.optional(v.number()),
    supplier: v.optional(v.string()),
    supplierUrl: v.optional(v.string()),
    ordered: v.boolean(),
    orderedAt: v.optional(v.number()),
    delivered: v.boolean(),
    deliveredAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_task", ["taskId"])
    .index("by_user", ["userId"]),

  serviceHistory: defineTable({
    motorcycleId: v.id("motorcycles"),
    userId: v.id("users"),
    taskId: v.optional(v.id("maintenanceTasks")),
    title: v.string(),
    description: v.optional(v.string()),
    mileage: v.number(),
    cost: v.optional(v.number()),
    serviceDate: v.number(),
    createdAt: v.number(),
  }).index("by_motorcycle", ["motorcycleId"])
    .index("by_user", ["userId"]),
});
