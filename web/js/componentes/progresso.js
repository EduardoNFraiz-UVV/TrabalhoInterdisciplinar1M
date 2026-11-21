/*
  progresso.js
  Para que serve: cria a barra de progresso (rótulo à esquerda, valor à direita, trilha e
  preenchimento) e o acompanhamento da doação em 3 passos (Oferecida, Aceita, Recebida).
  Quem usa: painéis, campanhas e "Minhas doações".
  Depende de: dom.js. O visual está em css/componentes/progresso.css.
*/

import { el } from '../utilitarios/dom.js';

/*
  Cria a barra de progresso.
  rotulo: texto à esquerda (ex.: "Cobertores de casal").
  valor: texto à direita (ex.: "20 de 50").
  percentual: número de 0 a 100 que define a largura do preenchimento.
*/
export function barraProgresso(rotulo, valor, percentual) {
  const largura = Math.max(0, Math.min(100, percentual));
  return el('div', { class: 'progresso' },
    el('div', { class: 'progresso-textos' },
      el('span', { class: 'rotulo' }, rotulo),
      el('span', { class: 'valor' }, valor)),
    /* role="progressbar" e aria-valuenow deixam leitores de tela anunciarem o andamento */
    el('div', {
      class: 'progresso-trilha',
      role: 'progressbar',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': largura,
      'aria-label': `${rotulo}: ${largura}%`
    }, el('div', { class: 'progresso-preenchimento', style: `width: ${largura}%` })));
}

/*
  Cria o acompanhamento em 3 passos de uma doação.
  status: 'oferecida', 'aceita' ou 'recebida' (os passos já concluídos ficam marcados).
  Para status 'recusada' ou 'cancelada', só o primeiro passo fica marcado.
*/
export function passosDaDoacao(status) {
  const nomes = ['Oferecida', 'Aceita pela ONG', 'Recebida'];
  const etapaAtual = { oferecida: 0, aceita: 1, recebida: 2, recusada: 0, cancelada: 0 }[status];
  return el('ol', { class: 'passos', 'aria-label': 'Acompanhamento da doação' },
    nomes.map((nome, indice) => {
      const feito = indice <= etapaAtual;
      const atual = indice === etapaAtual;
      return el('li', {
        class: `passo${feito ? ' passo-feito' : ''}${atual ? ' passo-atual' : ''}`,
        'aria-current': atual ? 'step' : null
      }, el('span', { class: 'passo-marca' }, feito ? '✓' : String(indice + 1)), nome);
    }));
}
