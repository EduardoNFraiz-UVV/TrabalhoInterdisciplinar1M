import { el, preencher } from '../utilitarios/dom.js';

export function fatiar(lista, pagina, porPagina) {
  const inicio = (pagina - 1) * porPagina;
  return lista.slice(inicio, inicio + porPagina);
}

export function totalDePaginas(total, porPagina) {
  return Math.max(1, Math.ceil(total / porPagina));
}

export function preencherPagina(area, { total, porPagina, pagina, conteudo }) {
  const medidor = area.cloneNode(false);
  medidor.removeAttribute('id');
  medidor.style.cssText = `position:absolute;visibility:hidden;width:${area.offsetWidth}px`;
  area.after(medidor);

  let maisAlta = 0;
  for (let numero = 1; numero <= totalDePaginas(total, porPagina); numero++) {
    preencher(medidor, conteudo(numero));
    maisAlta = Math.max(maisAlta, medidor.offsetHeight);
  }
  medidor.remove();

  area.style.minHeight = `${maisAlta}px`;
  preencher(area, conteudo(pagina));
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
