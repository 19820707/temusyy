# Temusy — Sistema psicológico de comércio (não é só UI)

Este ficheiro define o **modelo mental** por detrás das camadas Temusy: **pressão suave**, **orientação** e **recompensa**. O código do tema materializa estes três eixos com **copy honesta** e **sinais verificáveis** (inventário, políticas, descontos reais) — não confundir com dark patterns.

---

## Os três eixos

| Eixo | O que o cérebro precisa | Como o tema ajuda (sem mentir) |
|------|-------------------------|--------------------------------|
| **Pressão suave** | “Há movimento / escassez / tempo” sem pânico | Urgência real (`product-urgency-badges`), faixa de oferta com contador quando há fim definido (`dynamic-temusy-deal-zone`), micro-reward no topo (`static-announcement` + presets), smart entry com oferta de sessão (`temusy-smart-entry-popup`). |
| **Orientação** | “Para onde vou?” com poucas escolhas boas | Homepage: hero → **deal zone** → grelha de SKUs → **hub** com CTAs de decisão (Best sellers / Under $50 / Trending) → trust → **3** quick paths → featured → recentes → prova social. Hub e chips reduzem forks. |
| **Recompensa** | “O que ganho se avançar?” | Entrada: desconto + envio (copy alinhada a links reais). Bundle tiers no PDP (`temusy-bundle-tiers`) + descontos automáticos na Shopify. Trust bar liga a políticas reais. |

**Regra de ouro:** cada promessa visível (%, envio, stock, “em X carrinhos”) deve ter **espelho operacional** (taxas, inventário, metafield de app, ou desconto automático). O Liquid não inventa números.

---

## Mapa rápido ficheiro → eixo

- **Pressão suave:** `snippets/product-urgency-badges.liquid`, `sections/dynamic-temusy-deal-zone.liquid`, `sections/static-announcement.liquid`, `snippets/temusy-smart-entry-popup.liquid`, `settings.temusy_product_urgency_badges`
- **Orientação:** `templates/index.json` (`order[]`), `sections/dynamic-smart-homepage-hub.liquid`, `sections/dynamic-collection-list.liquid` (quick paths), `snippets/temusy-interest-bridge.liquid` + intent zone attributes
- **Recompensa:** `snippets/temusy-bundle-tiers.liquid` + descontos Shopify, `snippets/temusy-smart-entry-popup.liquid` + `temusy_smart_entry_discount_url`, `sections/dynamic-highlights-banner.liquid` (trust), `snippets/temusy-location-context-popup.liquid` (contexto = menos fricção)

---

## Para prompts no Cursor

> Ao acrescentar “urgência” ou “oferta”, escolhe **um** eixo principal por zona de ecrã e mantém **verificabilidade** (tests + políticas). Para “orientação”, prefere **menos rotulos** e links para coleções reais. Para “recompensa”, documenta a dependência de **Automatic discount / Function / app** quando o checkout tiver de refletir o preço.

---

## Leitura relacionada

- `docs/cursor-prompts-anti-decision-ux.md` — stack homepage, anti-decision, smart entry
- `docs/homepage-section-dependencies.md` — ids de secções e dependências de ficheiros
- `docs/shopify-flow-fase-8.md` — tags / Flow para merchandising
