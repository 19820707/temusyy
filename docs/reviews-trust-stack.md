# Reviews and trust stack (professional baseline)

## A. Real reviews on product cards (required for conversion)

The theme renders **star ratings on collection/search grids** when:

1. **Theme setting** `product_ratings_star_display` is on (see `config/settings_data.json` → `current`).
2. The product has Shopify’s standard review metafields populated: `product.metafields.reviews.rating` and `product.metafields.reviews.rating_count`.

**Judge.me** and **Loox** both integrate with Shopify and typically fill these metafields after their widgets sync. Install **one** app, complete onboarding, and import or collect reviews so metafields are non-empty.

This repo already references a **Loox** app embed in `config/settings_data.json` (your live export). After a fresh install, re-save the theme or re-add the app embed if stars do not appear.

## B. Trust bar (homepage)

`templates/index.json` → `homepage_trust_bar` ships:

- **+12,000 orders delivered** — body line *Trusted by customers worldwide.*
- **Fast shipping** → `/policies/shipping-policy`
- **Easy returns** → `/policies/refund-policy`
- **Customer support** → `shopify://pages/support`

Create a **page with handle `support`** in Shopify Admin (or change the link in the theme editor to your existing support page, e.g. `temusy-customer-support`).

## C. “No product without trust signals” (what the theme can enforce)

- **Homepage:** the trust bar follows **bestsellers → category thumbnails** so shoppers see policy proof after intent + discovery, then a final **featured** SKU row. Order is locked in `tests/templates-index-smart-homepage-contract.test.cjs`.
- **Every product card:** keep a reviews app + metafields so **stars** can render; use **merchandising tags** (see `snippets/product-merchandising-labels.liquid`) for extra trust where needed.

Pure Liquid **cannot** guarantee every SKU has reviews without an app and merchant data — the stack above is the enforceable baseline.

## Smart hub collections (`templates/index.json`)

The homepage hub expects **smart collections** (or manual collections) with handles:

- `under-50` — e.g. automated collection with a maximum price of 50 (store currency).
- `new-arrivals` — e.g. products tagged `new` or sorted by created date.

Create them in **Products → Collections** if links would otherwise 404.
