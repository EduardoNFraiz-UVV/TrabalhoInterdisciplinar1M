/*
  abas.js
  Para que serve: cria abas com contador ("Todas (6)  Oferecidas (2)") que filtram uma lista.
  Segue o padrão de acessibilidade de abas: role="tablist" no grupo, role="tab" em cada aba,
  aria-selected na aba escolhida e navegação com as setas do teclado.
  Quem usa: Minhas doações, Doações recebidas, Aprovações, Campanhas, Usuários e Perfil da ONG.
  Depende de: dom.js. O visual está em css/componentes/abas.css.

  Importante: as abas NÃO trocam de página. Elas só marcam qual está escolhida e avisam a página
  (função aoMudar), que então redesenha a lista com o filtro novo.
*/

/* Traz a função que cria elementos HTML */
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
  /* Aba atual: a pedida ou, se não pediram nenhuma, a primeira da lista */
  let atual = ativa ?? abas[0].id;
  /* A caixa que agrupa os botões. role="tablist" avisa o leitor de tela que são abas */
  const lista = el('div', { class: 'abas', role: 'tablist', 'aria-label': rotulo });
  /* Um Map é uma lista de pares chave -> valor. Aqui: id da aba -> { botão, contador } */
  const botoes = new Map();     /* id da aba -> botão, para atualizar depois */

  /* Cria um botão para cada aba */
  abas.forEach((aba) => {
    /* O número pequeno ao lado do nome (ex.: 6). Começa com o valor dado ou vazio */
    const contador = el('span', { class: 'aba-contador' }, aba.contador ?? '');
    /* O botão da aba */
    const botao = el('button', {
      type: 'button',                      /* botão comum, não envia formulário */
      class: 'aba',
      role: 'tab',                         /* avisa o leitor de tela que é uma aba */
      dataset: { aba: aba.id },            /* vira data-aba="id" no HTML */
      onclick: () => selecionar(aba.id)    /* ao clicar, escolhe esta aba */
    }, aba.rotulo, aba.contador === undefined ? null : contador);   /* texto + contador (só se foi informado) */
    /* Guarda botão e contador para poder atualizar depois */
    botoes.set(aba.id, { botao, contador });
    /* Coloca o botão dentro da caixa de abas */
    lista.append(botao);
  });

  /* Marca visualmente a aba atual e ajusta o foco do teclado (só a aba atual recebe Tab) */
  function desenhar() {
    /* Percorre todos os botões guardados: botoes.forEach recebe (valor, chave) */
    botoes.forEach(({ botao }, id) => {
      /* aria-selected="true" na aba atual e "false" nas outras (o CSS usa isso para pintar) */
      botao.setAttribute('aria-selected', String(id === atual));
      /* tabIndex 0 = entra na ordem do Tab; -1 = só recebe foco por código (setas) */
      botao.tabIndex = id === atual ? 0 : -1;
    });
  }

  /* Troca a aba e avisa quem criou as abas */
  function selecionar(id, focar = false) {
    /* Guarda qual é a aba atual */
    atual = id;
    /* Atualiza a aparência */
    desenhar();
    /* Se veio das setas do teclado, leva o foco para o botão da nova aba */
    if (focar) botoes.get(id).botao.focus();
    /* Avisa a página, que redesenha a lista */
    aoMudar(id);
  }

  /* Setas esquerda e direita (e Home/End) movem entre as abas */
  lista.addEventListener('keydown', (evento) => {
    /* Lista só com os ids das abas, na ordem, e a posição da aba atual nela */
    const ids = abas.map((aba) => aba.id);
    const posicao = ids.indexOf(atual);
    /* Começa sem nova aba escolhida */
    let nova = null;
    /* Seta direita: próxima aba (o % volta ao começo depois da última) */
    if (evento.key === 'ArrowRight') nova = ids[(posicao + 1) % ids.length];
    /* Seta esquerda: aba anterior (soma o tamanho para não dar posição negativa) */
    if (evento.key === 'ArrowLeft') nova = ids[(posicao - 1 + ids.length) % ids.length];
    /* Home: primeira aba. End: última aba */
    if (evento.key === 'Home') nova = ids[0];
    if (evento.key === 'End') nova = ids[ids.length - 1];
    /* Se alguma tecla de navegação foi apertada */
    if (nova) {
      /* Impede o comportamento padrão da tecla (rolar a página) */
      evento.preventDefault();
      /* Escolhe a nova aba e leva o foco até ela */
      selecionar(nova, true);
    }
  });

  /* Primeira pintura: marca a aba inicial */
  desenhar();

  /* O que quem chamou criarAbas recebe de volta */
  return {
    /* A caixa pronta, para a página colocar na tela */
    elemento: lista,
    /* Atualiza os números das abas: atualizarContadores({ todas: 6, oferecida: 2 }) */
    atualizarContadores(valores) {
      /* Para cada par id/valor do objeto recebido */
      Object.entries(valores).forEach(([id, valor]) => {
        /* Acha o contador daquela aba */
        const item = botoes.get(id);
        /* Se a aba existe, troca o número mostrado */
        if (item) item.contador.textContent = valor;
      });
    },
    /* Devolve o id da aba atual */
    ativa: () => atual
  };
}
