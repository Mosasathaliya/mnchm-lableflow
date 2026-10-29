# MNChem LabelFlow — Convex Backend Deployment & Integration Guide

This application is built with a dual-ready architecture:
1. **Built-in Full-Stack Express Engine**: Ready-to-run immediately with zero setup, complete session auth, file storage, and atomic persistent storage.
2. **First-Class Convex Cloud Backend**: Fully defined schema, queries, mutations, file storage, and session indexes located in `/convex`.

---

## 1. Convex Architecture Overview

All Convex backend source files are configured under `/convex`:
- `convex/schema.ts`: Strongly typed Convex schema defining:
  - `appSessions`: Authenticated sessions with tokens, TTL, and revocation.
  - `productTemplates`: Product label definitions, field placements, versions, and statuses.
  - `orderLabels`: Finalized and draft packaging orders, PO, Batch, Expiry, and PDF references.
  - `appSettings`: Application configuration and date format preferences.
- `convex/auth.ts`: `loginWithAccessCode`, `verifySession`, `logoutSession`.
- `convex/templates.ts`: `listTemplates`, `getTemplate`, `createTemplate`, `updateTemplate`, `archiveTemplate`.
- `convex/orders.ts`: `listOrders`, `getOrder`, `createOrder`.
- `convex/files.ts`: `generateUploadUrl`, `getFileUrl` (Convex File Storage).
- `convex/settings.ts`: `getSettings`, `updateSettings`.

---

## 2. Deploying to Convex Cloud

Follow these steps to deploy to your Convex team account:

### Step 1: Install Convex CLI (if not already installed)
```bash
npm install -g convex
# or inside the project:
npm install convex
```

### Step 2: Initialize Convex Project
```bash
npx convex dev
```
- When prompted, log in with your Convex account (GitHub or Google).
- Select or create a project named `mnchem-labelflow`.
- Convex will push the schema and functions to your cloud development environment.

### Step 3: Configure Environment Variables in Convex Dashboard
In your Convex project settings (Settings > Environment Variables), set:
```env
LABEL_APP_ACCESS_CODE=3056
```
*(You may update this access code at any time without rebuilding the application).*

### Step 4: Configure Frontend Connection
Add your Convex deployment URL to `.env.local` or your hosting environment:
```env
VITE_CONVEX_URL="https://your-deployment-name.convex.cloud"
```

### Step 5: Production Deployment
```bash
npx convex deploy
```

---

## 3. Security Notes

- The access code `3056` is validated strictly server-side in both Express (`server.ts`) and Convex (`convex/auth.ts`).
- Never check `.env.local` or secrets into version control.
- To rotate the access code, change the `LABEL_APP_ACCESS_CODE` environment variable in your production hosting platform or Convex dashboard.
