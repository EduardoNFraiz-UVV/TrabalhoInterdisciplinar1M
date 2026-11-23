import { tabela, buscar, inserir, atualizar, removerOnde } from '../nucleo/armazenamento.js';
import { percentual } from '../utilitarios/formatacao.js';
import { somarQuantidades, semRepetidos } from '../utilitarios/listas.js';
import { recebido } from './necessidades.js';

export function metasDaCampanha(idCampanha) {
  return tabela('campanha_meta').filter((m) => m.id_campanha === idCampanha);
}

export function cidadesDaCampanha(idCampanha) {
  return tabela('campanha_cidade')
    .filter((cc) => cc.id_campanha === idCampanha)
    .map((cc) => buscar('cidade', cc.id_cidade))
    .filter(Boolean);
}

export function textoCidades(idCampanha) {
  const nomes = cidadesDaCampanha(idCampanha).map((c) => c.nome);
  if (nomes.length <= 1) return nomes.join('');
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

export function ongCriadora(campanha) {
  return campanha.id_ong ? buscar('ong', campanha.id_ong) : null;
}

export function nomeCriador(campanha) {
  return ongCriadora(campanha)?.nome ?? 'Administração';
}

export function campanhasAtivas() {
  return tabela('campanha').filter((c) => c.status === 'ativa');
}

export function categoriasDaCampanha(idCampanha) {
  return semRepetidos(metasDaCampanha(idCampanha).map((m) => m.id_categoria));
}

export function vinculosAceitos(idCampanha) {
  return tabela('campanha_necessidade')
    .filter((v) => v.id_campanha === idCampanha && v.status === 'aceito')
    .map((vinculo) => {
      const necessidade = buscar('necessidade', vinculo.id_necessidade);
      return { vinculo, necessidade, ong: necessidade ? buscar('ong', necessidade.id_ong) : null };
    })
    .filter((item) => item.necessidade);
}

export function metaTotal(idCampanha) {
  const gerais = somarQuantidades(metasDaCampanha(idCampanha));
  const necessidadesQueAumentam = vinculosAceitos(idCampanha)
    .filter((item) => item.vinculo.aumenta_meta)
    .map((item) => item.necessidade);
  return gerais + somarQuantidades(necessidadesQueAumentam);
}

export function recebidoDaMeta(idMeta) {
  const recebidas = tabela('doacao').filter((d) => d.id_meta === idMeta && d.status === 'recebida');
  return somarQuantidades(recebidas);
}

export function faltamDaMeta(meta) {
  const doacoesDaMeta = tabela('doacao')
    .filter((d) => d.id_meta === meta.id_meta && ['oferecida', 'aceita', 'recebida'].includes(d.status));
  return Math.max(0, meta.quantidade - somarQuantidades(doacoesDaMeta));
}

export function recebidoDaCampanha(idCampanha) {
  let nasMetas = 0;
  for (const meta of metasDaCampanha(idCampanha)) {
    nasMetas += recebidoDaMeta(meta.id_meta);
  }
  let nasNecessidades = 0;
  for (const item of vinculosAceitos(idCampanha)) {
    nasNecessidades += recebido(item.necessidade.id_necessidade);
  }
  return nasMetas + nasNecessidades;
}

export function progressoDaCampanha(idCampanha) {
  return percentual(recebidoDaCampanha(idCampanha), metaTotal(idCampanha));
}

export function quantidadeDeOngs(idCampanha) {
  return semRepetidos(vinculosAceitos(idCampanha).map((item) => item.ong?.id_ong)).length;
}

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

  const idsMantidos = metas.filter((m) => m.id_meta).map((m) => m.id_meta);
  removerOnde('campanha_meta', (m) => m.id_campanha === campanha.id_campanha
    && !idsMantidos.includes(m.id_meta)
    && !tabela('doacao').some((d) => d.id_meta === m.id_meta));
  metas.forEach((meta) => {
    if (meta.id_meta) {
      atualizar('campanha_meta', meta.id_meta, { id_categoria: meta.id_categoria, item: meta.item, quantidade: meta.quantidade, unidade: meta.unidade });
    } else {
      inserir('campanha_meta', { id_campanha: campanha.id_campanha, id_categoria: meta.id_categoria, item: meta.item, quantidade: meta.quantidade, unidade: meta.unidade });
    }
  });
  return campanha;
}

export function aprovarCampanha(idCampanha) {
  atualizar('campanha', idCampanha, { status: 'ativa' });
}

export function encerrarCampanha(idCampanha) {
  atualizar('campanha', idCampanha, { status: 'encerrada' });
}

export function reabrirCampanha(idCampanha) {
  atualizar('campanha', idCampanha, { status: 'ativa' });
}

export function recusarCampanha(idCampanha) {
  removerOnde('campanha_cidade', (cc) => cc.id_campanha === idCampanha);
  removerOnde('campanha_necessidade', (v) => v.id_campanha === idCampanha);
  removerOnde('campanha_meta', (m) => m.id_campanha === idCampanha);
  removerOnde('campanha', (c) => c.id_campanha === idCampanha);
}
