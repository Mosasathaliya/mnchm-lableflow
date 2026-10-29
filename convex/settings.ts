import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();

    if (!settings) {
      return {
        key: "global",
        dateFormat: "DD/MM/YYYY",
        companyName: "Modern National Chemicals (MNChem)",
        companyAddress: "Dammam 2nd Industrial City, KSA",
        companyWebsite: "www.mn-chem.com",
        defaultPageSize: "A4",
        defaultOrientation: "Landscape",
        autoPrintDialog: false,
        updatedAt: Date.now(),
      };
    }
    return settings;
  },
});

export const updateSettings = mutation({
  args: {
    dateFormat: v.union(v.literal("YYYY-MM-DD"), v.literal("DD/MM/YYYY"), v.literal("DD-MMM-YYYY")),
    companyName: v.string(),
    companyAddress: v.string(),
    companyWebsite: v.string(),
    autoPrintDialog: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        defaultPageSize: "A4",
        defaultOrientation: "Landscape",
        updatedAt: now,
      });
      return await ctx.db.get(existing._id);
    } else {
      const id = await ctx.db.insert("appSettings", {
        key: "global",
        ...args,
        defaultPageSize: "A4",
        defaultOrientation: "Landscape",
        updatedAt: now,
      });
      return await ctx.db.get(id);
    }
  },
});
