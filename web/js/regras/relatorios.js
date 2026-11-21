/*
  relatorios.js
  Para que serve: calcula os 3 relatórios do painel do administrador (RN-44), iguais às 3
  consultas do banco de dados. Só contam doações RECEBIDAS. Doação para meta entra na
  categoria da meta.
  Quem usa: painel do administrador.
  Depende de: armazenamento.js e formatacao.js.
*/

import { tabela, buscar } from '../nucleo/armazenamento.js';
import { chaveMes, ultimosMeses } from '../utilitarios/formatacao.js';

/* Categoria de uma doação: a da necessidade ou a da meta de campanha */
function categoriaDaDoacao(doacao) {
  if (doacao.id_meta) return buscar('campanha_meta', doacao.id_meta).id_categoria;
  return buscar('necessidade', doacao.id_necessidade).id_categoria;
}

/* Doações recebidas nos últimos N meses, já com o mês de recebimento */
function recebidasNosUltimosMeses(quantidadeMeses) {
  const meses = ultimosMeses(quantidadeMeses);
  return tabela('doacao').filter((d) => d.status === 'recebida' && meses.includes(chaveMes(d.data_recebimento)));
}

/* Relatório 1: doações recebidas por mês. Devolve [{ mes: '2026-06', total: 31 }, ...] */
export function doacoesPorMes(quantidadeMeses = 6) {
  const recebidas = recebidasNosUltimosMeses(quantidadeMeses);
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
  return tabela('categoria').map((categoria) => {
    const linha = {
      categoria: categoria.nome,
      urgente: { solicitado: 0, recebido: 0 },
      normal: { solicitado: 0, recebido: 0 }
    };
    tabela('necessidade')
      .filter((n) => n.id_categoria === categoria.id_categoria)
      .forEach((n) => {
        const grupo = linha[n.prioridade];
        grupo.solicitado += n.quantidade;
        grupo.recebido += tabela('doacao')
          .filter((d) => d.id_necessidade === n.id_necessidade && d.status === 'recebida')
          .reduce((soma, d) => soma + d.quantidade, 0);
      });
    const solicitado = linha.urgente.solicitado + linha.normal.solicitado;
    const recebido = linha.urgente.recebido + linha.normal.recebido;
    linha.percentual = solicitado ? Math.round((recebido / solicitado) * 100) : 0;
    return linha;
  }).filter((linha) => linha.urgente.solicitado + linha.normal.solicitado > 0);
}

/*
  Relatório 3: média mensal de doações recebidas por categoria e no total.
  Devolve { categorias: [{ categoria, media }], mediaGeral }, com as categorias da maior média para a menor.
*/
export function mediaMensalPorCategoria(quantidadeMeses = 6) {
  const recebidas = recebidasNosUltimosMeses(quantidadeMeses);
  const categorias = tabela('categoria')
    .map((categoria) => ({
      categoria: categoria.nome,
      media: recebidas.filter((d) => categoriaDaDoacao(d) === categoria.id_categoria).length / quantidadeMeses
    }))
    .filter((item) => item.media > 0)
    .sort((a, b) => b.media - a.media);
  return { categorias, mediaGeral: recebidas.length / quantidadeMeses };
}
