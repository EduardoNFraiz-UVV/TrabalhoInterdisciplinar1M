import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { inicial, formatarData, formatarQuantidade, formatarNumero, nomeAbreviado } from '../../utilitarios/formatacao.js';
import { necessidadesDaOng, prometido, faltam, ordemPorUrgencia } from '../../regras/necessidades.js';
import { detalharDoacao, quantidadeComUnidade } from '../../regras/doacoes.js';
import { criarAbas } from '../../componentes/abas.js';
import { criarTabela } from '../../componentes/tabela.js';
import { seloPrioridade, seloVerificada } from '../../componentes/selos.js';
import { botaoDoar } from '../../componentes/acoes-doacao.js';
import { preencherSelect } from '../../componentes/formulario.js';
import { alerta } from '../../componentes/alertas.js';
import { icone } from '../../componentes/icones.js';

function montar(usuario) {
  const ong = buscar('ong', parametro('id'));
  if (!ong || !ong.verificada) {
    $('#area-alerta').append(alerta('erro', 'ONG não encontrada.', 'Ela pode ter saído da plataforma. Veja a lista de ONGs.'));
    return;
  }
  const cidade = buscar('cidade', ong.id_cidade);
  $('#migalha-atual').textContent = ong.nome;
  document.title = `${ong.nome} · Conecta Doações`;

  preencher($('#cabecalho-ong'),
    el('div', { class: 'linha' },
      el('span', { class: 'inicial inicial-grande', 'aria-hidden': 'true' }, inicial(ong.nome)),
      el('div', { class: 'pilha pilha-pequena cresce' },
        el('h1', { id: 'titulo-ong' }, ong.nome),
        el('div', { class: 'linha' }, seloVerificada(), el('span', { class: 'texto-legenda' }, `CNPJ ${ong.cnpj}`)),
        el('p', {}, ong.descricao))));

  preencher($('#lista-contato'),
    el('li', {}, icone('pin', 18), `${ong.endereco}`),
    el('li', {}, icone('clock', 18), ong.horario_atendimento ?? 'Horário não informado'),
    el('li', {}, icone('phone', 18), [ong.telefone, ong.email_contato].filter(Boolean).join(' · ') || 'Contato não informado'),
    el('li', {}, icone('truck', 18), ong.aceita_retirada ? 'Aceita entrega no local ou retirada' : 'Aceita entrega no local'));

  const necessidades = () => necessidadesDaOng(ong.id_ong).filter((n) => n.situacao === 'ativa');
  const doacoesRecebidas = () => tabela('doacao').filter((d) => d.status === 'recebida' && d.id_necessidade && buscar('necessidade', d.id_necessidade).id_ong === ong.id_ong)
    .sort((a, b) => b.data_recebimento.localeCompare(a.data_recebimento));

  let abaAtual = 'necessidades';
  const abas = criarAbas({
    rotulo: 'Seções do perfil da ONG',
    abas: [
      { id: 'necessidades', rotulo: 'Necessidades', contador: necessidades().length },
      { id: 'sobre', rotulo: 'Sobre a ONG' },
      { id: 'doacoes', rotulo: 'Doações recebidas' }
    ],
    ativa: abaAtual,
    aoMudar: (id) => { abaAtual = id; desenharAba(); }
  });
  $('#abas').append(abas.elemento);

  function abaNecessidades() {
    const selectCategoria = el('select', { id: 'filtro-categoria' });
    preencherSelect(selectCategoria, tabela('categoria'), { valor: (c) => c.id_categoria, rotulo: (c) => c.nome, primeira: 'Todas' });
    const selectOrdem = el('select', { id: 'filtro-ordem' },
      el('option', { value: 'urgentes' }, 'Mais urgentes'),
      el('option', { value: 'faltam' }, 'O que mais falta'),
      el('option', { value: 'recentes' }, 'Mais recentes'));
    const area = el('div', {});

    function desenharTabela() {
      const ordem = selectOrdem.value;
      function comparar(a, b) {
        if (ordem === 'faltam') return faltam(b) - faltam(a);
        if (ordem === 'recentes') return b.data_atualizacao.localeCompare(a.data_atualizacao);
        return ordemPorUrgencia(a, b);
      }
      const lista = necessidades()
        .filter((n) => !selectCategoria.value || n.id_categoria === Number(selectCategoria.value))
        .sort(comparar);
      preencher(area, criarTabela({
        legenda: `Necessidades da ${ong.nome}`,
        linhas: lista,
        vazio: 'Nenhuma necessidade ativa com esse filtro.',
        colunas: [
          { titulo: 'Item', render: (n) => el('strong', {}, n.item) },
          { titulo: 'Categoria', render: (n) => buscar('categoria', n.id_categoria).nome },
          { titulo: 'Quantidade necessária', classe: 'numerico', render: (n) => formatarQuantidade(n.quantidade, n.unidade) },
          { titulo: 'Já prometido', classe: 'numerico', render: (n) => formatarNumero(prometido(n.id_necessidade)) },
          { titulo: 'Prioridade', render: (n) => seloPrioridade(n.prioridade) },
          {
            titulo: 'Ação',
            classe: 'acoes',
            render: (n) => (faltam(n) > 0
              ? botaoDoar(usuario, 'doar', { necessidade: n.id_necessidade }, { rotuloAcessivel: `Quero doar ${n.item}` })
              : el('span', { class: 'texto-legenda' }, 'Meta atingida'))
          }
        ]
      }));
    }
    selectCategoria.addEventListener('change', desenharTabela);
    selectOrdem.addEventListener('change', desenharTabela);
    desenharTabela();

    const botaoGeral = botaoDoar(usuario, 'doar', { ong: ong.id_ong }, { rotulo: 'Quero doar', tipo: 'primario', pequeno: false });
    return [
      el('div', { class: 'filtros' },
        el('div', { class: 'campo' }, el('label', { for: 'filtro-categoria' }, 'Categoria'), selectCategoria),
        el('div', { class: 'campo' }, el('label', { for: 'filtro-ordem' }, 'Ordenar'), selectOrdem)),
      area,
      el('p', { class: 'texto-legenda' }, 'URGENTE = necessário nos próximos 7 dias · Atualizado recentemente'),
      botaoGeral ? el('div', {}, botaoGeral) : ''
    ];
  }

  function abaSobre() {
    return el('div', { class: 'cartao' },
      el('h2', {}, 'Sobre a ONG'),
      el('p', {}, ong.descricao),
      el('dl', { class: 'resumo-lista' },
        el('dt', {}, 'Cidade'), el('dd', {}, `${cidade.nome} - ${cidade.uf}`),
        el('dt', {}, 'Cadastrada em'), el('dd', {}, formatarData(ong.data_cadastro)),
        el('dt', {}, 'Retirada'), el('dd', {}, ong.aceita_retirada ? 'Aceita retirada no endereço do doador' : 'Só entrega no local')));
  }

  function abaDoacoes() {
    const recebidas = doacoesRecebidas();
    return [
      el('p', { class: 'texto-apoio' }, `${recebidas.length} ${recebidas.length === 1 ? 'doação recebida' : 'doações recebidas'} por esta ONG. Mostramos as 8 mais recentes.`),
      criarTabela({
        legenda: 'Doações recebidas pela ONG',
        linhas: recebidas.slice(0, 8),
        vazio: 'Esta ONG ainda não confirmou doações recebidas.',
        colunas: [
          { titulo: 'Data', render: (d) => formatarData(d.data_recebimento) },
          { titulo: 'Doador', render: (d) => nomeAbreviado(buscar('usuario', d.id_doador).nome) },
          { titulo: 'Item', render: (d) => detalharDoacao(d).item },
          { titulo: 'Quantidade', classe: 'numerico', render: (d) => quantidadeComUnidade(d) }
        ]
      })
    ];
  }

  function desenharAba() {
    let conteudo;
    if (abaAtual === 'necessidades') conteudo = abaNecessidades();
    else if (abaAtual === 'sobre') conteudo = abaSobre();
    else conteudo = abaDoacoes();
    preencher($('#conteudo-aba'), conteudo);
  }
  desenharAba();
}

const contexto = iniciarPagina({ perfis: null });
if (contexto) montar(contexto.usuario);
