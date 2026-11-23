/*
  campanha-form.js (compartilhado)
  Para que serve: toda a lógica do formulário de campanha, usado em DUAS páginas:
    - paginas/ong/campanha-form.html   (tela 16: a ONG SOLICITA a campanha, que nasce pendente);
    - paginas/admin/campanha-form.html (tela 17: o administrador CRIA ou EDITA, e a campanha nasce ativa).
  Cuida de: cidades (várias), metas gerais (quantidade + categoria + item), endereço de recebimento,
  buscador geral de necessidades com filtros, "aumentar a meta" geral ou individual, resumo da meta total
  e a gravação com validação (RN-18, RN-21 a RN-23, RN-26, RN-31 a RN-33).
  Quem usa: js/paginas/ong/campanha-form.js e js/paginas/admin/campanha-form.js.

  Ideia do arquivo: a função iniciarFormularioCampanha() recebe o "modo" ('ong' ou 'admin') e monta o
  formulário inteiro. As variáveis metas e selecionadas guardam o que a pessoa escolheu; cada vez que algo
  muda, uma função desenhar...() refaz a parte da tela correspondente.
*/

/* Funções de outros arquivos que usamos aqui */
import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { ir, parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarNumero, formatarQuantidade, normalizar, UNIDADES } from '../../utilitarios/formatacao.js';
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
  /* A página é da ONG? Textos do modo escolhido e o formulário */
  const ehOng = modo === 'ong';
  const textos = TEXTOS[modo];
  const form = $('#formulario-campanha');

  /* Modo edição (?id=): o administrador edita qualquer campanha; a ONG só edita pedidos seus ainda pendentes */
  /* campanha fica null no modo "criar" e com o registro no modo "editar" */
  const idEdicao = parametro('id');
  const campanha = idEdicao ? buscar('campanha', idEdicao) : null;
  /* Se o id não existe, ou se a ONG tenta editar campanha que não é dela ou já aprovada: volta para a lista */
  if (idEdicao && (!campanha || (ehOng && (campanha.id_ong !== ong.id_ong || campanha.status !== 'pendente')))) {
    ir(textos.destino);
    return;
  }

  /* Títulos da página */
  /* (campanha ? A : B) escolhe o texto de edição se existe campanha, ou o de criação se não existe */
  $('#titulo-pagina').textContent = campanha ? textos.tituloEdicao : textos.titulo;
  const migalha = $('#migalha-atual');
  if (migalha) migalha.textContent = campanha ? textos.tituloEdicao : textos.titulo;
  document.title = `${campanha ? textos.tituloEdicao : textos.titulo} · Conecta Doações`;
  $('#botao-salvar').textContent = campanha ? textos.botaoEdicao : textos.botao;
  /* Troca a caixa de aviso fixa da página pelo alerta do modo (o "..." espalha a lista como argumentos) */
  $('#alerta-situacao').replaceWith(alerta(...textos.alerta));

  /* RN-09: ONG não verificada não solicita campanhas */
  if (ehOng && !ong.verificada) {
    $('#area-alerta').append(alerta('aviso', 'Sua ONG ainda não foi verificada.', 'Você poderá solicitar campanhas depois que o administrador aprovar o cadastro.'));
    $('#botao-salvar').setAttribute('disabled', '');
  }

  /* No perfil ONG o link "+ Cadastrar nova necessidade" existe; no administrador ele não faz sentido */
  if (!ehOng) $('#link-nova-necessidade')?.remove();

  /* ---------- Estado do formulário ---------- */
  /* Metas gerais: ao editar, copia cada meta existente ({ ...m } faz uma cópia, para não alterar o banco antes de salvar) */
  const metas = campanha ? metasDaCampanha(campanha.id_campanha).map((m) => ({ ...m })) : [];
  /* Um Map é uma lista de pares chave -> valor. Aqui: necessidades escolhidas, e se aumentam a meta */
  const selecionadas = new Map();          /* id da necessidade -> true/false (aumenta a meta) */
  if (campanha) {
    /* Ao editar, começa com as necessidades que já estão vinculadas (aceitas) */
    vinculosAceitos(campanha.id_campanha).forEach(({ vinculo, necessidade }) => selecionadas.set(necessidade.id_necessidade, vinculo.aumenta_meta));
  }
  /* Modo da escolha "aumenta a meta": 'todas', 'nenhuma' ou 'individual' (uma a uma) */
  let modoAumenta = 'individual';

  /* Função curta que devolve o nome de uma categoria pelo id */
  const nomeCategoria = (id) => buscar('categoria', id).nome;

  /* ---------- Cidades ---------- */
  /* Ids das cidades já marcadas (vazio se estamos criando) */
  const cidadesMarcadas = campanha ? cidadesDaCampanha(campanha.id_campanha).map((c) => c.id_cidade) : [];
  /* Uma caixa de seleção (checkbox) para cada cidade da tabela cidade */
  preencher($('#lista-cidades'), tabela('cidade').map((c) => el('div', { class: 'opcao' },
    el('input', { type: 'checkbox', id: `cidade-${c.id_cidade}`, name: 'cidades', value: c.id_cidade, checked: cidadesMarcadas.includes(c.id_cidade) }),
    el('label', { for: `cidade-${c.id_cidade}` }, `${c.nome} (${c.uf})`))));

  /* ---------- Campos de texto: valores iniciais ---------- */
  /* Ao editar, preenche os campos com os dados da campanha (form.titulo acha o campo pelo atributo name) */
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
  /* Se a ONG escolheu "usar o endereço da ONG", copia o endereço e trava os campos */
  function aplicarEndereco() {
    if (!radiosEndereco) return;
    const usarOng = radiosEndereco.value === 'ong';
    if (usarOng) {
      form.endereco_recebimento.value = ong.endereco;
      form.horario_recebimento.value = ong.horario_atendimento ?? '';
    }
    /* readOnly = o campo aparece, mas não dá para digitar nele */
    form.endereco_recebimento.readOnly = usarOng;
    form.horario_recebimento.readOnly = usarOng;
  }
  if (radiosEndereco) {
    /* Começa em "ong" se estamos criando ou se a campanha já usa o endereço da ONG; senão, "outro" */
    radiosEndereco.value = !campanha || campanha.endereco_recebimento === ong.endereco ? 'ong' : 'outro';
    aplicarEndereco();
    /* Sempre que a pessoa trocar a opção, aplica de novo */
    radiosEndereco.forEach((radio) => radio.addEventListener('change', aplicarEndereco));
  }

  /* ---------- Metas gerais ---------- */
  /* Lista de unidades do campo "unidade da meta": a mesma lista da necessidade (un., pct., L, latas, kg, cx.) */
  preencherSelect($('#meta-unidade'), UNIDADES, { valor: (u) => u, rotulo: (u) => u });
  /* Lista de categorias do campo "categoria da meta" */
  preencherSelect($('#meta-categoria'), tabela('categoria'), { valor: (c) => c.id_categoria, rotulo: (c) => c.nome, primeira: 'Selecione' });

  /* Desenha a lista de metas já adicionadas */
  function desenharMetas() {
    preencher($('#metas-lista'), metas.length === 0
      ? el('li', { class: 'texto-apoio' }, 'Nenhuma meta adicionada ainda.')
      : metas.map((meta, indice) => el('li', {},
        el('span', {}, `${formatarQuantidade(meta.quantidade, meta.unidade)} · ${nomeCategoria(meta.id_categoria)} · ${meta.item}`),
        el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Remover a meta ${meta.item}`, onclick: () => removerMeta(indice) }, 'Remover'))));
    /* As metas definem as categorias do buscador, então ele também é atualizado */
    ajustarSelecaoAsCategorias();
    atualizarFiltroDeCategorias();
    desenharNecessidades();
  }

  /* Remove a meta que está na posição "indice" da lista */
  function removerMeta(indice) {
    const meta = metas[indice];
    /* Meta que já recebeu doações não pode sumir (o banco impede, pois a doação aponta para ela) */
    if (meta.id_meta && tabela('doacao').some((d) => d.id_meta === meta.id_meta)) {
      preencher($('#erro-metas'), alerta('erro', 'Esta meta já recebeu doações.', 'Ela não pode ser removida, para não perder o histórico dos doadores.'));
      return;
    }
    /* splice(posição, 1) tira 1 item da lista; depois limpa o erro e redesenha */
    metas.splice(indice, 1);
    preencher($('#erro-metas'));
    desenharMetas();
  }

  /* Botão "+ Adicionar meta" */
  $('#adicionar-meta').addEventListener('click', () => {
    /* Valores digitados nos quatro campos da meta */
    const quantidade = $('#meta-quantidade').value;
    const unidade = $('#meta-unidade').value;
    const categoria = $('#meta-categoria').value;
    const item = $('#meta-item').value.trim();
    /* Os quatro são obrigatórios e a quantidade precisa ser inteira maior que zero */
    if (!inteiroPositivo(quantidade) || !unidade || !categoria || !item) {
      preencher($('#erro-metas'), alerta('erro', 'Meta incompleta.', 'Informe a quantidade (maior que zero) e a unidade, escolha a categoria e escreva o item. Exemplo: 1500 un., Higiene, itens de higiene.'));
      return;
    }
    /* Acrescenta a meta na lista, limpa os campos (a unidade volta para a primeira, "un.") e redesenha */
    metas.push({ id_categoria: Number(categoria), item, quantidade: Number(quantidade), unidade });
    preencher($('#erro-metas'));
    $('#meta-quantidade').value = '';
    $('#meta-unidade').value = UNIDADES[0];
    $('#meta-categoria').value = '';
    $('#meta-item').value = '';
    desenharMetas();
  });

  /* ---------- Buscador geral de necessidades ---------- */
  /* Campo de busca com ícone */
  const campoBusca = el('input', { type: 'search', id: 'nec-busca', placeholder: 'Buscar necessidade ou ONG', autocomplete: 'off' });
  $('#campo-nec-busca').append(icone('search', 18), campoBusca);

  /* Filtro de ONG: só ONGs verificadas */
  const ongsVerificadas = tabela('ong').filter((o) => o.verificada);
  preencherSelect($('#nec-ong'), ongsVerificadas, { valor: (o) => o.id_ong, rotulo: (o) => o.nome, primeira: 'Todas' });
  /* Filtro de cidade: cidades das ONGs, sem repetir, ordenadas pelo nome */
  const cidadesDasOngs = semRepetidos(ongsVerificadas.map((o) => o.id_cidade)).map((id) => buscar('cidade', id)).sort((a, b) => a.nome.localeCompare(b.nome));
  preencherSelect($('#nec-cidade'), cidadesDasOngs, { valor: (c) => c.id_cidade, rotulo: (c) => c.nome, primeira: 'Todas' });

  /* Categorias que a campanha pede: as das metas (sem metas, qualquer categoria) */
  function categoriasPermitidas() {
    /* Categorias das metas, sem repetir */
    const ids = semRepetidos(metas.map((m) => m.id_categoria));
    /* Se há metas usa essas; senão, todas as categorias */
    return ids.length ? ids : tabela('categoria').map((c) => c.id_categoria);
  }

  /* O filtro de categoria só lista as categorias permitidas */
  function atualizarFiltroDeCategorias() {
    const seletor = $('#nec-categoria');
    /* Guarda a escolha atual para tentar mantê-la depois de refazer a lista */
    const atual = seletor.value;
    preencherSelect(seletor, categoriasPermitidas().map((id) => buscar('categoria', id)), { valor: (c) => c.id_categoria, rotulo: (c) => c.nome, primeira: 'Todas' });
    /* Se a escolha antiga ainda existe entre as opções, volta a marcá-la */
    if ([...seletor.options].some((o) => o.value === atual)) seletor.value = atual;
  }

  /* Se uma meta saiu, necessidades de categorias que a campanha não pede mais deixam de estar selecionadas */
  function ajustarSelecaoAsCategorias() {
    const permitidas = categoriasPermitidas();
    /* [...selecionadas.keys()] faz uma cópia dos ids (assim podemos apagar do Map enquanto percorremos) */
    [...selecionadas.keys()].forEach((id) => {
      if (!permitidas.includes(buscar('necessidade', id).id_categoria)) selecionadas.delete(id);
    });
  }

  /* Necessidades que passam pelos filtros */
  function candidatas() {
    /* Valores atuais dos filtros */
    const termo = normalizar(campoBusca.value);
    const filtroOng = $('#nec-ong').value;
    const filtroCategoria = $('#nec-categoria').value;
    const filtroPrioridade = $('#nec-prioridade').value;
    const filtroCidade = $('#nec-cidade').value;
    const permitidas = categoriasPermitidas();
    return necessidadesAtivas().filter((n) => {
      /* ONG dona da necessidade (usada na busca e no filtro de cidade) */
      const dona = buscar('ong', n.id_ong);
      /* Todas as condições abaixo precisam ser verdadeiras (&&). "!filtro ||" = se o filtro está vazio, passa */
      return permitidas.includes(n.id_categoria)
        && (!termo || normalizar(n.item).includes(termo) || normalizar(dona.nome).includes(termo))
        && (!filtroOng || n.id_ong === Number(filtroOng))
        && (!filtroCategoria || n.id_categoria === Number(filtroCategoria))
        && (!filtroPrioridade || n.prioridade === filtroPrioridade)
        && (!filtroCidade || dona.id_cidade === Number(filtroCidade));
    });
  }

  /* Desenha a lista de necessidades com duas caixas de seleção em cada uma */
  function desenharNecessidades() {
    const lista = candidatas();
    preencher($('#nec-lista'), lista.length === 0
      ? el('p', { class: 'campo-ajuda lista-vazia' }, 'Nenhuma necessidade encontrada com esses filtros.')
      : lista.map((n) => {
        /* ONG dona e se esta necessidade está marcada */
        const dona = buscar('ong', n.id_ong);
        const marcada = selecionadas.has(n.id_necessidade);
        return el('div', { class: 'item item-necessidade' },
          /* Primeira caixa: incluir a necessidade na campanha */
          el('div', { class: 'opcao' },
            el('input', {
              type: 'checkbox', id: `nec-${n.id_necessidade}`, checked: marcada,
              onchange: (evento) => {
                /* Marcou: guarda no Map (true se o modo é "todas"). Desmarcou: apaga do Map */
                if (evento.target.checked) selecionadas.set(n.id_necessidade, modoAumenta === 'todas');
                else selecionadas.delete(n.id_necessidade);
                desenharNecessidades();
              }
            }),
            el('label', { for: `nec-${n.id_necessidade}` }, `${n.item} · ${dona.nome} · ${formatarQuantidade(n.quantidade, n.unidade)}`)),
          /* Segunda caixa: "Aumenta a meta" (só liga se a primeira está marcada e o modo é "individual") */
          el('div', { class: 'opcao' },
            el('input', {
              type: 'checkbox', id: `aumenta-${n.id_necessidade}`, checked: marcada && selecionadas.get(n.id_necessidade),
              disabled: !marcada || modoAumenta !== 'individual',
              onchange: (evento) => { selecionadas.set(n.id_necessidade, evento.target.checked); desenharResumo(); }
            }),
            el('label', { for: `aumenta-${n.id_necessidade}` }, 'Aumenta a meta')));
      }));
    /* Atualiza também o resumo da meta */
    desenharResumo();
  }

  /* Escolha geral de "aumentar a meta": todas, nenhuma ou uma a uma (RN-33) */
  form.elements.modo_aumenta.forEach((radio) => radio.addEventListener('change', () => {
    /* Guarda o modo escolhido */
    modoAumenta = form.elements.modo_aumenta.value;
    /* Em "todas" ou "nenhuma", aplica a escolha a todas as necessidades já selecionadas */
    if (modoAumenta !== 'individual') [...selecionadas.keys()].forEach((id) => selecionadas.set(id, modoAumenta === 'todas'));
    desenharNecessidades();
  }));

  /* Qualquer mudança nos filtros ou na busca redesenha a lista */
  ['#nec-ong', '#nec-categoria', '#nec-prioridade', '#nec-cidade'].forEach((seletor) => $(seletor).addEventListener('change', desenharNecessidades));
  campoBusca.addEventListener('input', desenharNecessidades);

  /* ---------- Resumo da meta (RN-26) ---------- */
  function desenharResumo() {
    /* Soma das metas gerais */
    const gerais = somarQuantidades(metas);
    /* Percorre o Map: cada par é [id da necessidade, aumenta a meta?]. Soma só as que aumentam */
    let aumento = 0;
    let qtdAumentam = 0;
    for (const [id, aumenta] of selecionadas) {
      if (aumenta) {
        aumento += buscar('necessidade', id).quantidade;
        qtdAumentam += 1;
      }
    }
    /* Quantas necessidades estão selecionadas no total */
    const qtdSelecionadas = selecionadas.size;

    /* Resumo ao lado: metas gerais, aumento das necessidades e meta total (<dl>: pares nome/valor) */
    preencher($('#resumo-meta'),
      el('dt', {}, 'Metas gerais'),
      el('dd', {}, metas.length ? `${metas.map((m) => formatarNumero(m.quantidade)).join(' + ')} = ${formatarNumero(gerais)}` : '—'),
      el('dt', {}, 'Necessidades que aumentam a meta'),
      el('dd', {}, `+ ${formatarNumero(aumento)}`),
      el('dt', {}, 'Meta total'),
      el('dd', { class: 'destaque' }, `${formatarNumero(gerais + aumento)} itens`));

    /* Frase embaixo da lista, com singular/plural */
    $('#nec-rodape').textContent = `${qtdSelecionadas} ${qtdSelecionadas === 1 ? 'necessidade selecionada' : 'necessidades selecionadas'} · aumentam a meta: ${qtdAumentam}`;
  }

  /* ---------- Salvar ---------- */
  form.addEventListener('submit', (evento) => {
    /* Impede o navegador de recarregar a página */
    evento.preventDefault();
    limparErros(form);
    /* FormData reúne os campos do formulário; getAll('cidades') devolve todas as cidades marcadas (como texto), e map(Number) converte para número */
    const dados = new FormData(form);
    const cidades = dados.getAll('cidades').map(Number);
    /* Objeto onde juntamos os erros, campo por campo */
    const erros = {};

    /* Validações dos campos */
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
      /* Se esse é o único erro, leva o cursor ao campo da meta e para */
      if (Object.keys(erros).length === 0) { $('#meta-quantidade').focus(); return; }
    }
    /* O fieldset de cidades não tem campo com name; o erro aparece junto da legenda */
    const erroCidades = erros.cidades;
    delete erros.cidades;
    if (mostrarErros(form, erros) || erroCidades) {
      if (erroCidades) {
        /* Mostra o erro das cidades à mão: destaque vermelho + mensagem dentro da caixa de cidades */
        const caixa = $('#campo-cidades');
        caixa.classList.add('campo-invalido');
        caixa.append(el('div', { class: 'campo-erro', id: 'erro-cidades' }, icone('alert', 16), erroCidades));
        if (Object.keys(erros).length === 0) $('#lista-cidades input')?.focus();
      }
      return;
    }

    /* Dona da campanha: ao editar, continua a mesma; ao criar, é a ONG logada (ou ninguém, se for o administrador) */
    let donaDaCampanha = null;
    if (campanha) donaDaCampanha = campanha.id_ong;
    else if (ehOng) donaDaCampanha = ong.id_ong;

    /* Situação: ao editar, continua a mesma; ao criar, a ONG pede (pendente) e o administrador cria já ativa */
    let situacao = 'ativa';
    if (campanha) situacao = campanha.status;
    else if (ehOng) situacao = 'pendente';

    /* Grava a campanha, as cidades e as metas */
    const salva = salvarCampanha({
      id_campanha: campanha?.id_campanha,
      id_ong: donaDaCampanha,
      titulo: dados.get('titulo').trim(),
      descricao: dados.get('descricao').trim(),
      tipo: dados.get('tipo'),
      data_inicio: dados.get('data_inicio'),
      data_fim: dados.get('data_fim'),
      status: situacao,
      endereco_recebimento: dados.get('endereco_recebimento').trim(),
      horario_recebimento: dados.get('horario_recebimento').trim() || null,
      cidades,
      metas
    });

    /* Grava os vínculos: quem cria vincula direto (aceito); o que foi desmarcado sai */
    vinculosAceitos(salva.id_campanha).forEach(({ necessidade }) => {
      if (!selecionadas.has(necessidade.id_necessidade)) removerVinculo(salva.id_campanha, necessidade.id_necessidade);
    });
    /* [...selecionadas] transforma o Map em lista de pares; cada par vira { idNecessidade, aumentaMeta } */
    incluirNecessidades(salva.id_campanha, [...selecionadas].map(([idNecessidade, aumentaMeta]) => ({ idNecessidade, aumentaMeta })));

    /* Deixa um aviso para a próxima página e volta para a tela de destino do modo */
    guardarAviso(...textos.final);
    ir(textos.destino);
  });

  /* Primeira pintura: metas, necessidades e resumo */
  desenharMetas();
}
