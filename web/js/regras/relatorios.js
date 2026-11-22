/*
  relatorios.js
  Para que serve: calcula os 3 relatórios do painel do administrador (RN-44), iguais às 3
  consultas do banco de dados. Só contam doações RECEBIDAS. Doação para meta entra na
  categoria da meta.
  Quem usa: painel do administrador.
  Depende de: armazenamento.js, formatacao.js e necessidades.js.
*/

/* Funções de outros arquivos que usamos aqui */
import { tabela, buscar } from '../nucleo/armazenamento.js';
import { chaveMes, ultimosMeses } from '../utilitarios/formatacao.js';
import { recebido } from './necessidades.js';

/* Categoria de uma doação: a da necessidade ou a da meta de campanha */
function categoriaDaDoacao(doacao) {
  /* Doação para meta: a categoria vem da meta */
  if (doacao.id_meta) return buscar('campanha_meta', doacao.id_meta).id_categoria;
  /* Doação para necessidade: a categoria vem da necessidade */
  return buscar('necessidade', doacao.id_necessidade).id_categoria;
}

/* Doações recebidas nos últimos N meses, já com o mês de recebimento */
function recebidasNosUltimosMeses(quantidadeMeses) {
  /* Lista dos últimos N meses no formato 'AAAA-MM' */
  const meses = ultimosMeses(quantidadeMeses);
  /* Só as doações recebidas cujo mês de recebimento está nessa lista */
  return tabela('doacao').filter((d) => d.status === 'recebida' && meses.includes(chaveMes(d.data_recebimento)));
}

/* Relatório 1: doações recebidas por mês. Devolve [{ mes: '2026-06', total: 31 }, ...] */
export function doacoesPorMes(quantidadeMeses = 6) {
  const recebidas = recebidasNosUltimosMeses(quantidadeMeses);
  /* Para cada mês da lista, conta quantas doações foram recebidas nele */
  return ultimosMeses(quantidadeMeses).map((mes) => ({
    mes,
    total: recebidas.filter((d) => chaveMes(d.data_recebimento) === mes).length
  }));
}

/*
  Relatório 2: demanda por categoria e prioridade (solicitado x recebido).
  Considera as necessidades das ONGs. Devolve uma linha por categoria com os totais de
  itens solicitados e recebidos, separados em urgente e normal, e o percentual atendido.
*/
export function demandaPorCategoria() {
  /* Uma linha para cada categoria */
  return tabela('categoria').map((categoria) => {
    /* A linha começa com tudo zerado */
    const linha = {
      categoria: categoria.nome,
      urgente: { solicitado: 0, recebido: 0 },
      normal: { solicitado: 0, recebido: 0 }
    };
    tabela('necessidade')
      /* Só as necessidades desta categoria */
      .filter((n) => n.id_categoria === categoria.id_categoria)
      .forEach((n) => {
        /* O grupo certo da linha: linha.urgente ou linha.normal, conforme a prioridade */
        const grupo = linha[n.prioridade];
        /* Soma o que foi pedido e o que já foi recebido */
        grupo.solicitado += n.quantidade;
        grupo.recebido += recebido(n.id_necessidade);
      });
    /* Totais da linha (urgente + normal) e o percentual atendido */
    const totalSolicitado = linha.urgente.solicitado + linha.normal.solicitado;
    const totalRecebido = linha.urgente.recebido + linha.normal.recebido;
    linha.percentual = totalSolicitado ? Math.round((totalRecebido / totalSolicitado) * 100) : 0;
    return linha;
    /* Depois de montar todas as linhas, joga fora as categorias que ninguém pediu */
  }).filter((linha) => linha.urgente.solicitado + linha.normal.solicitado > 0);
}

/*
  Relatório 3: média mensal de doações recebidas por categoria e no total.
  Devolve { categorias: [{ categoria, media }], mediaGeral }, com as categorias da maior média para a menor.
*/
export function mediaMensalPorCategoria(quantidadeMeses = 6) {
  const recebidas = recebidasNosUltimosMeses(quantidadeMeses);
  const categorias = tabela('categoria')
    /* Para cada categoria: quantas doações recebidas ela teve, dividido pelo número de meses */
    .map((categoria) => ({
      categoria: categoria.nome,
      media: recebidas.filter((d) => categoriaDaDoacao(d) === categoria.id_categoria).length / quantidadeMeses
    }))
    /* Joga fora as categorias sem doações */
    .filter((item) => item.media > 0)
    /* Ordena da maior média para a menor (b - a = ordem decrescente) */
    .sort((a, b) => b.media - a.media);
  /* A média geral é o total de doações recebidas dividido pelo número de meses */
  return { categorias, mediaGeral: recebidas.length / quantidadeMeses };
}
