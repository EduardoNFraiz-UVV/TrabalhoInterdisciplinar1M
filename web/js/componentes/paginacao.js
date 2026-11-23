/*
  paginacao.js
  Para que serve: divide uma lista longa em páginas e cria os botões "Anterior 1 2 3 Próxima".
  Quem usa: Início do doador, ONGs, Usuários e outras listas grandes.
  Depende de: dom.js. O visual está em css/componentes/cabecalho.css (seção Paginação).
*/

/* Traz as funções que criam elementos HTML (el) e trocam o conteúdo de uma área (preencher) */
import { el, preencher } from '../utilitarios/dom.js';

/* Devolve só os itens da página pedida. Exemplo: fatiar(lista, 2, 6) devolve os itens 7 a 12 */
export function fatiar(lista, pagina, porPagina) {
  /* Posição do primeiro item da página: página 2 com 6 por página começa na posição 6 */
  const inicio = (pagina - 1) * porPagina;
  /* slice(de, até) devolve uma cópia do pedaço da lista entre essas posições */
  return lista.slice(inicio, inicio + porPagina);
}

/* Quantas páginas são necessárias para o total de itens */
export function totalDePaginas(total, porPagina) {
  /* Math.ceil arredonda para cima (13 itens, 6 por página = 3 páginas); Math.max garante pelo menos 1 */
  return Math.max(1, Math.ceil(total / porPagina));
}

/*
  Mostra a página atual dentro de "area" SEM deixar a paginação mudar de lugar.
  O problema: cada página tem uma altura (linhas que quebram em duas, última página com menos itens),
  e os botões da paginação ficam logo abaixo, então subiam e desciam a cada clique.
  A solução: medir a página mais alta e reservar essa altura na área.
  conteudo: função que recebe o número de uma página e devolve o que desenhar nela.
*/
export function preencherPagina(area, { total, porPagina, pagina, conteudo }) {
  /* Cópia vazia da área (mesma classe e mesma largura) só para medir; fica invisível e fora do fluxo da página */
  const medidor = area.cloneNode(false);
  /* Tira o id da cópia para não existirem dois elementos com o mesmo id */
  medidor.removeAttribute('id');
  /* cssText troca todo o estilo da cópia (inclusive uma altura mínima antiga que ela herdou) */
  medidor.style.cssText = `position:absolute;visibility:hidden;width:${area.offsetWidth}px`;
  /* after() coloca a cópia logo depois da área, no mesmo lugar da página */
  area.after(medidor);

  /* Desenha cada página na cópia e guarda a maior altura encontrada */
  let maisAlta = 0;
  for (let numero = 1; numero <= totalDePaginas(total, porPagina); numero++) {
    preencher(medidor, conteudo(numero));
    /* offsetHeight = altura do elemento em pixels (o navegador calcula o layout ao ler esse valor) */
    maisAlta = Math.max(maisAlta, medidor.offsetHeight);
  }
  /* A medição acabou: remove a cópia */
  medidor.remove();

  /* A área nunca fica mais baixa que a página mais alta; assim a paginação fica sempre no mesmo lugar */
  area.style.minHeight = `${maisAlta}px`;
  /* Agora sim desenha a página atual na área de verdade */
  preencher(area, conteudo(pagina));
}

/*
  Cria o menu de paginação. Se só existe uma página, devolve null (não precisa de botões).
  total: quantidade total de itens; porPagina: itens por página;
  pagina: página atual; aoMudar: função chamada com o número da nova página.
*/
export function criarPaginacao({ total, porPagina, pagina, aoMudar }) {
  /* Quantas páginas existem */
  const paginas = totalDePaginas(total, porPagina);
  /* Com uma página só, não há o que paginar */
  if (paginas <= 1) return null;

  /* Cria um botão de página (ou de Anterior/Próxima) */
  const botao = (rotulo, destino, desativado = false, atual = false) => el('li', {},
    el('button', {
      type: 'button',
      disabled: desativado,                                                   /* botão apagado (ex.: "Anterior" na página 1) */
      'aria-current': atual ? 'page' : null,                                  /* marca a página atual para leitor de tela */
      'aria-label': typeof rotulo === 'number' ? `Página ${rotulo}` : rotulo, /* "Página 2" em vez de só "2" */
      onclick: () => aoMudar(destino)                                         /* ao clicar, avisa a página de destino */
    }, String(rotulo)));

  /* Começa com o botão "Anterior" (desativado se estamos na primeira página) */
  const itens = [botao('Anterior', pagina - 1, pagina === 1)];
  /* Um botão numerado para cada página; o da página atual fica marcado */
  for (let numero = 1; numero <= paginas; numero++) {
    itens.push(botao(numero, numero, false, numero === pagina));
  }
  /* Termina com o botão "Próxima" (desativado se estamos na última página) */
  itens.push(botao('Próxima', pagina + 1, pagina === paginas));

  /* <nav> = área de navegação; <ul> = lista dos botões */
  return el('nav', { 'aria-label': 'Paginação' }, el('ul', { class: 'paginacao', role: 'list' }, itens));
}
