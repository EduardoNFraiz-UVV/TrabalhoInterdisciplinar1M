import { tabela, buscar } from '../nucleo/armazenamento.js';
import { chaveMes, ultimosMeses } from '../utilitarios/formatacao.js';
import { recebido } from './necessidades.js';

function categoriaDaDoacao(doacao) {
  if (doacao.id_meta) return buscar('campanha_meta', doacao.id_meta).id_categoria;
  return buscar('necessidade', doacao.id_necessidade).id_categoria;
}

function recebidasNosUltimosMeses(quantidadeMeses) {
  const meses = ultimosMeses(quantidadeMeses);
  return tabela('doacao').filter((d) => d.status === 'recebida' && meses.includes(chaveMes(d.data_recebimento)));
}

export function doacoesPorMes(quantidadeMeses = 6) {
  const recebidas = recebidasNosUltimosMeses(quantidadeMeses);
  return ultimosMeses(quantidadeMeses).map((mes) => ({
    mes,
    total: recebidas.filter((d) => chaveMes(d.data_recebimento) === mes).length
  }));
}

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
        grupo.recebido += recebido(n.id_necessidade);
      });
    const totalSolicitado = linha.urgente.solicitado + linha.normal.solicitado;
    const totalRecebido = linha.urgente.recebido + linha.normal.recebido;
    linha.percentual = totalSolicitado ? Math.round((totalRecebido / totalSolicitado) * 100) : 0;
    return linha;
  }).filter((linha) => linha.urgente.solicitado + linha.normal.solicitado > 0);
}

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
