import { mutation } from "./_generated/server";

export const seedInitialData = mutation({
  handler: async (ctx) => {
    // Check if templates already exist
    const existing = await ctx.db.query("productTemplates").collect();
    if (existing.length > 0) {
      return { message: "Templates already seeded", count: existing.length };
    }

    const now = Date.now();

    // 1. Seed MNCLEAN S
    await ctx.db.insert("productTemplates", {
      name: "MNCLEAN S",
      code: "MNC-CLN-S01",
      category: "Wellbore Cleaning Solvent & Surfactant",
      description: "Wellbore Cleaning Solvent & Surfactant System for invert emulsion mud removal",
      density: "0.985 - 1.015 g/cm³",
      flashPoint: "> 65°C (> 149°F)",
      hazardClass: "Class 3 / Class 8 (Combustible & Corrosive)",
      netWeight: "200 kg / Drum (~440 lbs)",
      netVolume: "200 Liters (53 US Gallons)",
      unNumber: "UN 1993, PG III",
      artworkType: "vector",
      status: "active",
      version: 1,
      internalNotes: "Primary wellbore intervention solvent for Aramco & regional oilfield rigs. Converted from MNCLEAN S Label specification.",
      fields: [
        {
          id: "fld-po",
          name: "customerPoNumber",
          label: "Customer PO Number",
          type: "text",
          xPercent: 65,
          yPercent: 42,
          widthPercent: 30,
          fontSize: 16,
          fontWeight: "bold",
          fontColor: "#0a2652",
          align: "left",
          required: true,
          placeholder: "e.g. PO-ARAMCO-2026-984",
          maxLength: 40,
        },
        {
          id: "fld-batch",
          name: "batchNumber",
          label: "Batch Number",
          type: "text",
          xPercent: 65,
          yPercent: 54,
          widthPercent: 30,
          fontSize: 16,
          fontWeight: "bold",
          fontColor: "#0a2652",
          align: "left",
          required: true,
          placeholder: "e.g. MN-CLN-2610-01",
          maxLength: 35,
        },
        {
          id: "fld-expiry",
          name: "expiryDate",
          label: "Expiry Date",
          type: "date",
          xPercent: 65,
          yPercent: 66,
          widthPercent: 30,
          fontSize: 16,
          fontWeight: "bold",
          fontColor: "#d91e18",
          align: "left",
          required: true,
          maxLength: 20,
        },
      ],
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 2,
    });

    // 2. Seed MNCLEAN E
    await ctx.db.insert("productTemplates", {
      name: "MNCLEAN E",
      code: "MNC-CLN-E02",
      category: "Eco Heavy-Duty Solvent",
      description: "Biodegradable Wellbore Cleanout Solvent & Displacement Spacer Blend",
      density: "0.960 - 0.980 g/cm³",
      flashPoint: "> 93°C (> 200°F)",
      hazardClass: "Class 9 (Environmentally Regulated)",
      netWeight: "195 kg / Drum",
      netVolume: "200 Liters (53 US Gallons)",
      unNumber: "UN 3082, PG III",
      artworkType: "vector",
      status: "active",
      version: 1,
      internalNotes: "Offshore & environmentally sensitive well completions.",
      fields: [],
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 1,
    });

    // 3. Seed MNSPACER 100
    await ctx.db.insert("productTemplates", {
      name: "MNSPACER 100",
      code: "MNC-SPC-100",
      category: "Mutual Solvent Spacer",
      description: "Aqueous displacement spacer and wettability reversal surfactant chemistry",
      density: "1.020 - 1.045 g/cm³",
      flashPoint: "> 78°C",
      hazardClass: "Class 8 (Corrosive)",
      netWeight: "210 kg / Drum",
      netVolume: "200 Liters (53 US Gallons)",
      unNumber: "UN 1760, PG II",
      artworkType: "vector",
      status: "active",
      version: 1,
      internalNotes: "Mud removal spacer for high pressure wellbore cements.",
      fields: [],
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 1,
    });

    // 4. Seed sample verified order
    await ctx.db.insert("orderLabels", {
      orderNumber: "ORD-2026-1001",
      templateId: "tmpl-mnclean-s",
      templateVersion: 1,
      productName: "MNCLEAN S",
      productCode: "MNC-CLN-S01",
      customerPoNumber: "PO-ARAMCO-99881",
      expiryDate: "2028-10-31",
      batchNumber: "MN-CLN-2610-B1",
      manufacturingDate: "2026-10-28",
      status: "Finalized",
      pageCount: 1,
      createdAt: now - 86400000 * 1,
      finalizedAt: now - 86400000 * 1,
      createdBy: "MNChem QC Inspector #4",
      notes: "Sample verified shipment label for 200kg drum packaging.",
    });

    // 5. Seed default settings
    await ctx.db.insert("appSettings", {
      key: "global",
      dateFormat: "DD/MM/YYYY",
      companyName: "Modern National Chemicals (MNChem)",
      companyAddress: "Dammam 2nd Industrial City, Eastern Province, Kingdom of Saudi Arabia",
      companyWebsite: "www.mn-chem.com",
      defaultPageSize: "A4",
      defaultOrientation: "Landscape",
      autoPrintDialog: false,
      updatedAt: now,
    });

    return { message: "Seeded initial product templates, orders, and settings", count: 3 };
  },
});
