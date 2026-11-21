/*
  painel.js
  Página: paginas/admin/painel.html (tela 11: Painel e relatórios).
  Para que serve: calcula e mostra os números do painel do administrador e os 3 relatórios (RN-44):
  doações recebidas por mês, demanda por categoria e prioridade, e média mensal por categoria.
  Tudo é calculado das tabelas, então muda quando as doações mudam.
  Depende de: pagina.js, regras (relatórios, doações), componentes de cartão, gráfico, tabela e progresso.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela } from '../../nucleo/armazenamento.js';
import { url } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarNumero, formatarDecimal, formatarData, nomeMes, chaveMes, hojeISO } from '../../utilitarios/formatacao.js';
import { doacoesPorMes, demandaPorCategoria, mediaMensalPorCategoria } from '../../regras/relatorios.js';
import { graficoBarras } from '../../componentes/grafico.js';
import { criarTabela } from '../../componentes/tabela.js';
import { barraProgresso } from '../../componentes/progresso.js';

function cartaoResumo(numero, rotulo, textoLink, href) {
  return el('div', { class: 'cartao cartao-resumo' },
    el('span', { class: 'numero' }, formatarNumero(numero)),
    el('span', { class: 'rotulo-resumo' }, rotulo),
    el('a', { href, class: 'texto-forte' }, `${textoLink} ›`));
}

function montar() {
  const ongsPendentes = tabela('ong').filter((o) => !o.verificada);
  const campanhasPendentes = tabela('campanha').filter((c) => c.status === 'pendente');
  const mesAtual = chaveMes(hojeISO());
  const recebidasNoMes = tabela('doacao').filter((d) => d.status === 'recebida' && chaveMes(d.data_recebimento) === mesAtual).length;

  /* Quatro cartões de resumo */
  preencher($('#cartoes-resumo'),
    cartaoResumo(tabela('ong').length, 'ONGs cadastradas', 'Ver usuários', url('usuarios', { aba: 'ong' })),
    cartaoResumo(ongsPendentes.length, 'ONGs aguardando aprovação', 'Ver aprovações', url('aprovacoes', { aba: 'ongs' })),
    cartaoResumo(campanhasPendentes.length, 'Campanhas pendentes', 'Analisar', url('aprovacoes', { aba: 'campanhas' })),
    cartaoResumo(recebidasNoMes, 'Doações recebidas no mês', 'Ver campanhas', url('campanhasAdmin')));

  /* Relatório 1: gráfico de barras dos últimos 6 meses */
  const meses = doacoesPorMes(6).map((m) => ({ rotulo: nomeMes(m.mes), valor: m.total }));
  preencher($('#grafico'), graficoBarras(meses, `Doações recebidas por mês: ${meses.map((m) => `${m.rotulo} ${m.valor}`).join(', ')}`));

  /* Itens aguardando análise: ONGs e campanhas pendentes, os 4 mais recentes */
  const itens = [
    ...ongsPendentes.map((o) => ({ nome: o.nome, tipo: 'ONG', data: o.data_cadastro, destino: url('aprovacoes', { aba: 'ongs' }) })),
    ...campanhasPendentes.map((c) => ({ nome: c.titulo, tipo: 'Campanha', data: c.data_inicio, destino: url('aprovacoes', { aba: 'campanhas' }) }))
  ].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 4);
  /* Lista compacta: nome, tipo e data de um lado e o link "Analisar" do outro.
     Uma tabela de 3 colunas não cabe na coluna estreita e cortava a ação. */
  preencher($('#analise'), itens.length === 0
    ? el('p', { class: 'texto-apoio' }, 'Nada aguardando análise.')
    : el('ul', { class: 'lista-linhas', role: 'list' }, itens.map((i) => el('li', {},
      el('div', { class: 'principal' },
        el('strong', {}, i.nome),
        el('span', { class: 'texto-legenda' }, `${i.tipo} · ${formatarData(i.data)}`)),
      el('a', { class: 'acao', href: i.destino, 'aria-label': `Analisar ${i.nome}` }, 'Analisar')))));

  /* Relatório 2: demanda por categoria e prioridade (recebido de solicitado) */
  const celula = (grupo) => `${formatarNumero(grupo.recebido)} de ${formatarNumero(grupo.solicitado)}`;
  preencher($('#demanda'), criarTabela({
    legenda: 'Itens recebidos de itens solicitados, por categoria e prioridade',
    linhas: demandaPorCategoria(),
    colunas: [
      { titulo: 'Categoria', render: (l) => el('strong', {}, l.categoria) },
      { titulo: 'Urgente', classe: 'numerico', render: (l) => celula(l.urgente) },
      { titulo: 'Normal', classe: 'numerico', render: (l) => celula(l.normal) },
      { titulo: 'Atendido', classe: 'numerico', render: (l) => `${l.percentual}%` }
    ]
  }));

  /* Relatório 3: média mensal por categoria, em barras de progresso (a maior média ocupa a barra toda) */
  const { categorias, mediaGeral } = mediaMensalPorCategoria(6);
  const maior = Math.max(1, ...categorias.map((c) => c.media));
  preencher($('#media'), categorias.map((c) => barraProgresso(c.categoria, formatarDecimal(c.media), (c.media / maior) * 100)));
  $('#media-geral').textContent = `Média geral: ${formatarDecimal(mediaGeral)} doações por mês`;
}

if (iniciarPagina({ perfis: ['admin'] })) montar();
