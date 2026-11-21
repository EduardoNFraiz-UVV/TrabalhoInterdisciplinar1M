/*
  painel.js
  Página: paginas/ong/painel.html (tela 07: Painel da ONG).
  Para que serve: mostra o resumo da ONG e permite ACEITAR ou RECUSAR os pedidos de vínculo de outras
  ONGs às campanhas criadas por esta ONG (RN-31 a RN-33), decidindo se a necessidade aumenta a meta.
  Depende de: pagina.js, regras (necessidades, doações, vínculos, campanhas) e componentes.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { url } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { primeiroNome, formatarDiaMes, formatarNumero, formatarQuantidade, nomeAbreviado, percentual, chaveMes, hojeISO } from '../../utilitarios/formatacao.js';
import { necessidadesDaOng, prometido, ordemPorUrgencia } from '../../regras/necessidades.js';
import { doacoesDaOng, detalharDoacao, quantidadeComUnidade } from '../../regras/doacoes.js';
import { pedidosPendentes, aceitarVinculo, recusarVinculo } from '../../regras/vinculos.js';
import { criarTabela } from '../../componentes/tabela.js';
import { seloStatusDoacao, seloSituacaoCampanha } from '../../componentes/selos.js';
import { barraProgresso } from '../../componentes/progresso.js';
import { alerta, mostrarAlerta, exibirAvisoGuardado } from '../../componentes/alertas.js';
import { perguntarAumentaMeta } from '../../componentes/dialogo-vinculo.js';

const contexto = iniciarPagina({ perfis: ['ong'] });
if (contexto) montar(contexto.usuario, contexto.ong);

function montar(usuario, ong) {
  const areaAlerta = $('#area-alerta');
  exibirAvisoGuardado(areaAlerta);        /* aviso deixado pela página anterior (ex.: campanha enviada) */

  /* Saudação e percentual de perfil completo (conta quantos dados da ONG estão preenchidos) */
  $('#saudacao').textContent = `Olá, ${primeiroNome(usuario.nome)}! Painel do ${ong.nome}`;
  const camposDoPerfil = [ong.descricao, ong.endereco, ong.horario_atendimento, ong.telefone, ong.email_contato];
  const completo = Math.round((camposDoPerfil.filter(Boolean).length / camposDoPerfil.length) * 100);
  $('#subtitulo').textContent = completo < 100
    ? `Perfil ${completo}% completo. Falta preencher dados em "Editar perfil da ONG".`
    : 'Perfil completo.';

  /* RN-09: aviso para ONG ainda não verificada */
  if (!ong.verificada) {
    areaAlerta.append(alerta('aviso', 'Sua ONG ainda não foi verificada.', 'O administrador está analisando o cadastro. Enquanto isso, você não pode cadastrar necessidades nem solicitar campanhas.'));
  }

  /* Cartão de resumo: número grande, rótulo e link */
  const cartaoResumo = (numero, rotulo, textoLink, href) => el('div', { class: 'cartao cartao-resumo' },
    el('span', { class: 'numero' }, formatarNumero(numero)),
    el('span', { class: 'rotulo-resumo' }, rotulo),
    el('a', { href, class: 'texto-forte' }, `${textoLink} ›`));

  /* Desenha tudo que depende dos dados (chamado de novo depois de aceitar ou recusar um pedido) */
  function desenhar() {
    const doacoes = doacoesDaOng(ong.id_ong);
    const mesAtual = chaveMes(hojeISO());

    preencher($('#cartoes-resumo'),
      cartaoResumo(necessidadesDaOng(ong.id_ong).filter((n) => n.situacao === 'ativa').length, 'Necessidades cadastradas', 'Gerenciar', url('necessidades')),
      cartaoResumo(doacoes.filter((d) => d.status === 'oferecida').length, 'Doações pendentes', 'Ver pendentes', url('doacoesRecebidas', { aba: 'oferecida' })),
      cartaoResumo(doacoes.filter((d) => d.status === 'recebida' && chaveMes(d.data_recebimento) === mesAtual).length, 'Recebidas no mês', 'Ver histórico', url('doacoesRecebidas', { aba: 'recebida' })));

    /* Tabela das 4 últimas doações */
    preencher($('#ultimas'), criarTabela({
      legenda: 'Últimas doações recebidas pela ONG',
      linhas: doacoes.slice(0, 4),
      vazio: 'Sua ONG ainda não recebeu doações.',
      colunas: [
        { titulo: 'Data', render: (d) => formatarDiaMes(d.data_registro) },
        { titulo: 'Doador', render: (d) => nomeAbreviado(buscar('usuario', d.id_doador).nome) },
        { titulo: 'Item', render: (d) => detalharDoacao(d).item },
        { titulo: 'Qtd.', classe: 'numerico', render: (d) => quantidadeComUnidade(d) },
        { titulo: 'Status', render: (d) => seloStatusDoacao(d.status) }
      ]
    }));

    /* Barras de progresso das 3 necessidades mais urgentes */
    const urgentes = necessidadesDaOng(ong.id_ong).filter((n) => n.situacao === 'ativa').sort(ordemPorUrgencia).slice(0, 3);
    preencher($('#progressos'), urgentes.length === 0
      ? el('p', { class: 'texto-apoio' }, 'Nenhuma necessidade ativa.')
      : urgentes.map((n) => {
        const p = prometido(n.id_necessidade);
        return barraProgresso(n.item, `${formatarNumero(p)} de ${formatarNumero(n.quantidade)}${n.unidade !== 'un.' ? ` ${n.unidade}` : ''}`, percentual(p, n.quantidade));
      }));

    /* Campanhas que a ONG solicitou, com o selo de situação */
    const campanhas = tabela('campanha').filter((c) => c.id_ong === ong.id_ong);
    preencher($('#campanhas'), campanhas.length === 0
      ? el('li', { class: 'texto-apoio' }, 'Você ainda não solicitou campanhas.')
      : campanhas.map((c) => el('li', { class: 'linha linha-entre' },
        c.status === 'ativa' ? el('a', { href: url('campanha', { id: c.id_campanha }) }, c.titulo) : el('span', {}, c.titulo),
        seloSituacaoCampanha(c.status))));

    desenharPedidos();
  }

  /* Pedidos de vínculo às campanhas criadas por esta ONG */
  function desenharPedidos() {
    const pedidos = pedidosPendentes(ong.id_ong);
    preencher($('#pedidos'), criarTabela({
      legenda: 'Pedidos de vínculo às campanhas da ONG',
      linhas: pedidos,
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
            el('button', { type: 'button', class: 'acao', 'aria-label': `Aceitar ${p.necessidade.item}`, onclick: () => aceitar(p) }, 'Aceitar'),
            el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Recusar ${p.necessidade.item}`, onclick: () => recusar(p) }, 'Recusar')
          ]
        }
      ]
    }));
  }

  /* Aceitar: abre o diálogo "aumenta a meta?" e grava a decisão (RN-33) */
  async function aceitar(pedido) {
    const resposta = await perguntarAumentaMeta(pedido);
    if (!resposta) return;
    aceitarVinculo(pedido.campanha.id_campanha, pedido.necessidade.id_necessidade, resposta.aumenta);
    mostrarAlerta(areaAlerta, 'sucesso', 'Necessidade aceita na campanha.',
      resposta.aumenta ? `A meta da campanha "${pedido.campanha.titulo}" aumentou.` : `"${pedido.necessidade.item}" ajuda a cumprir a meta já declarada.`);
    desenhar();
  }

  /* Recusar: o vínculo recusado não conta na meta nem no progresso (RN-34) */
  function recusar(pedido) {
    recusarVinculo(pedido.campanha.id_campanha, pedido.necessidade.id_necessidade);
    mostrarAlerta(areaAlerta, 'info', 'Pedido recusado.', `"${pedido.necessidade.item}" não entra na campanha.`);
    desenhar();
  }

  desenhar();
}
