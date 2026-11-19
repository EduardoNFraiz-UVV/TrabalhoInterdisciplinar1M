# Tokens do guia de estilo (Conecta Doações)

Valores extraídos de `guia-de-estilo.png`. São a referência única para o Figma e para o CSS do site.

## Cores

| Grupo | Token | Hex |
|---|---|---|
| Marca | primary | #0D6B65 |
| Marca | primary-hover | #0A5450 |
| Marca | primary-soft | #D9EEEB |
| Marca | on-primary | #FFFFFF |
| Marca | accent | #F4B740 |
| Marca | accent-soft | #FCEFD3 |
| Marca | on-accent | #2B1D00 |
| Texto e bordas | ink | #13201E |
| Texto e bordas | ink-muted | #4A5C59 |
| Texto e bordas | line | #CCDAD7 |
| Texto e bordas | line-strong | #71857F |
| Texto e bordas | focus | #2F5BD3 |
| Superfícies | surface | #F5F8F7 |
| Superfícies | surface-raised | #FFFFFF |
| Superfícies | surface-sunken | #E6EFED |
| Estados | info | #2457B5 |
| Estados | info-soft | #E3EBFA |
| Estados | warning | #7F4D00 |
| Estados | warning-soft | #FCEFD6 |
| Estados | success | #1C6B3A |
| Estados | success-soft | #DFF1E5 |
| Estados | success-action (só no link "Concluir" da tela 8) | #2E7D32 |
| Estados | danger | #B3261E |
| Estados | danger-soft | #FBE4E1 |
| Estados | danger-hover | #8F1E18 |
| Estados | on-danger | #FFFFFF |

Contraste mínimo de 4,5:1 para texto. Os estados da doação sempre aparecem com palavra e ícone.

| Estado | Fundo | Texto e ícone |
|---|---|---|
| Oferecida | info-soft | info |
| Aceita | warning-soft | warning |
| Recebida | success-soft | success |
| Recusada | danger-soft | danger |
| URGENTE | danger-soft | danger |
| NORMAL | surface-sunken | ink-muted |

## Tipografia

Títulos: **Bricolage Grotesque** (700 e 800). Texto: **Atkinson Hyperlegible** (400 e 700). Ambas no Google Fonts.

| Estilo | Fonte | Tamanho / altura de linha | Peso |
|---|---|---|---|
| display | Bricolage Grotesque | 40 / 44 | 800 |
| heading-lg | Bricolage Grotesque | 28 / 34 | 700 |
| heading-md | Bricolage Grotesque | 22 / 28 | 700 |
| heading-sm | Bricolage Grotesque | 18 / 24 | 700 |
| body-lg | Atkinson Hyperlegible | 17 / 26 | 400 |
| body | Atkinson Hyperlegible | 15 / 22 | 400 |
| body-strong | Atkinson Hyperlegible | 15 / 22 | 700 |
| label | Atkinson Hyperlegible | 14 / 20 | 700 |
| caption | Atkinson Hyperlegible | 13 / 18 | 400 |
| overline | Atkinson Hyperlegible | 12 / 16 | 700 |

Um título (heading-lg) por tela. Texto corrido em body.

## Espaçamento, forma e controles

Grade de 4 px. Cards se separam por borda (`line`), não por sombra.

| Espaçamento | Valor |
|---|---|
| space-1 | 4 px |
| space-2 | 8 px |
| space-3 | 12 px |
| space-4 | 16 px |
| space-5 | 24 px |
| space-6 | 32 px |
| space-7 | 40 px |
| space-8 | 64 px |

| Raio | Valor |
|---|---|
| radius-sm | 6 px |
| radius-md | 10 px |
| radius-lg | 16 px |
| radius-pill | pílula (999 px) |

| Altura de controle | Valor |
|---|---|
| control-sm | 32 px |
| control-md | 40 px |
| control-lg | 48 px |

Sombras: `sombra-card` e `sombra-dialog`, ambas suaves. O guia não informa os valores exatos. Usar `0 1px 2px rgba(19,32,30,.08)` no card e `0 8px 24px rgba(19,32,30,.16)` no diálogo.

## Ícones

Traço de 2 px, grade de 24 px, sempre acompanhados de texto: search, check, x, alert, info, pin, clock, phone, truck, heart, verified, chevron, plus, edit, trash, help, package.

## Componentes

**Botões.** Quatro tipos, cada um com estados padrão, hover, desabilitado e com ícone.
- Primário: fundo primary, texto on-primary. Hover em primary-hover.
- Secundário: fundo branco, borda line-strong, texto primary. Hover com fundo primary-soft e borda primary.
- Discreto: sem fundo, texto primary. Hover com fundo primary-soft.
- Perigo: fundo danger, texto on-danger. Hover em danger-hover.
- Desabilitado: fundo surface-sunken, borda line, texto ink-muted.

Regras: um botão primário por área. O texto começa com verbo e diz o resultado ("Confirmar doação", nunca "OK"). Em formulários, Cancelar à esquerda e a ação principal à direita. "Excluir" só dentro do diálogo de confirmação.

**Campos de texto.** Rótulo sempre visível, em label. Obrigatório marcado com asterisco vermelho. Borda line-strong, raio radius-md, altura control-md. Estado de erro com borda danger, ícone alert e mensagem que diz o que houve e como resolver. Campo bloqueado com fundo surface-sunken. Texto de ajuda em caption.

**Seletores.** Radio e checkbox em primary. Filtros por status em abas com contador. Breadcrumbs com chevron, página atual em negrito. Busca com ícone search e botão "Buscar".

**Cabeçalho.** Marca "♡ Conecta Doações" em primary, itens de menu por perfil, item atual com fundo primary-soft, link "Ajuda" com ícone help e saudação à direita.
- Doador: Início, ONGs, Minhas doações, Perfil.
- ONG: Painel, Necessidades, Doações recebidas, Perfil da ONG.
- Administrador: Painel, Aprovações, Campanhas, Usuários.

**Cards.** Card de ONG (inicial em quadrado primary-soft, nome, cidade com pin, selo "ONG verificada", descrição, itens urgentes e botão "Ver necessidades"). Card de resumo (número grande, rótulo e link). Resumo da doação (tabela de rótulo e valor). Campanha emergencial (fundo accent-soft, selo EMERGÊNCIA em accent, barra de progresso e botão "Ver campanha").

**Feedback.** Alertas de sucesso, erro, aviso e informação, cada um com ícone, título e detalhe. Diálogo de confirmação com título, texto e botões Cancelar, Marcar concluída e Excluir. Ajuda contextual "Como funciona" sobre surface-sunken.

**Progresso.** Barra de 8 px em surface-sunken com preenchimento primary, rótulo à esquerda e valor à direita. Acompanhamento da doação em 3 passos: Oferecida, Aceita pela ONG, Recebida.
