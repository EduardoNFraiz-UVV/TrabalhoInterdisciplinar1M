/*
  selos.js
  Para que serve: cria as etiquetas coloridas (selos) de status da doação, prioridade,
  situação da campanha, vínculo e "ONG verificada". Cada selo tem ícone + palavra.
  Quem usa: tabelas e cartões de várias páginas.
  Depende de: dom.js, icones.js e formatacao.js. O visual está em css/componentes/selos.css.
*/

import { el } from '../utilitarios/dom.js';
import { icone } from './icones.js';
import { ROTULO_STATUS_DOACAO, ROTULO_SITUACAO_CAMPANHA } from '../utilitarios/formatacao.js';

/* Ícone usado em cada tipo de selo (o guia exige palavra + ícone, nunca só cor) */
const ICONE_POR_SELO = {
  oferecida: 'info',
  aceita: 'clock',
  recebida: 'check',
  recusada: 'alert',
  cancelada: 'x',
  urgente: 'alert',
  normal: 'info',
  ativa: 'check',
  pendente: 'clock',
  encerrada: 'x',
  aceito: 'check',
  recusado: 'alert',
  bloqueado: 'x',
  verificada: 'verified',
  emergencia: 'alert'
};

/* Cria um selo genérico: tipo define a cor e o ícone; texto é a palavra mostrada */
export function selo(tipo, texto) {
  return el('span', { class: `selo selo-${tipo}` }, icone(ICONE_POR_SELO[tipo] ?? 'info', 14), texto);
}

/* Selo do status de uma doação: Oferecida, Aceita, Recebida, Recusada ou Cancelada */
export function seloStatusDoacao(status) {
  return selo(status, ROTULO_STATUS_DOACAO[status]);
}

/* Selo de prioridade: URGENTE ou NORMAL (em maiúsculas, como no guia) */
export function seloPrioridade(prioridade) {
  return selo(prioridade, prioridade === 'urgente' ? 'URGENTE' : 'NORMAL');
}

/* Selo de situação da campanha: Ativa, Pendente ou Encerrada */
export function seloSituacaoCampanha(status) {
  return selo(status, ROTULO_SITUACAO_CAMPANHA[status]);
}

/* Selo de situação do vínculo entre necessidade e campanha */
export function seloVinculo(status) {
  const texto = { pendente: 'Aguardando aceite', aceito: 'Aceito', recusado: 'Recusado' }[status];
  return selo(status, texto);
}

/* Selo "ONG verificada" */
export function seloVerificada() {
  return selo('verificada', 'ONG verificada');
}

/* Selo EMERGÊNCIA do card de campanha */
export function seloEmergencia() {
  return selo('emergencia', 'Emergência');
}

/* Selo de situação do usuário: Ativo ou Bloqueado */
export function seloUsuario(ativo) {
  return ativo ? selo('ativa', 'Ativo') : selo('bloqueado', 'Bloqueado');
}
