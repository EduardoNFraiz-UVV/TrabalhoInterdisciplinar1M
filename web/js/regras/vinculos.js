/*
  vinculos.js
  Para que serve: regras do vínculo entre uma necessidade de ONG e uma campanha
  (tabela campanha_necessidade): quem pode pedir, categoria compatível (RN-30), aceitar,
  recusar, remover e a escolha "aumenta a meta" (RN-33).
  Quem usa: formulário de necessidade, painel da ONG, aprovações e formulários de campanha.
  Depende de: armazenamento.js, campanhas.js e formatacao.js.
*/

import { tabela, buscar, removerOnde, salvar } from '../nucleo/armazenamento.js';
import { categoriasDaCampanha } from './campanhas.js';
import { hojeISO } from '../utilitarios/formatacao.js';

/* Procura o vínculo entre uma campanha e uma necessidade (ou undefined se não existir) */
export function vinculoExistente(idCampanha, idNecessidade) {
  return tabela('campanha_necessidade').find((v) => v.id_campanha === idCampanha && v.id_necessidade === idNecessidade);
}

/* RN-30: a categoria da necessidade precisa ser igual à de alguma meta da campanha.
   Campanha sem metas aceita qualquer categoria. */
export function categoriaCompativel(necessidade, campanha) {
  const categorias = categoriasDaCampanha(campanha.id_campanha);
  return categorias.length === 0 || categorias.includes(necessidade.id_categoria);
}

/* O pedido só pode ser enviado se a campanha está ativa, a necessidade está ativa, a categoria combina e ainda não há vínculo */
export function podePedirVinculo(necessidade, campanha) {
  return campanha.status === 'ativa'
    && necessidade.situacao === 'ativa'
    && categoriaCompativel(necessidade, campanha)
    && !vinculoExistente(campanha.id_campanha, necessidade.id_necessidade);
}

/* Campanhas ativas para as quais a necessidade pode pedir vínculo (lista da tela "Cadastrar necessidade") */
export function campanhasCompativeis(necessidade) {
  return tabela('campanha').filter((campanha) => podePedirVinculo(necessidade, campanha));
}

/*
  Cria o vínculo. RN-32: se quem pede é quem criou a campanha, o vínculo já nasce ACEITO;
  o pedido de outra ONG nasce PENDENTE e espera o aceite de quem criou a campanha.
  idOngSolicitante: id da ONG que está pedindo (null quando é o administrador).
*/
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

/*
  Inclui várias necessidades de uma vez na campanha (buscador geral dos formulários de campanha).
  itens: [{ idNecessidade, aumentaMeta }]. Quem cria a campanha vincula direto: o vínculo entra ACEITO.
*/
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

/* Vínculos pendentes das campanhas criadas pela ONG (ou pelo administrador, quando idOng é null) */
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

/* RN-33: quem criou a campanha aceita o pedido e decide se a necessidade aumenta a meta */
export function aceitarVinculo(idCampanha, idNecessidade, aumentaMeta) {
  const vinculo = vinculoExistente(idCampanha, idNecessidade);
  if (!vinculo) return;
  vinculo.status = 'aceito';
  vinculo.aumenta_meta = aumentaMeta;
  salvar();
}

/* RN-34: recusar. O vínculo recusado não conta na meta nem no progresso */
export function recusarVinculo(idCampanha, idNecessidade) {
  const vinculo = vinculoExistente(idCampanha, idNecessidade);
  if (!vinculo) return;
  vinculo.status = 'recusado';
  salvar();
}

/* RN-34: remover o vínculo (a ONG desvincula as próprias necessidades; o administrador modera qualquer um) */
export function removerVinculo(idCampanha, idNecessidade) {
  removerOnde('campanha_necessidade', (v) => v.id_campanha === idCampanha && v.id_necessidade === idNecessidade);
}
