# Homepage template dependencies

`templates/index.json` opens with a **block comment** mapping system concepts to instance ids (same order as `order[]`).

## Canonical eight-step stack (concept → instance id)

| Concept | Instance id | Section type |
|--------|----------------|---------------|
| hero | `homepage_hero` | `dynamic-slideshow` |
| trending_products | `homepage_best_sellers_products` | `dynamic-featured-collection` |
| decision_shortcuts | `homepage_smart_hub` | `dynamic-smart-homepage-hub` |
| trust_bar | `homepage_trust_bar` | `dynamic-highlights-banner` |
| category_grid | `homepage_trending_categories` | `dynamic-collection-list` |
| featured_products | `homepage_featured_products` | `dynamic-featured-collection` |
| recently_viewed | `homepage_recently_viewed` | `static-recently-viewed` |
| testimonials | `homepage_testimonials` | `dynamic-testimonials` |

Optional sections **not** in the default homepage JSON (re-add via Theme Editor when needed): compact trending strip (`dynamic-featured-product-inline`), countdown (`dynamic-countdown-timer`), adaptive cookie strip (`dynamic-adaptive-homepage-priority`), extra recommended row (`dynamic-featured-collection`).

## `dynamic-smart-homepage-hub`

- **Template:** `templates/index.json` includes section `homepage_smart_hub` with type `dynamic-smart-homepage-hub`.
- **Required file:** `sections/dynamic-smart-homepage-hub.liquid` must exist in the published theme. If it is missing, Shopify will not render this section correctly and the homepage loses the search hub, lanes panel, and path cards.
- **CI:** `npm run test` runs `tests/templates-index-section-files-exist.test.cjs`, which fails if any section `type` referenced by `templates/index.json` has no matching `sections/<type>.liquid` file.

## Manual fallback (if the smart hub is removed)

Shopify JSON templates cannot swap sections at runtime when a file is missing. If you must ship a build **without** this custom section:

1. In the theme code, keep `sections/dynamic-smart-homepage-hub.liquid`, **or**
2. In **Online Store → Themes → Customize**, remove `Smart homepage hub` from the homepage and add in order:
   - A **search** affordance: header search (theme setting) or a section that exposes `routes.search_url`.
   - **Collection list** (e.g. `dynamic-collection-list`) for department navigation.
   - A **button / rich text** block linking to your support page and to **All products** (`/collections/all`).

Then update `templates/index.json` in the repo so it matches what you published, and run `npm run test` before pushing.

Canonical **order** and merchandising rules are asserted in `tests/templates-index-smart-homepage-contract.test.cjs`.

## Performance (homepage)

- **Hero:** `dynamic-slideshow` uses a **single slide** in `templates/index.json`, **no autoplay**, **small** height, and (for `small` / `medium` heights) **smaller `rimg` caps** (`1280x` / `640x`) to cut bytes. Multi-slide heroes opt into **lazy** slides. See `tests/slideshow-hero-performance-contract.test.cjs`.
- **Grids:** featured collection rows use **`layout` + `mobile_layout` = `grid`** in the homepage JSON so mobile does not switch to a heavy carousel for those sections.
