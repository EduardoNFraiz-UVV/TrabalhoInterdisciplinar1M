import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { url, parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarData, formatarDiaMes, formatarQuantidade, ROTULO_TIPO_CAMPANHA } from '../../utilitarios/formatacao.js';
import { aprovarOng, recusarOng } from '../../regras/contas.js';
import { aprovarCampanha, recusarCampanha, textoCidades, nomeCriador } from '../../regras/campanhas.js';
import { pedidosPendentes, aceitarVinculo, recusarVinculo, removerVinculo } from '../../regras/vinculos.js';
import { criarAbas } from '../../componentes/abas.js';
import { criarTabela } from '../../componentes/tabela.js';
import { seloVinculo } from '../../componentes/selos.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { confirmar } from '../../componentes/dialogo.js';
import { perguntarAumentaMeta } from '../../componentes/dialogo-vinculo.js';
import { preencherSelect } from '../../componentes/formulario.js';

function montar() {
  const areaAlerta = $('#area-alerta');
  const abaDaUrl = parametro('aba');
  let abaAtual = ['ongs', 'campanhas', 'vinculos'].includes(abaDaUrl) ? abaDaUrl : 'ongs';
  let ongSelecionada = null;
  let campanhaModerada = '';

  const abas = criarAbas({
    rotulo: 'Tipos de aprovação',
    abas: [
      { id: 'ongs', rotulo: 'ONGs pendentes', contador: 0 },
      { id: 'campanhas', rotulo: 'Campanhas pendentes', contador: 0 },
      { id: 'vinculos', rotulo: 'Vínculos pendentes', contador: 0 }
    ],
    ativa: abaAtual,
    aoMudar: (id) => { abaAtual = id; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  const listaOngs = () => tabela('ong').filter((o) => !o.verificada);
  const listaCampanhas = () => tabela('campanha').filter((c) => c.status === 'pendente');
  const listaVinculos = () => pedidosPendentes(null);

  function desenhar() {
    abas.atualizarContadores({ ongs: listaOngs().length, campanhas: listaCampanhas().length, vinculos: listaVinculos().length });
    let conteudo;
    if (abaAtual === 'ongs') conteudo = abaOngs();
    else if (abaAtual === 'campanhas') conteudo = abaCampanhas();
    else conteudo = abaVinculos();
    preencher($('#conteudo-aba'), ...conteudo);
  }

  function abaOngs() {
    const ongs = listaOngs();
    if (!ongSelecionada || !ongs.some((o) => o.id_ong === ongSelecionada)) ongSelecionada = ongs[0]?.id_ong ?? null;
    const ong = ongSelecionada ? buscar('ong', ongSelecionada) : null;

    const tabelaOngs = criarTabela({
      legenda: 'ONGs aguardando aprovação',
      linhas: ongs,
      vazio: 'Nenhuma ONG aguardando aprovação.',
      selecionada: (o) => o.id_ong === ongSelecionada,
      colunas: [
        { titulo: 'Nome', render: (o) => el('strong', {}, o.nome) },
        { titulo: 'CNPJ', render: (o) => o.cnpj },
        { titulo: 'Cidade', render: (o) => buscar('cidade', o.id_cidade).nome },
        { titulo: 'Cadastrada em', render: (o) => formatarData(o.data_cadastro) },
        {
          titulo: 'Ações',
          classe: 'acoes',
          render: (o) => [
            el('button', { type: 'button', class: 'acao', 'aria-label': `Ver detalhes de ${o.nome}`, onclick: () => { ongSelecionada = o.id_ong; desenhar(); } }, 'Detalhes'),
            el('button', { type: 'button', class: 'acao acao-sucesso', 'aria-label': `Aprovar ${o.nome}`, onclick: () => aprovar(o) }, 'Aprovar'),
            el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Recusar ${o.nome}`, onclick: () => recusar(o) }, 'Recusar')
          ]
        }
      ]
    });

    const detalhe = ong ? el('section', { class: 'cartao', 'aria-labelledby': 'titulo-detalhe' },
      el('h2', { id: 'titulo-detalhe' }, ong.nome),
      el('p', {}, ong.descricao),
      el('dl', { class: 'resumo-lista' },
        el('dt', {}, 'Endereço'), el('dd', {}, ong.endereco),
        el('dt', {}, 'Contato'), el('dd', {}, [ong.telefone, ong.email_contato].filter(Boolean).join(' · ') || '—'),
        el('dt', {}, 'Representante'), el('dd', {}, buscar('usuario', ong.id_usuario).nome),
        el('dt', {}, 'Retirada'), el('dd', {}, ong.aceita_retirada ? 'Aceita retirada' : 'Só entrega no local')),
      el('div', { class: 'linha linha-fim botoes-formulario' },
        el('button', { type: 'button', class: 'botao botao-secundario', onclick: () => recusar(ong) }, 'Recusar'),
        el('button', { type: 'button', class: 'botao botao-primario', onclick: () => aprovar(ong) }, 'Aprovar ONG'))) : '';
    return [tabelaOngs, detalhe];
  }

  function aprovar(ong) {
    aprovarOng(ong.id_ong);
    mostrarAlerta(areaAlerta, 'sucesso', 'ONG aprovada!', "Ela já aparece com o selo 'ONG verificada'.");
    desenhar();
  }

  async function recusar(ong) {
    const ok = await confirmar({ titulo: 'Recusar esta ONG?', texto: `O cadastro de "${ong.nome}" será removido e o representante não poderá mais entrar.`, rotuloConfirmar: 'Recusar ONG' });
    if (!ok) return;
    recusarOng(ong.id_ong);
    mostrarAlerta(areaAlerta, 'info', 'Cadastro recusado.', `"${ong.nome}" foi removida da lista de pendentes.`);
    desenhar();
  }

  function abaCampanhas() {
    return [criarTabela({
      legenda: 'Campanhas aguardando aprovação',
      linhas: listaCampanhas(),
      vazio: 'Nenhuma campanha aguardando aprovação.',
      colunas: [
        { titulo: 'Campanha', render: (c) => el('strong', {}, c.titulo) },
        { titulo: 'Criada por', render: (c) => nomeCriador(c) },
        { titulo: 'Tipo', render: (c) => ROTULO_TIPO_CAMPANHA[c.tipo] },
        { titulo: 'Cidades', render: (c) => textoCidades(c.id_campanha) },
        { titulo: 'Período', render: (c) => `${formatarDiaMes(c.data_inicio)} a ${formatarDiaMes(c.data_fim)}` },
        {
          titulo: 'Ações',
          classe: 'acoes',
          render: (c) => [
            el('a', { class: 'acao', href: url('campanha', { id: c.id_campanha }), 'aria-label': `Ver ${c.titulo}` }, 'Ver'),
            el('a', { class: 'acao', href: url('campanhaFormAdmin', { id: c.id_campanha }), 'aria-label': `Editar ${c.titulo}` }, 'Editar'),
            el('button', { type: 'button', class: 'acao acao-sucesso', 'aria-label': `Aprovar ${c.titulo}`, onclick: () => aprovarCamp(c) }, 'Aprovar'),
            el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Recusar ${c.titulo}`, onclick: () => recusarCamp(c) }, 'Recusar')
          ]
        }
      ]
    })];
  }

  function aprovarCamp(campanha) {
    aprovarCampanha(campanha.id_campanha);
    mostrarAlerta(areaAlerta, 'sucesso', 'Campanha aprovada!', `"${campanha.titulo}" já aparece para os doadores.`);
    desenhar();
  }

  async function recusarCamp(campanha) {
    const ok = await confirmar({ titulo: 'Recusar esta campanha?', texto: `O pedido "${campanha.titulo}" será removido e a ONG precisará solicitar de novo.`, rotuloConfirmar: 'Recusar campanha' });
    if (!ok) return;
    recusarCampanha(campanha.id_campanha);
    mostrarAlerta(areaAlerta, 'info', 'Pedido de campanha recusado.');
    desenhar();
  }

  function abaVinculos() {
    const pendentes = criarTabela({
      legenda: 'Pedidos de vínculo às campanhas da administração',
      linhas: listaVinculos(),
      vazio: 'Nenhum pedido de vínculo esperando resposta.',
      colunas: [
        { titulo: 'Necessidade', render: (p) => el('strong', {}, p.necessidade.item) },
        { titulo: 'ONG', render: (p) => p.ong.nome },
        { titulo: 'Campanha', render: (p) => p.campanha.titulo },
        { titulo: 'Categoria', render: (p) => buscar('categoria', p.necessidade.id_categoria).nome },
        { titulo: 'Quantidade', classe: 'numerico', render: (p) => formatarQuantidade(p.necessidade.quantidade, p.necessidade.unidade) },
        { titulo: 'Pedido em', render: (p) => formatarDiaMes(p.vinculo.data_pedido) },
        {
          titulo: 'Ações',
          classe: 'acoes',
          render: (p) => [
            el('button', { type: 'button', class: 'acao acao-sucesso', 'aria-label': `Aceitar ${p.necessidade.item}`, onclick: () => aceitarPedido(p) }, 'Aceitar'),
            el('button', {
              type: 'button',
              class: 'acao acao-perigo',
              'aria-label': `Recusar ${p.necessidade.item}`,
              onclick: () => {
                recusarVinculo(p.campanha.id_campanha, p.necessidade.id_necessidade);
                mostrarAlerta(areaAlerta, 'info', 'Pedido recusado.');
                desenhar();
              }
            }, 'Recusar')
          ]
        }
      ]
    });

    const seletor = el('select', { id: 'campanha-moderada' });
    preencherSelect(seletor, tabela('campanha'), { valor: (c) => c.id_campanha, rotulo: (c) => c.titulo, primeira: 'Escolha uma campanha', selecionado: campanhaModerada || null });
    seletor.addEventListener('change', () => { campanhaModerada = seletor.value; desenhar(); });

    const vinculosDaCampanha = campanhaModerada
      ? tabela('campanha_necessidade').filter((v) => v.id_campanha === Number(campanhaModerada))
        .map((vinculo) => ({ vinculo, necessidade: buscar('necessidade', vinculo.id_necessidade) })).filter((i) => i.necessidade)
      : [];
    const moderacao = el('section', { class: 'secao', 'aria-labelledby': 'titulo-moderacao' },
      el('h2', { id: 'titulo-moderacao' }, 'Moderar vínculos de uma campanha'),
      el('div', { class: 'campo' }, el('label', { for: 'campanha-moderada' }, 'Campanha'), seletor),
      campanhaModerada ? criarTabela({
        legenda: 'Vínculos da campanha escolhida',
        linhas: vinculosDaCampanha,
        vazio: 'Esta campanha não tem necessidades vinculadas.',
        colunas: [
          { titulo: 'Necessidade', render: (i) => el('strong', {}, i.necessidade.item) },
          { titulo: 'ONG', render: (i) => buscar('ong', i.necessidade.id_ong).nome },
          { titulo: 'Situação', render: (i) => seloVinculo(i.vinculo.status) },
          { titulo: 'Aumenta a meta', render: (i) => (i.vinculo.aumenta_meta ? 'Sim' : 'Não') },
          {
            titulo: 'Ações',
            classe: 'acoes',
            render: (i) => el('button', {
              type: 'button',
              class: 'acao acao-perigo',
              'aria-label': `Remover ${i.necessidade.item}`,
              onclick: () => {
                removerVinculo(i.vinculo.id_campanha, i.vinculo.id_necessidade);
                mostrarAlerta(areaAlerta, 'info', 'Vínculo removido.');
                desenhar();
              }
            }, 'Remover')
          }
        ]
      }) : '');
    return [pendentes, moderacao];
  }

  async function aceitarPedido(pedido) {
    const resposta = await perguntarAumentaMeta(pedido);
    if (!resposta) return;
    aceitarVinculo(pedido.campanha.id_campanha, pedido.necessidade.id_necessidade, resposta.aumenta);
    mostrarAlerta(areaAlerta, 'sucesso', 'Necessidade aceita na campanha.', resposta.aumenta ? 'A meta da campanha aumentou.' : 'A necessidade ajuda a cumprir a meta já declarada.');
    desenhar();
  }

  desenhar();
}

if (iniciarPagina({ perfis: ['admin'] })) montar();
