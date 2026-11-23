import { tabela, buscar, atualizar, remover, removerOnde } from '../nucleo/armazenamento.js';
import { hojeISO } from '../utilitarios/formatacao.js';
import { somarQuantidades } from '../utilitarios/listas.js';

const STATUS_QUE_PROMETEM = ['oferecida', 'aceita', 'recebida'];

export function prometido(idNecessidade) {
  const doacoes = tabela('doacao')
    .filter((d) => d.id_necessidade === idNecessidade && STATUS_QUE_PROMETEM.includes(d.status));
  return somarQuantidades(doacoes);
}

export function recebido(idNecessidade) {
  const doacoes = tabela('doacao').filter((d) => d.id_necessidade === idNecessidade && d.status === 'recebida');
  return somarQuantidades(doacoes);
}

export function faltam(necessidade) {
  return Math.max(0, necessidade.quantidade - prometido(necessidade.id_necessidade));
}

export function necessidadesDaOng(idOng) {
  return tabela('necessidade').filter((n) => n.id_ong === idOng);
}

export function necessidadesAtivas() {
  const idsDasOngsVerificadas = tabela('ong').filter((o) => o.verificada).map((o) => o.id_ong);
  return tabela('necessidade')
    .filter((n) => n.situacao === 'ativa' && idsDasOngsVerificadas.includes(n.id_ong))
    .sort(ordemPorUrgencia);
}

export function ordemPorUrgencia(a, b) {
  if (a.prioridade !== b.prioridade) return a.prioridade === 'urgente' ? -1 : 1;
  return b.data_atualizacao.localeCompare(a.data_atualizacao);
}

export function itensUrgentes(idOng) {
  return necessidadesDaOng(idOng).filter((n) => n.situacao === 'ativa' && n.prioridade === 'urgente' && faltam(n) > 0).length;
}

export function vinculosDaNecessidade(idNecessidade) {
  return tabela('campanha_necessidade')
    .filter((v) => v.id_necessidade === idNecessidade)
    .map((vinculo) => ({ vinculo, campanha: buscar('campanha', vinculo.id_campanha) }));
}

export function concluirNecessidade(idNecessidade) {
  atualizar('necessidade', idNecessidade, { situacao: 'concluida', data_atualizacao: hojeISO() });
}

export function excluirNecessidade(idNecessidade) {
  const doacoes = tabela('doacao').filter((d) => d.id_necessidade === idNecessidade);
  doacoes
    .filter((d) => d.status === 'oferecida' || d.status === 'aceita')
    .forEach((d) => atualizar('doacao', d.id_doacao, { status: 'recusada', mensagem_ong: 'A ONG removeu esta necessidade.' }));

  removerOnde('campanha_necessidade', (v) => v.id_necessidade === idNecessidade);

  if (doacoes.some((d) => d.status === 'recebida')) {
    concluirNecessidade(idNecessidade);
    return 'concluida';
  }
  removerOnde('doacao', (d) => d.id_necessidade === idNecessidade);
  remover('necessidade', idNecessidade);
  return 'excluida';
}
