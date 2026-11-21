/*
  paginacao.js
  Para que serve: divide uma lista longa em páginas e cria os botões "Anterior 1 2 3 Próxima".
  Quem usa: ONGs, Usuários e outras listas grandes.
  Depende de: dom.js. O visual está em css/componentes/cabecalho.css (seção Paginação).
*/

import { el } from '../utilitarios/dom.js';

/* Devolve só os itens da página pedida. Exemplo: fatiar(lista, 2, 6) devolve os itens 7 a 12 */
export function fatiar(lista, pagina, porPagina) {
  const inicio = (pagina - 1) * porPagina;
  return lista.slice(inicio, inicio + porPagina);
}

/* Quantas páginas são necessárias para o total de itens */
export function totalDePaginas(total, porPagina) {
  return Math.max(1, Math.ceil(total / porPagina));
}

/*
  Cria o menu de paginação. Se só existe uma página, devolve null (não precisa de botões).
  total: quantidade total de itens; porPagina: itens por página;
  pagina: página atual; aoMudar: função chamada com o número da nova página.
*/
export function criarPaginacao({ total, porPagina, pagina, aoMudar }) {
  const paginas = totalDePaginas(total, porPagina);
  if (paginas <= 1) return null;

  /* Cria um botão de página (ou de Anterior/Próxima) */
  const botao = (rotulo, destino, desativado = false, atual = false) => el('li', {},
    el('button', {
      type: 'button',
      disabled: desativado,
      'aria-current': atual ? 'page' : null,
      'aria-label': typeof rotulo === 'number' ? `Página ${rotulo}` : rotulo,
      onclick: () => aoMudar(destino)
    }, String(rotulo)));

  const itens = [botao('Anterior', pagina - 1, pagina === 1)];
  for (let numero = 1; numero <= paginas; numero++) {
    itens.push(botao(numero, numero, false, numero === pagina));
  }
  itens.push(botao('Próxima', pagina + 1, pagina === paginas));

  return el('nav', { 'aria-label': 'Paginação' }, el('ul', { class: 'paginacao', role: 'list' }, itens));
}
