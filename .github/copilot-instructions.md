# AI Coding Agent Guide

## Documentation Output Policy

**IMPORTANT**: All generated documentation, reports, summaries, and final iteration files produced by LLM agents MUST be saved exclusively to the **`docs/`** directory at the project root. This includes but is not limited to:

- Implementation reports and summaries
- Technical documentation
- Architecture guides
- Fix/change reports
- Migration guides
- Any markdown files documenting completed work

Do NOT save documentation files to the project root. Always use `docs/` as the output location for all generated documentation.

---

## Project Snapshot

- Built with Astro 4 (`astro.config.mjs`) and npm (`package.json`); Vercel/Netlify deploys expect Node 18 (`netlify.toml`).
- Path alias `@` maps into `src/` (`tsconfig.json`); components live in `src/layouts/components`, partials in `src/layouts/partials`, shortcodes in `src/layouts/shortcodes`.
- Global site settings and branding come from `src/config/config.json`, while design tokens live in `src/config/theme.json` and drive Tailwind config.
- Tailwind is extended via SCSS layers in `src/styles/main.scss`; keep utility classes aligned with the custom `.row`/`.col-*` grid supplied by `tailwind-bootstrap-grid` (`tailwind.config.js`).
- Auto-imported shortcodes defined in `src/layouts/shortcodes` are available in MDX without manual imports because of `astro-auto-import` integration (`astro.config.mjs`).

## Content & Data Flow

- Content collections are declared in `src/content/config.ts` for `blog` and `pages`; frontmatter must match those schemas.
- Listing metadata lives in `-index.(md|mdx)` files (for example `src/content/blog/-index.md`), while individual entries sit beside them.
- `getSinglePage` in `src/lib/contentParser.astro` filters out draft entries and files starting with `-`; use that helper whenever you need published collection data.
- Pagination, featured filtering, and excerpts rely on `config.settings` keys (see `src/pages/blog/index.astro` and `src/layouts/components/Blogs.astro`). Update `config.settings.pagination` and `summary_length` before changing those behaviors.
- Taxonomy pages derive categories through `getTaxonomy` in `src/lib/taxonomyParser.astro`; be sure new posts populate `categories` arrays to stay discoverable.

## Layout & Styling Patterns

- `src/layouts/Base.astro` wraps every page with meta tags, theme fonts via `astro-font`, view transitions, header/footer, and includes the viewport-sized Tailwind indicator (`TwSizeIndicator.astro`) during development.
- Default rich-text rendering pipes through `src/layouts/Default.astro`, which calls the MDX/Markdown renderer returned by `entry.render()`.
- Shared hero structures use `PageHeader.astro` and `Shape.astro`; page-specific data is typically merged into a `page_data` object before passing along.
- Components like `Blogs.astro` and `BlogCategories.astro` expect Astro `CollectionEntry` objects; keep the `data` shape consistent (title, date, image, categories, featured).

## Interactive Islands

- React islands live under `src/chat` and `src/pages/components`; hydrate them with the appropriate client directive (`client:load` on `ChatUI` in `src/pages/contact.astro`).
- `ChatUI.jsx` uses the browser OpenAI SDK with `dangerouslyAllowBrowser`; set `TOGETHER_API_KEY` in a `.env` (and configure exposure rules if refactoring to server-only use).
- Cookie consent is delivered both via the `@jop-software/astro-cookieconsent` integration and an optional React fallback (`src/pages/components/CookieConsent.jsx`). Avoid double-mounting in pages.
- When importing React or MDX helpers inside `.astro` files, keep them tree-shakeable by deferring heavy data work to `getStaticPaths`/`getEntry` blocks.

## Workflows & Utilities

- Primary commands: `npm install`, `npm run dev`, `npm run build`, and `npm run format`. Run `npm run json` only if `src/content/posts` exists—the script converts Markdown posts into `.json` for legacy consumers.
- Use `astro sync` (implicit in Astro 4 toolchain) after adding new content collection fields to refresh generated types in `src/.astro/`.
- Netlify builds run `astro build`; confirm any new environment variables are whitelisted in Netlify’s UI as Astro does not expose them by default.
- Keep navigation and footer links in sync through `src/config/menu.json` and `src/config/social.json`; `Header.astro` relies on `menu.json` structure (including `hasChildren` arrays).
- Large images should land in `public/images/...` so that `astro:assets` imports in components like `Services.astro` can reference optimized copies.
