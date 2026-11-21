/*
  tabela.js
  Para que serve: cria uma tabela HTML completa (<table> com <caption>, <thead> e <tbody>) a
  partir de uma lista de colunas e uma lista de linhas de dados.
  Cada <td> recebe o atributo data-rotulo com o nome da coluna: no celular o CSS usa esse texto
  para mostrar "Rótulo: valor" em cada linha (veja css/componentes/tabelas.css).
  Quem usa: quase todas as páginas com listas.
  Depende de: dom.js.
*/

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
  const cabecalho = el('tr', {}, colunas.map((coluna) =>
    el('th', { scope: 'col', class: coluna.classe }, coluna.classe === 'acoes' ? el('span', { class: 'so-leitor' }, 'Ações') : coluna.titulo)));

  const corpo = el('tbody', {});
  if (linhas.length === 0) {
    corpo.append(el('tr', {}, el('td', { colspan: colunas.length, class: 'tabela-vazia' }, vazio)));
  } else {
    linhas.forEach((linha) => {
      corpo.append(el('tr', { class: selecionada && selecionada(linha) ? 'selecionada' : null },
        colunas.map((coluna) => el('td', {
          class: coluna.classe,
          'data-rotulo': coluna.classe === 'acoes' ? null : coluna.titulo
        }, coluna.render(linha)))));
    });
  }

  return el('div', { class: 'tabela-rolagem' },
    el('table', { class: 'tabela' },
      el('caption', { class: 'so-leitor' }, legenda),
      el('thead', {}, cabecalho),
      corpo));
}
