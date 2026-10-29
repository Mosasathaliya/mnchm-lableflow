import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Authenticated application sessions
  appSessions: defineTable({
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    isValid: v.boolean(),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_token", ["token"])
    .index("by_valid", ["isValid", "expiresAt"]),

  // Product Templates
  productTemplates: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_code", ["code"])
    .index("by_name", ["name"]),

  // Order Labels
  orderLabels: defineTable({
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
    pdfUrl: v.optional(v.string()),
    pdfSizeBytes: v.optional(v.number()),
    pageCount: v.number(),
    createdBy: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    finalizedAt: v.optional(v.number()),
  })
    .index("by_order_number", ["orderNumber"])
    .index("by_po_number", ["customerPoNumber"])
    .index("by_batch_number", ["batchNumber"])
    .index("by_product", ["productName"])
    .index("by_created_at", ["createdAt"])
    .index("by_status", ["status"]),

  // Application Settings
  appSettings: defineTable({
    key: v.string(),
    dateFormat: v.union(v.literal("YYYY-MM-DD"), v.literal("DD/MM/YYYY"), v.literal("DD-MMM-YYYY")),
    companyName: v.string(),
    companyAddress: v.string(),
    companyWebsite: v.string(),
    defaultPageSize: v.literal("A4"),
    defaultOrientation: v.literal("Landscape"),
    autoPrintDialog: v.boolean(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
