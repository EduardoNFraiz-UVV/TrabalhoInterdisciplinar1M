import { tabela, buscar, removerOnde, salvar } from '../nucleo/armazenamento.js';
import { categoriasDaCampanha } from './campanhas.js';
import { hojeISO } from '../utilitarios/formatacao.js';

export function vinculoExistente(idCampanha, idNecessidade) {
  return tabela('campanha_necessidade').find((v) => v.id_campanha === idCampanha && v.id_necessidade === idNecessidade);
}

export function categoriaCompativel(necessidade, campanha) {
  const categorias = categoriasDaCampanha(campanha.id_campanha);
  return categorias.length === 0 || categorias.includes(necessidade.id_categoria);
}

export function podePedirVinculo(necessidade, campanha) {
  return campanha.status === 'ativa'
    && necessidade.situacao === 'ativa'
    && categoriaCompativel(necessidade, campanha)
    && !vinculoExistente(campanha.id_campanha, necessidade.id_necessidade);
}

export function campanhasCompativeis(necessidade) {
  return tabela('campanha').filter((campanha) => podePedirVinculo(necessidade, campanha));
}

export function pedirVinculo(idCampanha, idNecessidade, idOngSolicitante) {
  const campanha = buscar('campanha', idCampanha);
  const ehCriador = idOngSolicitante !== null && campanha.id_ong === idOngSolicitante;
  tabela('campanha_necessidade').push({
    id_campanha: idCampanha,
    id_necessidade: idNecessidade,
    status: ehCriador ? 'aceito' : 'pendente',
    aumenta_meta: false,
    data_pedido: hojeISO()
  });
  salvar();
}

export function incluirNecessidades(idCampanha, itens) {
  itens.forEach(({ idNecessidade, aumentaMeta }) => {
    const existente = vinculoExistente(idCampanha, idNecessidade);
    if (existente) {
      existente.status = 'aceito';
      existente.aumenta_meta = aumentaMeta;
    } else {
      tabela('campanha_necessidade').push({
        id_campanha: idCampanha,
        id_necessidade: idNecessidade,
        status: 'aceito',
        aumenta_meta: aumentaMeta,
        data_pedido: hojeISO()
      });
    }
  });
  salvar();
}

export function pedidosPendentes(idOng) {
  return tabela('campanha_necessidade')
    .filter((v) => v.status === 'pendente')
    .map((vinculo) => ({
      vinculo,
      campanha: buscar('campanha', vinculo.id_campanha),
      necessidade: buscar('necessidade', vinculo.id_necessidade)
    }))
    .filter((item) => item.campanha && item.necessidade && item.campanha.id_ong === idOng)
    .map((item) => ({ ...item, ong: buscar('ong', item.necessidade.id_ong) }));
}

export function aceitarVinculo(idCampanha, idNecessidade, aumentaMeta) {
  const vinculo = vinculoExistente(idCampanha, idNecessidade);
  if (!vinculo) return;
  vinculo.status = 'aceito';
  vinculo.aumenta_meta = aumentaMeta;
  salvar();
}

export function recusarVinculo(idCampanha, idNecessidade) {
  const vinculo = vinculoExistente(idCampanha, idNecessidade);
  if (!vinculo) return;
  vinculo.status = 'recusado';
  salvar();
}

export function removerVinculo(idCampanha, idNecessidade) {
  removerOnde('campanha_necessidade', (v) => v.id_campanha === idCampanha && v.id_necessidade === idNecessidade);
}
