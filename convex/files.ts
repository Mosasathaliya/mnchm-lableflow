import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate an upload URL for client to post files to Convex File Storage
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Get public or signed URL for a file
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
