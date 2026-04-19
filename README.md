# Temusyy — tema Shopify

Tema **Online Store 2.0** com templates JSON/Liquid, secções editáveis, snippets, `assets`, `config` e `locales`.

## Invariantes de engenharia (tema)

Estas regras aplicam-se ao **código** e aos **testes automatizados**, não ao Markdown:

- **Add-to-cart**: não dispara pedidos concorrentes ao carrinho (travamento no JS do tema).
- **Rede**: pedidos `fetch` ao carrinho usam limite de tempo (não bloqueiam indefinidamente).
- **Liquid**: não assumir dados sempre presentes (metafields, alocações de subscrição, etc.).
- **Imagens críticas**: dimensões + lazy loading onde o Theme Check e o UX o exigem.

## Requisitos

- Conta [Shopify](https://www.shopify.com/) e permissões na loja ou numa loja de desenvolvimento  
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) (`shopify version`)  
- [Node.js](https://nodejs.org/) **LTS** (para correr `npm run test` na raiz do repositório)

## Desenvolvimento local

Na **raiz do repositório** (onde está o `package.json` e as pastas `sections/`, `assets/`, etc.):

```bash
shopify theme dev --store SEU_SUBDOMINIO.myshopify.com
```

Substitua `SEU_SUBDOMINIO` pelo subdomínio real da loja. Na primeira ligação à loja, siga a autenticação pedida pelo CLI.

## Contratos automatizados (`npm run test`)

Na raiz do projeto:

```bash
npm run test
```

Executa, em cadeia, verificações de CI, atributos Git, licença e **testes de contrato** sobre Liquid, JSON de tema, `locales`, snippets e JS relevante (incluindo endurecimento de fluxos de carrinho onde aplicável). Falha rápido se alguma invariante documentada no código for violada.

## Theme Check (local)

```bash
npm run theme:check
```

Requer o Shopify CLI no `PATH`. O mesmo nível de falha (`--fail-level crash`) é usado no workflow de CI.

## Qualidade e CI

O workflow **Theme Check** corre em push e pull request para o ramo `main`. O *job* está limitado no tempo, usa `npm run test` como porta de qualidade barata e só falha o Theme Check para severidade `crash` (configurável em `.github/workflows/theme-check.yml`).

## Segurança e credenciais

- **Não commite** ficheiros `.env`, pastas `.shopify/` com sessão local, chaves privadas nem tokens de API. O `.gitignore` da raiz cobre os casos mais comuns.  
- Use variáveis de ambiente ou segredos da plataforma **fora** do repositório.  
- Não partilhe URLs de pré-visualização com tokens em canais públicos.

## Estrutura do projeto

| Pasta / ficheiro | Função |
|------------------|--------|
| `layout/` | Layout principal (`theme.liquid`, …) |
| `templates/` | Templates JSON/Liquid |
| `sections/` | Secções do editor de temas |
| `snippets/` | Partials Liquid |
| `assets/` | CSS, JS, imagens |
| `config/` | `settings_schema.json`, `settings_data.json`, `markets.json` |
| `locales/` | Traduções |
| `tests/` | Contratos Node (regressão) ligados a `npm run test` |

## Licença

Ver [LICENSE](LICENSE) (MIT).
