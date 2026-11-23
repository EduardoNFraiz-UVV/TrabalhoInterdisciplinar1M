/*
  doacoes-campanhas.js
  Página: paginas/admin/doacoes-campanhas.html (tela 19: Doações das campanhas).
  Para que serve: o administrador acompanha as doações às metas das campanhas criadas por ele e segue o
  fluxo oferecida -> aceita -> recebida (RN-40 e RN-41), podendo recusar com mensagem (RN-42).
  A tabela tem paginação (10 por página) e o botão "Detalhes" abre um modal com os dados da doação.
  Depende de: pagina.js, regras de doações e campanhas, componentes de abas, tabela, paginação, diálogo, selos e alertas.
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
import { criarPaginacao, fatiar, preencherPagina } from '../../componentes/paginacao.js';
import { abrirDialogo } from '../../componentes/dialogo.js';
import { seloStatusDoacao } from '../../componentes/selos.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { preencherSelect } from '../../componentes/formulario.js';
import { icone } from '../../componentes/icones.js';

/* Quantas doações aparecem em cada página da tabela */
const POR_PAGINA = 10;

/* As quatro abas: o id é o status da doação; "oferecida" aparece como "Pendentes" */
const ABAS = [
  { id: 'oferecida', rotulo: 'Pendentes' },
  { id: 'aceita', rotulo: 'Aceitas' },
  { id: 'recebida', rotulo: 'Recebidas' },
  { id: 'recusada', rotulo: 'Recusadas' }
];

function montar() {
  /* Área de avisos e estado da tela: aba aberta e página atual da tabela (começa na 1) */
  const areaAlerta = $('#area-alerta');
  let abaAtual = 'oferecida';
  let pagina = 1;

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
    /* Ao trocar de aba: guarda a aba, volta para a página 1 e redesenha */
    aoMudar: (id) => { abaAtual = id; pagina = 1; desenhar(); }
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

  /* Desenha os contadores, a tabela e a paginação */
  function desenhar() {
    /* Doações que passam nos filtros e quantas há em cada status (para os números das abas) */
    const doacoes = filtradas();
    const contagem = contarPorStatus(doacoes);
    abas.atualizarContadores({ oferecida: contagem.oferecida, aceita: contagem.aceita, recebida: contagem.recebida, recusada: contagem.recusada });

    /* Linhas da tabela: só as da aba atual */
    const linhas = doacoes.filter((d) => d.status === abaAtual);
    /* Volta para a primeira página se a atual deixou de existir (ex.: a última doação da página foi aceita) */
    if ((pagina - 1) * POR_PAGINA >= linhas.length) pagina = 1;

    /* A tabela de uma página: recebe o número da página e mostra só as doações dela */
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
    /* Mostra a página atual com a altura da página mais alta, para a paginação não mudar de lugar */
    preencherPagina($('#lista'), { total: linhas.length, porPagina: POR_PAGINA, pagina, conteudo: tabelaDaPagina });
    /* Botões da paginação; ao escolher outra página, guarda o número e redesenha */
    preencher($('#paginacao'), criarPaginacao({ total: linhas.length, porPagina: POR_PAGINA, pagina, aoMudar: (nova) => { pagina = nova; desenhar(); } }));
  }

  /* Ações da linha: Detalhes (sempre), Aceitar e Recusar (oferecida), Confirmar recebimento (aceita) */
  function acoesDaLinha(d) {
    /* O botão "Detalhes" existe em toda linha: abre o modal com os dados da doação */
    const botoes = [el('button', { type: 'button', class: 'acao', 'aria-label': 'Ver detalhes da doação', onclick: () => abrirDetalhe(d) }, 'Detalhes')];
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

  /*
    Abre o modal com o detalhe da doação, a mensagem ao doador e os botões conforme o status.
    É "async" porque espera o administrador responder: o await abaixo só termina quando o modal fecha.
  */
  async function abrirDetalhe(doacao) {
    /* Dados prontos sobre o destino e o doador */
    const info = detalharDoacao(doacao);
    const doador = buscar('usuario', doacao.id_doador);
    /* Campo de mensagem ao doador e se a doação ainda pode receber uma ação (oferecida ou aceita) */
    const campoMensagem = el('textarea', { id: 'mensagem', rows: 3, maxlength: 200, placeholder: 'Ex.: Obrigado! Entregue na recepção.' });
    const acionavel = doacao.status === 'oferecida' || doacao.status === 'aceita';

    /* Botões do modal. "valor" é o que abrirDialogo devolve quando o botão é clicado (null = só fechar) */
    const botoes = [{ rotulo: 'Fechar', tipo: 'discreto', valor: null }];
    if (acionavel) {
      botoes.push({ rotulo: 'Recusar', tipo: 'secundario', valor: 'recusada' });
      /* O botão principal muda conforme o status: "oferecida" aceita; "aceita" confirma o recebimento */
      if (doacao.status === 'oferecida') botoes.push({ rotulo: 'Aceitar doação', tipo: 'primario', valor: 'aceita' });
      else botoes.push({ rotulo: 'Confirmar recebimento', tipo: 'primario', valor: 'recebida' });
    }

    /* Abre o modal (um <dialog>) e espera: "resposta" é o botão clicado, ou null se foi Fechar ou Esc */
    const resposta = await abrirDialogo({
      titulo: 'Detalhe da doação',
      corpo: el('div', { class: 'pilha' },
        /* <dl> = lista de definições: cada <dt> (nome) tem um <dd> (valor) */
        el('dl', { class: 'resumo-lista' },
          el('dt', {}, 'Meta'), el('dd', {}, `${info.meta.item} (${info.campanha.titulo})`),
          el('dt', {}, 'Doador'), el('dd', {}, doador.nome),
          el('dt', {}, 'Quantidade'), el('dd', {}, quantidadeComUnidade(doacao)),
          el('dt', {}, 'Endereço'), el('dd', {}, info.endereco),
          el('dt', {}, 'Entrega'), el('dd', {}, `Entrega em ${formatarData(doacao.data_prevista)}`),
          el('dt', {}, 'E-mail'), el('dd', {}, doador.email),
          el('dt', {}, 'Telefone'), el('dd', {}, doador.telefone),
          /* Observação e mensagem só entram na tela se existirem (senão entra texto vazio) */
          doacao.observacao ? el('dt', {}, 'Observação do doador') : '', doacao.observacao ? el('dd', {}, `“${doacao.observacao}”`) : '',
          doacao.mensagem_ong ? el('dt', {}, 'Mensagem enviada') : '', doacao.mensagem_ong ? el('dd', {}, `“${doacao.mensagem_ong}”`) : ''),
        /* O campo de mensagem só aparece enquanto a doação aceita ações */
        acionavel ? el('div', { class: 'campo' }, el('label', { for: 'mensagem' }, 'Mensagem ao doador (opcional)'), campoMensagem) : ''),
      botoes,
      /* Chamada quando um botão com valor é clicado: devolve o texto digitado (vem em resposta.dados) */
      ler: () => campoMensagem.value
    });
    /* Se foi escolhida uma ação (não foi Fechar nem Esc), muda o status com a mensagem digitada */
    if (resposta) alterar(doacao.id_doacao, resposta.valor, resposta.dados);
  }

  /* O formulário de filtros não deve recarregar a página ao ser enviado */
  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());
  /* Ao digitar na busca ou mudar a campanha, volta para a página 1 e redesenha */
  campoBusca.addEventListener('input', () => { pagina = 1; desenhar(); });
  $('#filtro-campanha').addEventListener('change', () => { pagina = 1; desenhar(); });
  /* Primeira pintura da página */
  desenhar();
}

/* Confere o login (só administrador) e monta cabeçalho e rodapé; depois monta a página */
if (iniciarPagina({ perfis: ['admin'] })) montar();
