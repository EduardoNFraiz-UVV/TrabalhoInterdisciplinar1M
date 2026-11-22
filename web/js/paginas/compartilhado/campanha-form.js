/*
  campanha-form.js (compartilhado)
  Para que serve: toda a lógica do formulário de campanha, usado em DUAS páginas:
    - paginas/ong/campanha-form.html   (tela 16: a ONG SOLICITA a campanha, que nasce pendente);
    - paginas/admin/campanha-form.html (tela 17: o administrador CRIA ou EDITA, e a campanha nasce ativa).
  Cuida de: cidades (várias), metas gerais (quantidade + categoria + item), endereço de recebimento,
  buscador geral de necessidades com filtros, "aumentar a meta" geral ou individual, resumo da meta total
  e a gravação com validação (RN-18, RN-21 a RN-23, RN-26, RN-31 a RN-33).
  Quem usa: js/paginas/ong/campanha-form.js e js/paginas/admin/campanha-form.js.
*/

import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { ir, parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarNumero, formatarQuantidade, normalizar } from '../../utilitarios/formatacao.js';
import { somarQuantidades, semRepetidos } from '../../utilitarios/listas.js';
import { necessidadesAtivas } from '../../regras/necessidades.js';
import { metasDaCampanha, cidadesDaCampanha, vinculosAceitos, salvarCampanha } from '../../regras/campanhas.js';
import { incluirNecessidades, removerVinculo } from '../../regras/vinculos.js';
import { obrigatorio, inteiroPositivo, periodoValido } from '../../regras/validacoes.js';
import { mostrarErros, limparErros, preencherSelect } from '../../componentes/formulario.js';
import { alerta, guardarAviso } from '../../componentes/alertas.js';
import { icone } from '../../componentes/icones.js';

/* Textos que mudam entre a página da ONG e a do administrador */
const TEXTOS = {
  ong: {
    titulo: 'Solicitar campanha emergencial',
    tituloEdicao: 'Editar pedido de campanha',
    botao: 'Enviar para aprovação',
    botaoEdicao: 'Salvar pedido',
    alerta: ['aviso', 'Aguardando aprovação', 'A campanha fica pendente até o administrador aprovar. Depois disso, aparece para os doadores.'],
    final: ['sucesso', 'Campanha enviada para aprovação.', 'O administrador vai analisar o pedido antes de a campanha aparecer para os doadores.'],
    destino: 'painelOng'
  },
  admin: {
    titulo: 'Nova campanha',
    tituloEdicao: 'Editar campanha',
    botao: 'Criar campanha',
    botaoEdicao: 'Salvar campanha',
    alerta: ['sucesso', 'Campanha ativa na hora', 'A campanha criada aqui já fica ativa para os doadores.'],
    final: ['sucesso', 'Campanha salva.', 'As alterações já valem para os doadores.'],
    destino: 'campanhasAdmin'
  }
};

/*
  Liga o formulário. modo: 'ong' ou 'admin'. ong: registro da ONG logada (null para o administrador).
*/
export function iniciarFormularioCampanha({ modo, ong }) {
  const ehOng = modo === 'ong';
  const textos = TEXTOS[modo];
  const form = $('#formulario-campanha');

  /* Modo edição (?id=): o administrador edita qualquer campanha; a ONG só edita pedidos seus ainda pendentes */
  const idEdicao = parametro('id');
  const campanha = idEdicao ? buscar('campanha', idEdicao) : null;
  if (idEdicao && (!campanha || (ehOng && (campanha.id_ong !== ong.id_ong || campanha.status !== 'pendente')))) {
    ir(textos.destino);
    return;
  }

  /* Títulos da página */
  $('#titulo-pagina').textContent = campanha ? textos.tituloEdicao : textos.titulo;
  const migalha = $('#migalha-atual');
  if (migalha) migalha.textContent = campanha ? textos.tituloEdicao : textos.titulo;
  document.title = `${campanha ? textos.tituloEdicao : textos.titulo} · Conecta Doações`;
  $('#botao-salvar').textContent = campanha ? textos.botaoEdicao : textos.botao;
  $('#alerta-situacao').replaceWith(alerta(...textos.alerta));

  /* RN-09: ONG não verificada não solicita campanhas */
  if (ehOng && !ong.verificada) {
    $('#area-alerta').append(alerta('aviso', 'Sua ONG ainda não foi verificada.', 'Você poderá solicitar campanhas depois que o administrador aprovar o cadastro.'));
    $('#botao-salvar').setAttribute('disabled', '');
  }

  /* No perfil ONG o link "+ Cadastrar nova necessidade" existe; no administrador ele não faz sentido */
  if (!ehOng) $('#link-nova-necessidade')?.remove();

  /* ---------- Estado do formulário ---------- */
  const metas = campanha ? metasDaCampanha(campanha.id_campanha).map((m) => ({ ...m })) : [];
  const selecionadas = new Map();          /* id da necessidade -> true/false (aumenta a meta) */
  if (campanha) {
    vinculosAceitos(campanha.id_campanha).forEach(({ vinculo, necessidade }) => selecionadas.set(necessidade.id_necessidade, vinculo.aumenta_meta));
  }
  let modoAumenta = 'individual';

  const nomeCategoria = (id) => buscar('categoria', id).nome;

  /* ---------- Cidades ---------- */
  const cidadesMarcadas = campanha ? cidadesDaCampanha(campanha.id_campanha).map((c) => c.id_cidade) : [];
  preencher($('#lista-cidades'), tabela('cidade').map((c) => el('div', { class: 'opcao' },
    el('input', { type: 'checkbox', id: `cidade-${c.id_cidade}`, name: 'cidades', value: c.id_cidade, checked: cidadesMarcadas.includes(c.id_cidade) }),
    el('label', { for: `cidade-${c.id_cidade}` }, `${c.nome} (${c.uf})`))));

  /* ---------- Campos de texto: valores iniciais ---------- */
  if (campanha) {
    form.titulo.value = campanha.titulo;
    form.tipo.value = campanha.tipo;
    form.data_inicio.value = campanha.data_inicio;
    form.data_fim.value = campanha.data_fim;
    form.descricao.value = campanha.descricao;
    form.endereco_recebimento.value = campanha.endereco_recebimento;
    form.horario_recebimento.value = campanha.horario_recebimento ?? '';
  }

  /* ---------- Endereço de recebimento (RN-22) ---------- */
  const radiosEndereco = form.elements.origem_endereco;     /* só existe na página da ONG */
  function aplicarEndereco() {
    if (!radiosEndereco) return;
    const usarOng = radiosEndereco.value === 'ong';
    if (usarOng) {
      form.endereco_recebimento.value = ong.endereco;
      form.horario_recebimento.value = ong.horario_atendimento ?? '';
    }
    form.endereco_recebimento.readOnly = usarOng;
    form.horario_recebimento.readOnly = usarOng;
  }
  if (radiosEndereco) {
    radiosEndereco.value = !campanha || campanha.endereco_recebimento === ong.endereco ? 'ong' : 'outro';
    aplicarEndereco();
    radiosEndereco.forEach((radio) => radio.addEventListener('change', aplicarEndereco));
  }

  /* ---------- Metas gerais ---------- */
  preencherSelect($('#meta-categoria'), tabela('categoria'), { valor: (c) => c.id_categoria, rotulo: (c) => c.nome, primeira: 'Selecione' });

  function desenharMetas() {
    preencher($('#metas-lista'), metas.length === 0
      ? el('li', { class: 'texto-apoio' }, 'Nenhuma meta adicionada ainda.')
      : metas.map((meta, indice) => el('li', {},
        el('span', {}, `${formatarNumero(meta.quantidade)} · ${nomeCategoria(meta.id_categoria)} · ${meta.item}`),
        el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Remover a meta ${meta.item}`, onclick: () => removerMeta(indice) }, 'Remover'))));
    /* As metas definem as categorias do buscador, então ele também é atualizado */
    ajustarSelecaoAsCategorias();
    atualizarFiltroDeCategorias();
    desenharNecessidades();
  }

  function removerMeta(indice) {
    const meta = metas[indice];
    /* Meta que já recebeu doações não pode sumir (o banco impede, pois a doação aponta para ela) */
    if (meta.id_meta && tabela('doacao').some((d) => d.id_meta === meta.id_meta)) {
      preencher($('#erro-metas'), alerta('erro', 'Esta meta já recebeu doações.', 'Ela não pode ser removida, para não perder o histórico dos doadores.'));
      return;
    }
    metas.splice(indice, 1);
    preencher($('#erro-metas'));
    desenharMetas();
  }

  $('#adicionar-meta').addEventListener('click', () => {
    const quantidade = $('#meta-quantidade').value;
    const categoria = $('#meta-categoria').value;
    const item = $('#meta-item').value.trim();
    if (!inteiroPositivo(quantidade) || !categoria || !item) {
      preencher($('#erro-metas'), alerta('erro', 'Meta incompleta.', 'Informe a quantidade (maior que zero), escolha a categoria e escreva o item. Exemplo: 1500, Higiene, itens de higiene.'));
      return;
    }
    metas.push({ id_categoria: Number(categoria), item, quantidade: Number(quantidade) });
    preencher($('#erro-metas'));
    $('#meta-quantidade').value = '';
    $('#meta-categoria').value = '';
    $('#meta-item').value = '';
    desenharMetas();
  });

  /* ---------- Buscador geral de necessidades ---------- */
  const campoBusca = el('input', { type: 'search', id: 'nec-busca', placeholder: 'Buscar necessidade ou ONG', autocomplete: 'off' });
  $('#campo-nec-busca').append(icone('search', 18), campoBusca);

  const ongsVerificadas = tabela('ong').filter((o) => o.verificada);
  preencherSelect($('#nec-ong'), ongsVerificadas, { valor: (o) => o.id_ong, rotulo: (o) => o.nome, primeira: 'Todas' });
  const cidadesDasOngs = semRepetidos(ongsVerificadas.map((o) => o.id_cidade)).map((id) => buscar('cidade', id)).sort((a, b) => a.nome.localeCompare(b.nome));
  preencherSelect($('#nec-cidade'), cidadesDasOngs, { valor: (c) => c.id_cidade, rotulo: (c) => c.nome, primeira: 'Todas' });

  /* Categorias que a campanha pede: as das metas (sem metas, qualquer categoria) */
  function categoriasPermitidas() {
    const ids = semRepetidos(metas.map((m) => m.id_categoria));
    return ids.length ? ids : tabela('categoria').map((c) => c.id_categoria);
  }

  /* O filtro de categoria só lista as categorias permitidas */
  function atualizarFiltroDeCategorias() {
    const seletor = $('#nec-categoria');
    const atual = seletor.value;
    preencherSelect(seletor, categoriasPermitidas().map((id) => buscar('categoria', id)), { valor: (c) => c.id_categoria, rotulo: (c) => c.nome, primeira: 'Todas' });
    if ([...seletor.options].some((o) => o.value === atual)) seletor.value = atual;
  }

  /* Se uma meta saiu, necessidades de categorias que a campanha não pede mais deixam de estar selecionadas */
  function ajustarSelecaoAsCategorias() {
    const permitidas = categoriasPermitidas();
    [...selecionadas.keys()].forEach((id) => {
      if (!permitidas.includes(buscar('necessidade', id).id_categoria)) selecionadas.delete(id);
    });
  }

  /* Necessidades que passam pelos filtros */
  function candidatas() {
    const termo = normalizar(campoBusca.value);
    const filtroOng = $('#nec-ong').value;
    const filtroCategoria = $('#nec-categoria').value;
    const filtroPrioridade = $('#nec-prioridade').value;
    const filtroCidade = $('#nec-cidade').value;
    const permitidas = categoriasPermitidas();
    return necessidadesAtivas().filter((n) => {
      const dona = buscar('ong', n.id_ong);
      return permitidas.includes(n.id_categoria)
        && (!termo || normalizar(n.item).includes(termo) || normalizar(dona.nome).includes(termo))
        && (!filtroOng || n.id_ong === Number(filtroOng))
        && (!filtroCategoria || n.id_categoria === Number(filtroCategoria))
        && (!filtroPrioridade || n.prioridade === filtroPrioridade)
        && (!filtroCidade || dona.id_cidade === Number(filtroCidade));
    });
  }

  function desenharNecessidades() {
    const lista = candidatas();
    preencher($('#nec-lista'), lista.length === 0
      ? el('p', { class: 'campo-ajuda lista-vazia' }, 'Nenhuma necessidade encontrada com esses filtros.')
      : lista.map((n) => {
        const dona = buscar('ong', n.id_ong);
        const marcada = selecionadas.has(n.id_necessidade);
        return el('div', { class: 'item item-necessidade' },
          el('div', { class: 'opcao' },
            el('input', {
              type: 'checkbox', id: `nec-${n.id_necessidade}`, checked: marcada,
              onchange: (evento) => {
                if (evento.target.checked) selecionadas.set(n.id_necessidade, modoAumenta === 'todas');
                else selecionadas.delete(n.id_necessidade);
                desenharNecessidades();
              }
            }),
            el('label', { for: `nec-${n.id_necessidade}` }, `${n.item} · ${dona.nome} · ${formatarQuantidade(n.quantidade, n.unidade)}`)),
          el('div', { class: 'opcao' },
            el('input', {
              type: 'checkbox', id: `aumenta-${n.id_necessidade}`, checked: marcada && selecionadas.get(n.id_necessidade),
              disabled: !marcada || modoAumenta !== 'individual',
              onchange: (evento) => { selecionadas.set(n.id_necessidade, evento.target.checked); desenharResumo(); }
            }),
            el('label', { for: `aumenta-${n.id_necessidade}` }, 'Aumenta a meta')));
      }));
    desenharResumo();
  }

  /* Escolha geral de "aumentar a meta": todas, nenhuma ou uma a uma (RN-33) */
  form.elements.modo_aumenta.forEach((radio) => radio.addEventListener('change', () => {
    modoAumenta = form.elements.modo_aumenta.value;
    if (modoAumenta !== 'individual') [...selecionadas.keys()].forEach((id) => selecionadas.set(id, modoAumenta === 'todas'));
    desenharNecessidades();
  }));

  ['#nec-ong', '#nec-categoria', '#nec-prioridade', '#nec-cidade'].forEach((seletor) => $(seletor).addEventListener('change', desenharNecessidades));
  campoBusca.addEventListener('input', desenharNecessidades);

  /* ---------- Resumo da meta (RN-26) ---------- */
  function desenharResumo() {
    const gerais = somarQuantidades(metas);
    let aumento = 0;
    let qtdAumentam = 0;
    for (const [id, aumenta] of selecionadas) {
      if (aumenta) {
        aumento += buscar('necessidade', id).quantidade;
        qtdAumentam += 1;
      }
    }
    const qtdSelecionadas = selecionadas.size;

    preencher($('#resumo-meta'),
      el('dt', {}, 'Metas gerais'),
      el('dd', {}, metas.length ? `${metas.map((m) => formatarNumero(m.quantidade)).join(' + ')} = ${formatarNumero(gerais)}` : '—'),
      el('dt', {}, 'Necessidades que aumentam a meta'),
      el('dd', {}, `+ ${formatarNumero(aumento)}`),
      el('dt', {}, 'Meta total'),
      el('dd', { class: 'destaque' }, `${formatarNumero(gerais + aumento)} itens`));

    $('#nec-rodape').textContent = `${qtdSelecionadas} ${qtdSelecionadas === 1 ? 'necessidade selecionada' : 'necessidades selecionadas'} · aumentam a meta: ${qtdAumentam}`;
  }

  /* ---------- Salvar ---------- */
  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limparErros(form);
    const dados = new FormData(form);
    const cidades = dados.getAll('cidades').map(Number);
    const erros = {};

    if (!obrigatorio(dados.get('titulo'))) erros.titulo = 'Informe o título da campanha, por exemplo "Enchente em Vila Velha".';
    if (!dados.get('tipo')) erros.tipo = 'Escolha o tipo da campanha.';
    if (cidades.length === 0) erros.cidades = 'Escolha pelo menos uma cidade afetada.';
    if (!dados.get('data_inicio')) erros.data_inicio = 'Informe a data de início.';
    if (!dados.get('data_fim')) erros.data_fim = 'Informe a data de fim.';
    else if (dados.get('data_inicio') && !periodoValido(dados.get('data_inicio'), dados.get('data_fim'))) erros.data_fim = 'A data de fim não pode ser anterior à data de início.';
    if (!obrigatorio(dados.get('descricao'))) erros.descricao = 'Descreva a campanha para os doadores entenderem como ajudar.';
    if (!obrigatorio(dados.get('endereco_recebimento'))) erros.endereco_recebimento = 'Informe o endereço onde as doações serão entregues.';

    /* RN-23: pelo menos uma meta geral ou uma necessidade vinculada */
    if (metas.length === 0 && selecionadas.size === 0) {
      preencher($('#erro-metas'), alerta('erro', 'A campanha precisa de pelo menos uma meta.', 'Adicione uma meta geral ou vincule uma necessidade de ONG.'));
      if (Object.keys(erros).length === 0) { $('#meta-quantidade').focus(); return; }
    }
    /* O fieldset de cidades não tem campo com name; o erro aparece junto da legenda */
    const erroCidades = erros.cidades;
    delete erros.cidades;
    if (mostrarErros(form, erros) || erroCidades) {
      if (erroCidades) {
        const caixa = $('#campo-cidades');
        caixa.classList.add('campo-invalido');
        caixa.append(el('div', { class: 'campo-erro', id: 'erro-cidades' }, icone('alert', 16), erroCidades));
        if (Object.keys(erros).length === 0) $('#lista-cidades input')?.focus();
      }
      return;
    }

    /* Grava a campanha, as cidades e as metas */
    const salva = salvarCampanha({
      id_campanha: campanha?.id_campanha,
      id_ong: campanha ? campanha.id_ong : (ehOng ? ong.id_ong : null),
      titulo: dados.get('titulo').trim(),
      descricao: dados.get('descricao').trim(),
      tipo: dados.get('tipo'),
      data_inicio: dados.get('data_inicio'),
      data_fim: dados.get('data_fim'),
      status: campanha ? campanha.status : (ehOng ? 'pendente' : 'ativa'),
      endereco_recebimento: dados.get('endereco_recebimento').trim(),
      horario_recebimento: dados.get('horario_recebimento').trim() || null,
      cidades,
      metas
    });

    /* Grava os vínculos: quem cria vincula direto (aceito); o que foi desmarcado sai */
    vinculosAceitos(salva.id_campanha).forEach(({ necessidade }) => {
      if (!selecionadas.has(necessidade.id_necessidade)) removerVinculo(salva.id_campanha, necessidade.id_necessidade);
    });
    incluirNecessidades(salva.id_campanha, [...selecionadas].map(([idNecessidade, aumentaMeta]) => ({ idNecessidade, aumentaMeta })));

    guardarAviso(...textos.final);
    ir(textos.destino);
  });

  desenharMetas();
}
