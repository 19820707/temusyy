# Homepage template dependencies

## `dynamic-smart-homepage-hub`

- **Template:** `templates/index.json` includes section `homepage_smart_hub` with type `dynamic-smart-homepage-hub`.
- **Required file:** `sections/dynamic-smart-homepage-hub.liquid` must exist in the published theme. If it is missing, Shopify will not render this section correctly and the homepage loses the search hub, shortcuts, and path cards.
- **CI:** `npm run test` runs `tests/templates-index-section-files-exist.test.cjs`, which fails if any section type referenced by `templates/index.json` has no matching `sections/<type>.liquid` file.

## Manual fallback (if the smart hub is removed)

Shopify JSON templates cannot swap sections at runtime when a file is missing. If you must ship a build **without** this custom section:

1. In the theme code, keep `sections/dynamic-smart-homepage-hub.liquid`, **or**
2. In **Online Store → Themes → Customize**, remove `Smart homepage hub` from the homepage and add in order:
   - A **search** affordance: header search (theme setting) or a section that exposes `routes.search_url`.
   - **Collection list** (e.g. `dynamic-collection-list`) for department navigation.
   - A **button / rich text** block linking to your support page and to **All products** (`/collections/all`).

Then update `templates/index.json` in the repo so it matches what you published, and run `npm run test` before pushing.

## Semantic homepage section IDs (`templates/index.json`)

Stable keys for future automation (bestsellers, trending, inventory). Section **`type`** stays the Shopify section handle; only the JSON **instance id** is semantic.

| Instance id | Role |
|-------------|------|
| `homepage_hero` | Hero slideshow |
| `homepage_smart_hub` | Search, shortcuts, paths |
| `homepage_department_grid` | Department navigation |
| `homepage_trending_categories` | “Popular categories now” row: collection list after hub (not product-level best sellers unless you change section type) |
| `homepage_trust_bar` | Trust + navigation strip (shipping page link, support, offers) before deep editorials |
| `homepage_editorial_*` | Category showcases (banner + grid pairs) |
| `homepage_testimonials` | Social proof |
