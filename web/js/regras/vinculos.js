/*
  vinculos.js
  Para que serve: regras do vínculo entre uma necessidade de ONG e uma campanha
  (tabela campanha_necessidade): quem pode pedir, categoria compatível (RN-30), aceitar,
  recusar, remover e a escolha "aumenta a meta" (RN-33).
  Quem usa: formulário de necessidade, painel da ONG, aprovações e formulários de campanha.
  Depende de: armazenamento.js, campanhas.js e formatacao.js.

  Situações de um vínculo (coluna status): pendente (esperando aceite), aceito ou recusado.
*/

/* Funções de outros arquivos que usamos aqui */
import { tabela, buscar, removerOnde, salvar } from '../nucleo/armazenamento.js';
import { categoriasDaCampanha } from './campanhas.js';
import { hojeISO } from '../utilitarios/formatacao.js';

/* Procura o vínculo entre uma campanha e uma necessidade (ou undefined se não existir) */
export function vinculoExistente(idCampanha, idNecessidade) {
  /* find devolve o primeiro vínculo que combina as duas pontas */
  return tabela('campanha_necessidade').find((v) => v.id_campanha === idCampanha && v.id_necessidade === idNecessidade);
}

/* RN-30: a categoria da necessidade precisa ser igual à de alguma meta da campanha.
   Campanha sem metas aceita qualquer categoria. */
export function categoriaCompativel(necessidade, campanha) {
  /* Categorias que a campanha pede (as das suas metas) */
  const categorias = categoriasDaCampanha(campanha.id_campanha);
  /* Compatível se a campanha não pede categoria nenhuma, ou se pede a categoria da necessidade */
  return categorias.length === 0 || categorias.includes(necessidade.id_categoria);
}

/* O pedido só pode ser enviado se a campanha está ativa, a necessidade está ativa, a categoria combina e ainda não há vínculo */
export function podePedirVinculo(necessidade, campanha) {
  /* O && só dá verdadeiro se TODAS as condições forem verdadeiras */
  return campanha.status === 'ativa'
    && necessidade.situacao === 'ativa'
    && categoriaCompativel(necessidade, campanha)
    && !vinculoExistente(campanha.id_campanha, necessidade.id_necessidade);
}

/* Campanhas ativas para as quais a necessidade pode pedir vínculo (lista da tela "Cadastrar necessidade") */
export function campanhasCompativeis(necessidade) {
  /* Fica só com as campanhas para as quais o pedido é permitido */
  return tabela('campanha').filter((campanha) => podePedirVinculo(necessidade, campanha));
}

/*
  Cria o vínculo. RN-32: se quem pede é quem criou a campanha, o vínculo já nasce ACEITO;
  o pedido de outra ONG nasce PENDENTE e espera o aceite de quem criou a campanha.
  idOngSolicitante: id da ONG que está pedindo (null quando é o administrador).
*/
export function pedirVinculo(idCampanha, idNecessidade, idOngSolicitante) {
  /* Campanha à qual o pedido se refere */
  const campanha = buscar('campanha', idCampanha);
  /* Quem pede é o criador da campanha? (só se há ONG solicitante e ela é a dona da campanha) */
  const ehCriador = idOngSolicitante !== null && campanha.id_ong === idOngSolicitante;
  /* Acrescenta o novo vínculo na tabela (como é tabela de ligação, não tem id próprio) */
  tabela('campanha_necessidade').push({
    id_campanha: idCampanha,
    id_necessidade: idNecessidade,
    status: ehCriador ? 'aceito' : 'pendente',
    aumenta_meta: false,
    data_pedido: hojeISO()
  });
  /* Grava no localStorage */
  salvar();
}

/*
  Inclui várias necessidades de uma vez na campanha (buscador geral dos formulários de campanha).
  itens: [{ idNecessidade, aumentaMeta }]. Quem cria a campanha vincula direto: o vínculo entra ACEITO.
*/
export function incluirNecessidades(idCampanha, itens) {
  /* Para cada item da lista (já separando os dois campos) */
  itens.forEach(({ idNecessidade, aumentaMeta }) => {
    /* Já existe vínculo com essa necessidade? */
    const existente = vinculoExistente(idCampanha, idNecessidade);
    if (existente) {
      /* Existe: só atualiza para aceito e guarda a escolha "aumenta a meta" */
      existente.status = 'aceito';
      existente.aumenta_meta = aumentaMeta;
    } else {
      /* Não existe: cria o vínculo já aceito */
      tabela('campanha_necessidade').push({
        id_campanha: idCampanha,
        id_necessidade: idNecessidade,
        status: 'aceito',
        aumenta_meta: aumentaMeta,
        data_pedido: hojeISO()
      });
    }
  });
  /* Grava tudo de uma vez no fim */
  salvar();
}

/* Vínculos pendentes das campanhas criadas pela ONG (ou pelo administrador, quando idOng é null) */
export function pedidosPendentes(idOng) {
  return tabela('campanha_necessidade')
    /* Só os que esperam aceite */
    .filter((v) => v.status === 'pendente')
    /* Junta, em cada pedido, a campanha e a necessidade a que ele se refere */
    .map((vinculo) => ({
      vinculo,
      campanha: buscar('campanha', vinculo.id_campanha),
      necessidade: buscar('necessidade', vinculo.id_necessidade)
    }))
    /* Fica só com os pedidos completos e cuja campanha pertence à ONG pedida */
    .filter((item) => item.campanha && item.necessidade && item.campanha.id_ong === idOng)
    /* Acrescenta a ONG dona da necessidade ({ ...item } copia os campos e o resto acrescenta "ong") */
    .map((item) => ({ ...item, ong: buscar('ong', item.necessidade.id_ong) }));
}

/* RN-33: quem criou a campanha aceita o pedido e decide se a necessidade aumenta a meta */
export function aceitarVinculo(idCampanha, idNecessidade, aumentaMeta) {
  /* Acha o vínculo; se não existe, não há o que aceitar */
  const vinculo = vinculoExistente(idCampanha, idNecessidade);
  if (!vinculo) return;
  /* Marca como aceito e guarda a escolha */
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
  /* Apaga da tabela os registros que combinam com a campanha e a necessidade */
  removerOnde('campanha_necessidade', (v) => v.id_campanha === idCampanha && v.id_necessidade === idNecessidade);
}
