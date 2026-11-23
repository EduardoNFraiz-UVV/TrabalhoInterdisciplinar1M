/*
  aprovacoes.js
  Página: paginas/admin/aprovacoes.html (tela 12: Aprovação de ONGs e campanhas).
  Para que serve: três abas de moderação do administrador (RN-19, RN-32 a RN-34, RN-43):
    - ONGs pendentes: aprovar (selo verificada) ou recusar;
    - Campanhas pendentes: aprovar (vira ativa), recusar ou editar;
    - Vínculos pendentes: pedidos às campanhas criadas pela administração, com o diálogo "aumenta a meta";
      e moderação para remover vínculos de qualquer campanha.
  Depende de: pagina.js, regras de contas, campanhas e vínculos, componentes de abas, tabela e diálogo.

  Aqui as abas trocam o conteúdo da caixa #conteudo-aba: cada aba tem uma função (abaOngs, abaCampanhas,
  abaVinculos) que devolve uma lista de elementos, e desenhar() escolhe qual delas usar.
*/

/* Funções de outros arquivos que usamos aqui */
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
  /* Área de avisos da página */
  const areaAlerta = $('#area-alerta');
  /* A URL pode pedir uma aba (?aba=campanhas); se o valor não é válido, usa "ongs" */
  const abaDaUrl = parametro('aba');
  let abaAtual = ['ongs', 'campanhas', 'vinculos'].includes(abaDaUrl) ? abaDaUrl : 'ongs';
  /* Estado da página: ONG com detalhes abertos e campanha escolhida na moderação ('' = nenhuma) */
  let ongSelecionada = null;
  let campanhaModerada = '';

  /* Abas com contador (os números são atualizados em desenhar) */
  const abas = criarAbas({
    rotulo: 'Tipos de aprovação',
    abas: [
      { id: 'ongs', rotulo: 'ONGs pendentes', contador: 0 },
      { id: 'campanhas', rotulo: 'Campanhas pendentes', contador: 0 },
      { id: 'vinculos', rotulo: 'Vínculos pendentes', contador: 0 }
    ],
    ativa: abaAtual,
    /* Ao trocar de aba: guarda o id e redesenha */
    aoMudar: (id) => { abaAtual = id; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  /* Listas de pendentes: funções, para sempre refletirem os dados atuais */
  const listaOngs = () => tabela('ong').filter((o) => !o.verificada);
  const listaCampanhas = () => tabela('campanha').filter((c) => c.status === 'pendente');
  const listaVinculos = () => pedidosPendentes(null);

  /* Atualiza os números das abas e troca o conteúdo da aba atual */
  function desenhar() {
    abas.atualizarContadores({ ongs: listaOngs().length, campanhas: listaCampanhas().length, vinculos: listaVinculos().length });
    /* Escolhe qual aba desenhar (cada função devolve uma lista de elementos) */
    let conteudo;
    if (abaAtual === 'ongs') conteudo = abaOngs();
    else if (abaAtual === 'campanhas') conteudo = abaCampanhas();
    else conteudo = abaVinculos();
    /* O "..." espalha a lista de elementos como argumentos de preencher */
    preencher($('#conteudo-aba'), ...conteudo);
  }

  /* ---------- Aba ONGs ---------- */
  function abaOngs() {
    /* ONGs pendentes; se a selecionada saiu da lista (ou não há), seleciona a primeira (ou null) */
    const ongs = listaOngs();
    if (!ongSelecionada || !ongs.some((o) => o.id_ong === ongSelecionada)) ongSelecionada = ongs[0]?.id_ong ?? null;
    const ong = ongSelecionada ? buscar('ong', ongSelecionada) : null;

    /* Tabela das ONGs pendentes */
    const tabelaOngs = criarTabela({
      legenda: 'ONGs aguardando aprovação',
      linhas: ongs,
      vazio: 'Nenhuma ONG aguardando aprovação.',
      /* A linha da ONG selecionada fica destacada */
      selecionada: (o) => o.id_ong === ongSelecionada,
      colunas: [
        { titulo: 'Nome', render: (o) => el('strong', {}, o.nome) },
        { titulo: 'CNPJ', render: (o) => o.cnpj },
        { titulo: 'Cidade', render: (o) => buscar('cidade', o.id_cidade).nome },
        { titulo: 'Cadastrada em', render: (o) => formatarData(o.data_cadastro) },
        {
          titulo: 'Ações',
          classe: 'acoes',
          /* Três botões por linha: Detalhes, Aprovar e Recusar */
          render: (o) => [
            el('button', { type: 'button', class: 'acao', 'aria-label': `Ver detalhes de ${o.nome}`, onclick: () => { ongSelecionada = o.id_ong; desenhar(); } }, 'Detalhes'),
            el('button', { type: 'button', class: 'acao acao-sucesso', 'aria-label': `Aprovar ${o.nome}`, onclick: () => aprovar(o) }, 'Aprovar'),
            el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Recusar ${o.nome}`, onclick: () => recusar(o) }, 'Recusar')
          ]
        }
      ]
    });

    /* Detalhe da ONG selecionada: descrição, endereço, contato e representante */
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
    /* Devolve a tabela e o detalhe (que é '' se não há ONG selecionada) */
    return [tabelaOngs, detalhe];
  }

  /* Aprovar a ONG: ela passa a ter o selo "ONG verificada" */
  function aprovar(ong) {
    aprovarOng(ong.id_ong);
    mostrarAlerta(areaAlerta, 'sucesso', 'ONG aprovada!', "Ela já aparece com o selo 'ONG verificada'.");
    desenhar();
  }

  /* Recusar a ONG: pede confirmação. "async" porque esperamos (await) a resposta do diálogo */
  async function recusar(ong) {
    const ok = await confirmar({ titulo: 'Recusar esta ONG?', texto: `O cadastro de "${ong.nome}" será removido e o representante não poderá mais entrar.`, rotuloConfirmar: 'Recusar ONG' });
    /* Se desistiu, não faz nada */
    if (!ok) return;
    recusarOng(ong.id_ong);
    mostrarAlerta(areaAlerta, 'info', 'Cadastro recusado.', `"${ong.nome}" foi removida da lista de pendentes.`);
    desenhar();
  }

  /* ---------- Aba Campanhas ---------- */
  function abaCampanhas() {
    /* Devolve uma lista com uma tabela só */
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
          /* Quatro ações por linha: Ver e Editar (links), Aprovar e Recusar (botões) */
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

  /* Aprovar a campanha: ela fica ativa e aparece para os doadores */
  function aprovarCamp(campanha) {
    aprovarCampanha(campanha.id_campanha);
    mostrarAlerta(areaAlerta, 'sucesso', 'Campanha aprovada!', `"${campanha.titulo}" já aparece para os doadores.`);
    desenhar();
  }

  /* Recusar a campanha: pede confirmação antes */
  async function recusarCamp(campanha) {
    const ok = await confirmar({ titulo: 'Recusar esta campanha?', texto: `O pedido "${campanha.titulo}" será removido e a ONG precisará solicitar de novo.`, rotuloConfirmar: 'Recusar campanha' });
    if (!ok) return;
    recusarCampanha(campanha.id_campanha);
    mostrarAlerta(areaAlerta, 'info', 'Pedido de campanha recusado.');
    desenhar();
  }

  /* ---------- Aba Vínculos ---------- */
  function abaVinculos() {
    /* Tabela dos pedidos de vínculo pendentes */
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
            /* Aceitar: abre o diálogo "aumenta a meta?" */
            el('button', { type: 'button', class: 'acao acao-sucesso', 'aria-label': `Aceitar ${p.necessidade.item}`, onclick: () => aceitarPedido(p) }, 'Aceitar'),
            /* Recusar: marca o vínculo como recusado, avisa e redesenha */
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

    /* Moderação: o administrador escolhe uma campanha e remove vínculos (RN-34) */
    /* Lista de campanhas; a escolhida continua marcada depois de redesenhar */
    const seletor = el('select', { id: 'campanha-moderada' });
    preencherSelect(seletor, tabela('campanha'), { valor: (c) => c.id_campanha, rotulo: (c) => c.titulo, primeira: 'Escolha uma campanha', selecionado: campanhaModerada || null });
    /* Ao escolher outra campanha: guarda o id e redesenha */
    seletor.addEventListener('change', () => { campanhaModerada = seletor.value; desenhar(); });

    /* Vínculos da campanha escolhida (lista vazia se nenhuma foi escolhida) */
    const vinculosDaCampanha = campanhaModerada
      ? tabela('campanha_necessidade').filter((v) => v.id_campanha === Number(campanhaModerada))
        .map((vinculo) => ({ vinculo, necessidade: buscar('necessidade', vinculo.id_necessidade) })).filter((i) => i.necessidade)
      : [];
    const moderacao = el('section', { class: 'secao', 'aria-labelledby': 'titulo-moderacao' },
      el('h2', { id: 'titulo-moderacao' }, 'Moderar vínculos de uma campanha'),
      el('div', { class: 'campo' }, el('label', { for: 'campanha-moderada' }, 'Campanha'), seletor),
      /* A tabela só aparece depois de escolher uma campanha */
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
            /* Botão Remover: apaga o vínculo, avisa e redesenha */
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
    /* Devolve a tabela dos pendentes e a seção de moderação */
    return [pendentes, moderacao];
  }

  /* Aceitar um pedido: abre o diálogo "aumenta a meta?" e grava a decisão (RN-33) */
  async function aceitarPedido(pedido) {
    /* Espera a resposta do diálogo (null se a pessoa cancelou) */
    const resposta = await perguntarAumentaMeta(pedido);
    if (!resposta) return;
    aceitarVinculo(pedido.campanha.id_campanha, pedido.necessidade.id_necessidade, resposta.aumenta);
    /* Mensagem diferente conforme a escolha "aumenta a meta" */
    mostrarAlerta(areaAlerta, 'sucesso', 'Necessidade aceita na campanha.', resposta.aumenta ? 'A meta da campanha aumentou.' : 'A necessidade ajuda a cumprir a meta já declarada.');
    desenhar();
  }

  /* Primeira pintura da página */
  desenhar();
}

/* Confere o login (só administrador) e monta cabeçalho e rodapé; depois monta a página */
if (iniciarPagina({ perfis: ['admin'] })) montar();
