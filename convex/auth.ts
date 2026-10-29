import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const loginWithAccessCode = mutation({
  args: { accessCode: v.string() },
  handler: async (ctx, args) => {
    // In Convex cloud, ACCESS_CODE is stored in process.env.LABEL_APP_ACCESS_CODE
    const configuredCode = process.env.LABEL_APP_ACCESS_CODE || "3056";

    if (args.accessCode.trim() !== configuredCode.trim()) {
      throw new Error("Invalid access code.");
    }

    const token = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("appSessions", {
      token,
      createdAt: now,
      expiresAt,
      isValid: true,
    });

    return { token, expiresAt };
  },
});

export const verifySession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("appSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || !session.isValid || session.expiresAt < Date.now()) {
      return { authenticated: false };
    }

    return { authenticated: true, expiresAt: session.expiresAt };
  },
});

export const logoutSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("appSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.patch(session._id, { isValid: false });
    }

    return { success: true };
  },
});
