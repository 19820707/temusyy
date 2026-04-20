# Anti-decision UX — Shopify theme (Temusy)

Use this doc with Cursor when you want the storefront to stay **active and conversion-oriented**: fewer forks, less copy, more **visual products** and **quick paths**.

---

## 1) JSON completo para Shopify

**Source of truth:** `templates/index.json` (leading block comment maps *concept →* `homepage_*` id).

**Canonical nine-step `order`:**

1. `homepage_hero`
2. `homepage_deal_zone` — *deal_zone* (`dynamic-temusy-deal-zone`: countdown + SKUs)
3. `homepage_best_sellers_products` — *trending_products* (first big SKU grid)
4. `homepage_smart_hub` — *decision_shortcuts* (search + path chips + **decision CTAs**)
5. `homepage_trust_bar`
6. `homepage_trending_categories` — *category_grid* (**3** image tiles + short title **Quick paths**)
7. `homepage_featured_products`
8. `homepage_recently_viewed`
9. `homepage_testimonials`

**Re-add via Theme Editor (optional):** compact buy-zone strip (`dynamic-featured-product-inline`), legacy countdown (`dynamic-countdown-timer`), adaptive cookie strip, extra recommended collection row.

---

## Sistema psicológico (pressão + orientação + recompensa)

O storefront Temusy não é só “UI bonita”: é um **sistema psicológico** em três camadas — **pressão suave**, **orientação**, **recompensa** — mapeado a snippets/secções concretos e a regras de honestidade.

**Documento canónico:** [`docs/temusy-psychological-commerce-system.md`](./temusy-psychological-commerce-system.md)

**CI:** run `npm test` before push; homepage contracts live in `tests/templates-index-smart-homepage-contract.test.cjs`.

---

## 2) Prompts prontos para o Cursor (copiar / colar)

### A — Manter stack a 9 secções

> In `templates/index.json`, keep `order` exactly nine ids as in `CANONICAL_HOMEPAGE_ORDER` in `tests/templates-index-smart-homepage-contract.test.cjs`. Do not add orphan keys under `sections`. After edits, run `npm test` and fix any contract failures.

### B — Anti-decision na grelha de categorias

> Treat `homepage_trending_categories` as **visual quick paths only**: at most **3** `collection` blocks, short emoji+label titles, section title like “Quick paths”, no long instructional copy. Prefer `thumbnail_columns_desktop: 3` when there are three tiles. Update `tests/templates-index-smart-homepage-contract.test.cjs` if block counts or titles change.

### C — Hub sem “tutorial wall”

> For `homepage_smart_hub` (`dynamic-smart-homepage-hub`), keep **richtext body empty**, title aligned to automatic shop flow (e.g. contains “shop flow”), short search placeholder, path_chips layout. Do not reintroduce long explanatory paragraphs above the fold.

### D — Confiança sem parágrafos longos

> For `homepage_trust_bar` highlights, keep **policy-honest** blurbs but **one short line** per tile where tests still require keywords like “policy”, “checkout” or “encryption”. Run `npm test` after copy edits.

---

## 3) Sistema de badges (urgência, popular, trending, …)

Badges are **split by design** so chips are not duplicated on cards:

| Sinal | Onde está | Como alimentar |
|--------|-----------|----------------|
| **Only N left**, **Selling fast**, **In N carts** | `snippets/product-urgency-badges.liquid` | Low stock (Shopify inventory ≤ theme `low_stock_threshold`); tags `selling-fast` / `temusy-selling-fast` or metafield `custom.selling_fast`; metafield `custom.active_carts` (integer, from app/Flow — never fake in Liquid). |
| **Popular**, **Trending**, **Best seller**, **Limited stock** (merch chip) | `snippets/product-merchandising-labels.liquid` | Tags: `popular`, `trending` / `tendencia` / `destaque` / `temusy-interesse`, bestseller tags, inventory when `tags_only` is false. |

**Theme toggle:** `settings.temusy_product_urgency_badges` (see `config/settings_schema.json`).

**Prompt para alinhar merchandising:**

> Ensure `snippets/product-grid-item.liquid` continues to `render` both `product-urgency-badges` and `product-merchandising-labels` in the agreed order for grid cards. When adding a new badge type, choose **either** urgency row **or** merch labels to avoid duplicate “selling fast” messaging; document new tags/metafields in the snippet header comment.

---

## Verdade operacional

- **Passivo:** long copy, many category branches, weak first SKU surface.  
- **Ativo:** hero → **product grid** → **hub** → trust → **3** visual paths → featured → recent → proof.

---

## Smart entry popup (obrigatório na primeira vista da sessão)

- **Snippet:** `snippets/temusy-smart-entry-popup.liquid` — render em `layout/theme.liquid` após o skip link.
- **Theme settings:** `temusy_smart_entry_popup_enable`, `temusy_smart_entry_discount_url` (Products group in `settings_schema.json`).
- **Copy:** `locales/en.default.json` / `pt-BR.json` → `general.temusy_smart_entry.*`.
- **Comportamento:** `sessionStorage` chave `temusy_smart_entry_session` — uma vez por sessão de browser após fechar ou clicar “Apply discount”. Não corre em `password`.
