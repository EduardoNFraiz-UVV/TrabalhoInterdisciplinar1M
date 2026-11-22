import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela } from '../../nucleo/armazenamento.js';
import { url } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarDiaMes, formatarNumero, normalizar, ROTULO_TIPO_CAMPANHA } from '../../utilitarios/formatacao.js';
import { textoCidades, nomeCriador, progressoDaCampanha, metaTotal, encerrarCampanha, reabrirCampanha } from '../../regras/campanhas.js';
import { criarAbas } from '../../componentes/abas.js';
import { criarTabela } from '../../componentes/tabela.js';
import { seloSituacaoCampanha } from '../../componentes/selos.js';
import { confirmar } from '../../componentes/dialogo.js';
import { mostrarAlerta, exibirAvisoGuardado } from '../../componentes/alertas.js';
import { icone } from '../../componentes/icones.js';

function montar() {
  const areaAlerta = $('#area-alerta');
  exibirAvisoGuardado(areaAlerta);
  let abaAtual = 'todas';

  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Nome da campanha ou cidade', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  const abas = criarAbas({
    rotulo: 'Filtrar campanhas por situação',
    abas: [
      { id: 'todas', rotulo: 'Todas', contador: 0 },
      { id: 'ativa', rotulo: 'Ativas', contador: 0 },
      { id: 'pendente', rotulo: 'Pendentes', contador: 0 },
      { id: 'encerrada', rotulo: 'Encerradas', contador: 0 }
    ],
    ativa: abaAtual,
    aoMudar: (id) => { abaAtual = id; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  function desenhar() {
    const termo = normalizar(campoBusca.value);
    const tipo = $('#filtro-tipo').value;
    const base = tabela('campanha')
      .filter((c) => !termo || normalizar(c.titulo).includes(termo) || normalizar(textoCidades(c.id_campanha)).includes(termo))
      .filter((c) => !tipo || c.tipo === tipo)
      .sort((a, b) => b.data_inicio.localeCompare(a.data_inicio));

    abas.atualizarContadores({
      todas: base.length,
      ativa: base.filter((c) => c.status === 'ativa').length,
      pendente: base.filter((c) => c.status === 'pendente').length,
      encerrada: base.filter((c) => c.status === 'encerrada').length
    });

    preencher($('#lista'), criarTabela({
      legenda: 'Campanhas emergenciais',
      linhas: base.filter((c) => abaAtual === 'todas' || c.status === abaAtual),
      vazio: 'Nenhuma campanha encontrada.',
      colunas: [
        { titulo: 'Campanha', render: (c) => el('a', { href: url('campanha', { id: c.id_campanha }), class: 'texto-forte' }, c.titulo) },
        { titulo: 'Criada por', render: (c) => nomeCriador(c) },
        { titulo: 'Tipo', render: (c) => ROTULO_TIPO_CAMPANHA[c.tipo] },
        { titulo: 'Cidades', render: (c) => textoCidades(c.id_campanha) },
        { titulo: 'Progresso', render: (c) => `${progressoDaCampanha(c.id_campanha)}% · meta ${formatarNumero(metaTotal(c.id_campanha))}` },
        { titulo: 'Período', render: (c) => `${formatarDiaMes(c.data_inicio)} a ${formatarDiaMes(c.data_fim)}` },
        { titulo: 'Situação', render: (c) => seloSituacaoCampanha(c.status) },
        { titulo: 'Ações', classe: 'acoes', render: (c) => acoes(c) }
      ]
    }));
  }

  function acoes(c) {
    const lista = [];
    if (c.status !== 'encerrada') lista.push(el('a', { class: 'acao', href: url('campanhaFormAdmin', { id: c.id_campanha }), 'aria-label': `Editar ${c.titulo}` }, 'Editar'));
    if (c.status === 'ativa') lista.push(el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Encerrar ${c.titulo}`, onclick: () => encerrar(c) }, 'Encerrar'));
    if (c.status === 'pendente') lista.push(el('a', { class: 'acao acao-sucesso', href: url('aprovacoes', { aba: 'campanhas' }), 'aria-label': `Analisar ${c.titulo}` }, 'Analisar'));
    if (c.status === 'encerrada') lista.push(el('button', { type: 'button', class: 'acao acao-sucesso', 'aria-label': `Reabrir ${c.titulo}`, onclick: () => reabrir(c) }, 'Reabrir'));
    if (c.id_ong === null) lista.push(el('a', { class: 'acao', href: url('doacoesCampanhas', { campanha: c.id_campanha }), 'aria-label': `Ver doações de ${c.titulo}` }, 'Ver doações'));
    return lista;
  }

  async function encerrar(campanha) {
    const ok = await confirmar({
      titulo: 'Encerrar campanha?',
      texto: 'A campanha deixa de aparecer para os doadores. As doações já registradas continuam valendo.',
      rotuloConfirmar: 'Encerrar campanha'
    });
    if (!ok) return;
    encerrarCampanha(campanha.id_campanha);
    mostrarAlerta(areaAlerta, 'info', 'Campanha encerrada.', `"${campanha.titulo}" não aparece mais para os doadores.`);
    desenhar();
  }

  function reabrir(campanha) {
    reabrirCampanha(campanha.id_campanha);
    mostrarAlerta(areaAlerta, 'sucesso', 'Campanha reaberta.', `"${campanha.titulo}" voltou a aparecer para os doadores.`);
    desenhar();
  }

  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());
  campoBusca.addEventListener('input', desenhar);
  $('#filtro-tipo').addEventListener('change', desenhar);
  desenhar();
}

if (iniciarPagina({ perfis: ['admin'] })) montar();
