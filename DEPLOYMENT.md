# Deployment Guide

## Cloudflare Pages Deployment

### Prerequisites

1. GitHub repository with the code
2. Cloudflare account
3. Custom domain (moltbunker.com)

### Steps

1. **Connect Repository**
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Connect your GitHub repository

2. **Build Settings**
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

3. **Environment Variables** (if needed)
   - Add any required environment variables in Cloudflare Pages settings

4. **Custom Domain**
   - Add custom domain: `moltbunker.com`
   - Cloudflare will automatically configure SSL

5. **Deploy**
   - Click "Save and Deploy"
   - Your site will be live at moltbunker.com

### Important Files

- `cloudflare/_redirects` - Handles SPA routing (automatically copied to dist)
- `dist/` - Build output directory
- `docs/` - Documentation markdown files (copied to dist/docs)
- `whitepaper/` - Whitepaper markdown (copied to dist/whitepaper)

### Post-Deployment

1. Update BUNKER token contract address in:
   - `src/components/sections/Tokenomics.tsx`
   - `docs/tokenomics.md`
   - `whitepaper/moltbunker-whitepaper.md`

2. Replace logo placeholder:
   - Update `public/logo.svg` with your actual logo

3. Update GitHub links:
   - Update GitHub URLs in Header and Footer components

4. Test all routes:
   - Homepage (/)
   - Documentation (/docs)
   - Whitepaper (/whitepaper)
   - 404 page

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## Build Locally

```bash
npm run build
npm run preview
```

## Notes

- The site uses Tailwind CSS v4 with PostCSS
- All markdown files are copied to dist during build
- SPA routing is handled by Cloudflare Pages redirects
- Documentation is served as static markdown files
