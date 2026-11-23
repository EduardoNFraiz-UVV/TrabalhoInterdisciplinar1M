/*
  minhas-doacoes.js
  Página: paginas/doador/minhas-doacoes.html (tela 06: Minhas doações).
  Para que serve: lista as doações do doador logado com filtro por status (abas com contador) e busca;
  mostra o detalhe com o acompanhamento em 3 passos; permite CANCELAR enquanto a doação está "oferecida" (RN-40).
  Depende de: pagina.js, regras de doações, componentes de abas, tabela, selos, progresso e diálogo.

  Roteiro da página (o mesmo de quase todas):
    1. iniciarPagina (no fim do arquivo) confere o login e chama montar();
    2. montar() cria a busca e as abas e chama desenhar();
    3. desenhar() filtra as doações e troca a tabela na tela;
    4. cada ação do usuário (aba, busca, "Ver detalhes", "Cancelar") muda uma variável e chama desenhar() de novo.
*/

/* Funções de outros arquivos que usamos aqui */
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

/* usuario: o doador logado */
function montar(usuario) {
  /* Área de avisos da página e aviso deixado pela página anterior (se houver) */
  const areaAlerta = $('#area-alerta');
  exibirAvisoGuardado(areaAlerta);          /* "Doação registrada com sucesso!" vindo do formulário */

  /* Estado da página: aba escolhida e doação que está com os detalhes abertos (null = nenhuma) */
  let abaAtual = 'todas';
  let selecionada = null;

  /* Campo de busca (criado aqui e colocado na página, com o ícone de lupa) */
  const campoBusca = el('input', { type: 'search', id: 'busca', 'aria-label': 'Buscar por ONG, campanha ou item', placeholder: 'Buscar por ONG, campanha ou item', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  /* Abas com contador: cada aba da lista ABAS ganha contador 0 (os números reais entram em desenhar) */
  const abas = criarAbas({
    rotulo: 'Filtrar doações por status',
    abas: ABAS.map((a) => ({ ...a, contador: 0 })),
    ativa: abaAtual,
    /* Quando o usuário escolhe outra aba: guarda o id e redesenha */
    aoMudar: (id) => { abaAtual = id; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  /* Aplica a busca por texto (ONG, campanha ou item) */
  function buscadas() {
    /* Texto digitado, sem acentos e em minúsculas */
    const termo = normalizar(campoBusca.value);
    return doacoesDoDoador(usuario.id_usuario).filter((d) => {
      /* Sem texto digitado, todas passam */
      if (!termo) return true;
      /* Com texto: o destino ou o item da doação precisa conter o texto */
      const info = detalharDoacao(d);
      return normalizar(info.destino).includes(termo) || normalizar(info.item).includes(termo);
    });
  }

  /* Desenha os números das abas, a tabela e os detalhes */
  function desenhar() {
    /* Doações que passam na busca e quantas há em cada status */
    const todas = buscadas();
    const contagem = contarPorStatus(todas);
    /* Atualiza os números que aparecem nas abas ("encerradas" soma recusadas e canceladas) */
    abas.atualizarContadores({
      todas: todas.length,
      oferecida: contagem.oferecida,
      aceita: contagem.aceita,
      recebida: contagem.recebida,
      encerradas: contagem.recusada + contagem.cancelada
    });

    /* Linhas da tabela: aba "todas" mostra tudo; "encerradas" mostra recusadas e canceladas; as outras, só o status igual ao da aba */
    const linhas = todas.filter((d) => abaAtual === 'todas'
      || (abaAtual === 'encerradas' ? ['recusada', 'cancelada'].includes(d.status) : d.status === abaAtual));

    /* Estado vazio que ensina o próximo passo: quem nunca doou vê o caminho para a lista de ONGs */
    const nuncaDoou = doacoesDoDoador(usuario.id_usuario).length === 0;
    const vazio = nuncaDoou
      ? el('span', {}, 'Você ainda não registrou doações. ', el('a', { href: url('ongs') }, 'Ver ONGs que precisam de ajuda'))
      : 'Nenhuma doação nesta situação.';

    /* Troca o conteúdo da caixa #lista pela tabela nova */
    preencher($('#lista'), criarTabela({
      legenda: 'Doações registradas por você',
      linhas,
      vazio,
      /* A linha da doação com detalhes abertos fica destacada */
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
            /* Botão "Ver detalhes": guarda qual doação abrir, redesenha e rola a tela até os detalhes */
            el('button', {
              type: 'button',
              class: 'acao',
              'aria-label': `Ver detalhes de ${detalharDoacao(d).item}`,
              onclick: () => {
                selecionada = d.id_doacao;
                desenhar();
                $('#secao-detalhe').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }, 'Ver detalhes'),
            /* Botão "Cancelar": só aparece enquanto a doação está "oferecida" */
            d.status === 'oferecida'
              ? el('button', {
                type: 'button',
                class: 'acao acao-perigo',
                'aria-label': `Cancelar doação de ${detalharDoacao(d).item}`,
                onclick: () => cancelar(d)
              }, 'Cancelar')
              : ''
          ]
        }
      ]
    }));

    /* Atualiza também a área de detalhes */
    desenharDetalhe();
  }

  /* Cancelar: só enquanto a doação está "oferecida" */
  /* "async" porque esperamos (await) a resposta do diálogo de confirmação */
  async function cancelar(doacao) {
    /* Abre o diálogo e espera o usuário clicar; confirmado é true ou false */
    const confirmado = await confirmar({
      titulo: 'Cancelar esta doação?',
      texto: `A ONG será avisada de que você não vai mais entregar ${quantidadeComUnidade(doacao)} de ${detalharDoacao(doacao).item}.`,
      rotuloConfirmar: 'Cancelar doação'
    });
    /* Se desistiu, não faz nada */
    if (!confirmado) return;
    /* Muda o status para "cancelada", avisa na tela e redesenha */
    mudarStatus(doacao.id_doacao, 'cancelada');
    mostrarAlerta(areaAlerta, 'info', 'Doação cancelada.', 'A ONG foi avisada.');
    desenhar();
  }

  /* Detalhes: passos, duas colunas de informação e o texto de acompanhamento */
  function desenharDetalhe() {
    /* Seção dos detalhes e a doação escolhida (null se nenhuma) */
    const secao = $('#secao-detalhe');
    const doacao = selecionada ? buscar('doacao', selecionada) : null;
    /* Sem doação escolhida, a seção fica escondida e paramos aqui */
    secao.hidden = !doacao;
    if (!doacao) return;

    /* Dados prontos sobre o destino da doação, se é para uma meta de campanha e o status atual */
    const info = detalharDoacao(doacao);
    const ehMeta = doacao.id_meta !== null;
    const status = doacao.status;

    /* Texto da forma de entrega: meta = leva ao endereço da campanha; senão depende da forma escolhida */
    let formaDeEntrega = 'Retirada no meu endereço';
    if (ehMeta) formaDeEntrega = 'Vou levar até o endereço da campanha';
    else if (doacao.forma_entrega === 'levar') formaDeEntrega = 'Vou levar até a ONG';

    /* Desenha os 3 passos e as duas colunas (<dl> = pares nome/valor) */
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
          el('dt', {}, 'Forma de entrega'), el('dd', {}, formaDeEntrega),
          el('dt', {}, 'Data prevista'), el('dd', {}, formatarData(doacao.data_prevista)),
          el('dt', {}, 'Endereço'), el('dd', {}, doacao.forma_entrega === 'retirada' ? doacao.endereco_retirada : info.endereco),
          el('dt', {}, 'Horário'), el('dd', {}, info.horario ?? '—'),
          el('dt', {}, ehMeta ? 'Quem recebe' : 'Contato'), el('dd', {}, ehMeta ? `${info.quemRecebe} · ${info.contato}` : info.contato),
          /* A mensagem da ONG só aparece se existir (senão entra texto vazio) */
          doacao.mensagem_ong ? el('dt', {}, 'Mensagem') : '', doacao.mensagem_ong ? el('dd', {}, `“${doacao.mensagem_ong}”`) : '')));

    /* Texto de acompanhamento de cada status */
    const textos = {
      oferecida: 'Aguardando a ONG aceitar a doação (geralmente em até 2 dias).',
      aceita: 'A doação foi aceita. Leve ou aguarde a retirada na data combinada.',
      recebida: `Recebida em ${formatarData(doacao.data_recebimento)}. Obrigado por ajudar!`,
      recusada: 'A doação foi recusada. Você pode ajudar outra necessidade.',
      cancelada: 'Você cancelou esta doação.'
    };
    /* E-mail de contato de quem recebe (info.ong pode ser null, por isso o ?.) */
    const emailContato = info.ong?.email_contato;
    /* Rodapé dos detalhes: o texto do status e, se houver e-mail, um botão para escrever */
    preencher($('#rodape-detalhe'),
      el('p', { class: 'texto-apoio' }, textos[status]),
      emailContato ? el('a', { class: 'botao botao-secundario', href: `mailto:${emailContato}` }, ehMeta ? 'Falar com quem recebe' : 'Falar com a ONG') : '');
  }

  /* O formulário de busca não deve recarregar a página ao ser enviado */
  $('#formulario-busca').addEventListener('submit', (evento) => evento.preventDefault());
  /* Ao digitar na busca, redesenha a tabela */
  campoBusca.addEventListener('input', desenhar);
  /* Primeira pintura da página */
  desenhar();
}

/* Passo 1: confere o login (só doador entra aqui) e monta o cabeçalho e o rodapé */
const contexto = iniciarPagina({ perfis: ['doador'] });
/* Passo 2: se está tudo certo, monta a página com o usuário logado */
if (contexto) montar(contexto.usuario);
