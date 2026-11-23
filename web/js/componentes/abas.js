import { el } from '../utilitarios/dom.js';

export function criarAbas({ rotulo, abas, ativa, aoMudar }) {
  let atual = ativa ?? abas[0].id;
  const lista = el('div', { class: 'abas', role: 'tablist', 'aria-label': rotulo });
  const botoes = new Map();

  abas.forEach((aba) => {
    const contador = el('span', { class: 'aba-contador' }, aba.contador ?? '');
    const botao = el('button', {
      type: 'button',
      class: 'aba',
      role: 'tab',
      dataset: { aba: aba.id },
      onclick: () => selecionar(aba.id)
    }, aba.rotulo, aba.contador === undefined ? null : contador);
    botoes.set(aba.id, { botao, contador });
    lista.append(botao);
  });

  function desenhar() {
    botoes.forEach(({ botao }, id) => {
      botao.setAttribute('aria-selected', String(id === atual));
      botao.tabIndex = id === atual ? 0 : -1;
    });
  }

  function selecionar(id, focar = false) {
    atual = id;
    desenhar();
    if (focar) botoes.get(id).botao.focus();
    aoMudar(id);
  }

  lista.addEventListener('keydown', (evento) => {
    const ids = abas.map((aba) => aba.id);
    const posicao = ids.indexOf(atual);
    let nova = null;
    if (evento.key === 'ArrowRight') nova = ids[(posicao + 1) % ids.length];
    if (evento.key === 'ArrowLeft') nova = ids[(posicao - 1 + ids.length) % ids.length];
    if (evento.key === 'Home') nova = ids[0];
    if (evento.key === 'End') nova = ids[ids.length - 1];
    if (nova) {
      evento.preventDefault();
      selecionar(nova, true);
    }
  });

  desenhar();

  return {
    elemento: lista,
    atualizarContadores(valores) {
      Object.entries(valores).forEach(([id, valor]) => {
        const item = botoes.get(id);
        if (item) item.contador.textContent = valor;
      });
    },
    ativa: () => atual
  };
}
