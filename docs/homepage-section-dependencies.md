# Homepage template dependencies

## `dynamic-smart-homepage-hub`

- **Template:** `templates/index.json` includes section `homepage_smart_hub` with type `dynamic-smart-homepage-hub`.
- **Required file:** `sections/dynamic-smart-homepage-hub.liquid` must exist in the published theme. If it is missing, Shopify will not render this section correctly and the homepage loses the search hub, lanes panel, and path cards.
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

Stable keys for automation and contracts. Section **`type`** is the Shopify section handle; JSON **instance id** is semantic.

| Instance id | Role |
|-------------|------|
| `homepage_hero` | Single-slide hero (compact height, one CTA) |
| `homepage_deal_countdown` | `dynamic-countdown-timer`: time-bound offer strip (“Ends in…”) — update end date/time in Theme Editor for real promos |
| `homepage_smart_hub` | Search + intent lanes (collection links + support) |
| `homepage_best_sellers_products` | Primary SKU grid (`best-sellers`) — stacked right after the hub for one-screen commerce |
| `homepage_trust_bar` | Highlights strip (proof + policies + support) — immediately after bestsellers |
| `homepage_adaptive_priority` | Cookie-driven “pick up where you left off” strip (often empty until a hub/category click sets interest) |
| `homepage_trending_categories` | One `dynamic-collection-list` for category thumbnails (no second department grid) |
| `homepage_featured_products` | Second SKU grid (curated collection; keep distinct from bestsellers) |
| `homepage_testimonials` | Social proof |

Canonical **order** is asserted in `tests/templates-index-smart-homepage-contract.test.cjs`.

## Performance (homepage)

- **Hero:** `dynamic-slideshow` uses a **single slide** in `templates/index.json`, **no autoplay**, **small** height, and (for `small` / `medium` heights) **smaller `rimg` caps** (`1280x` / `640x`) to cut bytes. Multi-slide heroes opt into **lazy** slides. See `tests/slideshow-hero-performance-contract.test.cjs`.
- **Grids:** featured collection rows use **`layout` + `mobile_layout` = `grid`** in the homepage JSON so mobile does not switch to a heavy carousel for those sections.
