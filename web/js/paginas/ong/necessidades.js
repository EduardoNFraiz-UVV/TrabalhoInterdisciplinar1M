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

const contexto = iniciarPagina({ perfis: ['ong'] });
if (contexto) montar(contexto.ong);

function montar(ong) {
  const areaAlerta = $('#area-alerta');
  exibirAvisoGuardado(areaAlerta);

  if (!ong.verificada) {
    areaAlerta.append(alerta('aviso', 'Sua ONG ainda não foi verificada.', 'Assim que o administrador aprovar o cadastro, você poderá cadastrar necessidades.'));
    const botaoNova = $('#botao-nova');
    botaoNova.setAttribute('aria-disabled', 'true');
    botaoNova.removeAttribute('href');
  }

  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Ex.: cobertor', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  preencherSelect($('#filtro-categoria'), tabela('categoria'), {
    valor: (c) => c.id_categoria,
    rotulo: (c) => c.nome,
    primeira: 'Todas'
  });

  function desenhar() {
    const termo = normalizar(campoBusca.value);
    const categoria = $('#filtro-categoria').value;
    const prioridade = $('#filtro-prioridade').value;
    const situacao = $('#filtro-situacao').value;

    const linhas = necessidadesDaOng(ong.id_ong)
      .filter((n) => !termo || normalizar(n.item).includes(termo))
      .filter((n) => !categoria || n.id_categoria === Number(categoria))
      .filter((n) => !prioridade || n.prioridade === prioridade)
      .filter((n) => !situacao || n.situacao === situacao)
      .sort(ordemPorUrgencia);

    $('#contagem').textContent = `${linhas.length} ${linhas.length === 1 ? 'necessidade encontrada' : 'necessidades encontradas'}`;

    const semNecessidades = necessidadesDaOng(ong.id_ong).length === 0;
    const vazio = semNecessidades && ong.verificada
      ? el('span', {}, 'Você ainda não cadastrou necessidades. ', el('a', { href: url('necessidadeForm') }, 'Cadastrar a primeira necessidade'))
      : 'Nenhuma necessidade encontrada com esses filtros.';

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

  function colunaCampanhas(necessidade) {
    const vinculos = vinculosDaNecessidade(necessidade.id_necessidade).filter((v) => v.vinculo.status !== 'recusado');
    if (vinculos.length === 0) return '—';
    return el('ul', { class: 'lista-simples', role: 'list' }, vinculos.map(({ vinculo, campanha }) =>
      el('li', {}, vinculo.status === 'pendente' ? `${campanha.titulo} (aguardando)` : campanha.titulo)));
  }

  function acoes(n) {
    return [
      el('a', { class: 'acao', href: url('necessidadeForm', { id: n.id_necessidade }), 'aria-label': `Editar ${n.item}` }, 'Editar'),
      n.situacao === 'ativa'
        ? el('button', { type: 'button', class: 'acao acao-sucesso', 'aria-label': `Concluir ${n.item}`, onclick: () => concluir(n) }, 'Concluir')
        : el('button', { type: 'button', class: 'acao', 'aria-label': `Reativar ${n.item}`, onclick: () => reativar(n) }, 'Reativar'),
      el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Excluir ${n.item}`, onclick: () => excluir(n) }, 'Excluir')
    ];
  }

  function concluir(n) {
    concluirNecessidade(n.id_necessidade);
    mostrarAlerta(areaAlerta, 'sucesso', 'Necessidade concluída.', `"${n.item}" não recebe mais doações.`);
    desenhar();
  }

  function reativar(n) {
    atualizar('necessidade', n.id_necessidade, { situacao: 'ativa' });
    mostrarAlerta(areaAlerta, 'sucesso', 'Necessidade reativada.', `"${n.item}" voltou a receber doações.`);
    desenhar();
  }

  async function excluir(n) {
    const quantidadePrometida = prometido(n.id_necessidade);
    const temPrometido = quantidadePrometida > 0;
    const botoes = [{ rotulo: 'Cancelar', tipo: 'discreto', valor: null }];
    if (temPrometido) botoes.push({ rotulo: 'Marcar concluída', tipo: 'secundario', valor: 'concluir' });
    botoes.push({ rotulo: 'Excluir', tipo: 'perigo', valor: 'excluir' });

    const resposta = await abrirDialogo({
      titulo: 'Excluir necessidade?',
      texto: temPrometido
        ? `"${n.item}" tem ${formatarQuantidade(quantidadePrometida, n.unidade)} prometidos por doadores. Eles serão avisados. Você pode marcar como concluída em vez de excluir.`
        : `"${n.item}" será removida da lista. Esta ação não pode ser desfeita.`,
      botoes
    });
    if (resposta === 'concluir') return concluir(n);
    if (resposta !== 'excluir') return;

    vinculosDaNecessidade(n.id_necessidade).forEach(({ campanha }) => removerVinculo(campanha.id_campanha, n.id_necessidade));
    const resultado = excluirNecessidade(n.id_necessidade);
    mostrarAlerta(areaAlerta, 'sucesso',
      resultado === 'excluida' ? 'Necessidade excluída.' : 'Necessidade marcada como concluída.',
      resultado === 'excluida' ? 'Os doadores com doações prometidas foram avisados.' : 'Ela já tem doações recebidas, então fica no histórico como concluída.');
    desenhar();
  }

  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());

  campoBusca.addEventListener('input', desenhar);
  ['#filtro-categoria', '#filtro-prioridade', '#filtro-situacao'].forEach((seletor) => $(seletor).addEventListener('change', desenhar));

  desenhar();
}
