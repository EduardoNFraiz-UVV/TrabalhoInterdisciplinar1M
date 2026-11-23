import { iniciarPagina } from '../../nucleo/pagina.js';
import { buscar } from '../../nucleo/armazenamento.js';
import { parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarData, formatarDiaMes, nomeAbreviado, normalizar, ROTULO_ENTREGA } from '../../utilitarios/formatacao.js';
import { doacoesDaOng, detalharDoacao, quantidadeComUnidade, contarPorStatus, mudarStatus } from '../../regras/doacoes.js';
import { criarAbas } from '../../componentes/abas.js';
import { criarTabela } from '../../componentes/tabela.js';
import { criarPaginacao, fatiar, preencherPagina } from '../../componentes/paginacao.js';
import { abrirDialogo } from '../../componentes/dialogo.js';
import { seloStatusDoacao } from '../../componentes/selos.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { icone } from '../../componentes/icones.js';

const POR_PAGINA = 10;

const ABAS = [
  { id: 'oferecida', rotulo: 'Pendentes' },
  { id: 'aceita', rotulo: 'Aceitas' },
  { id: 'recebida', rotulo: 'Recebidas' },
  { id: 'recusada', rotulo: 'Recusadas' }
];

function montar(ong) {
  const areaAlerta = $('#area-alerta');

  let pagina = 1;
  const abaDaUrl = parametro('aba');
  let abaAtual = ABAS.some((a) => a.id === abaDaUrl) ? abaDaUrl : 'oferecida';

  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Nome do doador ou item', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  const abas = criarAbas({
    rotulo: 'Filtrar doações por status',
    abas: ABAS.map((a) => ({ ...a, contador: 0 })),
    ativa: abaAtual,
    aoMudar: (id) => { abaAtual = id; pagina = 1; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  function filtradas() {
    const origem = $('#filtro-origem').value;
    const termo = normalizar(campoBusca.value);
    return doacoesDaOng(ong.id_ong)
      .filter((d) => !origem || (origem === 'campanhas') === (d.id_meta !== null))
      .filter((d) => !termo || normalizar(buscar('usuario', d.id_doador).nome).includes(termo) || normalizar(detalharDoacao(d).item).includes(termo));
  }

  function desenhar() {
    const doacoes = filtradas();
    const contagem = contarPorStatus(doacoes);
    abas.atualizarContadores({ oferecida: contagem.oferecida, aceita: contagem.aceita, recebida: contagem.recebida, recusada: contagem.recusada });

    const linhas = doacoes.filter((d) => d.status === abaAtual);
    if ((pagina - 1) * POR_PAGINA >= linhas.length) pagina = 1;

    const tabelaDaPagina = (numero) => criarTabela({
      legenda: 'Doações oferecidas à ONG',
      linhas: fatiar(linhas, numero, POR_PAGINA),
      vazio: abaAtual === 'oferecida'
        ? 'Nenhuma doação esperando resposta. Quando um doador registrar uma doação para suas necessidades ou campanhas, ela aparece aqui.'
        : 'Nenhuma doação nesta situação.',
      colunas: [
        { titulo: 'Data', render: (d) => formatarDiaMes(d.data_registro) },
        { titulo: 'Doador', render: (d) => nomeAbreviado(buscar('usuario', d.id_doador).nome) },
        { titulo: 'Item', render: (d) => detalharDoacao(d).item },
        { titulo: 'Qtd.', classe: 'numerico', render: (d) => quantidadeComUnidade(d) },
        { titulo: 'Entrega', render: (d) => (d.id_meta ? 'Leva até a campanha' : ROTULO_ENTREGA[d.forma_entrega]) },
        { titulo: 'Data prevista', render: (d) => formatarDiaMes(d.data_prevista) },
        { titulo: 'Origem', render: (d) => detalharDoacao(d).origem },
        { titulo: 'Status', render: (d) => seloStatusDoacao(d.status) },
        { titulo: 'Ações', classe: 'acoes', render: (d) => acoesDaLinha(d) }
      ]
    });
    preencherPagina($('#lista'), { total: linhas.length, porPagina: POR_PAGINA, pagina, conteudo: tabelaDaPagina });
    preencher($('#paginacao'), criarPaginacao({ total: linhas.length, porPagina: POR_PAGINA, pagina, aoMudar: (nova) => { pagina = nova; desenhar(); } }));
  }

  function acoesDaLinha(d) {
    const nome = detalharDoacao(d).item;
    const botoes = [el('button', { type: 'button', class: 'acao', 'aria-label': `Ver detalhes de ${nome}`, onclick: () => abrirDetalhe(d) }, 'Detalhes')];
    if (d.status === 'oferecida') {
      botoes.push(el('button', { type: 'button', class: 'acao acao-sucesso', onclick: () => alterar(d.id_doacao, 'aceita') }, 'Aceitar'));
      botoes.push(el('button', { type: 'button', class: 'acao acao-perigo', onclick: () => alterar(d.id_doacao, 'recusada') }, 'Recusar'));
    }
    if (d.status === 'aceita') {
      botoes.push(el('button', { type: 'button', class: 'acao acao-sucesso', onclick: () => alterar(d.id_doacao, 'recebida') }, 'Confirmar recebimento'));
    }
    return botoes;
  }

  function alterar(idDoacao, novoStatus, mensagem = null) {
    if (!mudarStatus(idDoacao, novoStatus, mensagem)) return;
    const texto = { aceita: 'Doação aceita. O doador foi avisado.', recusada: 'Doação recusada. O doador foi avisado.', recebida: 'Recebimento confirmado. Obrigado por registrar!' }[novoStatus];
    mostrarAlerta(areaAlerta, novoStatus === 'recusada' ? 'info' : 'sucesso', texto);
    desenhar();
  }

  async function abrirDetalhe(doacao) {
    const info = detalharDoacao(doacao);
    const doador = buscar('usuario', doacao.id_doador);
    let entrega = `Retirada em ${formatarData(doacao.data_prevista)}`;
    if (doacao.id_meta) entrega = `Entrega no endereço da campanha em ${formatarData(doacao.data_prevista)}`;
    else if (doacao.forma_entrega === 'levar') entrega = `Entrega na ONG em ${formatarData(doacao.data_prevista)}`;

    const campoMensagem = el('textarea', { id: 'mensagem', rows: 3, maxlength: 200, placeholder: 'Ex.: Obrigado! Pode entregar na portaria.' });
    const acionavel = doacao.status === 'oferecida' || doacao.status === 'aceita';

    const botoes = [{ rotulo: 'Fechar', tipo: 'discreto', valor: null }];
    if (acionavel) {
      botoes.push({ rotulo: 'Recusar', tipo: 'secundario', valor: 'recusada' });
      if (doacao.status === 'oferecida') botoes.push({ rotulo: 'Aceitar doação', tipo: 'primario', valor: 'aceita' });
      else botoes.push({ rotulo: 'Confirmar recebimento', tipo: 'primario', valor: 'recebida' });
    }

    const resposta = await abrirDialogo({
      titulo: 'Detalhe da doação',
      corpo: el('div', { class: 'pilha' },
        el('dl', { class: 'resumo-lista' },
          el('dt', {}, 'Item'), el('dd', {}, info.item),
          el('dt', {}, 'Doador'), el('dd', {}, doador.nome),
          el('dt', {}, 'Quantidade'), el('dd', {}, quantidadeComUnidade(doacao)),
          el('dt', {}, 'Entrega'), el('dd', {}, entrega),
          doacao.forma_entrega === 'retirada' ? el('dt', {}, 'Endereço de retirada') : '', doacao.forma_entrega === 'retirada' ? el('dd', {}, doacao.endereco_retirada) : '',
          el('dt', {}, 'E-mail'), el('dd', {}, doador.email),
          el('dt', {}, 'Telefone'), el('dd', {}, doador.telefone),
          doacao.observacao ? el('dt', {}, 'Observação do doador') : '', doacao.observacao ? el('dd', {}, `“${doacao.observacao}”`) : '',
          doacao.mensagem_ong ? el('dt', {}, 'Mensagem enviada') : '', doacao.mensagem_ong ? el('dd', {}, `“${doacao.mensagem_ong}”`) : ''),
        acionavel ? el('div', { class: 'campo' }, el('label', { for: 'mensagem' }, 'Mensagem ao doador (opcional)'), campoMensagem) : ''),
      botoes,
      ler: () => campoMensagem.value
    });
    if (resposta) alterar(doacao.id_doacao, resposta.valor, resposta.dados);
  }

  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());
  campoBusca.addEventListener('input', () => { pagina = 1; desenhar(); });
  $('#filtro-origem').addEventListener('change', () => { pagina = 1; desenhar(); });
  desenhar();
}

const contexto = iniciarPagina({ perfis: ['ong'] });
if (contexto) montar(contexto.ong);
