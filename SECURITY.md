# Política de segurança

Este documento aplica-se ao **código deste repositório** (tema Shopify). Comportamento da loja em produção também depende da **plataforma Shopify**, de **aplicações de terceiros** e de **configurações do comerciante** — fora do controlo exclusivo deste tema.

## Invariantes de engenharia (tema)

As garantias abaixo são implementadas em **Liquid/JS** e validadas por **testes automatizados** (`npm run test`), não por este ficheiro Markdown:

- **Carrinho / ATC:** evitar pedidos concorrentes ao adicionar ao carrinho onde o tema controla o fluxo.
- **Rede:** evitar que `fetch` ao carrinho fique pendurado indefinidamente (limites de tempo).
- **Liquid:** não assumir que metafields, imagens ou alocações existem sempre.
- **Superfície web:** reduzir XSS (escape/filtros), evitar `eval` de conteúdo não confiável e não registar PII em `console` em código de produção.

## Versões suportadas

Apenas o ramo **`main`** deste repositório é considerado para **correções de segurança ativas** noutros ramos, a política é *best effort*.

## O que reportar (âmbito)

**Dentro de âmbito** (exemplos):

- Cross-site scripting (**XSS**) explorável via templates, secções ou snippets do tema.
- Inclusão ou execução de código a partir de entrada controlada pelo visitante (quando atribuível ao tema).
- Fuga de dados sensíveis **causada pelo tema** (por exemplo, dados de cliente expostos em HTML/JS do tema por erro de implementação).
- Configuração do tema que **desative** proteções razoáveis (por exemplo, exposição de endpoints internos em `settings` usados pelo JS do tema).

**Fora de âmbito** (exemplos):

- Vulnerabilidades na **infraestrutura Shopify**, checkout alojado pela Shopify, ou contas/comprometimento fora deste repositório.
- Problemas introduzidos apenas por **aplicações de terceiros** ou scripts injetados via `content_for_header` de apps (reporte ao fornecedor da app / Shopify).
- Questões de **conformidade legal** ou **PCI** que não resultem de código deste repositório.

## Reportar uma vulnerabilidade

Se encontrar um problema de segurança relacionado com **este tema**, **não** abra um *issue* público com detalhes exploráveis, PoC completo ou dados reais de clientes.

1. **GitHub:** no repositório onde este código está alojado, vá a **Security** → **Report a vulnerability** (ou **Advisories** → **Report a vulnerability**, conforme a interface).  
2. **Alternativa:** contacte os mantenedores por um **canal privado**, com impacto resumido, versão/commit afectado e **passos mínimos** para reprodução (sem incluir segredos, tokens ou PII real).

Objectivo: correcção ou mitigação com **divulgação coordenada** antes de discussão pública com exploit.

## Boas práticas para contribuidores

- Não commite `.env`, pastas `.shopify/` com sessão local, chaves privadas nem tokens (ver `.gitignore` e [README](README.md)).  
- Execute `npm run test` antes de abrir PR; use `npm run theme:check` se tiver Shopify CLI instalado.  
- Não cole URLs de pré-visualização com **tokens** em issues ou chats públicos.

## Expectativa de resposta

Os mantenedores esforçam-se por **acknowledge** inicial em dias úteis; o tempo de correcção depende da gravidade e da carga. Se o relatório for fora de âmbito, indicar-se-á por que motivo e, se possível, canal mais adequado.
