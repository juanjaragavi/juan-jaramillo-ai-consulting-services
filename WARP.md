# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Documentation Output Policy

**CRITICAL DIRECTIVE**: All generated documentation, reports, summaries, guides, and final iteration files produced by AI agents or LLM tools MUST be saved exclusively to the **`docs/`** directory located at the project root.

### Mandatory Output Location

- **Target Directory**: `docs/` (relative to project root)
- **Applies To**: All markdown files (`.md`), reports, implementation summaries, technical guides, architecture documentation, migration reports, fix summaries, and any other documentation artifacts
- **Enforcement**: This directive overrides any default or inferred output locations

**Examples of files that MUST go in `docs/`:**

- `FIX_SUMMARY_REPORT.md`
- `VIEW_TRANSITIONS_GUIDE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `ARCHITECTURE_DECISIONS.md`
- Any other generated `.md` documentation

**Do NOT save documentation to:**

- Project root directory (except this WARP.md and README.md)
- Source directories (`src/`)
- Any other location outside `docs/`

---

## Project Overview

This is an Astro-based website for Juan Jaramillo AI Consulting Services, featuring an AI-powered chatbot, content management, and marketing pages. The site showcases AI consulting services across multiple industries (fintech, e-commerce, healthcare, manufacturing, etc.).

## Development Commands

### Core Commands

- **Start dev server**: `npm run dev` or `yarn dev` (runs Astro dev server)
- **Build for production**: `npm run build` or `yarn build`
- **Generate JSON from markdown**: `npm run json` (creates JSON files from markdown content in `src/content/posts`)
- **Format code**: `npm run format` (Prettier formatting for all files)

### Package Manager

This project uses **Yarn 1.22.19** as specified in `package.json`. Prefer `yarn` commands over `npm`.

## Architecture

### Tech Stack

- **Framework**: Astro 4.15.8 (SSG/SSR hybrid)
- **Styling**: TailwindCSS 3.4.13 with custom configuration
- **UI Components**: React 18.3.1 (for interactive components)
- **AI Integration**: OpenAI GPT-4o-mini for chatbot
- **Content**: MDX for content files with frontmatter

### Directory Structure

```bash
src/
├── chat/              # AI chatbot component (ChatUI.jsx)
├── config/            # Site configuration (config.json, theme.json)
├── content/           # Content collections (blog, pages, industries, etc.)
│   ├── blog/          # Blog posts (MDX)
│   ├── pages/         # Static pages content
│   ├── homepage/      # Homepage content
│   ├── about/         # About section content
│   ├── features/      # Features content
│   ├── integrations/  # Integration pages
│   └── ...            # Other content sections
├── layouts/           # Astro layouts and reusable components
│   ├── components/    # Reusable UI components
│   ├── shortcodes/    # MDX shortcodes (Button, Accordion, Video, etc.)
│   ├── partials/      # Partial components (Header, Footer, etc.)
│   └── function-components/  # Functional helper components
├── lib/               # Utility libraries
│   └── utils/         # Helper functions (dateFormat, readingTime, taxonomyFilter, etc.)
├── pages/             # Astro pages (file-based routing)
│   ├── blog/          # Blog listing and individual posts
│   ├── industries/    # Industry-specific pages
│   ├── integrations/  # Integration showcase pages
│   └── *.astro        # Other pages (index, about, contact, services, etc.)
├── styles/            # Global styles and CSS
└── types/             # TypeScript type definitions
```

### Key Patterns

#### Content Collections

Content is managed via Astro's content collections system (defined in `src/content/config.ts`):

- **Blog collection**: Posts with title, date, author, categories, featured flag
- **Pages collection**: Static pages with layout, meta_title, description

#### Path Aliases

The project uses TypeScript path aliases (defined in `tsconfig.json`):

- `@/components/*` → `./src/layouts/components/*`
- `@/shortcodes/*` → `./src/layouts/shortcodes/*`
- `@/helpers/*` → `./src/layouts/helpers/*`
- `@/partials/*` → `./src/layouts/partials/*`
- `@/*` → `./src/*`

#### Auto-Import System

MDX shortcodes are auto-imported via `astro-auto-import`:

- Button, Accordion, Notice, Video, Youtube, Blockquote, Badge, ContentBlock, Changelog, Tab, Tabs

#### AI Chatbot Architecture

- **Component**: `src/chat/ChatUI.jsx` (React component)
- **Model**: OpenAI GPT-4o-mini-2024-07-18
- **API Key**: Uses `PUBLIC_TOGETHER_API_KEY` from environment variables
- **System Prompt**: Embedded in ChatUI.jsx with comprehensive company information
- **Integration**: Client-side OpenAI SDK with `dangerouslyAllowBrowser: true`

#### Configuration

- **Site config**: `src/config/config.json` (base URL, logo, meta, Disqus, etc.)
- **Theme config**: `src/config/theme.json` (colors, fonts, spacing)
- **Tailwind config**: `tailwind.config.js` (dynamically reads from theme.json)
- **Astro config**: `astro.config.mjs` (integrations, markdown plugins, site settings)

## Environment Variables

Required environment variables (create `.env` file in root):

```env
PUBLIC_TOGETHER_API_KEY=your_TOGETHER_API_KEY_here
```

## Content Management

### Creating Blog Posts

1. Add new `.md` or `.mdx` file to `src/content/blog/`
2. Include frontmatter with required fields:

   ```yaml
   ---
   title: "Post Title"
   date: 2024-01-01
   author: "Author Name"
   categories: ["category1", "category2"]
   image: "/images/post-image.jpg"
   draft: false
   featured: false
   ---
   ```

3. Use shortcodes for rich content (Button, Video, Accordion, etc.)

### Modifying Site Configuration

- **General settings**: Edit `src/config/config.json`
- **Styling/theming**: Edit `src/config/theme.json` (changes propagate to Tailwind)
- **Navigation/Footer**: Typically in layout components or config

## Styling Approach

- **Utility-first**: TailwindCSS classes throughout
- **Theme system**: Colors and fonts defined in `theme.json`, mapped to Tailwind
- **Typography plugin**: `@tailwindcss/typography` for rich text
- **Forms plugin**: `@tailwindcss/forms` for form styling
- **Bootstrap grid**: Optional grid system via `tailwind-bootstrap-grid`

## Build & Deployment

- **Build output**: `dist/` directory (ignored in git)
- **Deployment**: Configured for Netlify (see `netlify.toml`)
- **SSR compatibility**: OpenAI SDK requires `ssr.noExternal: ["openai"]` in Astro config

## Markdown Plugins

- **remark-toc**: Table of contents generation
- **remark-collapse**: Collapsible sections
- **Syntax highlighting**: Shiki with "one-dark-pro" theme

## Important Notes

- **Cookie consent**: Uses `@jop-software/astro-cookieconsent` with custom modal configuration
- **Disqus**: Enabled for blog comments (shortname: "juan-jaramillo-ai-consulting-services")
- **RSS/Sitemap**: Generated via Astro integrations
- **Image optimization**: Uses Sharp 0.33.1 for image processing
- **React components**: Must use `.jsx` extension, not `.astro`, for React-specific features

## Troubleshooting

- **OpenAI errors**: Verify `PUBLIC_TOGETHER_API_KEY` is set in environment
- **Build failures**: Check for missing frontmatter in content files
- **Style inconsistencies**: Ensure `theme.json` values align with Tailwind config
- **TypeScript errors**: Verify path aliases match `tsconfig.json` configuration
