import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarData, formatarDiaMes, nomeAbreviado, normalizar } from '../../utilitarios/formatacao.js';
import { doacoesDasCampanhasDoAdmin, detalharDoacao, quantidadeComUnidade, contarPorStatus, mudarStatus } from '../../regras/doacoes.js';
import { criarAbas } from '../../componentes/abas.js';
import { criarTabela } from '../../componentes/tabela.js';
import { criarPaginacao, fatiar, preencherPagina } from '../../componentes/paginacao.js';
import { abrirDialogo } from '../../componentes/dialogo.js';
import { seloStatusDoacao } from '../../componentes/selos.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { preencherSelect } from '../../componentes/formulario.js';
import { icone } from '../../componentes/icones.js';

const POR_PAGINA = 10;

const ABAS = [
  { id: 'oferecida', rotulo: 'Pendentes' },
  { id: 'aceita', rotulo: 'Aceitas' },
  { id: 'recebida', rotulo: 'Recebidas' },
  { id: 'recusada', rotulo: 'Recusadas' }
];

function montar() {
  const areaAlerta = $('#area-alerta');
  let abaAtual = 'oferecida';
  let pagina = 1;

  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Nome do doador ou item', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  const campanhasDoAdmin = tabela('campanha').filter((c) => c.id_ong === null);
  preencherSelect($('#filtro-campanha'), campanhasDoAdmin, { valor: (c) => c.id_campanha, rotulo: (c) => c.titulo, primeira: 'Todas', selecionado: parametro('campanha') });

  const abas = criarAbas({
    rotulo: 'Filtrar doações por status',
    abas: ABAS.map((a) => ({ ...a, contador: 0 })),
    ativa: abaAtual,
    aoMudar: (id) => { abaAtual = id; pagina = 1; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  function filtradas() {
    const campanha = $('#filtro-campanha').value;
    const termo = normalizar(campoBusca.value);
    return doacoesDasCampanhasDoAdmin()
      .filter((d) => !campanha || detalharDoacao(d).campanha.id_campanha === Number(campanha))
      .filter((d) => !termo || normalizar(buscar('usuario', d.id_doador).nome).includes(termo) || normalizar(detalharDoacao(d).item).includes(termo));
  }

  function desenhar() {
    const doacoes = filtradas();
    const contagem = contarPorStatus(doacoes);
    abas.atualizarContadores({ oferecida: contagem.oferecida, aceita: contagem.aceita, recebida: contagem.recebida, recusada: contagem.recusada });

    const linhas = doacoes.filter((d) => d.status === abaAtual);
    if ((pagina - 1) * POR_PAGINA >= linhas.length) pagina = 1;

    const tabelaDaPagina = (numero) => criarTabela({
      legenda: 'Doações às metas das campanhas da administração',
      linhas: fatiar(linhas, numero, POR_PAGINA),
      vazio: 'Nenhuma doação nesta situação.',
      colunas: [
        { titulo: 'Data', render: (d) => formatarDiaMes(d.data_registro) },
        { titulo: 'Campanha', render: (d) => detalharDoacao(d).campanha.titulo },
        { titulo: 'Doador', render: (d) => nomeAbreviado(buscar('usuario', d.id_doador).nome) },
        { titulo: 'Meta', render: (d) => detalharDoacao(d).meta.item },
        { titulo: 'Qtd.', classe: 'numerico', render: (d) => quantidadeComUnidade(d) },
        { titulo: 'Data prevista', render: (d) => formatarDiaMes(d.data_prevista) },
        { titulo: 'Status', render: (d) => seloStatusDoacao(d.status) },
        { titulo: 'Ações', classe: 'acoes', render: (d) => acoesDaLinha(d) }
      ]
    });
    preencherPagina($('#lista'), { total: linhas.length, porPagina: POR_PAGINA, pagina, conteudo: tabelaDaPagina });
    preencher($('#paginacao'), criarPaginacao({ total: linhas.length, porPagina: POR_PAGINA, pagina, aoMudar: (nova) => { pagina = nova; desenhar(); } }));
  }

  function acoesDaLinha(d) {
    const botoes = [el('button', { type: 'button', class: 'acao', 'aria-label': 'Ver detalhes da doação', onclick: () => abrirDetalhe(d) }, 'Detalhes')];
    if (d.status === 'oferecida') {
      botoes.push(el('button', { type: 'button', class: 'acao acao-sucesso', onclick: () => alterar(d.id_doacao, 'aceita') }, 'Aceitar'));
      botoes.push(el('button', { type: 'button', class: 'acao acao-perigo', onclick: () => alterar(d.id_doacao, 'recusada') }, 'Recusar'));
    }
    if (d.status === 'aceita') botoes.push(el('button', { type: 'button', class: 'acao acao-sucesso', onclick: () => alterar(d.id_doacao, 'recebida') }, 'Confirmar recebimento'));
    return botoes;
  }

  function alterar(idDoacao, novoStatus, mensagem = null) {
    if (!mudarStatus(idDoacao, novoStatus, mensagem)) return;
    const texto = { aceita: 'Doação aceita. O doador foi avisado.', recusada: 'Doação recusada. O doador foi avisado.', recebida: 'Recebimento confirmado. O andamento da meta foi atualizado.' }[novoStatus];
    mostrarAlerta(areaAlerta, novoStatus === 'recusada' ? 'info' : 'sucesso', texto);
    desenhar();
  }

  async function abrirDetalhe(doacao) {
    const info = detalharDoacao(doacao);
    const doador = buscar('usuario', doacao.id_doador);
    const campoMensagem = el('textarea', { id: 'mensagem', rows: 3, maxlength: 200, placeholder: 'Ex.: Obrigado! Entregue na recepção.' });
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
          el('dt', {}, 'Meta'), el('dd', {}, `${info.meta.item} (${info.campanha.titulo})`),
          el('dt', {}, 'Doador'), el('dd', {}, doador.nome),
          el('dt', {}, 'Quantidade'), el('dd', {}, quantidadeComUnidade(doacao)),
          el('dt', {}, 'Endereço'), el('dd', {}, info.endereco),
          el('dt', {}, 'Entrega'), el('dd', {}, `Entrega em ${formatarData(doacao.data_prevista)}`),
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
  $('#filtro-campanha').addEventListener('change', () => { pagina = 1; desenhar(); });
  desenhar();
}

if (iniciarPagina({ perfis: ['admin'] })) montar();
