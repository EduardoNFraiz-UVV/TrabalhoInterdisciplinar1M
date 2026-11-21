/*
  abas.js
  Para que serve: cria abas com contador ("Todas (6)  Oferecidas (2)") que filtram uma lista.
  Segue o padrão de acessibilidade de abas: role="tablist" no grupo, role="tab" em cada aba,
  aria-selected na aba escolhida e navegação com as setas do teclado.
  Quem usa: Minhas doações, Doações recebidas, Aprovações, Campanhas, Usuários e Perfil da ONG.
  Depende de: dom.js. O visual está em css/componentes/abas.css.
*/

import { el } from '../utilitarios/dom.js';

/*
  Cria o grupo de abas.
  rotulo: nome do grupo para leitores de tela (ex.: "Filtrar doações por status").
  abas: lista de { id, rotulo, contador } (contador é opcional).
  ativa: id da aba que começa selecionada.
  aoMudar: função chamada com o id da aba sempre que o usuário escolhe outra.
  Devolve { elemento, atualizarContadores(objeto), ativa() }.
*/
export function criarAbas({ rotulo, abas, ativa, aoMudar }) {
  let atual = ativa ?? abas[0].id;
  const lista = el('div', { class: 'abas', role: 'tablist', 'aria-label': rotulo });
  const botoes = new Map();     /* id da aba -> botão, para atualizar depois */

  /* Cria um botão para cada aba */
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

  /* Marca visualmente a aba atual e ajusta o foco do teclado (só a aba atual recebe Tab) */
  function desenhar() {
    botoes.forEach(({ botao }, id) => {
      botao.setAttribute('aria-selected', String(id === atual));
      botao.tabIndex = id === atual ? 0 : -1;
    });
  }

  /* Troca a aba e avisa quem criou as abas */
  function selecionar(id, focar = false) {
    atual = id;
    desenhar();
    if (focar) botoes.get(id).botao.focus();
    aoMudar(id);
  }

  /* Setas esquerda e direita (e Home/End) movem entre as abas */
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
    /* Atualiza os números das abas: atualizarContadores({ todas: 6, oferecida: 2 }) */
    atualizarContadores(valores) {
      Object.entries(valores).forEach(([id, valor]) => {
        const item = botoes.get(id);
        if (item) item.contador.textContent = valor;
      });
    },
    ativa: () => atual
  };
}
