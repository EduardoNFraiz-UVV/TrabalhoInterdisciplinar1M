# Conecta Doações

Plataforma web de doações que aproxima pessoas que querem doar de ONGs e campanhas emergenciais. Projeto interdisciplinar do 1º período, reunindo Experiência e Interface com o Usuário, Introdução ao Desenvolvimento Web e Banco de Dados.

**Integrantes:** Bernardo Teixeira Angeli, Eduardo Neuman, Filippi Kruger, Heitor Vieira Holander e Julio Lyra.

## Links

- Protótipo no Figma: https://www.figma.com/design/xBUHw0LL4nvoHsjjS1twxP/telas
- Site publicado (GitHub Pages): https://eduardonfraiz-uvv.github.io/TrabalhoInterdisciplinar1M/web/

## Perfis de usuário

| Perfil | Usuário | Senha |
|---|---|---|
| Doador | doador | doa#2026 |
| Entidade (ONG) | entidade | ent!2026 |
| Administrador | admin | adm@2026 |

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `documentos/` | Enunciados de Web e de Banco de Dados e regras de negócio (`regras-de-negocio.md`) |
| `uiux/` | Personas, histórias, wireframes, fluxos, guia de estilo, tokens e especificação das telas |
| `web/` | Site em HTML, CSS e JavaScript |
| `banco-de-dados/` | Modelos, scripts SQL, resultados, relatório e arquivos de entrega |
| `entrega-web/` | PDF de entrega de Web |

## Site

HTML, CSS e JavaScript puros, sem bibliotecas. Todas as telas da especificação (`uiux/especificacao-das-telas.md`) mais as telas extras (criar conta, esqueci minha senha, ajuda, perfis e lista de campanhas). Os dados ficam no `localStorage` do navegador, com as mesmas tabelas e colunas do banco, e o rodapé tem o botão "Restaurar dados de exemplo".

O JavaScript usa módulos (`import`/`export`), então o site precisa de um servidor para abrir. Dentro da pasta `web/`:

```
python -m http.server 8000
```

e abrir http://localhost:8000. No VS Code, a extensão Live Server também serve. No GitHub Pages funciona direto.

| Pasta de `web/` | Conteúdo |
|---|---|
| `index.html` | Tela 00, apresentação |
| `paginas/publico/` | Entrar, criar conta, esqueci a senha, ajuda, ONGs, perfil da ONG, campanha e campanhas ativas |
| `paginas/doador/` | Início, doar, doar para a campanha, minhas doações e perfil |
| `paginas/ong/` | Painel, necessidades (CRUD), formulário de necessidade, doações recebidas, solicitar campanha e perfil |
| `paginas/admin/` | Painel com relatórios, aprovações, campanhas, usuários, nova campanha e doações das campanhas |
| `css/` | `base/` (tokens, reset, tipografia, layout), `componentes/` e `paginas/` |
| `js/` | `nucleo/` (dados, sessão, caminhos), `regras/` (regras de negócio), `componentes/`, `utilitarios/` e `paginas/` (um arquivo por tela) |

## Banco de dados

Banco em PostgreSQL com 10 tabelas e 109.941 registros fictícios.

| Arquivo | Função |
|---|---|
| `banco-de-dados/sql/ddl.sql` | Criação das tabelas |
| `banco-de-dados/sql/dml.sql` | Carga de dados |
| `banco-de-dados/sql/dql.sql` | Três consultas do relatório |
| `banco-de-dados/scripts/gerar_dml.py` | Gera o `dml.sql` (Python 3, sem bibliotecas externas) |
| `banco-de-dados/scripts/gerar_relatorio.py` | Gera o relatório a partir dos CSV de `resultados/` |

Para recriar o banco, em um PostgreSQL vazio:

```
psql -d conecta -f banco-de-dados/sql/ddl.sql
psql -d conecta -f banco-de-dados/sql/dml.sql
psql -d conecta -f banco-de-dados/sql/dql.sql
```
