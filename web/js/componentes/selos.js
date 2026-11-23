import { el } from '../utilitarios/dom.js';
import { icone } from './icones.js';
import { ROTULO_STATUS_DOACAO, ROTULO_SITUACAO_CAMPANHA } from '../utilitarios/formatacao.js';

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

export function selo(tipo, texto) {
  return el('span', { class: `selo selo-${tipo}` }, icone(ICONE_POR_SELO[tipo] ?? 'info', 14), texto);
}

export function seloStatusDoacao(status) {
  return selo(status, ROTULO_STATUS_DOACAO[status]);
}

export function seloPrioridade(prioridade) {
  return selo(prioridade, prioridade === 'urgente' ? 'URGENTE' : 'NORMAL');
}

export function seloSituacaoCampanha(status) {
  return selo(status, ROTULO_SITUACAO_CAMPANHA[status]);
}

export function seloVinculo(status) {
  const texto = { pendente: 'Aguardando aceite', aceito: 'Aceito', recusado: 'Recusado' }[status];
  return selo(status, texto);
}

export function seloVerificada() {
  return selo('verificada', 'ONG verificada');
}

export function seloEmergencia() {
  return selo('emergencia', 'Emergência');
}

export function seloUsuario(ativo) {
  return ativo ? selo('ativa', 'Ativo') : selo('bloqueado', 'Bloqueado');
}
