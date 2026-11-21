/*
  minhas-doacoes.js
  Página: paginas/doador/minhas-doacoes.html (tela 06: Minhas doações).
  Para que serve: lista as doações do doador logado com filtro por status (abas com contador) e busca;
  mostra o detalhe com o acompanhamento em 3 passos; permite CANCELAR enquanto a doação está "oferecida" (RN-40).
  Depende de: pagina.js, regras de doações, componentes de abas, tabela, selos, progresso e diálogo.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { buscar } from '../../nucleo/armazenamento.js';
import { url } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarData, normalizar } from '../../utilitarios/formatacao.js';
import { doacoesDoDoador, detalharDoacao, quantidadeComUnidade, contarPorStatus, mudarStatus } from '../../regras/doacoes.js';
import { criarAbas } from '../../componentes/abas.js';
import { criarTabela } from '../../componentes/tabela.js';
import { seloStatusDoacao } from '../../componentes/selos.js';
import { passosDaDoacao } from '../../componentes/progresso.js';
import { confirmar } from '../../componentes/dialogo.js';
import { mostrarAlerta, exibirAvisoGuardado } from '../../componentes/alertas.js';
import { icone } from '../../componentes/icones.js';

/* Abas: o id "todas" mostra tudo; "encerradas" junta recusadas e canceladas */
const ABAS = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'oferecida', rotulo: 'Oferecidas' },
  { id: 'aceita', rotulo: 'Aceitas' },
  { id: 'recebida', rotulo: 'Recebidas' },
  { id: 'encerradas', rotulo: 'Recusadas e canceladas' }
];

function montar(usuario) {
  const areaAlerta = $('#area-alerta');
  exibirAvisoGuardado(areaAlerta);          /* "Doação registrada com sucesso!" vindo do formulário */

  let abaAtual = 'todas';
  let selecionada = null;

  const campoBusca = el('input', { type: 'search', id: 'busca', 'aria-label': 'Buscar por ONG, campanha ou item', placeholder: 'Buscar por ONG, campanha ou item', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  const abas = criarAbas({
    rotulo: 'Filtrar doações por status',
    abas: ABAS.map((a) => ({ ...a, contador: 0 })),
    ativa: abaAtual,
    aoMudar: (id) => { abaAtual = id; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  /* Aplica a busca por texto (ONG, campanha ou item) */
  function buscadas() {
    const termo = normalizar(campoBusca.value);
    return doacoesDoDoador(usuario.id_usuario).filter((d) => {
      if (!termo) return true;
      const info = detalharDoacao(d);
      return normalizar(info.destino).includes(termo) || normalizar(info.item).includes(termo);
    });
  }

  function desenhar() {
    const todas = buscadas();
    const contagem = contarPorStatus(todas);
    abas.atualizarContadores({ todas: todas.length, oferecida: contagem.oferecida, aceita: contagem.aceita, recebida: contagem.recebida, encerradas: contagem.recusada + contagem.cancelada });

    const linhas = todas.filter((d) => abaAtual === 'todas'
      || (abaAtual === 'encerradas' ? ['recusada', 'cancelada'].includes(d.status) : d.status === abaAtual));

    /* Estado vazio que ensina o próximo passo: quem nunca doou vê o caminho para a lista de ONGs */
    const nuncaDoou = doacoesDoDoador(usuario.id_usuario).length === 0;
    const vazio = nuncaDoou
      ? el('span', {}, 'Você ainda não registrou doações. ', el('a', { href: url('ongs') }, 'Ver ONGs que precisam de ajuda'))
      : 'Nenhuma doação nesta situação.';

    preencher($('#lista'), criarTabela({
      legenda: 'Doações registradas por você',
      linhas,
      vazio,
      selecionada: (d) => d.id_doacao === selecionada,
      colunas: [
        { titulo: 'Data', render: (d) => formatarData(d.data_registro) },
        { titulo: 'ONG ou campanha', render: (d) => detalharDoacao(d).destino },
        { titulo: 'Item', render: (d) => detalharDoacao(d).item },
        { titulo: 'Quantidade', classe: 'numerico', render: (d) => quantidadeComUnidade(d) },
        { titulo: 'Status', render: (d) => seloStatusDoacao(d.status) },
        {
          titulo: 'Ação',
          classe: 'acoes',
          render: (d) => [
            el('button', { type: 'button', class: 'acao', 'aria-label': `Ver detalhes de ${detalharDoacao(d).item}`, onclick: () => { selecionada = d.id_doacao; desenhar(); $('#secao-detalhe').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }, 'Ver detalhes'),
            d.status === 'oferecida' ? el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Cancelar doação de ${detalharDoacao(d).item}`, onclick: () => cancelar(d) }, 'Cancelar') : ''
          ]
        }
      ]
    }));

    desenharDetalhe();
  }

  /* Cancelar: só enquanto a doação está "oferecida" */
  async function cancelar(doacao) {
    const confirmado = await confirmar({
      titulo: 'Cancelar esta doação?',
      texto: `A ONG será avisada de que você não vai mais entregar ${quantidadeComUnidade(doacao)} de ${detalharDoacao(doacao).item}.`,
      rotuloConfirmar: 'Cancelar doação'
    });
    if (!confirmado) return;
    mudarStatus(doacao.id_doacao, 'cancelada');
    mostrarAlerta(areaAlerta, 'info', 'Doação cancelada.', 'A ONG foi avisada.');
    desenhar();
  }

  /* Detalhes: passos, duas colunas de informação e o texto de acompanhamento */
  function desenharDetalhe() {
    const secao = $('#secao-detalhe');
    const doacao = selecionada ? buscar('doacao', selecionada) : null;
    secao.hidden = !doacao;
    if (!doacao) return;

    const info = detalharDoacao(doacao);
    const ehMeta = doacao.id_meta !== null;
    const status = doacao.status;

    preencher($('#passos'), passosDaDoacao(status));
    preencher($('#colunas'),
      el('div', { class: 'pilha pilha-pequena' },
        el('h3', {}, 'Sua doação'),
        el('dl', { class: 'resumo-lista' },
          el('dt', {}, ehMeta ? 'Campanha' : 'ONG'), el('dd', {}, info.destino),
          el('dt', {}, 'Item'), el('dd', {}, info.item),
          el('dt', {}, 'Quantidade'), el('dd', {}, quantidadeComUnidade(doacao)),
          el('dt', {}, 'Observação'), el('dd', {}, doacao.observacao ? `“${doacao.observacao}”` : '—'),
          el('dt', {}, 'Registrada em'), el('dd', {}, formatarData(doacao.data_registro)))),
      el('div', { class: 'pilha pilha-pequena' },
        el('h3', {}, 'Entrega e contato'),
        el('dl', { class: 'resumo-lista' },
          el('dt', {}, 'Forma de entrega'), el('dd', {}, ehMeta ? 'Vou levar até o endereço da campanha' : doacao.forma_entrega === 'levar' ? 'Vou levar até a ONG' : 'Retirada no meu endereço'),
          el('dt', {}, 'Data prevista'), el('dd', {}, formatarData(doacao.data_prevista)),
          el('dt', {}, 'Endereço'), el('dd', {}, doacao.forma_entrega === 'retirada' ? doacao.endereco_retirada : info.endereco),
          el('dt', {}, 'Horário'), el('dd', {}, info.horario ?? '—'),
          el('dt', {}, ehMeta ? 'Quem recebe' : 'Contato'), el('dd', {}, ehMeta ? `${info.quemRecebe} · ${info.contato}` : info.contato),
          doacao.mensagem_ong ? el('dt', {}, 'Mensagem') : '', doacao.mensagem_ong ? el('dd', {}, `“${doacao.mensagem_ong}”`) : '')));

    const textos = {
      oferecida: 'Aguardando a ONG aceitar a doação (geralmente em até 2 dias).',
      aceita: 'A doação foi aceita. Leve ou aguarde a retirada na data combinada.',
      recebida: `Recebida em ${formatarData(doacao.data_recebimento)}. Obrigado por ajudar!`,
      recusada: 'A doação foi recusada. Você pode ajudar outra necessidade.',
      cancelada: 'Você cancelou esta doação.'
    };
    const emailContato = info.ong?.email_contato;
    preencher($('#rodape-detalhe'),
      el('p', { class: 'texto-apoio' }, textos[status]),
      emailContato ? el('a', { class: 'botao botao-secundario', href: `mailto:${emailContato}` }, ehMeta ? 'Falar com quem recebe' : 'Falar com a ONG') : '');
  }

  $('#formulario-busca').addEventListener('submit', (evento) => evento.preventDefault());
  campoBusca.addEventListener('input', desenhar);
  desenhar();
}

const contexto = iniciarPagina({ perfis: ['doador'] });
if (contexto) montar(contexto.usuario);
