# Production Deployment Fix - October 31, 2025

## Issues Identified

### 1. Chat API Error

**Error**: "An error occurred: The string did not match the expected pattern."

**Root Cause**: The Astro configuration was set to `output: "static"` mode, which doesn't properly support server-rendered API endpoints in production on Netlify, even with `prerender: false` on individual endpoints.

**Solution**: Changed `astro.config.mjs` to use `output: "hybrid"` mode, which enables:

- Static rendering for most pages (default)
- Server-side rendering for API endpoints marked with `prerender: false`
- Proper support for Netlify Functions

### 2. Images Not Visible

**Root Cause**: The Banner component was using Astro's `Image` component from `astro:assets` with string paths from the public folder. In production builds, this can cause issues with image optimization and path resolution.

**Solution**: Updated `Banner.astro` to:

- Use regular `<img>` tags for public folder images (paths starting with `/`)
- Keep `Image` component only for imported assets
- This ensures reliable image delivery in production without build-time optimization issues

## Files Modified

### 1. `astro.config.mjs`

```javascript
// Changed from:
output: "static";

// To:
output: "hybrid";
```

### 2. `src/layouts/components/Banner.astro`

- Added conditional rendering for images
- Public folder images use `<img>` tags
- Imported assets use `Image` component
- Fixed banner shape to use regular `<img>` tag

## Environment Variables Required in Netlify

**CRITICAL**: Ensure the following environment variable is set in your Netlify dashboard:

### Setting up in Netlify

1. Go to your Netlify dashboard
2. Navigate to: Site settings → Environment variables
3. Add the following variable:

```bash
Key: TOGETHER_API_KEY
Value: [Your Together AI API Key]
Scopes: All scopes (Production, Deploy Previews, Branch deploys)
```

### Current API Key Location

The API key is currently in `.env.local` file (not committed to git):

```bash
TOGETHER_API_KEY=9f357f1eae2e5cb536e23aa1c6cd484fa54797b73e862768cb833393a2c41c58
```

**⚠️ IMPORTANT**:

- DO NOT commit the `.env.local` file to git
- Always set environment variables directly in Netlify dashboard
- The API endpoint (`/src/pages/api/chat.js`) will automatically pick up the environment variable from Netlify's build environment

## Testing Checklist

After deploying these changes:

- [ ] Homepage banner image loads correctly
- [ ] All images in the Services section display properly
- [ ] Testimonial avatars are visible
- [ ] Chat widget on Contact page initializes without errors
- [ ] Chat messages send and receive successfully
- [ ] No console errors related to API key or image paths

## Deployment Steps

1. Commit the changes:

   ```bash
   git add .
   git commit -m "fix: update to hybrid mode and fix image handling for production"
   ```

2. Push to GitHub:

   ```bash
   git push origin main
   ```

3. Verify Netlify environment variables are set (see above)

4. Wait for Netlify auto-deployment to complete

5. Test the production site thoroughly

## Technical Details

### Why Hybrid Mode?

- `static`: All pages are pre-rendered at build time
- `server`: All pages are server-rendered on demand
- `hybrid`: Pages are static by default, but can opt-in to server rendering with `prerender: false`

The `/api/chat` endpoint requires server-side execution to:

- Securely access the API key (never exposed to browser)
- Make real-time API calls to Together AI
- Handle dynamic request/response cycles

### Image Handling Strategy

- **Public folder images** (`/images/*`): Use `<img>` tags for guaranteed path resolution
- **Imported assets**: Use Astro's `Image` component for optimization
- This hybrid approach ensures compatibility across development and production environments

## Related Documentation

- [Astro Output Modes](https://docs.astro.build/en/guides/server-side-rendering/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Astro Image Service](https://docs.astro.build/en/guides/images/)
