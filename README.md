# Temusyy — tema Shopify

Tema Shopify (Online Store 2.0) para loja com secções JSON, snippets reutilizáveis e integração com o fluxo padrão de `templates`, `sections`, `snippets`, `assets`, `config` e `locales`.

## Requisitos

- Conta [Shopify](https://www.shopify.com/) e acesso à loja ou ambiente de desenvolvimento  
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) atualizado (`shopify version`)

## Desenvolvimento local

Na raiz do repositório (onde está o tema):

```bash
shopify theme dev --store SEU_SUBDOMINIO.myshopify.com
```

Para ligar este diretório a uma loja pela primeira vez:

```bash
shopify theme init
# ou, se já tiver o código clonado:
cd temusyy
shopify theme dev --store SEU_SUBDOMINIO.myshopify.com
```

Substitua `SEU_SUBDOMINIO` pelo subdomínio real da loja.

## Estrutura do projeto

| Pasta / ficheiro | Função |
|------------------|--------|
| `layout/` | Layout principal do tema (`theme.liquid`, etc.) |
| `templates/` | Templates JSON/Liquid (páginas, produto, coleção, carrinho, …) |
| `sections/` | Secções reutilizáveis no editor de temas |
| `snippets/` | Partials Liquid |
| `assets/` | CSS, JS, imagens e outros estáticos |
| `config/` | `settings_schema.json`, `settings_data.json`, `markets.json` |
| `locales/` | Cadeias de tradução |

## Qualidade e CI

O workflow [Theme Check](https://shopify.dev/docs/storefronts/themes/tools/theme-check) corre em cada push e pull request para o ramo `main`. O *job* só falha para severidade `crash`, para não bloquear integração enquanto existe dívida técnica documentada no relatório (centenas de ofensas de nível inferior). Os logs da Action listam tudo; o objetivo é ir endurecendo o `--fail-level` em `.github/workflows/theme-check.yml` à medida que as correções forem feitas.

## Licença

Ver [LICENSE](LICENSE) (MIT).
