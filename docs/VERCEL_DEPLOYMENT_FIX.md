# Vercel Deployment Fix - October 31, 2025

## Issue

Deployment to Vercel failed with configuration error:

```
[config] Astro found issue(s) with your configuration:
output: Did not match union.
> Expected "static" | "server", received "hybrid"
```

## Root Cause

The project was configured with:
- `@astrojs/netlify` adapter (wrong platform)
- `output: "hybrid"` mode (not compatible with the Netlify adapter on Vercel)

## Solution

### 1. Installed Vercel Adapter

```bash
npm install @astrojs/vercel
```

### 2. Updated `astro.config.mjs`

**Changed from:**
```javascript
import netlify from "@astrojs/netlify";

export default defineConfig({
  output: "hybrid",
  adapter: netlify(),
  // ...
});
```

**Changed to:**
```javascript
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  // ...
});
```

### 3. Why "server" Mode?

With Vercel's adapter:
- `output: "server"` enables SSR (Server-Side Rendering)
- Vercel automatically optimizes and caches static pages
- API routes (`/api/chat`) work seamlessly
- No need for "hybrid" mode - Vercel handles it intelligently

## Environment Variables for Vercel

**CRITICAL**: Set the following environment variable in your Vercel dashboard:

### In Vercel Dashboard

1. Go to your project settings
2. Navigate to: Settings → Environment Variables
3. Add:

```
Name: TOGETHER_API_KEY
Value: [Your Together AI API Key]
Environments: Production, Preview, Development
```

**API Key:**
```
TOGETHER_API_KEY=9f357f1eae2e5cb536e23aa1c6cd484fa54797b73e862768cb833393a2c41c58
```

## Deployment Flow

1. Push changes to GitHub:
```bash
git add .
git commit -m "fix: switch to Vercel adapter for proper deployment"
git push origin main
```

2. Vercel will auto-deploy from GitHub
3. Ensure environment variables are set
4. Test the deployment

## Key Differences: Netlify vs Vercel

### Netlify
- Uses Netlify Functions for API routes
- Supports `hybrid` mode explicitly
- Requires `@astrojs/netlify` adapter

### Vercel
- Uses Vercel Serverless Functions
- Prefers `server` mode with automatic optimization
- Requires `@astrojs/vercel/serverless` adapter

## Files Modified

1. `astro.config.mjs` - Switched adapter and output mode
2. `package.json` - Added `@astrojs/vercel` dependency

## Testing Checklist

After deployment:

- [ ] Site builds successfully on Vercel
- [ ] Homepage loads with all images
- [ ] Banner images display correctly
- [ ] Service section images visible
- [ ] Chat on Contact page initializes
- [ ] Chat API responses work properly
- [ ] No build errors in Vercel logs

## Vercel-Specific Features

With the Vercel adapter, you get:
- Automatic Edge Network optimization
- Built-in Image Optimization
- Serverless Functions for API routes
- Zero-config deployments from Git
- Preview deployments for PRs

## Related Documentation

- [Astro Vercel Adapter](https://docs.astro.build/en/guides/integrations-guide/vercel/)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
