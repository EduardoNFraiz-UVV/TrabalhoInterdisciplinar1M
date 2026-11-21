/*
  cartoes.js
  Para que serve: cria os cartões reutilizados em várias páginas: cartão de ONG e cartão de campanha
  emergencial (fundo amarelo-claro, selo EMERGÊNCIA, barra de progresso e botão "Ver campanha").
  Quem usa: apresentação, início do doador, lista de ONGs e campanhas ativas.
  Depende de: dom.js, icones.js, selos.js, progresso.js, caminhos.js e as regras.
  O visual está em css/componentes/cartoes.css.
*/

import { el } from '../utilitarios/dom.js';
import { icone } from './icones.js';
import { seloVerificada, seloEmergencia } from './selos.js';
import { barraProgresso } from './progresso.js';
import { url } from '../nucleo/caminhos.js';
import { buscar } from '../nucleo/armazenamento.js';
import { inicial, formatarData, ROTULO_TIPO_CAMPANHA } from '../utilitarios/formatacao.js';
import { itensUrgentes } from '../regras/necessidades.js';
import { textoCidades, progressoDaCampanha } from '../regras/campanhas.js';

/* Corta um texto longo e coloca reticências no fim */
function resumir(texto, limite = 110) {
  return texto.length > limite ? `${texto.slice(0, limite).trim()}…` : texto;
}

/*
  Cartão de ONG: inicial, nome, cidade, selo verificada, descrição, itens urgentes e botão.
  nivelTitulo: 'h2' ou 'h3', para respeitar a hierarquia de títulos da página.
*/
export function cartaoOng(ong, nivelTitulo = 'h3') {
  const cidade = buscar('cidade', ong.id_cidade);
  const urgentes = itensUrgentes(ong.id_ong);
  return el('article', { class: 'cartao cartao-ong' },
    el('div', { class: 'linha' },
      el('span', { class: 'inicial', 'aria-hidden': 'true' }, inicial(ong.nome)),
      el('div', { class: 'pilha pilha-pequena' },
        el(nivelTitulo, {}, ong.nome),
        el('span', { class: 'meta-linha' }, icone('pin', 14), `${cidade.nome} - ${cidade.uf}`))),
    ong.verificada ? el('div', {}, seloVerificada()) : '',
    el('p', { class: 'texto-apoio' }, resumir(ong.descricao)),
    urgentes > 0
      ? el('p', { class: 'urgentes' }, icone('alert', 14), `${urgentes} ${urgentes === 1 ? 'item urgente' : 'itens urgentes'}`)
      : el('p', { class: 'texto-legenda' }, 'Sem itens urgentes'),
    el('a', { class: 'botao botao-secundario', href: url('ong', { id: ong.id_ong }), 'aria-label': `Ver necessidades de ${ong.nome}` }, 'Ver necessidades'));
}

/* Cartão de campanha emergencial com progresso e botão "Ver campanha" */
export function cartaoCampanha(campanha, nivelTitulo = 'h3') {
  const progresso = progressoDaCampanha(campanha.id_campanha);
  return el('article', { class: 'cartao cartao-campanha' },
    el('div', {}, seloEmergencia()),
    el(nivelTitulo, {}, campanha.titulo),
    el('p', {}, campanha.descricao),
    el('div', { class: 'linha' },
      el('span', { class: 'meta-linha' }, icone('pin', 14), `${textoCidades(campanha.id_campanha)} · ${ROTULO_TIPO_CAMPANHA[campanha.tipo]}`),
      el('span', { class: 'meta-linha' }, icone('clock', 14), `Arrecadação até ${formatarData(campanha.data_fim)}`)),
    barraProgresso('Meta da campanha', `${progresso}% atingida`, progresso),
    el('a', { class: 'botao botao-primario', href: url('campanha', { id: campanha.id_campanha }), 'aria-label': `Ver campanha ${campanha.titulo}` }, 'Ver campanha'));
}
