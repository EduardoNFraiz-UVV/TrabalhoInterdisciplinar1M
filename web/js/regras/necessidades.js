/*
  necessidades.js
  Para que serve: regras das necessidades das ONGs: quanto já foi prometido e quanto falta
  (RN-16), listagens, vínculos com campanhas e exclusão.
  Quem usa: páginas de ONG, do doador e do administrador.
  Depende de: armazenamento.js.
*/

import { tabela, buscar, atualizar, remover, removerOnde } from '../nucleo/armazenamento.js';
import { hojeISO } from '../utilitarios/formatacao.js';

/* Status de doação que "prometem" itens: oferecida, aceita e recebida (RN-16) */
const STATUS_QUE_PROMETEM = ['oferecida', 'aceita', 'recebida'];

/* RN-16: Prometido = soma das quantidades das doações oferecidas, aceitas e recebidas da necessidade */
export function prometido(idNecessidade) {
  return tabela('doacao')
    .filter((d) => d.id_necessidade === idNecessidade && STATUS_QUE_PROMETEM.includes(d.status))
    .reduce((soma, d) => soma + d.quantidade, 0);
}

/* Quantidade que já chegou (só doações recebidas) */
export function recebido(idNecessidade) {
  return tabela('doacao')
    .filter((d) => d.id_necessidade === idNecessidade && d.status === 'recebida')
    .reduce((soma, d) => soma + d.quantidade, 0);
}

/* RN-16: Faltam = quantidade pedida menos o prometido (nunca negativo) */
export function faltam(necessidade) {
  return Math.max(0, necessidade.quantidade - prometido(necessidade.id_necessidade));
}

/* Todas as necessidades de uma ONG */
export function necessidadesDaOng(idOng) {
  return tabela('necessidade').filter((n) => n.id_ong === idOng);
}

/* Necessidades ativas (RN-14: concluída não recebe doação) de ONGs verificadas, em ordem: urgentes primeiro (RN-13) */
export function necessidadesAtivas() {
  const ongsVerificadas = new Set(tabela('ong').filter((o) => o.verificada).map((o) => o.id_ong));
  return tabela('necessidade')
    .filter((n) => n.situacao === 'ativa' && ongsVerificadas.has(n.id_ong))
    .sort(ordemPorUrgencia);
}

/* Função de ordenação: urgente antes de normal e, dentro do mesmo grupo, a mais recente primeiro */
export function ordemPorUrgencia(a, b) {
  if (a.prioridade !== b.prioridade) return a.prioridade === 'urgente' ? -1 : 1;
  return b.data_atualizacao.localeCompare(a.data_atualizacao);
}

/* Quantas necessidades urgentes e ainda não completas uma ONG tem (mostrado no card da ONG) */
export function itensUrgentes(idOng) {
  return necessidadesDaOng(idOng).filter((n) => n.situacao === 'ativa' && n.prioridade === 'urgente' && faltam(n) > 0).length;
}

/* Vínculos de uma necessidade com campanhas: devolve [{ vinculo, campanha }] */
export function vinculosDaNecessidade(idNecessidade) {
  return tabela('campanha_necessidade')
    .filter((v) => v.id_necessidade === idNecessidade)
    .map((vinculo) => ({ vinculo, campanha: buscar('campanha', vinculo.id_campanha) }));
}

/* Marca a necessidade como concluída (ela não recebe mais doações) */
export function concluirNecessidade(idNecessidade) {
  atualizar('necessidade', idNecessidade, { situacao: 'concluida', data_atualizacao: hojeISO() });
}

/*
  Exclui uma necessidade (RN-15). As doações já oferecidas ou aceitas são recusadas com uma
  mensagem, para o doador ser avisado. Se existirem doações JÁ RECEBIDAS, a necessidade não pode
  sumir do histórico: ela é marcada como concluída. Devolve 'excluida' ou 'concluida'.
*/
export function excluirNecessidade(idNecessidade) {
  const doacoes = tabela('doacao').filter((d) => d.id_necessidade === idNecessidade);
  doacoes
    .filter((d) => d.status === 'oferecida' || d.status === 'aceita')
    .forEach((d) => atualizar('doacao', d.id_doacao, { status: 'recusada', mensagem_ong: 'A ONG removeu esta necessidade.' }));

  /* Os vínculos com campanhas saem junto (a necessidade deixa de existir nelas) */
  removerOnde('campanha_necessidade', (v) => v.id_necessidade === idNecessidade);

  if (doacoes.some((d) => d.status === 'recebida')) {
    concluirNecessidade(idNecessidade);
    return 'concluida';
  }
  /* Sem nenhuma doação recebida, as doações restantes (recusadas, canceladas) também saem */
  removerOnde('doacao', (d) => d.id_necessidade === idNecessidade);
  remover('necessidade', idNecessidade);
  return 'excluida';
}
