/*
  necessidades.js
  Página: paginas/ong/necessidades.html (tela 08: Gerenciar necessidades).
  Para que serve: é o CRUD do site. LISTA as necessidades da ONG com busca e filtros, e permite
  EDITAR (leva ao formulário), CONCLUIR (marca como concluída direto na linha, RN-14) e
  EXCLUIR (com diálogo de confirmação quando há doações prometidas, RN-15).
  Depende de: pagina.js, armazenamento.js, regras de necessidades, componentes de tabela, selos e diálogo.

  CRUD = Create (criar, no formulário), Read (listar, aqui), Update (editar) e Delete (excluir).
*/

/* Funções de outros arquivos que usamos aqui */
import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, atualizar } from '../../nucleo/armazenamento.js';
import { url } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { normalizar, formatarQuantidade, formatarNumero, formatarData } from '../../utilitarios/formatacao.js';
import { necessidadesDaOng, prometido, concluirNecessidade, excluirNecessidade, vinculosDaNecessidade, ordemPorUrgencia } from '../../regras/necessidades.js';
import { removerVinculo } from '../../regras/vinculos.js';
import { criarTabela } from '../../componentes/tabela.js';
import { seloPrioridade } from '../../componentes/selos.js';
import { alerta, mostrarAlerta, exibirAvisoGuardado } from '../../componentes/alertas.js';
import { abrirDialogo } from '../../componentes/dialogo.js';
import { preencherSelect } from '../../componentes/formulario.js';
import { icone } from '../../componentes/icones.js';

/* Só representantes de ONG abrem esta página */
/* (montar é declarada mais abaixo; funções criadas com "function" podem ser usadas antes da linha onde aparecem) */
const contexto = iniciarPagina({ perfis: ['ong'] });
if (contexto) montar(contexto.ong);

/* ong: a ONG de quem está logado */
function montar(ong) {
  /* Área de avisos e aviso deixado pela página anterior */
  const areaAlerta = $('#area-alerta');
  exibirAvisoGuardado(areaAlerta);

  /* RN-09: ONG ainda não verificada não cadastra necessidades */
  if (!ong.verificada) {
    areaAlerta.append(alerta('aviso', 'Sua ONG ainda não foi verificada.', 'Assim que o administrador aprovar o cadastro, você poderá cadastrar necessidades.'));
    /* O botão "Nova necessidade" fica desativado: avisa o leitor de tela e tira o endereço do link */
    const botaoNova = $('#botao-nova');
    botaoNova.setAttribute('aria-disabled', 'true');
    botaoNova.removeAttribute('href');
  }

  /* Campo de busca com o ícone de lupa */
  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Ex.: cobertor', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  /* Lista de categorias do filtro */
  preencherSelect($('#filtro-categoria'), tabela('categoria'), {
    valor: (c) => c.id_categoria,
    rotulo: (c) => c.nome,
    primeira: 'Todas'
  });

  /* Desenha a tabela de acordo com os filtros atuais */
  function desenhar() {
    /* Valores atuais dos filtros */
    const termo = normalizar(campoBusca.value);
    const categoria = $('#filtro-categoria').value;
    const prioridade = $('#filtro-prioridade').value;
    const situacao = $('#filtro-situacao').value;

    /* Cada .filter() aplica um filtro; um filtro vazio ("!termo ||") deixa todos passarem */
    const linhas = necessidadesDaOng(ong.id_ong)
      .filter((n) => !termo || normalizar(n.item).includes(termo))
      .filter((n) => !categoria || n.id_categoria === Number(categoria))
      .filter((n) => !prioridade || n.prioridade === prioridade)
      .filter((n) => !situacao || n.situacao === situacao)
      .sort(ordemPorUrgencia);

    /* Contagem com singular/plural */
    $('#contagem').textContent = `${linhas.length} ${linhas.length === 1 ? 'necessidade encontrada' : 'necessidades encontradas'}`;

    /* Estado vazio com próximo passo: se a ONG não tem nenhuma necessidade, o link leva ao cadastro */
    const semNecessidades = necessidadesDaOng(ong.id_ong).length === 0;
    const vazio = semNecessidades && ong.verificada
      ? el('span', {}, 'Você ainda não cadastrou necessidades. ', el('a', { href: url('necessidadeForm') }, 'Cadastrar a primeira necessidade'))
      : 'Nenhuma necessidade encontrada com esses filtros.';

    /* Troca o conteúdo da caixa #lista pela tabela nova */
    preencher($('#lista'), criarTabela({
      legenda: 'Necessidades cadastradas pela ONG',
      linhas,
      vazio,
      colunas: [
        { titulo: 'Item', render: (n) => el('strong', {}, n.item) },
        { titulo: 'Categoria', render: (n) => tabela('categoria').find((c) => c.id_categoria === n.id_categoria).nome },
        { titulo: 'Quantidade', classe: 'numerico', render: (n) => formatarQuantidade(n.quantidade, n.unidade) },
        { titulo: 'Prometido', classe: 'numerico', render: (n) => formatarNumero(prometido(n.id_necessidade)) },
        { titulo: 'Prioridade', render: (n) => seloPrioridade(n.prioridade) },
        { titulo: 'Campanhas', render: colunaCampanhas },
        { titulo: 'Atualizado em', render: (n) => formatarData(n.data_atualizacao) },
        { titulo: 'Ações', classe: 'acoes', render: (n) => acoes(n) }
      ]
    }));
  }

  /* Coluna Campanhas: nome da campanha, "(aguardando)" se o pedido não foi aceito, ou travessão */
  function colunaCampanhas(necessidade) {
    /* Vínculos desta necessidade, sem os recusados */
    const vinculos = vinculosDaNecessidade(necessidade.id_necessidade).filter((v) => v.vinculo.status !== 'recusado');
    /* Nenhum vínculo: mostra um travessão */
    if (vinculos.length === 0) return '—';
    /* Uma lista com o título de cada campanha; pedidos pendentes ganham "(aguardando)" */
    return el('ul', { class: 'lista-simples', role: 'list' }, vinculos.map(({ vinculo, campanha }) =>
      el('li', {}, vinculo.status === 'pendente' ? `${campanha.titulo} (aguardando)` : campanha.titulo)));
  }

  /* Links de ação da linha: Editar (primary), Concluir (verde) e Excluir (vermelho), só texto, sem ícone */
  function acoes(n) {
    return [
      /* Editar: um link para o formulário, com o id da necessidade na URL */
      el('a', { class: 'acao', href: url('necessidadeForm', { id: n.id_necessidade }), 'aria-label': `Editar ${n.item}` }, 'Editar'),
      /* Ativa: botão "Concluir". Concluída: botão "Reativar" */
      n.situacao === 'ativa'
        ? el('button', { type: 'button', class: 'acao acao-sucesso', 'aria-label': `Concluir ${n.item}`, onclick: () => concluir(n) }, 'Concluir')
        : el('button', { type: 'button', class: 'acao', 'aria-label': `Reativar ${n.item}`, onclick: () => reativar(n) }, 'Reativar'),
      /* Excluir */
      el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Excluir ${n.item}`, onclick: () => excluir(n) }, 'Excluir')
    ];
  }

  /* Concluir: marca como concluída direto na linha, sem diálogo */
  function concluir(n) {
    concluirNecessidade(n.id_necessidade);
    mostrarAlerta(areaAlerta, 'sucesso', 'Necessidade concluída.', `"${n.item}" não recebe mais doações.`);
    desenhar();
  }

  /* Reativar: volta uma necessidade concluída para ativa */
  function reativar(n) {
    atualizar('necessidade', n.id_necessidade, { situacao: 'ativa' });
    mostrarAlerta(areaAlerta, 'sucesso', 'Necessidade reativada.', `"${n.item}" voltou a receber doações.`);
    desenhar();
  }

  /* Excluir: se há doações prometidas (RN-15), o diálogo também oferece "Marcar concluída" */
  async function excluir(n) {
    /* Quanto já foi prometido por doadores */
    const quantidadePrometida = prometido(n.id_necessidade);
    const temPrometido = quantidadePrometida > 0;
    /* Botões do diálogo: sempre Cancelar e Excluir; "Marcar concluída" só se há promessas */
    const botoes = [{ rotulo: 'Cancelar', tipo: 'discreto', valor: null }];
    if (temPrometido) botoes.push({ rotulo: 'Marcar concluída', tipo: 'secundario', valor: 'concluir' });
    botoes.push({ rotulo: 'Excluir', tipo: 'perigo', valor: 'excluir' });

    /* Abre o diálogo e espera a resposta (o "valor" do botão clicado) */
    const resposta = await abrirDialogo({
      titulo: 'Excluir necessidade?',
      texto: temPrometido
        ? `"${n.item}" tem ${formatarQuantidade(quantidadePrometida, n.unidade)} prometidos por doadores. Eles serão avisados. Você pode marcar como concluída em vez de excluir.`
        : `"${n.item}" será removida da lista. Esta ação não pode ser desfeita.`,
      botoes
    });
    /* Escolheu "Marcar concluída": faz isso e termina */
    if (resposta === 'concluir') return concluir(n);
    /* Qualquer resposta que não seja "excluir" (Cancelar ou Esc) não faz nada */
    if (resposta !== 'excluir') return;

    /* Vínculos com campanhas saem junto; a regra de negócio decide se exclui de verdade ou conclui (histórico) */
    vinculosDaNecessidade(n.id_necessidade).forEach(({ campanha }) => removerVinculo(campanha.id_campanha, n.id_necessidade));
    const resultado = excluirNecessidade(n.id_necessidade);
    /* Mensagem conforme o resultado: 'excluida' ou 'concluida' */
    mostrarAlerta(areaAlerta, 'sucesso',
      resultado === 'excluida' ? 'Necessidade excluída.' : 'Necessidade marcada como concluída.',
      resultado === 'excluida' ? 'Os doadores com doações prometidas foram avisados.' : 'Ela já tem doações recebidas, então fica no histórico como concluída.');
    desenhar();
  }

  /* Apertar Enter na busca não deve recarregar a página */
  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());

  /* Qualquer mudança nos filtros redesenha a tabela */
  campoBusca.addEventListener('input', desenhar);
  ['#filtro-categoria', '#filtro-prioridade', '#filtro-situacao'].forEach((seletor) => $(seletor).addEventListener('change', desenhar));

  /* Primeira pintura da página */
  desenhar();
}
