/*
  campanha.js
  Página: paginas/publico/campanha.html (tela 15: Campanha, detalhe).
  Para que serve: mostra a campanha escolhida (?id=) com metas e progresso (RN-26 e RN-27), onde entregar
  e as necessidades de ONGs aceitas. Só campanhas ATIVAS aparecem para visitantes e doadores (RN-20);
  administrador e a ONG que criou podem abrir também as pendentes e encerradas.
  Depende de: pagina.js, armazenamento.js, regras de campanhas, componentes de progresso, tabela e ações.
*/

/* Funções de outros arquivos que usamos aqui */
import { iniciarPagina } from '../../nucleo/pagina.js';
import { buscar } from '../../nucleo/armazenamento.js';
import { url, parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarData, formatarNumero, formatarQuantidade, percentual, ROTULO_TIPO_CAMPANHA } from '../../utilitarios/formatacao.js';
import { metasDaCampanha, metaTotal, recebidoDaCampanha, recebidoDaMeta, progressoDaCampanha, vinculosAceitos, textoCidades, nomeCriador, quantidadeDeOngs, faltamDaMeta } from '../../regras/campanhas.js';
import { recebido, faltam } from '../../regras/necessidades.js';
import { barraProgresso } from '../../componentes/progresso.js';
import { criarTabela } from '../../componentes/tabela.js';
import { seloEmergencia, seloPrioridade, seloSituacaoCampanha } from '../../componentes/selos.js';
import { botaoDoar } from '../../componentes/acoes-doacao.js';
import { alerta } from '../../componentes/alertas.js';
import { icone } from '../../componentes/icones.js';

/* Quantas necessidades aparecem de início (o botão "Ver mais" mostra o resto) */
const INICIAIS = 6;

/* usuario: quem está logado (ou null); ong: a ONG dele (ou null) */
function montar(usuario, ong) {
  /* 1. Acha a campanha pelo número da URL (?id=...) */
  const campanha = buscar('campanha', parametro('id'));
  /* Administrador e a ONG dona da campanha podem ver campanhas que não estão ativas */
  const podeVerNaoAtiva = usuario && (usuario.perfil === 'admin' || (ong && campanha?.id_ong === ong.id_ong));

  /* Campanha inexistente ou fora do ar para quem não é dono */
  if (!campanha || (campanha.status !== 'ativa' && !podeVerNaoAtiva)) {
    $('#area-alerta').append(alerta('aviso', 'Esta campanha não está disponível.', 'Ela pode ter sido encerrada ou ainda estar em análise. Veja as campanhas ativas.'));
    $('#destaque').append(el('a', { class: 'botao botao-primario', href: url('campanhasAtivas') }, 'Ver campanhas ativas'));
    return;
  }

  /* Id e progresso (0 a 100) da campanha; o título da aba do navegador leva o nome da campanha */
  const id = campanha.id_campanha;
  const progresso = progressoDaCampanha(id);
  document.title = `${campanha.titulo} · Conecta Doações`;

  /* Card de destaque: selo, título, descrição, cidades e tipo, prazo e barra geral */
  preencher($('#destaque'), el('div', { class: 'cartao cartao-campanha' },
    el('div', { class: 'linha' }, seloEmergencia(), campanha.status !== 'ativa' ? seloSituacaoCampanha(campanha.status) : ''),
    el('h1', { id: 'titulo-campanha' }, campanha.titulo),
    el('p', {}, campanha.descricao),
    el('div', { class: 'linha' },
      el('span', { class: 'meta-linha' }, icone('pin', 14), `${textoCidades(id)} · ${ROTULO_TIPO_CAMPANHA[campanha.tipo]}`),
      el('span', { class: 'meta-linha' }, icone('clock', 14), `Arrecadação até ${formatarData(campanha.data_fim)}`)),
    barraProgresso('Meta da campanha', `${progresso}% atingida`, progresso)));

  /* Mostra o corpo da página (que começa escondido) */
  $('#corpo').hidden = false;

  /* Metas gerais: barra de progresso e botão "Doar para esta meta" (leva à tela 18) */
  preencher($('#metas'), metasDaCampanha(id).map((meta) => {
    /* Quanto esta meta já recebeu */
    const recebidoMeta = recebidoDaMeta(meta.id_meta);
    /* O botão só existe se a campanha está ativa e ainda falta algo (e se o perfil pode doar) */
    const botao = campanha.status === 'ativa' && faltamDaMeta(meta) > 0
      ? botaoDoar(usuario, 'doarCampanha', { meta: meta.id_meta }, { rotulo: 'Doar para esta meta', rotuloAcessivel: `Doar para a meta ${meta.item}` })
      : null;
    /* Um item de lista por meta: título, botão e barra de progresso */
    return el('li', { class: 'cartao cartao-compacto' },
      el('div', { class: 'linha linha-entre' },
        el('h3', {}, `${formatarNumero(meta.quantidade)} · ${meta.item}`),
        botao ?? ''),
      barraProgresso(buscar('categoria', meta.id_categoria).nome, `${formatarNumero(recebidoMeta)} de ${formatarNumero(meta.quantidade)}`, percentual(recebidoMeta, meta.quantidade)));
  }));

  /* Necessidades vinculadas aceitas */
  const vinculos = vinculosAceitos(id);
  /* Começa mostrando só as primeiras; "Ver mais" liga esta variável */
  let mostrarTodas = false;
  $('#texto-necessidades').textContent = 'Cada item é uma necessidade de uma ONG participante. Doe direto para a ONG que precisa.';

  /* Desenha a tabela de necessidades (todas ou só as primeiras) */
  function desenharNecessidades() {
    const lista = mostrarTodas ? vinculos : vinculos.slice(0, INICIAIS);
    preencher($('#necessidades'), criarTabela({
      legenda: 'Necessidades de ONGs vinculadas à campanha',
      linhas: lista,
      vazio: 'Nenhuma necessidade de ONG vinculada ainda.',
      colunas: [
        { titulo: 'Item', render: (v) => el('strong', {}, v.necessidade.item) },
        { titulo: 'ONG', render: (v) => v.ong.nome },
        { titulo: 'Pedido', classe: 'numerico', render: (v) => formatarQuantidade(v.necessidade.quantidade, v.necessidade.unidade) },
        { titulo: 'Recebido', classe: 'numerico', render: (v) => formatarQuantidade(recebido(v.necessidade.id_necessidade), v.necessidade.unidade) },
        { titulo: 'Prioridade', render: (v) => seloPrioridade(v.necessidade.prioridade) },
        {
          titulo: 'Ação',
          classe: 'acoes',
          /* Botão de doar só com campanha ativa e se ainda falta algo; senão, célula vazia */
          render: (v) => (campanha.status === 'ativa' && faltam(v.necessidade) > 0
            ? botaoDoar(usuario, 'doar', { necessidade: v.necessidade.id_necessidade }, { rotuloAcessivel: `Quero doar ${v.necessidade.item}` })
            : '')
        }
      ]
    }));
    /* Botão "Ver mais": some se cabem todas; o texto alterna entre "Ver menos" e "Ver mais (N)" */
    const botaoMais = $('#ver-mais');
    botaoMais.hidden = vinculos.length <= INICIAIS;
    botaoMais.textContent = mostrarTodas ? 'Ver menos' : `Ver mais necessidades (${vinculos.length - INICIAIS})`;
  }
  /* Ao clicar em "Ver mais/menos": inverte a variável (true vira false e vice-versa) e redesenha */
  $('#ver-mais').addEventListener('click', () => { mostrarTodas = !mostrarTodas; desenharNecessidades(); });
  desenharNecessidades();

  /* Resumo da campanha */
  /* ONG que criou a campanha (null se foi o administrador) */
  const criadora = campanha.id_ong ? buscar('ong', campanha.id_ong) : null;
  preencher($('#resumo'),
    el('dt', {}, 'Meta total'), el('dd', {}, `${formatarNumero(metaTotal(id))} itens`),
    el('dt', {}, 'Já atendido'), el('dd', {}, `${progresso}% (${formatarNumero(recebidoDaCampanha(id))} itens)`),
    el('dt', {}, 'Necessidades'), el('dd', {}, `${vinculos.length} de ${quantidadeDeOngs(id)} ${quantidadeDeOngs(id) === 1 ? 'ONG' : 'ONGs'}`),
    el('dt', {}, 'Prazo'), el('dd', {}, formatarData(campanha.data_fim)),
    /* Se foi uma ONG, o nome vira link para o perfil dela; se foi o administrador, só o texto */
    el('dt', {}, 'Criada por'), el('dd', {}, criadora ? el('a', { href: url('ong', { id: criadora.id_ong }) }, nomeCriador(campanha)) : nomeCriador(campanha)));

  /* Onde entregar: endereço e horário de recebimento da campanha */
  preencher($('#entrega'),
    el('li', {}, icone('pin', 18), campanha.endereco_recebimento),
    el('li', {}, icone('clock', 18), campanha.horario_recebimento ?? 'Horário não informado'));
}

/* Prepara a página (pública). O menu marca "inicio" para quem está logado e "campanhas-ativas" para visitante */
const contexto = iniciarPagina({ perfis: null, pagina: (usuario) => (usuario ? 'inicio' : 'campanhas-ativas') });
/* Se não está redirecionando, monta o conteúdo com o usuário e a ONG dele */
if (contexto) montar(contexto.usuario, contexto.ong);
