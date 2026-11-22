/*
  progresso.js
  Para que serve: cria a barra de progresso (rótulo à esquerda, valor à direita, trilha e
  preenchimento) e o acompanhamento da doação em 3 passos (Oferecida, Aceita, Recebida).
  Quem usa: painéis, campanhas e "Minhas doações".
  Depende de: dom.js. O visual está em css/componentes/progresso.css.
*/

/* Traz a função que cria elementos HTML */
import { el } from '../utilitarios/dom.js';

/*
  Cria a barra de progresso.
  rotulo: texto à esquerda (ex.: "Cobertores de casal").
  valor: texto à direita (ex.: "20 de 50").
  percentual: número de 0 a 100 que define a largura do preenchimento.
*/
export function barraProgresso(rotulo, valor, percentual) {
  /* Garante que a largura fique entre 0 e 100, mesmo que chegue um valor fora disso */
  const largura = Math.max(0, Math.min(100, percentual));
  /* Caixa da barra: primeiro a linha de textos, depois a trilha com o preenchimento */
  return el('div', { class: 'progresso' },
    el('div', { class: 'progresso-textos' },
      el('span', { class: 'rotulo' }, rotulo),
      el('span', { class: 'valor' }, valor)),
    /* role="progressbar" e aria-valuenow deixam leitores de tela anunciarem o andamento */
    el('div', {
      class: 'progresso-trilha',
      role: 'progressbar',
      'aria-valuemin': 0,                          /* menor valor possível */
      'aria-valuemax': 100,                        /* maior valor possível */
      'aria-valuenow': largura,                    /* valor de agora */
      'aria-label': `${rotulo}: ${largura}%`       /* nome lido pelo leitor de tela */
    }, el('div', { class: 'progresso-preenchimento', style: `width: ${largura}%` })));   /* a parte colorida, com a largura em % */
}

/*
  Cria o acompanhamento em 3 passos de uma doação.
  status: 'oferecida', 'aceita' ou 'recebida' (os passos já concluídos ficam marcados).
  Para status 'recusada' ou 'cancelada', só o primeiro passo fica marcado.
*/
export function passosDaDoacao(status) {
  /* Nome de cada passo, na ordem */
  const nomes = ['Oferecida', 'Aceita pela ONG', 'Recebida'];
  /* Em qual passo (0, 1 ou 2) a doação está, conforme o status */
  const etapaAtual = { oferecida: 0, aceita: 1, recebida: 2, recusada: 0, cancelada: 0 }[status];
  /* <ol> = lista numerada: os passos têm uma ordem */
  return el('ol', { class: 'passos', 'aria-label': 'Acompanhamento da doação' },
    /* map cria um <li> para cada nome; "indice" é a posição (0, 1, 2) */
    nomes.map((nome, indice) => {
      /* Passo já concluído (ou o atual) e passo atual */
      const feito = indice <= etapaAtual;
      const atual = indice === etapaAtual;
      return el('li', {
        /* Classes extras só quando valem: passo-feito e passo-atual */
        class: `passo${feito ? ' passo-feito' : ''}${atual ? ' passo-atual' : ''}`,
        /* aria-current="step" avisa o leitor de tela qual é o passo atual */
        'aria-current': atual ? 'step' : null
      }, el('span', { class: 'passo-marca' }, feito ? '✓' : String(indice + 1)), nome);   /* marca: ✓ se feito, senão o número */
    }));
}
