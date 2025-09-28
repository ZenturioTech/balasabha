## Balasabha – Technical Documentation

### Overview

- **Frontend**: Public website built with React + Vite
- **Backend/CMS**: React-based CMS for authenticated uploads and an admin dashboard
- **Auth/DB**: Supabase (PostgreSQL + Auth)
- **Storage/CDN**: BunnyCDN for media uploads and delivery
- **Serverless APIs**: Bunny list/delete helpers implemented as server routes

### Tech Stack

- **Frameworks**: React 19, Vite 6, React Router 7
- **Language**: TypeScript
- **Styling**: Tailwind (configured), CSS modules/files in CMS
- **Auth/DB SDK**: `@supabase/supabase-js` v2
- **Storage**: BunnyCDN (Storage Zone + Pull Zone)
- **Deployment**: Netlify/Vercel-style (repo includes `netlify.toml`, `vercel.json`)

### Repository Structure

- `App.tsx`, `index.tsx`, `components/*`: Public website UI
- `public/*`: Static assets and CSV datasets (`block-username.csv`, `panchayath.csv`, `ulb.csv`)
- `services/supabaseClient.ts`: Shared Supabase client for browser
- `src/cms/*`: CMS app
  - `CMSApp.tsx`: CMS entry/router
  - `pages/CMS.tsx`: Upload form and workflow
  - `pages/SuperAdmin.tsx`: Admin dashboard and analytics
  - `lib/bunny.ts`: Bunny upload/list/delete client helpers
  - `lib/supabaseClient.ts`: CMS-local Supabase client
  - `lib/i18n.tsx`: CMS translation hooks
- `api/bunny/*`: Server APIs for Bunny list/delete
- `vite.config.ts`: Vite build config

## Environments and Configuration

Configure both Vite (client) and serverless runtime environments.

### Supabase

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPERADMIN_EMAIL` – email that unlocks Super Admin UI in CMS

### BunnyCDN

- `VITE_BUNNY_API_KEY` – Bunny Storage AccessKey
- `VITE_BUNNY_STORAGE_ZONE` – Storage Zone name
- `VITE_BUNNY_PULL_ZONE` – Pull Zone hostname (public CDN URL host)
- `VITE_BUNNY_HOSTNAME` – Storage API hostname (e.g., `storage.bunnycdn.com`)

Notes:
- Client-side uploads currently use these envs directly (see Security Considerations).
- Serverless list/delete endpoints also read these envs at runtime.

## Frontend (Public Website)

### Purpose

- Public-facing UI for showcasing content.
- Uses static CSVs from `public/` for district, block, ULB, and panchayath data.

### Build & Run

- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

### Notable Assets

- `public/block-username.csv`
- `public/panchayath.csv`
- `public/ulb.csv`
- `public/images/*`

## Backend/CMS

### Purpose

- Authenticated upload interface for contributors
- Super Admin dashboard for analytics and moderation

### Main Components

- `src/cms/pages/CMS.tsx`
  - Reads Supabase auth session
  - Determines user scope (district/block/ULB) via:
    - `block-username.csv` mapping
    - `panchayath.csv` for block→panchayath
    - `ulb.csv` for district→ULB and email local-part convention (ends with `ulb`)
  - Uploads media to BunnyCDN and inserts metadata row into Supabase

- `src/cms/pages/SuperAdmin.tsx`
  - Queries `metadata` table
  - Filters by district, media type, area type
  - Shows KPIs, top districts, recent entries

- `src/cms/lib/bunny.ts`
  - `uploadToBunny`: browser PUT upload to Bunny storage
  - `listBunnyDirectory`: calls server API to list storage directory
  - `deleteBunnyPath`: calls server API to delete a file

### Serverless API Endpoints

- `api/bunny/list.js` – GET `/api/bunny/list?path=<dir>`
  - Proxies to Bunny Storage List API with AccessKey on server side
  - Returns normalized entries `{ guid, path, objectName, isDirectory, size, lastChanged }`

- `api/bunny/delete.js` – DELETE `/api/bunny/delete?path=<file>`
  - Proxies to Bunny delete endpoint with server-side AccessKey
  - Returns `{ success: true }` on success

## Database Schema (Supabase PostgreSQL)

### Tables

`public.metadata`

Purpose: stores a single record per uploaded submission with contextual metadata.

Suggested DDL (aligns with application usage):

```sql
create table if not exists public.metadata (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone not null default now(),
  metadata jsonb not null,
  district text,
  username text,
  block_ulb text,
  panchayath text
);

create index if not exists metadata_created_at_idx on public.metadata (created_at desc);
create index if not exists metadata_district_idx on public.metadata (district);
create index if not exists metadata_username_idx on public.metadata (username);
create index if not exists metadata_block_ulb_idx on public.metadata (block_ulb);
create index if not exists metadata_panchayath_idx on public.metadata (panchayath);

alter table public.metadata enable row level security;

-- Base policies (adjust for your needs)
create policy "allow insert for authenticated" on public.metadata
for insert to authenticated with check (true);

create policy "allow read for all authenticated" on public.metadata
for select to authenticated using (true);
```

### JSON Structure in `metadata.metadata`

- `name: string`
- `district: string`
- `block: string`
- `panchayath: string`
- `ward: string`
- `mediaType: 'image' | 'video' | 'story' | 'poem'`
- `imageUrl?: string`
- `thumbnailUrl?: string`
- `videoUrl?: string`
- `storyImages?: { page: number; url: string; filename: string }[]`
- `createdAt: ISO string`
- `ulb?: string`
- `ulbFolder?: string`
- `areaType: 'block' | 'ulb'`

## Authentication & Authorization

### Authentication

- Supabase session is fetched client-side via `supabase.auth.getUser()`
- Email is used to identify user and derive role/scope

### Authorization (Current Behavior)

- **Super Admin**: email equals `VITE_SUPERADMIN_EMAIL`
- **Non-admin users**: scope determined by CSVs and email naming
  - `block-username.csv` maps their username to district/block
  - For ULB, email local-part pattern (`<normalized-ulb>ulb`) maps to a ULB folder

### Recommendations

- Enforce authorization via Supabase RLS and custom claims where possible
- Optionally, introduce an `accounts` table to store roles and scopes instead of CSVs

## Storage (BunnyCDN)

### Upload Path Convention

`/{storageZone}/{district}/{blockOrUlb}/[panchayath?]/{filename}`

- District, block/ULB, and panchayath are sanitized to lowercase alphanumeric with dashes
- ULB folder convention: `{ulbname}ulb` (normalized)
- Pull Zone URL is used for public URLs

### Flows

- **Browser upload**: Direct HTTP PUT to `https://{VITE_BUNNY_HOSTNAME}/{storageZone}/...` with `AccessKey` header
- **Public URL**: `https://{VITE_BUNNY_PULL_ZONE}/{district}/{blockOrUlb}/[panchayath?]/{filename}`
- **List/Delete**: Performed via server endpoints (`/api/bunny/list`, `/api/bunny/delete`) to keep AccessKey server-side

### Security Considerations

- The current `uploadToBunny` exposes the AccessKey to the browser via Vite envs. Options to harden:
  - Proxy uploads through a serverless function (no key in client)
  - Issue short-lived signed URLs from a backend service
  - Restrict key by IP and origin if feasible; tighten CORS

## Data Flow Summary

1. User signs into CMS (Supabase)
2. CMS determines allowed region (district/block/ULB) from CSVs or email pattern
3. User uploads media → browser PUTs to Bunny → receives public URL
4. CMS inserts a row into `public.metadata` with contextual JSON
5. Super Admin dashboard reads `metadata` for KPIs, charts, and recent entries
6. Optional: Admin uses list/delete API to manage Bunny storage objects

## CSV Inputs (in `public/`)

- `block-username.csv`: columns include `District`, `Block Name`, `username`
- `panchayath.csv`: columns include `District`, `Block`, `Panchayaths`
- `ulb.csv`: columns include `District`, `ULB`, `ULB Type`

## Operations & Deployment

### Build/Run

- Install deps: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview: `npm run preview`

### Deployment Notes

- Ensure env vars are configured in both client and serverless runtime
- Netlify/Vercel: map `api/` directory to functions/handlers; ensure CORS headers remain
- Provide CSVs in `public/` at deploy time

### Monitoring & Maintenance

- Consider adding rate limiting and logging on serverless APIs
- Add Supabase RLS for stricter data access control
- Optionally implement a server-side upload path to avoid exposing Bunny AccessKey

## Appendix: Types (for reference)

```ts
type UploadParams = {
  file: File
  district: string
  blockOrUlb: string
  areaType: 'block' | 'ulb'
  panchayath?: string
}

type BunnyEntry = {
  guid?: string
  path: string
  objectName: string
  isDirectory: boolean
  size: number
  lastChanged?: string
}

type MetadataRow = {
  id: number
  created_at: string
  metadata: any
  district: string | null
  username: string | null
  block_ulb: string | null
  panchayath: string | null
}
```


