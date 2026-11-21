/*
  doacoes.js
  Para que serve: regras das doações: validar e registrar (RN-35 a RN-39), o fluxo de status
  (RN-40 e RN-41), e funções que descobrem "para onde vai" cada doação e quem a recebe.
  Quem usa: telas do doador (registrar, minhas doações), da ONG (doações recebidas) e do administrador.
  Depende de: armazenamento.js, necessidades.js, campanhas.js, validacoes.js e formatacao.js.
*/

import { tabela, buscar, inserir, atualizar } from '../nucleo/armazenamento.js';
import { faltam } from './necessidades.js';
import { faltamDaMeta, ongCriadora } from './campanhas.js';
import { inteiroPositivo, obrigatorio, dataDeHojeEmDiante } from './validacoes.js';
import { hojeISO, formatarQuantidade } from '../utilitarios/formatacao.js';

/* RN-40: transições permitidas. De "oferecida" pode ir para aceita, recusada ou cancelada (só o doador);
   de "aceita" pode ir para recebida ou recusada. "recebida", "recusada" e "cancelada" são finais. */
const TRANSICOES = {
  oferecida: ['aceita', 'recusada', 'cancelada'],
  aceita: ['recebida', 'recusada'],
  recebida: [],
  recusada: [],
  cancelada: []
};

/* Primeira letra maiúscula: 'água potável' vira 'Água potável' */
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/*
  Descobre tudo sobre o destino de uma doação, de um jeito único para as telas.
  Doação para NECESSIDADE: entrega no endereço da ONG dona (RN-37).
  Doação para META: entrega no endereço de recebimento da campanha (RN-38).
*/
export function detalharDoacao(doacao) {
  if (doacao.id_meta) {
    const meta = buscar('campanha_meta', doacao.id_meta);
    const campanha = buscar('campanha', meta.id_campanha);
    const ong = ongCriadora(campanha);
    return {
      tipo: 'meta',
      item: `${capitalizar(meta.item)} (meta)`,
      unidade: 'itens',
      idCategoria: meta.id_categoria,
      meta,
      campanha,
      ong,
      destino: `Campanha: ${campanha.titulo}`,
      origem: `Campanha: ${campanha.titulo}`,
      endereco: campanha.endereco_recebimento,
      horario: campanha.horario_recebimento,
      contato: ong ? `${ong.telefone} · ${ong.email_contato}` : 'Administração da plataforma',
      quemRecebe: ong ? ong.nome : 'Administração'
    };
  }
  const necessidade = buscar('necessidade', doacao.id_necessidade);
  const ong = buscar('ong', necessidade.id_ong);
  return {
    tipo: 'necessidade',
    item: necessidade.item,
    unidade: necessidade.unidade,
    idCategoria: necessidade.id_categoria,
    necessidade,
    campanha: null,
    ong,
    destino: ong.nome,
    origem: 'Minhas necessidades',
    endereco: ong.endereco,
    horario: ong.horario_atendimento,
    contato: `${ong.telefone} · ${ong.email_contato}`,
    quemRecebe: ong.nome
  };
}

/* Quantidade da doação com a unidade do destino: "5 un." */
export function quantidadeComUnidade(doacao) {
  return formatarQuantidade(doacao.quantidade, detalharDoacao(doacao).unidade);
}

/*
  Valida os dados de uma nova doação e devolve um objeto de erros { campo: 'mensagem' }.
  Objeto vazio = tudo certo. Regras: RN-14 e RN-42 (destino aberto), RN-39 (quantidade),
  RN-37 e RN-38 (forma de entrega) e data prevista de hoje em diante.
  dados: { idNecessidade, idMeta, quantidade, forma, enderecoRetirada, dataPrevista }
*/
export function validarDoacao(dados) {
  const erros = {};
  const ehMeta = Boolean(dados.idMeta);

  /* Destino precisa estar aberto para receber doações */
  if (ehMeta) {
    const meta = buscar('campanha_meta', dados.idMeta);
    const campanha = buscar('campanha', meta.id_campanha);
    if (campanha.status !== 'ativa') erros.geral = 'Esta campanha não está ativa e não recebe novas doações.';
  } else {
    const necessidade = buscar('necessidade', dados.idNecessidade);
    if (necessidade.situacao !== 'ativa') erros.geral = 'Esta necessidade já foi concluída e não recebe novas doações.';
  }

  /* RN-39: quantidade maior que zero e que não passe do que falta */
  const faltaAgora = ehMeta
    ? faltamDaMeta(buscar('campanha_meta', dados.idMeta))
    : faltam(buscar('necessidade', dados.idNecessidade));
  if (!inteiroPositivo(dados.quantidade)) {
    erros.quantidade = 'Informe uma quantidade maior que zero, só com números inteiros.';
  } else if (Number(dados.quantidade) > faltaAgora) {
    erros.quantidade = faltaAgora > 0
      ? `Esta quantidade passa do que falta. Informe no máximo ${faltaAgora}.`
      : 'Já foi prometido tudo o que este item pedia. Escolha outro item.';
  }

  /* RN-37 e RN-38: forma de entrega */
  if (ehMeta && dados.forma !== 'levar') {
    erros.forma = 'Doações para campanhas só aceitam entrega no endereço de recebimento.';
  } else if (!['levar', 'retirada'].includes(dados.forma)) {
    erros.forma = 'Escolha como a doação vai chegar.';
  } else if (dados.forma === 'retirada') {
    const ong = buscar('ong', buscar('necessidade', dados.idNecessidade).id_ong);
    if (!ong.aceita_retirada) erros.forma = 'Esta ONG não faz retirada no endereço do doador. Escolha levar até a ONG.';
    else if (!obrigatorio(dados.enderecoRetirada)) erros.enderecoRetirada = 'Informe o endereço onde a ONG deve retirar a doação.';
  }

  if (!dataDeHojeEmDiante(dados.dataPrevista)) erros.dataPrevista = 'Escolha uma data de hoje em diante.';
  return erros;
}

/* Registra a doação (sempre com status "oferecida") e devolve o registro criado */
export function registrarDoacao(dados) {
  return inserir('doacao', {
    id_doador: dados.idDoador,
    id_necessidade: dados.idMeta ? null : dados.idNecessidade,
    id_meta: dados.idMeta ?? null,
    quantidade: Number(dados.quantidade),
    observacao: dados.observacao?.trim() || null,
    forma_entrega: dados.forma,
    endereco_retirada: dados.forma === 'retirada' ? dados.enderecoRetirada.trim() : null,
    data_prevista: dados.dataPrevista,
    data_registro: hojeISO(),
    data_recebimento: null,
    status: 'oferecida',
    mensagem_ong: null
  });
}

/* Confere se a mudança de status é permitida pelo fluxo (RN-40) */
export function podeMudarPara(doacao, novoStatus) {
  return TRANSICOES[doacao.status].includes(novoStatus);
}

/*
  Muda o status da doação seguindo o fluxo.
  RN-41: ao virar "recebida" grava a data de recebimento; nos outros status a data fica vazia.
  mensagem: texto opcional da ONG ao aceitar ou recusar (RN-42).
*/
export function mudarStatus(idDoacao, novoStatus, mensagem = null) {
  const doacao = buscar('doacao', idDoacao);
  if (!doacao || !podeMudarPara(doacao, novoStatus)) return false;
  atualizar('doacao', idDoacao, {
    status: novoStatus,
    data_recebimento: novoStatus === 'recebida' ? hojeISO() : null,
    mensagem_ong: mensagem ? mensagem.trim() : doacao.mensagem_ong
  });
  return true;
}

/* Doações feitas por um doador, da mais recente para a mais antiga */
export function doacoesDoDoador(idDoador) {
  return tabela('doacao')
    .filter((d) => d.id_doador === idDoador)
    .sort((a, b) => b.data_registro.localeCompare(a.data_registro) || b.id_doacao - a.id_doacao);
}

/* Doações que uma ONG recebe: nas suas necessidades e nas metas das campanhas que ela criou */
export function doacoesDaOng(idOng) {
  const necessidadesDaOng = new Set(tabela('necessidade').filter((n) => n.id_ong === idOng).map((n) => n.id_necessidade));
  const campanhasDaOng = new Set(tabela('campanha').filter((c) => c.id_ong === idOng).map((c) => c.id_campanha));
  const metasDaOng = new Set(tabela('campanha_meta').filter((m) => campanhasDaOng.has(m.id_campanha)).map((m) => m.id_meta));
  return tabela('doacao')
    .filter((d) => necessidadesDaOng.has(d.id_necessidade) || metasDaOng.has(d.id_meta))
    .sort((a, b) => b.data_registro.localeCompare(a.data_registro) || b.id_doacao - a.id_doacao);
}

/* Doações às metas das campanhas criadas pela administração (tela "Doações das campanhas") */
export function doacoesDasCampanhasDoAdmin() {
  const campanhasDoAdmin = new Set(tabela('campanha').filter((c) => c.id_ong === null).map((c) => c.id_campanha));
  const metas = new Set(tabela('campanha_meta').filter((m) => campanhasDoAdmin.has(m.id_campanha)).map((m) => m.id_meta));
  return tabela('doacao')
    .filter((d) => metas.has(d.id_meta))
    .sort((a, b) => b.data_registro.localeCompare(a.data_registro) || b.id_doacao - a.id_doacao);
}

/* Conta as doações por status: { oferecida: 2, aceita: 1, ... } */
export function contarPorStatus(doacoes) {
  const contagem = { oferecida: 0, aceita: 0, recebida: 0, recusada: 0, cancelada: 0 };
  doacoes.forEach((d) => { contagem[d.status] += 1; });
  return contagem;
}
