import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { ProductTemplate, OrderLabel, AppSession, AppSettings } from './src/types/index.ts';
import { ConvexHttpClient } from 'convex/browser';
import { api as convexApi } from './convex/_generated/api.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ACCESS_CODE = process.env.LABEL_APP_ACCESS_CODE || '3056';
const CONVEX_URL = process.env.VITE_CONVEX_URL || 'https://exciting-toad-544.ap-southeast-2.convex.cloud';
const convex = new ConvexHttpClient(CONVEX_URL);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directories exist
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORAGE_DIR = path.resolve(DATA_DIR, 'storage');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

const DB_FILE = path.resolve(DATA_DIR, 'database.json');

interface DatabaseSchema {
  sessions: AppSession[];
  templates: ProductTemplate[];
  orders: OrderLabel[];
  settings: AppSettings;
}

// Default Seed Templates (MNCLEAN S as primary template)
const DEFAULT_TEMPLATES: ProductTemplate[] = [
  {
    id: 'tmpl-mnclean-s',
    name: 'MNCLEAN S',
    code: 'MNC-CLN-S01',
    category: 'Wellbore Cleaning Solvent & Surfactant',
    description: 'Wellbore Cleaning Solvent & Surfactant System for invert emulsion mud removal',
    density: '0.985 - 1.015 g/cm³',
    flashPoint: '> 65°C (> 149°F)',
    hazardClass: 'Class 3 / Class 8 (Combustible & Corrosive)',
    netWeight: '200 kg / Drum (~440 lbs)',
    netVolume: '200 Liters (53 US Gallons)',
    unNumber: 'UN 1993, PG III',
    artworkType: 'vector',
    status: 'active',
    version: 1,
    internalNotes: 'Primary wellbore intervention solvent for Aramco & regional oilfield service rigs. Converted from MNCLEAN S Label specification.',
    fields: [
      {
        id: 'fld-po',
        name: 'customerPoNumber',
        label: 'Customer PO Number',
        type: 'text',
        xPercent: 65,
        yPercent: 42,
        widthPercent: 30,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#0a2652',
        align: 'left',
        required: true,
        placeholder: 'e.g. PO-ARAMCO-2026-984',
        maxLength: 40,
      },
      {
        id: 'fld-batch',
        name: 'batchNumber',
        label: 'Batch Number',
        type: 'text',
        xPercent: 65,
        yPercent: 54,
        widthPercent: 30,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#0a2652',
        align: 'left',
        required: true,
        placeholder: 'e.g. MN-CLN-2610-01',
        maxLength: 35,
      },
      {
        id: 'fld-expiry',
        name: 'expiryDate',
        label: 'Expiry Date',
        type: 'date',
        xPercent: 65,
        yPercent: 66,
        widthPercent: 30,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#d91e18',
        align: 'left',
        required: true,
        maxLength: 20,
      },
    ],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tmpl-mnclean-e',
    name: 'MNCLEAN E',
    code: 'MNC-CLN-E02',
    category: 'Eco Heavy-Duty Solvent',
    description: 'Biodegradable Wellbore Cleanout Solvent & Displacement Spacer Blend',
    density: '0.960 - 0.980 g/cm³',
    flashPoint: '> 93°C (> 200°F)',
    hazardClass: 'Class 9 (Environmentally Regulated)',
    netWeight: '195 kg / Drum',
    netVolume: '200 Liters (53 US Gallons)',
    unNumber: 'UN 3082, PG III',
    artworkType: 'vector',
    status: 'active',
    version: 1,
    internalNotes: 'Offshore & environmentally sensitive well completions.',
    fields: [
      {
        id: 'fld-po-e',
        name: 'customerPoNumber',
        label: 'Customer PO Number',
        type: 'text',
        xPercent: 65,
        yPercent: 42,
        widthPercent: 30,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#0a2652',
        align: 'left',
        required: true,
        placeholder: 'e.g. PO-88771',
        maxLength: 40,
      },
      {
        id: 'fld-batch-e',
        name: 'batchNumber',
        label: 'Batch Number',
        type: 'text',
        xPercent: 65,
        yPercent: 54,
        widthPercent: 30,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#0a2652',
        align: 'left',
        required: true,
        placeholder: 'e.g. MN-CLE-2610-B2',
        maxLength: 35,
      },
      {
        id: 'fld-expiry-e',
        name: 'expiryDate',
        label: 'Expiry Date',
        type: 'date',
        xPercent: 65,
        yPercent: 66,
        widthPercent: 30,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#d91e18',
        align: 'left',
        required: true,
        maxLength: 20,
      },
    ],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'tmpl-mnspacer-100',
    name: 'MNSPACER 100',
    code: 'MNC-SPC-100',
    category: 'Mutual Solvent Spacer',
    description: 'Aqueous displacement spacer and wettability reversal surfactant chemistry',
    density: '1.020 - 1.045 g/cm³',
    flashPoint: '> 78°C',
    hazardClass: 'Class 8 (Corrosive)',
    netWeight: '210 kg / Drum',
    netVolume: '200 Liters (53 US Gallons)',
    unNumber: 'UN 1760, PG II',
    artworkType: 'vector',
    status: 'active',
    version: 1,
    internalNotes: 'Mud removal spacer for high pressure wellbore cements.',
    fields: [
      {
        id: 'fld-po-spc',
        name: 'customerPoNumber',
        label: 'Customer PO Number',
        type: 'text',
        xPercent: 65,
        yPercent: 42,
        widthPercent: 30,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#0a2652',
        align: 'left',
        required: true,
        maxLength: 40,
      },
      {
        id: 'fld-batch-spc',
        name: 'batchNumber',
        label: 'Batch Number',
        type: 'text',
        xPercent: 65,
        yPercent: 54,
        widthPercent: 30,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#0a2652',
        align: 'left',
        required: true,
        maxLength: 35,
      },
      {
        id: 'fld-expiry-spc',
        name: 'expiryDate',
        label: 'Expiry Date',
        type: 'date',
        xPercent: 65,
        yPercent: 66,
        widthPercent: 30,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#d91e18',
        align: 'left',
        required: true,
        maxLength: 20,
      },
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  dateFormat: 'DD/MM/YYYY',
  companyName: 'Modern National Chemicals (MNChem)',
  companyAddress: 'Dammam 2nd Industrial City, Eastern Province, Kingdom of Saudi Arabia',
  companyWebsite: 'www.mn-chem.com',
  defaultPageSize: 'A4',
  defaultOrientation: 'Landscape',
  autoPrintDialog: false,
};

// Seed an initial demo order so dashboard and order history are populated immediately
const DEFAULT_ORDERS: OrderLabel[] = [
  {
    id: 'ord-initial-sample',
    orderNumber: 'ORD-2026-1001',
    templateId: 'tmpl-mnclean-s',
    templateVersion: 1,
    productName: 'MNCLEAN S',
    productCode: 'MNC-CLN-S01',
    customerPoNumber: 'PO-ARAMCO-99881',
    expiryDate: '2028-10-31',
    batchNumber: 'MN-CLN-2610-B1',
    manufacturingDate: '2026-10-28',
    status: 'Finalized',
    pdfFileId: 'file-sample-mnclean-s.pdf',
    pdfUrl: '/api/files/file-sample-mnclean-s.pdf',
    pdfSizeBytes: 24500,
    pageCount: 1,
    createdAt: Date.now() - 86400000 * 1,
    finalizedAt: Date.now() - 86400000 * 1,
    createdBy: 'MNChem QC Inspector #4',
    notes: 'Sample verified shipment label for 200kg drum packaging.',
  },
];

// Helper to load database
function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      sessions: [],
      templates: DEFAULT_TEMPLATES,
      orders: DEFAULT_ORDERS,
      settings: DEFAULT_SETTINGS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      sessions: parsed.sessions || [],
      templates: parsed.templates || DEFAULT_TEMPLATES,
      orders: parsed.orders || DEFAULT_ORDERS,
      settings: parsed.settings || DEFAULT_SETTINGS,
    };
  } catch (err) {
    console.error('Error reading database file, reinitializing', err);
    return {
      sessions: [],
      templates: DEFAULT_TEMPLATES,
      orders: DEFAULT_ORDERS,
      settings: DEFAULT_SETTINGS,
    };
  }
}

// Helper to save database atomically
function saveDb(db: DatabaseSchema) {
  const tmp = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmp, DB_FILE);
}

// Auth Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Session token required.' });
  }
  const token = authHeader.split(' ')[1];
  const db = loadDb();
  const session = db.sessions.find((s) => s.token === token && s.isValid);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session.' });
  }

  if (session.expiresAt < Date.now()) {
    session.isValid = false;
    saveDb(db);
    return res.status(401).json({ error: 'Unauthorized: Session expired.' });
  }

  (req as any).session = session;
  next();
}

// API Routes

// 1. Auth Login (Validated against server-side LABEL_APP_ACCESS_CODE = 3056)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { accessCode } = req.body;
  if (!accessCode || typeof accessCode !== 'string') {
    return res.status(400).json({ error: 'Access code is required.' });
  }

  if (accessCode.trim() !== ACCESS_CODE.trim()) {
    return res.status(401).json({ error: 'Invalid access code. Please check and try again.' });
  }

  // Create cryptographic session
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

  const newSession: AppSession = {
    token,
    createdAt: now,
    expiresAt,
    isValid: true,
    ip: req.ip,
  };

  const db = loadDb();
  db.sessions.push(newSession);
  saveDb(db);

  return res.json({
    token,
    expiresAt,
    message: 'Authorized session established.',
  });
});

// 2. Auth Verify
app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ authenticated: false });
  }
  const token = authHeader.split(' ')[1];
  const db = loadDb();
  const session = db.sessions.find((s) => s.token === token && s.isValid);

  if (!session || session.expiresAt < Date.now()) {
    return res.json({ authenticated: false });
  }

  return res.json({ authenticated: true, expiresAt: session.expiresAt });
});

// 3. Auth Logout
app.post('/api/auth/logout', requireAuth, (req: Request, res: Response) => {
  const session = (req as any).session as AppSession;
  const db = loadDb();
  const found = db.sessions.find((s) => s.token === session.token);
  if (found) {
    found.isValid = false;
    saveDb(db);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. Templates: List
app.get('/api/templates', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  const { status, search } = req.query;

  let filtered = db.templates;
  if (status && (status === 'active' || status === 'archived')) {
    filtered = filtered.filter((t) => t.status === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }

  return res.json({ templates: filtered });
});

// 5. Templates: Get by ID
app.get('/api/templates/:id', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  const template = db.templates.find((t) => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Product template not found.' });
  }
  return res.json({ template });
});

// 6. Templates: Create
app.post('/api/templates', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  const body = req.body;

  if (!body.name || !body.code) {
    return res.status(400).json({ error: 'Product name and product code are required.' });
  }

  const newTemplate: ProductTemplate = {
    id: `tmpl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: body.name.trim(),
    code: body.code.trim().toUpperCase(),
    category: body.category?.trim() || 'Chemical Product',
    description: body.description?.trim() || '',
    density: body.density?.trim(),
    flashPoint: body.flashPoint?.trim(),
    hazardClass: body.hazardClass?.trim(),
    netWeight: body.netWeight?.trim() || '200 kg / Drum',
    netVolume: body.netVolume?.trim() || '200 L',
    unNumber: body.unNumber?.trim() || '',
    artworkType: body.artworkType || 'vector',
    artworkUrl: body.artworkUrl || '',
    customLogoUrl: body.customLogoUrl || '',
    isBlankCanvas: body.isBlankCanvas !== undefined ? Boolean(body.isBlankCanvas) : true,
    layoutPreset: body.layoutPreset || (body.isBlankCanvas ? 'blank' : 'standard-split'),
    canvasBgColor: body.canvasBgColor || '#ffffff',
    canvasBorder: body.canvasBorder || 'industrial',
    canvasBorderColor: body.canvasBorderColor || '#000000',
    artworkElements: Array.isArray(body.artworkElements) ? body.artworkElements : [],
    status: 'active',
    version: 1,
    fields: Array.isArray(body.fields) ? body.fields : [],
    internalNotes: body.internalNotes?.trim() || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  db.templates.unshift(newTemplate);
  saveDb(db);

  // Sync to Convex Cloud
  try {
    convex.mutation(convexApi.templates.createTemplate as any, {
      name: newTemplate.name,
      code: newTemplate.code,
      category: newTemplate.category,
      description: newTemplate.description,
      density: newTemplate.density,
      flashPoint: newTemplate.flashPoint,
      hazardClass: newTemplate.hazardClass,
      netWeight: newTemplate.netWeight,
      netVolume: newTemplate.netVolume,
      unNumber: newTemplate.unNumber,
      artworkType: newTemplate.artworkType,
      customLogoUrl: newTemplate.customLogoUrl,
      layoutPreset: newTemplate.layoutPreset,
      status: newTemplate.status,
      version: newTemplate.version,
      fields: newTemplate.fields,
      artworkElements: newTemplate.artworkElements,
      internalNotes: newTemplate.internalNotes,
    }).catch((e: any) => console.warn('[Convex Sync] Template sync notice:', e.message));
  } catch (err) {
    // Non-blocking
  }

  return res.status(201).json({ template: newTemplate });
});

// 7. Templates: Update
app.put('/api/templates/:id', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  const index = db.templates.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Template not found.' });
  }

  const existing = db.templates[index];
  const updated: ProductTemplate = {
    ...existing,
    ...req.body,
    id: existing.id,
    version: existing.version + 1,
    updatedAt: Date.now(),
  };

  db.templates[index] = updated;
  saveDb(db);
  return res.json({ template: updated });
});

// 8. Templates: Duplicate
app.post('/api/templates/:id/duplicate', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  const existing = db.templates.find((t) => t.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Template not found.' });
  }

  const duplicated: ProductTemplate = {
    ...existing,
    id: `tmpl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: `${existing.name} (Copy)`,
    code: `${existing.code}-COPY`,
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  db.templates.unshift(duplicated);
  saveDb(db);
  return res.status(201).json({ template: duplicated });
});

// 9. Templates: Archive / Restore
app.patch('/api/templates/:id/archive', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  const existing = db.templates.find((t) => t.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Template not found.' });
  }

  existing.status = existing.status === 'active' ? 'archived' : 'active';
  existing.updatedAt = Date.now();
  saveDb(db);
  return res.json({ template: existing });
});

// 10. Orders: List with Search, Filter & Pagination
app.get('/api/orders', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  const { search, status, templateId, page = '1', limit = '20' } = req.query;

  let orders = [...db.orders];

  if (status && typeof status === 'string' && status !== 'all') {
    orders = orders.filter((o) => o.status === status);
  }

  if (templateId && typeof templateId === 'string') {
    orders = orders.filter((o) => o.templateId === templateId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.customerPoNumber.toLowerCase().includes(q) ||
        o.batchNumber.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q)
    );
  }

  // Sort descending by creation timestamp
  orders.sort((a, b) => b.createdAt - a.createdAt);

  const p = Math.max(1, parseInt(page as string, 10));
  const l = Math.max(1, parseInt(limit as string, 10));
  const total = orders.length;
  const paginated = orders.slice((p - 1) * l, p * l);

  return res.json({
    orders: paginated,
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
  });
});

// 11. Orders: Get by ID
app.get('/api/orders/:id', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order label record not found.' });
  }
  return res.json({ order });
});

// 12. Orders: Create / Finalize Order
app.post('/api/orders', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  const {
    templateId,
    customerPoNumber,
    expiryDate,
    batchNumber,
    manufacturingDate,
    status = 'Finalized',
    pdfBase64,
    notes,
  } = req.body;

  if (!templateId || !customerPoNumber || !expiryDate || !batchNumber) {
    return res.status(400).json({
      error: 'Template ID, Customer PO Number, Expiry Date, and Batch Number are all required.',
    });
  }

  const template = db.templates.find((t) => t.id === templateId);
  if (!template) {
    return res.status(404).json({ error: 'Referenced product template does not exist.' });
  }

  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  let pdfFileId = '';
  let pdfUrl = '';
  let pdfSizeBytes = 0;

  // If client generated the PDF or passed base64, save it to file storage
  if (pdfBase64 && typeof pdfBase64 === 'string') {
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    pdfFileId = `${orderNumber}.pdf`;
    const filePath = path.resolve(STORAGE_DIR, pdfFileId);
    fs.writeFileSync(filePath, buffer);
    pdfUrl = `/api/files/${pdfFileId}`;
    pdfSizeBytes = buffer.length;
  }

  const newOrder: OrderLabel = {
    id: orderId,
    orderNumber,
    templateId: template.id,
    templateVersion: template.version,
    productName: template.name,
    productCode: template.code,
    customerPoNumber: customerPoNumber.trim(),
    expiryDate: expiryDate.trim(),
    batchNumber: batchNumber.trim(),
    manufacturingDate: manufacturingDate?.trim() || new Date().toISOString().split('T')[0],
    status: status === 'Draft' ? 'Draft' : 'Finalized',
    pdfFileId,
    pdfUrl,
    pdfSizeBytes,
    pageCount: 1,
    createdAt: Date.now(),
    finalizedAt: status === 'Finalized' ? Date.now() : undefined,
    createdBy: 'MNChem Authorized Operator',
    notes: notes?.trim() || '',
  };

  db.orders.unshift(newOrder);
  saveDb(db);

  // Sync to Convex Cloud
  try {
    convex.mutation(convexApi.orders.createOrder, {
      orderNumber: newOrder.orderNumber,
      templateId: newOrder.templateId,
      templateVersion: newOrder.templateVersion,
      productName: newOrder.productName,
      productCode: newOrder.productCode,
      customerPoNumber: newOrder.customerPoNumber,
      expiryDate: newOrder.expiryDate,
      batchNumber: newOrder.batchNumber,
      manufacturingDate: newOrder.manufacturingDate,
      status: newOrder.status,
      pdfSizeBytes: newOrder.pdfSizeBytes,
      pageCount: 1,
      createdBy: newOrder.createdBy,
      notes: newOrder.notes,
    }).catch((e: any) => console.warn('[Convex Sync] Order sync notice:', e.message));
  } catch (err) {
    // Non-blocking
  }

  return res.status(201).json({ order: newOrder });
});

// 13. File Storage: Upload file
app.post('/api/files/upload', requireAuth, (req: Request, res: Response) => {
  const { fileName, fileBase64, contentType } = req.body;
  if (!fileBase64) {
    return res.status(400).json({ error: 'File content base64 is required.' });
  }

  const fileId = `${Date.now()}-${(fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = path.resolve(STORAGE_DIR, fileId);
  const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  fs.writeFileSync(filePath, buffer);

  return res.json({
    fileId,
    url: `/api/files/${fileId}`,
    size: buffer.length,
    contentType: contentType || 'application/octet-stream',
  });
});

// 14. File Storage: Retrieve file
app.get('/api/files/:id', (req: Request, res: Response) => {
  const fileId = req.params.id;
  // Prevent directory traversal
  const safeId = path.basename(fileId);
  const filePath = path.resolve(STORAGE_DIR, safeId);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found in storage.');
  }

  if (safeId.endsWith('.pdf')) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeId}"`);
  } else if (safeId.endsWith('.png')) {
    res.setHeader('Content-Type', 'image/png');
  }

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// 15. Settings: Get & Update
app.get('/api/settings', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  return res.json({ settings: db.settings });
});

app.post('/api/settings', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  db.settings = {
    ...db.settings,
    ...req.body,
    defaultPageSize: 'A4',
    defaultOrientation: 'Landscape',
  };
  saveDb(db);

  // Sync to Convex Cloud
  try {
    convex.mutation(convexApi.settings.updateSettings, {
      dateFormat: db.settings.dateFormat,
      companyName: db.settings.companyName,
      companyAddress: db.settings.companyAddress,
      companyWebsite: db.settings.companyWebsite,
      autoPrintDialog: db.settings.autoPrintDialog,
    }).catch((e: any) => console.warn('[Convex Sync] Settings sync notice:', e.message));
  } catch (err) {
    // Non-blocking
  }

  return res.json({ settings: db.settings });
});

// 16. Dashboard Stats
app.get('/api/dashboard/stats', requireAuth, (req: Request, res: Response) => {
  const db = loadDb();
  const activeTemplates = db.templates.filter((t) => t.status === 'active').length;
  const totalOrders = db.orders.length;
  const finalizedOrders = db.orders.filter((o) => o.status === 'Finalized').length;
  const recentOrders = db.orders.slice(0, 5);

  return res.json({
    activeTemplates,
    totalTemplates: db.templates.length,
    totalOrders,
    finalizedOrders,
    recentOrders,
  });
});

// Vite mounting
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MNChem Label Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
