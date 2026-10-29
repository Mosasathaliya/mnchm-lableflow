import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listOrders = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db
      .query("orderLabels")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    if (args.status && args.status !== "all") {
      orders = orders.filter((o) => o.status === args.status);
    }

    if (args.search) {
      const q = args.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.customerPoNumber.toLowerCase().includes(q) ||
          o.batchNumber.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q)
      );
    }

    return orders;
  },
});

export const getOrder = query({
  args: { id: v.id("orderLabels") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createOrder = mutation({
  args: {
    orderNumber: v.string(),
    templateId: v.string(),
    templateVersion: v.number(),
    productName: v.string(),
    productCode: v.string(),
    customerPoNumber: v.string(),
    expiryDate: v.string(),
    batchNumber: v.string(),
    manufacturingDate: v.string(),
    fieldValues: v.optional(v.any()),
    status: v.union(v.literal("Finalized"), v.literal("Draft")),
    pdfStorageId: v.optional(v.id("_storage")),
    pdfSizeBytes: v.optional(v.number()),
    pageCount: v.number(),
    createdBy: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("orderLabels", {
      ...args,
      createdAt: now,
      finalizedAt: args.status === "Finalized" ? now : undefined,
    });
    return id;
  },
});
