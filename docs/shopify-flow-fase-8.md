# Fase 8 — Automação (Shopify Flow + tema Temusy)

Este ficheiro descreve **o que podes automatizar no Admin** com [Shopify Flow](https://help.shopify.com/manual/shopify-flow) e **como o tema reage**, sem apps obrigatórias e sem JavaScript extra nas grelhas de produto.

## O que o tema faz (hoje)

O snippet `snippets/product-merchandising-labels.liquid` mostra **várias faixas** nos cartões (tags por **nome exato** quando há risco de substring, ex.: `popular` vs “unpopular”):

| Faixa no cartão | Tags / sinal | Texto (ex. PT-BR) |
|-----------------|--------------|-------------------|
| Popular | `popular` | Popular |
| 🔥 Trending | `trending`, `tendencia`, `destaque`, `temusy-interesse`, `flow-interesse` | Em alta |
| ⭐ Best seller | `bestseller`, `mais-vendido`, `mais vendido`, `temusy-vendas`, `flow-vendas` | Mais vendido |
| ⚡ Selling fast | `selling-fast`, `selling fast`, `temusy-selling-fast`, ou metafield boolean `custom.selling_fast` | A vender rápido (no snippet `product-urgency-badges.liquid`, não duplicado nos merch labels) |
| ⚡ Limited stock | stock Shopify ≤ limiar (só quando `tags_only` é falso no snippet) | Stock limitado |

**Importante:** o Flow **não vê cliques** na loja nem taxa de conversão por produto. Para “mais cliques → destacar”, tens de **atribuir a tag tu** (revisão semanal com base em Analytics, relatório de pesquisa, app de merchandising, ou export). O tema só **mostra** a etiqueta quando a tag existe.

## O que o Flow faz bem

- **Etiquetas em produtos** quando há encomendas, stock, publicação, etc.
- **Organização**: adicionar produtos a coleções, arquivar rascunhos, notificações internas.
- **Triggers** úteis para “subir prioridade” ligada a **vendas reais**:
  - Ex.: encomenda paga → para cada linha → **Add product tags** → `temusy-vendas`.

## Receitas sugeridas (Admin → Apps → Shopify Flow)

### 1) Impulso por venda (simples)

1. **Trigger:** Order paid (ou Order created, conforme a tua política).
2. **Action:** For each line item → **Add product tags** → `temusy-vendas`.

**Nota:** este fluxo repõe a tag em cada venda. Para não acumular ruído, combina com:

- um segundo fluxo **agendado** (se o teu plano tiver) que remove `temusy-vendas` de produtos sem vendas nos últimos X dias, ou
- revisão manual mensal, ou
- uma coleção “em destaque” alimentada por outra regra e tags mais específicas.

### 2) Organização por stock

1. **Trigger:** Inventory quantity changed.
2. **Condition:** Quantity ≤ limiar (ex.: 5).
3. **Action:** Add tag `popular` ou `destaque` (ou só notificação Slack/email à equipa).

### 3) “Interesse” sem cliques automáticos

1. **Trigger:** Product created (lançamento).
2. **Action:** Add tag `temusy-interesse` durante a campanha.
3. Remove a tag ao fim da campanha (fluxo agendado ou manual).

Para sinais reais de procura (pesquisas, cliques), usa **relatórios** ou uma **app** que escreva tags ou metafields; o tema continua a ler as mesmas tags.

## “IA leve” sem complicar

- **Sem modelo no tema:** nada de inferência em Liquid; evita custo, RGPD e manutenção.
- **Inteligência = regras:** Flow + tags (e, no futuro, metafields `custom.*` se quiseres workflows mais ricos no Admin).
- **Prioridade na vitrine:** coleções “Mais vendidos” / automáticas do Shopify + tags `temusy-vendas` nas grelhas dão sinal visual claro sem alterar o algoritmo de ordenação do tema.

## Badges de urgência nos cartões (`product-urgency-badges.liquid`)

Ativado por defeito com **Theme settings → Products → “Compact urgency badges on product cards”**.

| Texto | Origem (honesta) |
|-------|------------------|
| Only *N* left | Stock Shopify rastreado, `1 ≤ quantidade ≤ low_stock_threshold` |
| Selling fast | Tags acima **ou** `custom.selling_fast` = true |
| In *N* carts | Só se existir metafield **integer** `custom.active_carts` (ex.: app / Flow que escreva o número) |

Sem metafield de carrinhos, **não** aparece “In 12 carts” — evita números inventados no Liquid.

## Checklist rápido

- [ ] Flow ativo no plano da loja.
- [ ] Decidir tags: `temusy-vendas` para vendas; `temusy-interesse` só quando tiveres fonte de dados (não é automático pelo Flow).
- [ ] Política para **remover** tags antigas (evitar todos os produtos “A subir nas vendas”).
- [ ] Revisar `locales/pt-BR.json` e `en.default.json` em `product.merch.flow_*` se quiseres outros textos.

## Automação avançada (setup mínimo)

**Tagging e prioridade**

- **Mais vendas → maior prioridade:** no Flow, *Order paid* → *Add product tags* → `temusy-vendas` e/ou `bestseller`. Usa uma coleção inteligente “Best selling” no Admin e mantém `homepage_best_sellers_products` apontada para essa coleção.
- **Organizar coleções:** Flow pode *Add product to collection* / *Remove product from collection* em triggers de stock, etiqueta ou data de lançamento.

**“Mais cliques”**

- O Flow **não** lê cliques da loja. Para destacar por interesse: export Analytics / Search & Discovery, ou app → tags `trending` / `temusy-interesse` → o tema mostra a faixa **Trending** nos cartões (`snippets/product-merchandising-labels.liquid`).

**Homepage**

- A pilha final está em `templates/index.json` (hero → buy zone inline → countdown → hub → bestsellers → …); não dupliques uma segunda grelha de “departamentos” além de `homepage_trending_categories`.
