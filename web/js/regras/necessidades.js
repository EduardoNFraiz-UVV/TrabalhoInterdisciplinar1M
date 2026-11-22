/*
  necessidades.js
  Para que serve: regras das necessidades das ONGs: quanto já foi prometido e quanto falta
  (RN-16), listagens, vínculos com campanhas e exclusão.
  Quem usa: páginas de ONG, do doador e do administrador.
  Depende de: armazenamento.js, formatacao.js e listas.js.
*/

/* Funções de outros arquivos que usamos aqui */
import { tabela, buscar, atualizar, remover, removerOnde } from '../nucleo/armazenamento.js';
import { hojeISO } from '../utilitarios/formatacao.js';
import { somarQuantidades } from '../utilitarios/listas.js';

/* Status de doação que "prometem" itens: oferecida, aceita e recebida (RN-16) */
const STATUS_QUE_PROMETEM = ['oferecida', 'aceita', 'recebida'];

/* RN-16: Prometido = soma das quantidades das doações oferecidas, aceitas e recebidas da necessidade */
export function prometido(idNecessidade) {
  /* Doações desta necessidade cujo status está na lista dos que "prometem" */
  const doacoes = tabela('doacao')
    .filter((d) => d.id_necessidade === idNecessidade && STATUS_QUE_PROMETEM.includes(d.status));
  /* Soma as quantidades delas */
  return somarQuantidades(doacoes);
}

/* Quantidade que já chegou (só doações recebidas) */
export function recebido(idNecessidade) {
  const doacoes = tabela('doacao').filter((d) => d.id_necessidade === idNecessidade && d.status === 'recebida');
  return somarQuantidades(doacoes);
}

/* RN-16: Faltam = quantidade pedida menos o prometido (nunca negativo) */
export function faltam(necessidade) {
  /* Math.max(0, ...) impede o resultado de ficar negativo */
  return Math.max(0, necessidade.quantidade - prometido(necessidade.id_necessidade));
}

/* Todas as necessidades de uma ONG */
export function necessidadesDaOng(idOng) {
  return tabela('necessidade').filter((n) => n.id_ong === idOng);
}

/* Necessidades ativas (RN-14: concluída não recebe doação) de ONGs verificadas, em ordem: urgentes primeiro (RN-13) */
export function necessidadesAtivas() {
  /* Lista com os ids das ONGs verificadas */
  const idsDasOngsVerificadas = tabela('ong').filter((o) => o.verificada).map((o) => o.id_ong);
  return tabela('necessidade')
    /* Só as ativas, de ONGs verificadas */
    .filter((n) => n.situacao === 'ativa' && idsDasOngsVerificadas.includes(n.id_ong))
    /* Ordena com a função ordemPorUrgencia (definida logo abaixo) */
    .sort(ordemPorUrgencia);
}

/* Função de ordenação: urgente antes de normal e, dentro do mesmo grupo, a mais recente primeiro */
export function ordemPorUrgencia(a, b) {
  /* Prioridades diferentes: a urgente vem primeiro (-1 = "a" antes de "b"; 1 = "b" antes de "a") */
  if (a.prioridade !== b.prioridade) return a.prioridade === 'urgente' ? -1 : 1;
  /* Mesma prioridade: a mais recente primeiro (localeCompare compara textos 'AAAA-MM-DD') */
  return b.data_atualizacao.localeCompare(a.data_atualizacao);
}

/* Quantas necessidades urgentes e ainda não completas uma ONG tem (mostrado no card da ONG) */
export function itensUrgentes(idOng) {
  /* .length conta quantas necessidades passaram pelo filtro */
  return necessidadesDaOng(idOng).filter((n) => n.situacao === 'ativa' && n.prioridade === 'urgente' && faltam(n) > 0).length;
}

/* Vínculos de uma necessidade com campanhas: devolve [{ vinculo, campanha }] */
export function vinculosDaNecessidade(idNecessidade) {
  return tabela('campanha_necessidade')
    /* Só os vínculos desta necessidade */
    .filter((v) => v.id_necessidade === idNecessidade)
    /* Para cada um, junta também o registro da campanha */
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
  /* Todas as doações desta necessidade */
  const doacoes = tabela('doacao').filter((d) => d.id_necessidade === idNecessidade);
  doacoes
    /* As que ainda estão em andamento (oferecida ou aceita) */
    .filter((d) => d.status === 'oferecida' || d.status === 'aceita')
    /* viram "recusada", com uma mensagem para o doador */
    .forEach((d) => atualizar('doacao', d.id_doacao, { status: 'recusada', mensagem_ong: 'A ONG removeu esta necessidade.' }));

  /* Os vínculos com campanhas saem junto (a necessidade deixa de existir nelas) */
  removerOnde('campanha_necessidade', (v) => v.id_necessidade === idNecessidade);

  /* Se alguma doação já foi recebida, mantemos o histórico: só marca como concluída */
  if (doacoes.some((d) => d.status === 'recebida')) {
    concluirNecessidade(idNecessidade);
    return 'concluida';
  }
  /* Sem nenhuma doação recebida, as doações restantes (recusadas, canceladas) também saem */
  removerOnde('doacao', (d) => d.id_necessidade === idNecessidade);
  remover('necessidade', idNecessidade);
  return 'excluida';
}
