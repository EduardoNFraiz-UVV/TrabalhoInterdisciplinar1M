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

  preencher($('#cartoes-resumo'),
    cartaoResumo(tabela('ong').length, 'ONGs cadastradas', 'Ver usuários', url('usuarios', { aba: 'ong' })),
    cartaoResumo(ongsPendentes.length, 'ONGs aguardando aprovação', 'Ver aprovações', url('aprovacoes', { aba: 'ongs' })),
    cartaoResumo(campanhasPendentes.length, 'Campanhas pendentes', 'Analisar', url('aprovacoes', { aba: 'campanhas' })),
    cartaoResumo(recebidasNoMes, 'Doações recebidas no mês', 'Ver campanhas', url('campanhasAdmin')));

  const meses = doacoesPorMes(6).map((m) => ({ rotulo: nomeMes(m.mes), valor: m.total }));
  preencher($('#grafico'), graficoBarras(meses, `Doações recebidas por mês: ${meses.map((m) => `${m.rotulo} ${m.valor}`).join(', ')}`));

  const itens = [
    ...ongsPendentes.map((o) => ({ nome: o.nome, tipo: 'ONG', data: o.data_cadastro, destino: url('aprovacoes', { aba: 'ongs' }) })),
    ...campanhasPendentes.map((c) => ({ nome: c.titulo, tipo: 'Campanha', data: c.data_inicio, destino: url('aprovacoes', { aba: 'campanhas' }) }))
  ].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 4);
  preencher($('#analise'), itens.length === 0
    ? el('p', { class: 'texto-apoio' }, 'Nada aguardando análise.')
    : el('ul', { class: 'lista-linhas', role: 'list' }, itens.map((i) => el('li', {},
      el('div', { class: 'principal' },
        el('strong', {}, i.nome),
        el('span', { class: 'texto-legenda' }, `${i.tipo} · ${formatarData(i.data)}`)),
      el('a', { class: 'acao', href: i.destino, 'aria-label': `Analisar ${i.nome}` }, 'Analisar')))));

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

  const { categorias, mediaGeral } = mediaMensalPorCategoria(6);
  const maior = Math.max(1, ...categorias.map((c) => c.media));
  preencher($('#media'), categorias.map((c) => barraProgresso(c.categoria, formatarDecimal(c.media), (c.media / maior) * 100)));
  $('#media-geral').textContent = `Média geral: ${formatarDecimal(mediaGeral)} doações por mês`;
}

if (iniciarPagina({ perfis: ['admin'] })) montar();
