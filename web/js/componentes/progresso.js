import { el } from '../utilitarios/dom.js';

export function barraProgresso(rotulo, valor, percentual) {
  const largura = Math.max(0, Math.min(100, percentual));
  return el('div', { class: 'progresso' },
    el('div', { class: 'progresso-textos' },
      el('span', { class: 'rotulo' }, rotulo),
      el('span', { class: 'valor' }, valor)),
    el('div', {
      class: 'progresso-trilha',
      role: 'progressbar',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': largura,
      'aria-label': `${rotulo}: ${largura}%`
    }, el('div', { class: 'progresso-preenchimento', style: `width: ${largura}%` })));
}

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
