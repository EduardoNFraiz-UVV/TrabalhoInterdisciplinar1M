/*
  campanhas.js
  Para que serve: regras das campanhas: metas, cidades, quem criou, meta total e progresso
  (RN-26 e RN-27), além de criar, editar, aprovar, encerrar e reabrir campanhas.
  Quem usa: páginas de campanha, painéis e telas de aprovação.
  Depende de: armazenamento.js, necessidades.js e formatacao.js.
*/

import { tabela, buscar, inserir, atualizar, removerOnde } from '../nucleo/armazenamento.js';
import { percentual } from '../utilitarios/formatacao.js';

/* Metas gerais de uma campanha (campanha_meta) */
export function metasDaCampanha(idCampanha) {
  return tabela('campanha_meta').filter((m) => m.id_campanha === idCampanha);
}

/* Cidades atingidas pela campanha (campanha_cidade), já como registros da tabela cidade */
export function cidadesDaCampanha(idCampanha) {
  return tabela('campanha_cidade')
    .filter((cc) => cc.id_campanha === idCampanha)
    .map((cc) => buscar('cidade', cc.id_cidade))
    .filter(Boolean);
}

/* Texto com as cidades: "Vila Velha e Cariacica" ou "Vila Velha, Cariacica e Viana" */
export function textoCidades(idCampanha) {
  const nomes = cidadesDaCampanha(idCampanha).map((c) => c.nome);
  if (nomes.length <= 1) return nomes.join('');
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

/* ONG que criou a campanha, ou null se foi o administrador (id_ong vazio) */
export function ongCriadora(campanha) {
  return campanha.id_ong ? buscar('ong', campanha.id_ong) : null;
}

/* Nome de quem criou: nome da ONG ou "Administração" */
export function nomeCriador(campanha) {
  return ongCriadora(campanha)?.nome ?? 'Administração';
}

/* Campanhas ativas (RN-20: só elas aparecem para doadores e visitantes) */
export function campanhasAtivas() {
  return tabela('campanha').filter((c) => c.status === 'ativa');
}

/* Categorias que a campanha pede (as categorias das suas metas) */
export function categoriasDaCampanha(idCampanha) {
  return [...new Set(metasDaCampanha(idCampanha).map((m) => m.id_categoria))];
}

/* Vínculos aceitos da campanha: [{ vinculo, necessidade, ong }] */
export function vinculosAceitos(idCampanha) {
  return tabela('campanha_necessidade')
    .filter((v) => v.id_campanha === idCampanha && v.status === 'aceito')
    .map((vinculo) => {
      const necessidade = buscar('necessidade', vinculo.id_necessidade);
      return { vinculo, necessidade, ong: necessidade ? buscar('ong', necessidade.id_ong) : null };
    })
    .filter((item) => item.necessidade);
}

/* RN-26: Meta total = soma das metas gerais + soma das necessidades aceitas com "aumenta a meta" */
export function metaTotal(idCampanha) {
  const gerais = metasDaCampanha(idCampanha).reduce((soma, m) => soma + m.quantidade, 0);
  const aumentos = vinculosAceitos(idCampanha)
    .filter((item) => item.vinculo.aumenta_meta)
    .reduce((soma, item) => soma + item.necessidade.quantidade, 0);
  return gerais + aumentos;
}

/* Quantidade recebida por uma meta geral (doações recebidas com id_meta igual) */
export function recebidoDaMeta(idMeta) {
  return tabela('doacao')
    .filter((d) => d.id_meta === idMeta && d.status === 'recebida')
    .reduce((soma, d) => soma + d.quantidade, 0);
}

/* Quanto falta para uma meta geral, contando também o que já foi oferecido e aceito */
export function faltamDaMeta(meta) {
  const prometidoMeta = tabela('doacao')
    .filter((d) => d.id_meta === meta.id_meta && ['oferecida', 'aceita', 'recebida'].includes(d.status))
    .reduce((soma, d) => soma + d.quantidade, 0);
  return Math.max(0, meta.quantidade - prometidoMeta);
}

/* RN-27: quantidade recebida = metas gerais + necessidades vinculadas aceitas */
export function recebidoDaCampanha(idCampanha) {
  const nasMetas = metasDaCampanha(idCampanha).reduce((soma, m) => soma + recebidoDaMeta(m.id_meta), 0);
  const nasNecessidades = vinculosAceitos(idCampanha).reduce((soma, item) => {
    return soma + tabela('doacao')
      .filter((d) => d.id_necessidade === item.necessidade.id_necessidade && d.status === 'recebida')
      .reduce((s, d) => s + d.quantidade, 0);
  }, 0);
  return nasMetas + nasNecessidades;
}

/* RN-27: progresso = recebido ÷ meta total, de 0 a 100 (sem meta total, 0%) */
export function progressoDaCampanha(idCampanha) {
  return percentual(recebidoDaCampanha(idCampanha), metaTotal(idCampanha));
}

/* Quantidade de ONGs diferentes que têm necessidades aceitas na campanha */
export function quantidadeDeOngs(idCampanha) {
  return new Set(vinculosAceitos(idCampanha).map((item) => item.ong?.id_ong)).size;
}

/*
  Cria ou atualiza uma campanha com cidades e metas.
  dados: { id_campanha (opcional, para editar), id_ong, titulo, descricao, tipo, data_inicio, data_fim,
           status, endereco_recebimento, horario_recebimento, cidades: [ids], metas: [{id_categoria, item, quantidade}] }
  Devolve o registro da campanha.
*/
export function salvarCampanha(dados) {
  const { cidades, metas, ...campos } = dados;
  let campanha;
  if (dados.id_campanha) {
    campanha = atualizar('campanha', dados.id_campanha, campos);
    removerOnde('campanha_cidade', (cc) => cc.id_campanha === campanha.id_campanha);
  } else {
    campanha = inserir('campanha', campos);
  }
  cidades.forEach((idCidade) => inserir('campanha_cidade', { id_campanha: campanha.id_campanha, id_cidade: idCidade }));

  /* Metas: as que já existem (têm id_meta) são atualizadas; as novas são inseridas; as removidas na tela saem */
  const idsMantidos = metas.filter((m) => m.id_meta).map((m) => m.id_meta);
  removerOnde('campanha_meta', (m) => m.id_campanha === campanha.id_campanha
    && !idsMantidos.includes(m.id_meta)
    && !tabela('doacao').some((d) => d.id_meta === m.id_meta));
  metas.forEach((meta) => {
    if (meta.id_meta) {
      atualizar('campanha_meta', meta.id_meta, { id_categoria: meta.id_categoria, item: meta.item, quantidade: meta.quantidade });
    } else {
      inserir('campanha_meta', { id_campanha: campanha.id_campanha, id_categoria: meta.id_categoria, item: meta.item, quantidade: meta.quantidade });
    }
  });
  return campanha;
}

/* RN-19: o administrador aprova (pendente vira ativa), encerra e reabre campanhas */
export function aprovarCampanha(idCampanha) {
  atualizar('campanha', idCampanha, { status: 'ativa' });
}

export function encerrarCampanha(idCampanha) {
  atualizar('campanha', idCampanha, { status: 'encerrada' });
}

export function reabrirCampanha(idCampanha) {
  atualizar('campanha', idCampanha, { status: 'ativa' });
}

/* Recusar um pedido de campanha: ela é removida, junto com cidades, metas e vínculos */
export function recusarCampanha(idCampanha) {
  removerOnde('campanha_cidade', (cc) => cc.id_campanha === idCampanha);
  removerOnde('campanha_necessidade', (v) => v.id_campanha === idCampanha);
  removerOnde('campanha_meta', (m) => m.id_campanha === idCampanha);
  removerOnde('campanha', (c) => c.id_campanha === idCampanha);
}
