/*
  doacoes-campanhas.js
  Página: paginas/admin/doacoes-campanhas.html (tela 19: Doações das campanhas).
  Para que serve: o administrador acompanha as doações às metas das campanhas criadas por ele e segue o
  fluxo oferecida -> aceita -> recebida (RN-40 e RN-41), podendo recusar com mensagem (RN-42).
  Depende de: pagina.js, regras de doações e campanhas, componentes de abas, tabela, selos e alertas.
*/

/* Funções de outros arquivos que usamos aqui */
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

/* As quatro abas: o id é o status da doação; "oferecida" aparece como "Pendentes" */
const ABAS = [
  { id: 'oferecida', rotulo: 'Pendentes' },
  { id: 'aceita', rotulo: 'Aceitas' },
  { id: 'recebida', rotulo: 'Recebidas' },
  { id: 'recusada', rotulo: 'Recusadas' }
];

function montar() {
  /* Área de avisos e estado da tela: aba aberta e doação selecionada para o detalhe */
  const areaAlerta = $('#area-alerta');
  let abaAtual = 'oferecida';
  let selecionada = null;

  /* Campo de busca com ícone */
  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Nome do doador ou item', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  /* Seletor com as campanhas criadas pela administração (as únicas cujas doações aparecem aqui) */
  const campanhasDoAdmin = tabela('campanha').filter((c) => c.id_ong === null);
  /* A URL pode trazer ?campanha=; essa campanha já começa escolhida */
  preencherSelect($('#filtro-campanha'), campanhasDoAdmin, { valor: (c) => c.id_campanha, rotulo: (c) => c.titulo, primeira: 'Todas', selecionado: parametro('campanha') });

  /* Abas com contador (os números são atualizados em desenhar) */
  const abas = criarAbas({
    rotulo: 'Filtrar doações por status',
    abas: ABAS.map((a) => ({ ...a, contador: 0 })),
    ativa: abaAtual,
    /* Ao trocar de aba: guarda a aba, limpa a doação selecionada e redesenha */
    aoMudar: (id) => { abaAtual = id; selecionada = null; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  /* Aplica a campanha escolhida e a busca à lista de doações */
  function filtradas() {
    /* Valor do filtro de campanha ('' = todas) e o texto buscado */
    const campanha = $('#filtro-campanha').value;
    const termo = normalizar(campoBusca.value);
    return doacoesDasCampanhasDoAdmin()
      /* Campanha: o id da campanha da doação precisa ser o escolhido */
      .filter((d) => !campanha || detalharDoacao(d).campanha.id_campanha === Number(campanha))
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
      legenda: 'Doações às metas das campanhas da administração',
      linhas,
      vazio: 'Nenhuma doação nesta situação.',
      /* A linha da doação selecionada fica destacada */
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
    /* Atualiza também a área de detalhe */
    desenharDetalhe();
  }

  /* Ações da linha: Detalhes (sempre), Aceitar e Recusar (oferecida), Confirmar recebimento (aceita) */
  function acoesDaLinha(d) {
    /* O botão "Detalhes" existe em toda linha: seleciona a doação e redesenha */
    const botoes = [el('button', { type: 'button', class: 'acao', 'aria-label': 'Ver detalhes da doação', onclick: () => { selecionada = d.id_doacao; desenhar(); } }, 'Detalhes')];
    /* Doação oferecida: pode ser aceita ou recusada */
    if (d.status === 'oferecida') {
      botoes.push(el('button', { type: 'button', class: 'acao acao-sucesso', onclick: () => alterar(d.id_doacao, 'aceita') }, 'Aceitar'));
      botoes.push(el('button', { type: 'button', class: 'acao acao-perigo', onclick: () => alterar(d.id_doacao, 'recusada') }, 'Recusar'));
    }
    /* Doação aceita: pode ter o recebimento confirmado */
    if (d.status === 'aceita') botoes.push(el('button', { type: 'button', class: 'acao acao-sucesso', onclick: () => alterar(d.id_doacao, 'recebida') }, 'Confirmar recebimento'));
    return botoes;
  }

  /* Muda o status da doação seguindo o fluxo e avisa o resultado */
  function alterar(idDoacao, novoStatus, mensagem = null) {
    /* mudarStatus devolve false se a mudança não é permitida pelo fluxo: então não fazemos nada */
    if (!mudarStatus(idDoacao, novoStatus, mensagem)) return;
    /* Texto de aviso para cada novo status */
    const texto = { aceita: 'Doação aceita. O doador foi avisado.', recusada: 'Doação recusada. O doador foi avisado.', recebida: 'Recebimento confirmado. O andamento da meta foi atualizado.' }[novoStatus];
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
    /* Campo de mensagem ao doador e se a doação ainda pode receber uma ação (oferecida ou aceita) */
    const campoMensagem = el('textarea', { id: 'mensagem', rows: 3, maxlength: 200, placeholder: 'Ex.: Obrigado! Entregue na recepção.' });
    const acionavel = doacao.status === 'oferecida' || doacao.status === 'aceita';

    preencher($('#detalhe'),
      /* <dl> = lista de definições: cada <dt> (nome) tem um <dd> (valor) */
      el('dl', { class: 'resumo-lista' },
        el('dt', {}, 'Meta'), el('dd', {}, `${info.meta.item} (${info.campanha.titulo})`),
        el('dt', {}, 'Quantidade'), el('dd', {}, quantidadeComUnidade(doacao)),
        el('dt', {}, 'Endereço'), el('dd', {}, `${info.endereco} · entrega em ${formatarData(doacao.data_prevista)}`),
        el('dt', {}, 'Contato'), el('dd', {}, `${doador.nome} · ${doador.email} · ${doador.telefone}`),
        /* Observação e mensagem só entram na tela se existirem (senão entra texto vazio) */
        doacao.observacao ? el('dt', {}, 'Observação') : '', doacao.observacao ? el('dd', {}, `“${doacao.observacao}”`) : '',
        doacao.mensagem_ong ? el('dt', {}, 'Mensagem enviada') : '', doacao.mensagem_ong ? el('dd', {}, `“${doacao.mensagem_ong}”`) : ''),
      /* Campo de mensagem e botões só aparecem enquanto a doação aceita ações */
      acionavel ? el('div', { class: 'campo' }, el('label', { for: 'mensagem' }, 'Mensagem ao doador (opcional)'), campoMensagem) : '',
      acionavel ? el('div', { class: 'linha linha-fim botoes-formulario' },
        el('button', { type: 'button', class: 'botao botao-secundario', onclick: () => alterar(doacao.id_doacao, 'recusada', campoMensagem.value) }, 'Recusar'),
        /* O botão principal muda conforme o status: "oferecida" aceita; "aceita" confirma o recebimento */
        el('button', { type: 'button', class: 'botao botao-primario', onclick: () => alterar(doacao.id_doacao, doacao.status === 'oferecida' ? 'aceita' : 'recebida', campoMensagem.value) },
          doacao.status === 'oferecida' ? 'Aceitar doação' : 'Confirmar recebimento')) : '');
  }

  /* O formulário de filtros não deve recarregar a página ao ser enviado */
  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());
  /* Redesenha ao digitar na busca ou mudar a campanha */
  campoBusca.addEventListener('input', desenhar);
  $('#filtro-campanha').addEventListener('change', desenhar);
  /* Primeira pintura da página */
  desenhar();
}

/* Confere o login (só administrador) e monta cabeçalho e rodapé; depois monta a página */
if (iniciarPagina({ perfis: ['admin'] })) montar();
