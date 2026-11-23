/*
  doacoes-recebidas.js
  Página: paginas/ong/doacoes-recebidas.html (tela 09: Doações recebidas).
  Para que serve: a ONG filtra as doações por status (abas), por origem e por texto, e muda o status
  seguindo o fluxo oferecida -> aceita -> recebida (RN-40 e RN-41). Pode recusar com mensagem (RN-42).
  Depende de: pagina.js, regras de doações, componentes de abas, tabela, selos e alertas.
*/

/* Funções de outros arquivos que usamos aqui */
import { iniciarPagina } from '../../nucleo/pagina.js';
import { buscar } from '../../nucleo/armazenamento.js';
import { parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarData, formatarDiaMes, nomeAbreviado, normalizar, ROTULO_ENTREGA } from '../../utilitarios/formatacao.js';
import { doacoesDaOng, detalharDoacao, quantidadeComUnidade, contarPorStatus, mudarStatus } from '../../regras/doacoes.js';
import { criarAbas } from '../../componentes/abas.js';
import { criarTabela } from '../../componentes/tabela.js';
import { seloStatusDoacao } from '../../componentes/selos.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { icone } from '../../componentes/icones.js';

/* As quatro abas: o id é o status da doação; "oferecida" aparece como "Pendentes" */
const ABAS = [
  { id: 'oferecida', rotulo: 'Pendentes' },
  { id: 'aceita', rotulo: 'Aceitas' },
  { id: 'recebida', rotulo: 'Recebidas' },
  { id: 'recusada', rotulo: 'Recusadas' }
];

/* ong: a ONG de quem está logado */
function montar(ong) {
  /* Área de avisos da página */
  const areaAlerta = $('#area-alerta');

  /* Estado da tela: aba aberta e doação selecionada para o detalhe */
  let selecionada = null;
  /* A URL pode pedir uma aba (?aba=aceita); se o valor não existe na lista, usa "oferecida" */
  const abaDaUrl = parametro('aba');
  let abaAtual = ABAS.some((a) => a.id === abaDaUrl) ? abaDaUrl : 'oferecida';

  /* Campo de busca com ícone */
  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Nome do doador ou item', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  /* Abas com contador (os números são atualizados em desenhar) */
  const abas = criarAbas({
    rotulo: 'Filtrar doações por status',
    abas: ABAS.map((a) => ({ ...a, contador: 0 })),
    ativa: abaAtual,
    /* Ao trocar de aba: guarda a aba, limpa a doação selecionada e redesenha */
    aoMudar: (id) => { abaAtual = id; selecionada = null; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  /* Aplica origem e busca à lista de doações da ONG */
  function filtradas() {
    /* Valor do filtro de origem ('' = todas) e o texto buscado */
    const origem = $('#filtro-origem').value;
    const termo = normalizar(campoBusca.value);
    return doacoesDaOng(ong.id_ong)
      /* Origem: compara "é campanha?" (true/false) com "a doação tem id_meta?" */
      .filter((d) => !origem || (origem === 'campanhas') === (d.id_meta !== null))
      /* Busca: o nome do doador ou o item precisa conter o texto */
      .filter((d) => !termo || normalizar(buscar('usuario', d.id_doador).nome).includes(termo) || normalizar(detalharDoacao(d).item).includes(termo));
  }

  /* Desenha os contadores, a tabela e o detalhe */
  function desenhar() {
    /* Doações que passam nos filtros e quantas há em cada status (para os números das abas) */
    const doacoes = filtradas();
    const contagem = contarPorStatus(doacoes);
    abas.atualizarContadores({ oferecida: contagem.oferecida, aceita: contagem.aceita, recebida: contagem.recebida, recusada: contagem.recusada });

    /* Linhas da tabela: só as da aba atual */
    const linhas = doacoes.filter((d) => d.status === abaAtual);
    /* Mantém o detalhe aberto só se a doação ainda está na aba; senão, mostra a primeira da lista */
    if (!selecionada || !linhas.some((d) => d.id_doacao === selecionada)) selecionada = linhas[0]?.id_doacao ?? null;

    preencher($('#lista'), criarTabela({
      legenda: 'Doações oferecidas à ONG',
      linhas,
      /* Na aba de pendentes, o vazio explica quando as doações aparecem */
      vazio: abaAtual === 'oferecida'
        ? 'Nenhuma doação esperando resposta. Quando um doador registrar uma doação para suas necessidades ou campanhas, ela aparece aqui.'
        : 'Nenhuma doação nesta situação.',
      /* A linha da doação selecionada fica destacada */
      selecionada: (d) => d.id_doacao === selecionada,
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
    }));

    /* Atualiza também a área de detalhe */
    desenharDetalhe();
  }

  /* Ações da linha: Aceitar e Recusar (oferecida), Confirmar recebimento (aceita) e Detalhes (sempre) */
  function acoesDaLinha(d) {
    /* Nome do item, usado nos textos para leitores de tela */
    const nome = detalharDoacao(d).item;
    /* O botão "Detalhes" existe em toda linha: seleciona a doação e redesenha */
    const botoes = [el('button', { type: 'button', class: 'acao', 'aria-label': `Ver detalhes de ${nome}`, onclick: () => { selecionada = d.id_doacao; desenhar(); } }, 'Detalhes')];
    /* Doação oferecida: pode ser aceita ou recusada */
    if (d.status === 'oferecida') {
      botoes.push(el('button', { type: 'button', class: 'acao acao-sucesso', onclick: () => alterar(d.id_doacao, 'aceita') }, 'Aceitar'));
      botoes.push(el('button', { type: 'button', class: 'acao acao-perigo', onclick: () => alterar(d.id_doacao, 'recusada') }, 'Recusar'));
    }
    /* Doação aceita: pode ter o recebimento confirmado */
    if (d.status === 'aceita') {
      botoes.push(el('button', { type: 'button', class: 'acao acao-sucesso', onclick: () => alterar(d.id_doacao, 'recebida') }, 'Confirmar recebimento'));
    }
    return botoes;
  }

  /* Muda o status da doação seguindo o fluxo e avisa o resultado */
  function alterar(idDoacao, novoStatus, mensagem = null) {
    /* mudarStatus devolve false se a mudança não é permitida pelo fluxo: então não fazemos nada */
    if (!mudarStatus(idDoacao, novoStatus, mensagem)) return;
    /* Texto de aviso para cada novo status */
    const texto = { aceita: 'Doação aceita. O doador foi avisado.', recusada: 'Doação recusada. O doador foi avisado.', recebida: 'Recebimento confirmado. Obrigado por registrar!' }[novoStatus];
    /* Recusa é um aviso neutro ("info"); aceitar e receber são sucesso */
    mostrarAlerta(areaAlerta, novoStatus === 'recusada' ? 'info' : 'sucesso', texto);
    desenhar();
  }

  /* Detalhe da doação selecionada, com mensagem ao doador e botões conforme o status */
  function desenharDetalhe() {
    /* Seção do detalhe e a doação selecionada (null se nenhuma) */
    const secao = $('#secao-detalhe');
    const doacao = selecionada ? buscar('doacao', selecionada) : null;
    /* Sem doação selecionada, a seção fica escondida e paramos aqui */
    secao.hidden = !doacao;
    if (!doacao) return;

    /* Dados prontos sobre o destino e o doador */
    const info = detalharDoacao(doacao);
    const doador = buscar('usuario', doacao.id_doador);
    /* Texto da entrega: para meta de campanha, na ONG ou retirada no endereço do doador */
    let entrega = `Retirada em ${formatarData(doacao.data_prevista)}`;
    if (doacao.id_meta) entrega = `Entrega no endereço da campanha em ${formatarData(doacao.data_prevista)}`;
    else if (doacao.forma_entrega === 'levar') entrega = `Entrega na ONG em ${formatarData(doacao.data_prevista)}`;

    /* Campo de mensagem ao doador e se a doação ainda pode receber uma ação (oferecida ou aceita) */
    const campoMensagem = el('textarea', { id: 'mensagem', rows: 3, maxlength: 200, placeholder: 'Ex.: Obrigado! Pode entregar na portaria.' });
    const acionavel = doacao.status === 'oferecida' || doacao.status === 'aceita';

    preencher($('#detalhe'),
      el('p', {}, el('strong', {}, `${info.item}`), ` · de ${doador.nome}`),
      el('p', {}, `Quantidade: ${quantidadeComUnidade(doacao)} · ${entrega}`),
      /* Linhas opcionais: só entram na tela se o dado existe (senão entra texto vazio) */
      doacao.forma_entrega === 'retirada' ? el('p', {}, `Endereço de retirada: ${doacao.endereco_retirada}`) : '',
      doacao.observacao ? el('p', { class: 'texto-apoio' }, `Observação do doador: “${doacao.observacao}”`) : '',
      el('p', { class: 'texto-apoio' }, `Contato: ${doador.email} · ${doador.telefone}`),
      doacao.mensagem_ong ? el('p', { class: 'texto-apoio' }, `Mensagem enviada: “${doacao.mensagem_ong}”`) : '',
      /* Campo de mensagem e botões só aparecem enquanto a doação aceita ações */
      acionavel ? el('div', { class: 'campo' }, el('label', { for: 'mensagem' }, 'Mensagem ao doador (opcional)'), campoMensagem) : '',
      acionavel ? el('div', { class: 'linha linha-fim botoes-formulario' },
        el('button', { type: 'button', class: 'botao botao-secundario', onclick: () => alterar(doacao.id_doacao, 'recusada', campoMensagem.value) }, 'Recusar'),
        doacao.status === 'oferecida'
          ? el('button', { type: 'button', class: 'botao botao-primario', onclick: () => alterar(doacao.id_doacao, 'aceita', campoMensagem.value) }, 'Aceitar doação')
          : el('button', { type: 'button', class: 'botao botao-primario', onclick: () => alterar(doacao.id_doacao, 'recebida', campoMensagem.value) }, 'Confirmar recebimento')) : '');
  }

  /* O formulário de filtros não deve recarregar a página ao ser enviado */
  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());
  /* Redesenha ao digitar na busca ou mudar a origem */
  campoBusca.addEventListener('input', desenhar);
  $('#filtro-origem').addEventListener('change', desenhar);
  /* Primeira pintura da página */
  desenhar();
}

/* A chamada fica no FIM do arquivo para que as constantes acima já existam quando a página é montada */
const contexto = iniciarPagina({ perfis: ['ong'] });
if (contexto) montar(contexto.ong);
