/*
  doacoes-campanhas.js
  Página: paginas/admin/doacoes-campanhas.html (tela 19: Doações das campanhas).
  Para que serve: o administrador acompanha as doações às metas das campanhas criadas por ele e segue o
  fluxo oferecida -> aceita -> recebida (RN-40 e RN-41), podendo recusar com mensagem (RN-42).
  Depende de: pagina.js, regras de doações e campanhas, componentes de abas, tabela, selos e alertas.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarData, formatarDiaMes, nomeAbreviado, normalizar } from '../../utilitarios/formatacao.js';
import { doacoesDasCampanhasDoAdmin, detalharDoacao, quantidadeComUnidade, contarPorStatus, mudarStatus } from '../../regras/doacoes.js';
import { criarAbas } from '../../componentes/abas.js';
import { criarTabela } from '../../componentes/tabela.js';
import { seloStatusDoacao } from '../../componentes/selos.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { preencherSelect } from '../../componentes/formulario.js';
import { icone } from '../../componentes/icones.js';

const ABAS = [
  { id: 'oferecida', rotulo: 'Pendentes' },
  { id: 'aceita', rotulo: 'Aceitas' },
  { id: 'recebida', rotulo: 'Recebidas' },
  { id: 'recusada', rotulo: 'Recusadas' }
];

function montar() {
  const areaAlerta = $('#area-alerta');
  let abaAtual = 'oferecida';
  let selecionada = null;

  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Nome do doador ou item', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  /* Seletor com as campanhas criadas pela administração (as únicas cujas doações aparecem aqui) */
  const campanhasDoAdmin = tabela('campanha').filter((c) => c.id_ong === null);
  preencherSelect($('#filtro-campanha'), campanhasDoAdmin, { valor: (c) => c.id_campanha, rotulo: (c) => c.titulo, primeira: 'Todas', selecionado: parametro('campanha') });

  const abas = criarAbas({
    rotulo: 'Filtrar doações por status',
    abas: ABAS.map((a) => ({ ...a, contador: 0 })),
    ativa: abaAtual,
    aoMudar: (id) => { abaAtual = id; selecionada = null; desenhar(); }
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
    if (!selecionada || !linhas.some((d) => d.id_doacao === selecionada)) selecionada = linhas[0]?.id_doacao ?? null;

    preencher($('#lista'), criarTabela({
      legenda: 'Doações às metas das campanhas da administração',
      linhas,
      vazio: 'Nenhuma doação nesta situação.',
      selecionada: (d) => d.id_doacao === selecionada,
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
    }));
    desenharDetalhe();
  }

  function acoesDaLinha(d) {
    const botoes = [el('button', { type: 'button', class: 'acao', 'aria-label': 'Ver detalhes da doação', onclick: () => { selecionada = d.id_doacao; desenhar(); } }, 'Detalhes')];
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

  function desenharDetalhe() {
    const secao = $('#secao-detalhe');
    const doacao = selecionada ? buscar('doacao', selecionada) : null;
    secao.hidden = !doacao;
    if (!doacao) return;

    const info = detalharDoacao(doacao);
    const doador = buscar('usuario', doacao.id_doador);
    const campoMensagem = el('textarea', { id: 'mensagem', rows: 3, maxlength: 200, placeholder: 'Ex.: Obrigado! Entregue na recepção.' });
    const acionavel = doacao.status === 'oferecida' || doacao.status === 'aceita';

    preencher($('#detalhe'),
      el('dl', { class: 'resumo-lista' },
        el('dt', {}, 'Meta'), el('dd', {}, `${info.meta.item} (${info.campanha.titulo})`),
        el('dt', {}, 'Quantidade'), el('dd', {}, quantidadeComUnidade(doacao)),
        el('dt', {}, 'Endereço'), el('dd', {}, `${info.endereco} · entrega em ${formatarData(doacao.data_prevista)}`),
        el('dt', {}, 'Contato'), el('dd', {}, `${doador.nome} · ${doador.email} · ${doador.telefone}`),
        doacao.observacao ? el('dt', {}, 'Observação') : '', doacao.observacao ? el('dd', {}, `“${doacao.observacao}”`) : '',
        doacao.mensagem_ong ? el('dt', {}, 'Mensagem enviada') : '', doacao.mensagem_ong ? el('dd', {}, `“${doacao.mensagem_ong}”`) : ''),
      acionavel ? el('div', { class: 'campo' }, el('label', { for: 'mensagem' }, 'Mensagem ao doador (opcional)'), campoMensagem) : '',
      acionavel ? el('div', { class: 'linha linha-fim botoes-formulario' },
        el('button', { type: 'button', class: 'botao botao-secundario', onclick: () => alterar(doacao.id_doacao, 'recusada', campoMensagem.value) }, 'Recusar'),
        el('button', { type: 'button', class: 'botao botao-primario', onclick: () => alterar(doacao.id_doacao, doacao.status === 'oferecida' ? 'aceita' : 'recebida', campoMensagem.value) },
          doacao.status === 'oferecida' ? 'Aceitar doação' : 'Confirmar recebimento')) : '');
  }

  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());
  campoBusca.addEventListener('input', desenhar);
  $('#filtro-campanha').addEventListener('change', desenhar);
  desenhar();
}

if (iniciarPagina({ perfis: ['admin'] })) montar();
