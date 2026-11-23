import { el } from '../utilitarios/dom.js';

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
