import { el } from '../utilitarios/dom.js';

export function fatiar(lista, pagina, porPagina) {
  const inicio = (pagina - 1) * porPagina;
  return lista.slice(inicio, inicio + porPagina);
}

export function totalDePaginas(total, porPagina) {
  return Math.max(1, Math.ceil(total / porPagina));
}

export function criarPaginacao({ total, porPagina, pagina, aoMudar }) {
  const paginas = totalDePaginas(total, porPagina);
  if (paginas <= 1) return null;

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
