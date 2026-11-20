# Conecta Doações

Plataforma web de doações que aproxima pessoas que querem doar de ONGs e campanhas emergenciais. Projeto interdisciplinar do 1º período, reunindo Experiência e Interface com o Usuário, Introdução ao Desenvolvimento Web e Banco de Dados.

**Integrantes:** Bernardo Teixeira Angeli, Eduardo Neuman, Filippi Kruger, Heitor Vieira Holander e Julio Lyra.

## Links

- Protótipo no Figma: https://www.figma.com/design/xBUHw0LL4nvoHsjjS1twxP/telas
- Site publicado: a definir (GitHub Pages)

## Perfis de usuário

| Perfil | Usuário | Senha |
|---|---|---|
| Doador | doador | doa#2026 |
| Entidade (ONG) | entidade | ent!2026 |
| Administrador | admin | adm@2026 |

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `documentos/` | Enunciados das três disciplinas e regras de negócio (`regras-de-negocio.md`) |
| `uiux/` | Personas, histórias, wireframes, fluxos, guia de estilo, tokens e especificação das telas |
| `web/` | Site em HTML, CSS e JavaScript |
| `banco-de-dados/` | Modelos, scripts SQL, resultados, relatório e arquivos de entrega |
| `entrega-web/` | PDF de entrega de Web |

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
