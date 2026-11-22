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
  exibirAvisoGuardado(areaAlerta);

  $('#saudacao').textContent = `Olá, ${primeiroNome(usuario.nome)}! Painel do ${ong.nome}`;
  const camposDoPerfil = [ong.descricao, ong.endereco, ong.horario_atendimento, ong.telefone, ong.email_contato];
  const completo = Math.round((camposDoPerfil.filter(Boolean).length / camposDoPerfil.length) * 100);
  $('#subtitulo').textContent = completo < 100
    ? `Perfil ${completo}% completo. Falta preencher dados em "Editar perfil da ONG".`
    : 'Perfil completo.';

  if (!ong.verificada) {
    areaAlerta.append(alerta('aviso', 'Sua ONG ainda não foi verificada.', 'O administrador está analisando o cadastro. Enquanto isso, você não pode cadastrar necessidades nem solicitar campanhas.'));
  }

  const cartaoResumo = (numero, rotulo, textoLink, href) => el('div', { class: 'cartao cartao-resumo' },
    el('span', { class: 'numero' }, formatarNumero(numero)),
    el('span', { class: 'rotulo-resumo' }, rotulo),
    el('a', { href, class: 'texto-forte' }, `${textoLink} ›`));

  function desenhar() {
    const doacoes = doacoesDaOng(ong.id_ong);
    const mesAtual = chaveMes(hojeISO());

    preencher($('#cartoes-resumo'),
      cartaoResumo(necessidadesDaOng(ong.id_ong).filter((n) => n.situacao === 'ativa').length, 'Necessidades cadastradas', 'Gerenciar', url('necessidades')),
      cartaoResumo(doacoes.filter((d) => d.status === 'oferecida').length, 'Doações pendentes', 'Ver pendentes', url('doacoesRecebidas', { aba: 'oferecida' })),
      cartaoResumo(doacoes.filter((d) => d.status === 'recebida' && chaveMes(d.data_recebimento) === mesAtual).length, 'Recebidas no mês', 'Ver histórico', url('doacoesRecebidas', { aba: 'recebida' })));

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

    const urgentes = necessidadesDaOng(ong.id_ong).filter((n) => n.situacao === 'ativa').sort(ordemPorUrgencia).slice(0, 3);
    preencher($('#progressos'), urgentes.length === 0
      ? el('p', { class: 'texto-apoio' }, 'Nenhuma necessidade ativa.')
      : urgentes.map((n) => {
        const p = prometido(n.id_necessidade);
        return barraProgresso(n.item, `${formatarNumero(p)} de ${formatarNumero(n.quantidade)}${n.unidade !== 'un.' ? ` ${n.unidade}` : ''}`, percentual(p, n.quantidade));
      }));

    const campanhas = tabela('campanha').filter((c) => c.id_ong === ong.id_ong);
    preencher($('#campanhas'), campanhas.length === 0
      ? el('li', { class: 'texto-apoio' }, 'Você ainda não solicitou campanhas.')
      : campanhas.map((c) => el('li', { class: 'linha linha-entre' },
        c.status === 'ativa' ? el('a', { href: url('campanha', { id: c.id_campanha }) }, c.titulo) : el('span', {}, c.titulo),
        seloSituacaoCampanha(c.status))));

    desenharPedidos();
  }

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

  async function aceitar(pedido) {
    const resposta = await perguntarAumentaMeta(pedido);
    if (!resposta) return;
    aceitarVinculo(pedido.campanha.id_campanha, pedido.necessidade.id_necessidade, resposta.aumenta);
    mostrarAlerta(areaAlerta, 'sucesso', 'Necessidade aceita na campanha.',
      resposta.aumenta ? `A meta da campanha "${pedido.campanha.titulo}" aumentou.` : `"${pedido.necessidade.item}" ajuda a cumprir a meta já declarada.`);
    desenhar();
  }

  function recusar(pedido) {
    recusarVinculo(pedido.campanha.id_campanha, pedido.necessidade.id_necessidade);
    mostrarAlerta(areaAlerta, 'info', 'Pedido recusado.', `"${pedido.necessidade.item}" não entra na campanha.`);
    desenhar();
  }

  desenhar();
}
