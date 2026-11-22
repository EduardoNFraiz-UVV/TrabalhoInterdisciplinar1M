# Guia para entender o código do site

Para quem está começando. Leia na ordem: cada parte usa a anterior. O código do site fica em `web/`.

## 1. Como abrir o site no seu computador

O JavaScript usa **módulos** (`import`/`export`), e o navegador só carrega módulos quando a página vem de um
servidor. Por isso, abrir o `index.html` com duplo clique não funciona.

1. Abra o terminal dentro da pasta `web/`.
2. Rode `python -m http.server 8000`.
3. Abra `http://localhost:8000` no navegador.

Logins de teste (os do enunciado): `doador` / `doa#2026`, `entidade` / `ent!2026`, `admin` / `adm@2026`.
No rodapé de qualquer página, "Restaurar dados de exemplo" volta tudo ao começo.

## 2. Mapa das pastas

| Pasta | O que tem |
|---|---|
| `web/index.html` | Página de apresentação (a primeira que o visitante vê) |
| `web/paginas/publico`, `doador`, `ong`, `admin` | Os arquivos HTML, uma pasta por tipo de usuário |
| `web/css/base` | Cores e medidas (`tokens.css`), zerar estilos do navegador (`reset.css`), letras (`tipografia.css`), esqueleto da página (`layout.css`) |
| `web/css/componentes` | Um CSS para cada peça reutilizável: botões, abas, tabelas, cartões, diálogo... |
| `web/css/paginas` | Estilos que só existem numa área (público, doador, ong, admin) |
| `web/css/principal.css` | Junta tudo com `@import`. Cada HTML carrega este arquivo |
| `web/js/nucleo` | O "motor": guarda os dados (`armazenamento.js`), login (`sessao.js`), endereços (`caminhos.js`), arranque da página (`pagina.js`), dados de exemplo |
| `web/js/utilitarios` | Ferramentas pequenas: criar elementos (`dom.js`), formatar datas e textos (`formatacao.js`) |
| `web/js/regras` | As regras de negócio: o que pode e o que não pode (campanhas, doações, necessidades, relatórios...) |
| `web/js/componentes` | Peças reutilizáveis que o JS desenha: cabeçalho, abas, tabela, diálogo, selos... |
| `web/js/paginas` | Um arquivo JS por página, na mesma divisão por tipo de usuário |

Regra para achar as coisas: a página `paginas/doador/minhas-doacoes.html` tem o seu JS em
`js/paginas/doador/minhas-doacoes.js`. O nome é o mesmo.

## 3. A vida de uma página (exemplo: Minhas doações)

**Passo 1. O HTML é só um esqueleto.** Em `paginas/doador/minhas-doacoes.html` quase tudo são caixas vazias:

```html
<header id="cabecalho"></header>
<main id="conteudo">
  <h1>Minhas doações</h1>
  <div id="abas"></div>
  <div id="lista"></div>
</main>
<footer id="rodape"></footer>
<script type="module" src="../../js/paginas/doador/minhas-doacoes.js"></script>
```

O `<script type="module">` é o que liga o JavaScript. Os `id` (`cabecalho`, `abas`, `lista`) são "etiquetas"
para o JS achar cada caixa e preencher.

**Passo 2. O JS da página começa por `iniciarPagina`.** No fim de `minhas-doacoes.js`:

```js
const contexto = iniciarPagina({ perfis: ['doador'] });
if (contexto) montar(contexto.usuario);
```

`iniciarPagina` (em `nucleo/pagina.js`) faz três coisas: confere se há alguém logado e se o perfil pode abrir a
página (senão manda para o login), monta o cabeçalho e o rodapé, e devolve o usuário.

**Passo 3. `montar` cria o conteúdo.** Cria as abas, o campo de busca e chama `desenhar()`.

**Passo 4. `desenhar` mostra a lista.** Lê os dados com `doacoesDoDoador(...)`, filtra pela aba e pela busca, e
troca o conteúdo da caixa `#lista` por uma tabela nova (`preencher($('#lista'), criarTabela(...))`).

**Passo 5. O usuário age e `desenhar` roda de novo.** Clicar numa aba, digitar na busca ou cancelar uma doação
muda um dado e chama `desenhar()` outra vez. A página nunca recarrega.

Quase toda página segue exatamente esta receita: HTML esqueleto, `iniciarPagina`, `montar`, `desenhar`.

## 4. Como funcionam as abas

Um engano comum: as abas **não trocam de página nem de layout**. O cabeçalho, o título e o rodapé ficam
parados. O que muda é só o conteúdo da caixa `#lista`.

1. O HTML tem uma caixa vazia: `<div id="abas"></div>`.
2. `criarAbas(...)` (em `js/componentes/abas.js`) monta um grupo de botões e o devolve. A página o coloca na caixa.
3. O resultado equivale a este HTML:

```html
<div class="abas" role="tablist" aria-label="Filtrar doações por status">
  <button type="button" class="aba" role="tab" aria-selected="true"  tabindex="0">Todas <span class="aba-contador">6</span></button>
  <button type="button" class="aba" role="tab" aria-selected="false" tabindex="-1">Oferecidas <span class="aba-contador">2</span></button>
</div>
```

4. Ao clicar num botão, `selecionar(id)` marca essa aba como `aria-selected="true"` e chama a função `aoMudar(id)`
   que a página entregou.
5. A página guarda o id numa variável (`abaAtual = id`) e chama `desenhar()`, que filtra a lista e troca a tabela.
6. As setas do teclado também trocam de aba (por acessibilidade).

O CSS destaca a aba escolhida olhando o atributo: `.aba[aria-selected="true"]` (em `css/componentes/abas.css`).

## 5. A função `el()`: criar HTML pelo JavaScript

Em vez de escrever HTML dentro de um texto, o projeto usa `el(tag, atributos, ...filhos)` (em `utilitarios/dom.js`):

```js
el('button', { type: 'button', class: 'aba', onclick: () => selecionar('todas') }, 'Todas')
```

equivale a escrever no HTML:

```html
<button type="button" class="aba">Todas</button>
```

mais "quando clicar, execute `selecionar('todas')`". Os atributos entram como objeto, os filhos (texto ou outros
`el(...)`) vêm depois. Por que não `innerHTML`? Porque o texto passado ao `el()` entra como **texto puro**: se
alguém digitar `<script>` num formulário, o navegador mostra as letras e não executa nada (segurança).

Outros atalhos de `dom.js`: `$('#lista')` encontra um elemento (é o `querySelector`), `preencher(caixa, ...)` troca
o conteúdo de uma caixa.

## 6. Onde ficam os dados e como funciona o login

- **Dados.** Não há servidor: as "tabelas" (cidade, ong, campanha, doacao...) ficam dentro do navegador, no
  `localStorage`, como um texto JSON. `nucleo/armazenamento.js` oferece `tabela('ong')` (lista de registros),
  `buscar('ong', 3)`, `inserir`, `atualizar` e `remover`. Na primeira visita, `dados-iniciais.js` cria os dados de
  exemplo, que reproduzem as telas do Figma.
- **Login.** `nucleo/sessao.js` compara o login digitado com a tabela `usuario`. A senha nunca é guardada: guardamos
  o **SHA-256** (um "resumo" de 64 letras e números) e comparamos resumo com resumo. O usuário logado fica guardado
  no navegador e `exigirPerfil` barra quem tenta abrir página de outro perfil.
- **Regras.** Os arquivos de `js/regras` respondem perguntas do tipo "quanto falta para a meta?" ou "esta doação
  pode ser cancelada?". As páginas só pedem a resposta e a mostram.

## 7. Cola de sintaxe do JavaScript

Cada linha: o que é, em português, e um exemplo real do projeto.

| Sintaxe | O que significa | Exemplo no projeto |
|---|---|---|
| `() => ...` (função seta) | Uma função sem nome. `(a) => a.id` é o mesmo que `function (a) { return a.id; }` | `onclick: () => selecionar(aba.id)` em `abas.js` |
| `lista.map(f)` | Cria uma lista nova aplicando `f` a cada item | `abas.map((aba) => aba.id)` |
| `lista.filter(f)` | Cria uma lista nova só com os itens em que `f` dá verdadeiro | `doacoesDoDoador(id).filter(...)` em `minhas-doacoes.js` |
| `lista.forEach(f)` | Executa `f` para cada item (um `for` com cara de função) | `abas.forEach((aba) => { ... })` |
| `a ?? b` | Usa `a`; se `a` for `null` ou `undefined`, usa `b`. Diferente de `\|\|`: o `0` e o texto vazio continuam valendo | `ativa ?? abas[0].id` |
| `a?.b()` | Só executa se `a` existir; se for `null`, não dá erro | `dialogo.querySelector('.botao')?.focus()` |
| `{ ...a, x: 0 }` | Copia todos os campos de `a` e troca ou acrescenta `x` | `{ ...a, contador: 0 }` |
| `function f({ rotulo, abas })` | Recebe um objeto e já separa os campos em variáveis | `criarAbas({ rotulo, abas, ativa, aoMudar })` |
| `` `Olá, ${nome}` `` | Texto com valores no meio (crase + `${...}`) | `` `Olá, ${primeiroNome(usuario.nome)}` `` |
| `cond ? a : b` | `if/else` em uma linha: se `cond`, vale `a`; senão, `b` | `id === atual ? 0 : -1` |
| `async` / `await` | Esperar algo que demora (o cálculo do SHA-256, a resposta de um diálogo) sem travar a página | `await hashSenha(senha)` em `sessao.js` |
| `new Promise(...)` | "Promessa de resposta": o diálogo devolve o que o usuário clicar, quando clicar | `abrirDialogo` em `dialogo.js` |
| `import { x } from './a.js'` / `export` | Um arquivo oferece funções com `export` e outro as usa com `import`. É assim que o código é dividido em pastas | todo arquivo de `js/` |
| `Object.entries(obj)` | Transforma `{ a: 1, b: 2 }` em `[['a', 1], ['b', 2]]` para percorrer com `forEach` | `atualizarContadores` em `abas.js` |

## 8. CSS: o que aparece e para que serve

O CSS é organizado em camadas: `principal.css` importa primeiro os **tokens** (cores, espaços), depois o
reset, a tipografia e o layout, e por fim os componentes, que usam os tokens.

| Recurso | O que faz | Onde |
|---|---|---|
| `var(--primary)` | Usa uma "variável" de CSS definida em `:root` (em `tokens.css`). Trocar a cor da marca é mudar uma linha | em quase todos os arquivos |
| `display: grid` e `repeat(auto-fill, minmax(280px, 1fr))` | Cria colunas que se ajustam sozinhas: tantas quantas couberem, cada uma com no mínimo 280px | `layout.css`, `campanha-form.css` |
| `min(480px, calc(100% - ...))` | Usa o menor dos dois valores: o diálogo tem no máximo 480px, mas nunca estoura a tela | `dialogo.css` |
| `@media (max-width: 640px)` | Regras que só valem em telas pequenas (celular). O cabeçalho vira menu recolhido abaixo de 820px | `tabelas.css`, `abas.css`, `cabecalho.css` |
| `td::before { content: attr(data-rotulo) }` | No celular, escreve na tela o texto do atributo `data-rotulo` antes de cada célula | `tabelas.css` |
| `:not(...)`, `:has(...)` | "Que NÃO tem tal classe" e "que TEM tal filho dentro" | `botoes.css`, `tabelas.css` |
| `body:not(.pronto) > main` | Esconde a página até o JS terminar de montá-la (evita "pulos" na tela). O JS põe a classe `pronto` | `layout.css` |
| `[aria-selected="true"]` | Estiliza pelo valor de um atributo | `abas.css` |
| `.so-leitor` | Texto escondido só visualmente: leitores de tela ainda o leem | `layout.css` |
| `@media (prefers-reduced-motion: reduce)` | Desliga animações para quem pediu menos movimento no sistema | `reset.css` |

## 9. HTML: tags e acessibilidade

**Estrutura (semântica).** `<header>` (topo), `<nav>` (menu), `<main>` (conteúdo principal, só um por página),
`<section>` (bloco com título), `<footer>`, `<h1>` a `<h3>` (títulos em ordem), `<ul>/<li>` (listas), `<form>`, `<label>` ligado
ao `<input>` por `for`/`id`, `<table>` com `<caption>`, `<thead>`, `<tbody>`, `<th scope="col">`, `<dl>/<dt>/<dd>`
(pares "nome: valor"), `<dialog>` (janela de confirmação nativa).

**Atributos que o grupo precisa saber explicar.**

| Atributo | Para quê |
|---|---|
| `lang="pt-BR"` | Idioma da página (leitores de tela pronunciam certo) |
| `meta viewport` | Faz a página se ajustar à largura do celular |
| `role="tablist"`, `role="tab"` | Dizem ao leitor de tela que aquilo é um grupo de abas |
| `aria-selected`, `aria-current="page"` | Qual aba / qual item do menu está ativo |
| `aria-label`, `aria-labelledby` | Nome de algo que não tem texto visível |
| `aria-live="polite"` | Avisa o leitor de tela quando o texto da caixa muda (mensagens de sucesso) |
| `aria-expanded`, `aria-controls` | Botão do menu no celular: aberto ou fechado, e qual painel ele controla |
| `hidden` | Esconde o elemento (ex.: o detalhe da doação antes de escolher uma) |
| `data-*` (ex.: `data-pagina`, `data-raiz`) | Dados guardados na tag para o JS ler |
| `class="pular-conteudo"` | Link "Pular para o conteúdo", só aparece ao navegar com o teclado |

## 10. Peças reutilizáveis (componentes) e onde estão

| Peça | Arquivo JS | O que desenha |
|---|---|---|
| Cabeçalho e menu | `componentes/cabecalho.js` | Marca, menu do perfil, Ajuda, saudação, Sair (menu recolhido no celular) |
| Rodapé | `componentes/rodape.js` | Nome do projeto, perfis de teste, "Restaurar dados de exemplo" |
| Abas | `componentes/abas.js` | Grupo de abas com contador |
| Tabela | `componentes/tabela.js` | `<table>` completa a partir de colunas e linhas |
| Paginação | `componentes/paginacao.js` | "Anterior 1 2 3 Próxima" |
| Diálogo | `componentes/dialogo.js` | Janela de confirmação com `<dialog>` |
| Alertas | `componentes/alertas.js` | Caixas de sucesso, erro, aviso e informação |
| Selos | `componentes/selos.js` | Etiquetas coloridas de status, prioridade, situação |
| Progresso | `componentes/progresso.js` | Barra de progresso e os 3 passos da doação |
| Cartões | `componentes/cartoes.js` | Cartão de ONG e de campanha |
| Gráfico | `componentes/grafico.js` | Gráfico de barras em SVG, sem biblioteca |
| Formulários | `componentes/formulario.js` | Ler campos e mostrar mensagens de erro |
| Ícones | `componentes/icones.js` | Ícones em SVG |

## 11. Perguntas que o professor pode fazer

- **"Por que o HTML tem caixas vazias?"** Porque o conteúdo depende de quem está logado e dos dados. O JS preenche cada caixa.
- **"Onde estão os dados?"** No `localStorage` do navegador, organizados como as tabelas do banco. Não há servidor.
- **"Como funciona o login?"** O JS compara o que foi digitado com a tabela `usuario`, comparando o SHA-256 da senha. O enunciado pede validação em JavaScript.
- **"O que acontece ao clicar numa aba?"** `selecionar` marca a aba, avisa a página, a página chama `desenhar()` e a tabela é trocada. Nenhuma página carrega.
- **"Por que `async`/`await`?"** O cálculo do SHA-256 do navegador demora um instante e devolve uma promessa; `await` espera o resultado.
- **"Por que tantos arquivos?"** Cada arquivo faz uma coisa: dados, regras, peças e páginas. Quem lê sabe onde procurar.
- **"Onde está o CRUD?"** Em Necessidades da ONG (`js/paginas/ong/necessidades.js` e `necessidade-form.js`): criar, listar, editar e excluir.
- **"Como o site se adapta ao celular?"** Meta `viewport` no HTML, grades que se ajustam sozinhas e `@media (max-width: 640px)` no CSS.
- **"O que é acessibilidade aqui?"** Tags semânticas, `label` ligado a cada campo, atributos `aria-*`, foco visível, navegação por teclado nas abas, texto com contraste.

## 12. O que NÃO foi trocado por uma versão "mais simples", e por quê

- **`async`/`await`**: o SHA-256 do navegador é assíncrono. Sem isso, a senha teria de ser guardada em texto puro.
- **`??` e `?.`**: parecem `||` e `if`, mas tratam o `0` e o texto vazio de outro jeito. Trocar mudaria o comportamento.
- **`import`/`export`**: é a divisão em pastas. Sem módulos, todos os arquivos dividiriam o mesmo espaço de nomes.
- **Funções seta `=>`**: fazem o mesmo que `function`; ficam porque o código é mais curto e a seção 7 explica a leitura.
- **`el()`**: poderia ser `innerHTML`, mas perderíamos a proteção contra texto malicioso (seção 5).
