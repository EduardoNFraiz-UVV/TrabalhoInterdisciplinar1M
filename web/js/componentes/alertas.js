/*
  alertas.js
  Para que serve: cria caixas de aviso (sucesso, erro, aviso, informação), cada uma com ícone,
  título e detalhe, e funções para mostrá-las dentro de uma área da página.
  Quem usa: formulários e páginas que avisam o resultado de uma ação.
  Depende de: dom.js e icones.js. O visual está em css/componentes/alertas.css.
*/

import { el, preencher } from '../utilitarios/dom.js';
import { icone } from './icones.js';

/* Ícone de cada tipo de alerta */
const ICONE_POR_TIPO = { sucesso: 'check', erro: 'alert', aviso: 'alert', info: 'info' };

/*
  Cria o elemento do alerta.
  tipo: 'sucesso', 'erro', 'aviso' ou 'info'.
  O alerta de erro usa role="alert" (leitor de tela lê na hora); os outros usam role="status".
*/
export function alerta(tipo, titulo, detalhe = null) {
  return el('div', { class: `alerta alerta-${tipo}`, role: tipo === 'erro' ? 'alert' : 'status' },
    icone(ICONE_POR_TIPO[tipo], 20),
    el('div', {},
      el('div', { class: 'alerta-titulo' }, titulo),
      detalhe ? el('div', { class: 'alerta-detalhe' }, detalhe) : null));
}

/* Mostra um alerta dentro de uma área (substitui o que estava lá). Se a área não existir, não faz nada */
export function mostrarAlerta(area, tipo, titulo, detalhe = null) {
  if (area) preencher(area, alerta(tipo, titulo, detalhe));
}

/* Esvazia a área de alertas */
export function limparAlerta(area) {
  if (area) area.replaceChildren();
}
