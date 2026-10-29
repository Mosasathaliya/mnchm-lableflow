import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listTemplates = query({
  args: { status: v.optional(v.string()), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("productTemplates");
    let templates = await q.collect();

    if (args.status && args.status !== "all") {
      templates = templates.filter((t) => t.status === args.status);
    }
    if (args.search) {
      const queryStr = args.search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(queryStr) ||
          t.code.toLowerCase().includes(queryStr)
      );
    }

    return templates;
  },
});

export const getTemplate = query({
  args: { id: v.id("productTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createTemplate = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    category: v.string(),
    description: v.string(),
    density: v.optional(v.string()),
    flashPoint: v.optional(v.string()),
    hazardClass: v.optional(v.string()),
    netWeight: v.optional(v.string()),
    netVolume: v.optional(v.string()),
    unNumber: v.optional(v.string()),
    artworkType: v.union(v.literal("vector"), v.literal("image")),
    artworkFileId: v.optional(v.id("_storage")),
    artworkUrl: v.optional(v.string()),
    customLogoUrl: v.optional(v.string()),
    layoutPreset: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
    version: v.number(),
    fields: v.array(v.any()),
    artworkElements: v.optional(v.array(v.any())),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("productTemplates", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTemplate = mutation({
  args: {
    id: v.id("productTemplates"),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Template not found");

    await ctx.db.patch(args.id, {
      ...args.patch,
      version: existing.version + 1,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.id);
  },
});

export const archiveTemplate = mutation({
  args: { id: v.id("productTemplates") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Template not found");
    const newStatus = existing.status === "active" ? "archived" : "active";
    await ctx.db.patch(args.id, { status: newStatus, updatedAt: Date.now() });
    return { status: newStatus };
  },
});
