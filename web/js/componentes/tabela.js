/*
  tabela.js
  Para que serve: cria uma tabela HTML completa (<table> com <caption>, <thead> e <tbody>) a
  partir de uma lista de colunas e uma lista de linhas de dados.
  Cada <td> recebe o atributo data-rotulo com o nome da coluna: no celular o CSS usa esse texto
  para mostrar "Rótulo: valor" em cada linha (veja css/componentes/tabelas.css).
  Quem usa: quase todas as páginas com listas.
  Depende de: dom.js.
*/

/* Traz a função que cria elementos HTML */
import { el } from '../utilitarios/dom.js';

/*
  Cria a tabela.
  legenda: título da tabela para leitores de tela (vira o <caption>).
  colunas: lista de { titulo, render, classe }.
    titulo: texto do cabeçalho (use '' para a coluna de ações e classe 'acoes');
    render: função que recebe a linha de dados e devolve o conteúdo da célula (texto ou elemento);
    classe: 'numerico' (alinha à direita) ou 'acoes' (botões em linha), opcional.
  linhas: lista de dados.
  vazio: o que aparece quando não há linhas. Pode ser um texto ou um elemento (ex.: uma frase com um link
         para o próximo passo), para o estado vazio orientar a pessoa em vez de só dizer "nada aqui".
  selecionada: função opcional que diz se a linha deve aparecer destacada.
*/
export function criarTabela({ legenda, colunas, linhas, vazio = 'Nenhum resultado encontrado.', selecionada = null }) {
  /* Linha do cabeçalho: um <th> para cada coluna */
  const cabecalho = el('tr', {}, colunas.map((coluna) =>
    /* scope="col" diz ao leitor de tela que o <th> é título de coluna.
       Na coluna de ações o título fica escondido para quem vê, mas é lido por leitor de tela ("Ações") */
    el('th', { scope: 'col', class: coluna.classe }, coluna.classe === 'acoes' ? el('span', { class: 'so-leitor' }, 'Ações') : coluna.titulo)));

  /* Corpo da tabela, ainda vazio */
  const corpo = el('tbody', {});
  if (linhas.length === 0) {
    /* Sem dados: uma única linha, com uma célula que ocupa todas as colunas (colspan) e a mensagem */
    corpo.append(el('tr', {}, el('td', { colspan: colunas.length, class: 'tabela-vazia' }, vazio)));
  } else {
    /* Com dados: uma linha <tr> para cada registro */
    linhas.forEach((linha) => {
      corpo.append(el('tr', { class: selecionada && selecionada(linha) ? 'selecionada' : null },   /* classe só nas linhas destacadas */
        /* Uma célula <td> para cada coluna */
        colunas.map((coluna) => el('td', {
          class: coluna.classe,
          'data-rotulo': coluna.classe === 'acoes' ? null : coluna.titulo   /* nome da coluna, usado no celular */
        }, coluna.render(linha)))));   /* render(linha) devolve o conteúdo da célula */
    });
  }

  /* Monta e devolve a tabela completa. O <div> externo permite rolar na horizontal se faltar espaço */
  return el('div', { class: 'tabela-rolagem' },
    el('table', { class: 'tabela' },
      el('caption', { class: 'so-leitor' }, legenda),   /* título da tabela, só para leitor de tela */
      el('thead', {}, cabecalho),
      corpo));
}
