/*
  necessidade-form.js
  Página: paginas/ong/necessidade-form.html (tela 10: Cadastrar / Editar necessidade).
  Para que serve: parte "C" (criar) e "U" (atualizar) do CRUD. Valida os campos, mostra uma
  pré-visualização ao vivo, lista as campanhas compatíveis para "Pedir vínculo" (RN-30) e, ao salvar,
  grava a necessidade e envia os pedidos (RN-32). Com ?id= na URL, edita uma necessidade existente.
  Depende de: pagina.js, armazenamento.js, regras de necessidades e vínculos, componentes de formulário.
*/

/* Funções de outros arquivos que usamos aqui */
import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, buscar, inserir, atualizar } from '../../nucleo/armazenamento.js';
import { ir, parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { hojeISO, formatarData, formatarQuantidade, UNIDADES } from '../../utilitarios/formatacao.js';
import { prometido, vinculosDaNecessidade } from '../../regras/necessidades.js';
import { metasDaCampanha } from '../../regras/campanhas.js';
import { campanhasCompativeis, pedirVinculo, removerVinculo } from '../../regras/vinculos.js';
import { obrigatorio, inteiroPositivo } from '../../regras/validacoes.js';
import { lerFormulario, mostrarErros, limparErros, preencherSelect } from '../../componentes/formulario.js';
import { seloPrioridade, seloVinculo } from '../../componentes/selos.js';
import { alerta, guardarAviso } from '../../componentes/alertas.js';

/* Confere o login (só ONG) e, se está tudo certo, monta a página.
   (montar é declarada mais abaixo; funções criadas com "function" podem ser usadas antes da linha onde aparecem) */
const contexto = iniciarPagina({ perfis: ['ong'] });
if (contexto) montar(contexto.ong);

/* ong: a ONG de quem está logado */
function montar(ong) {
  /* O formulário da página */
  const formulario = $('#formulario-necessidade');

  /* Modo edição: a URL traz ?id=. A necessidade precisa ser desta ONG */
  const idEdicao = parametro('id');
  /* necessidade fica null no modo "cadastrar" e com o registro no modo "editar" */
  const necessidade = idEdicao ? buscar('necessidade', idEdicao) : null;
  /* id inexistente ou de outra ONG: volta para a lista */
  if (idEdicao && (!necessidade || necessidade.id_ong !== ong.id_ong)) {
    ir('necessidades');
    return;
  }

  /* Textos da página mudam entre "Cadastrar" e "Editar" */
  if (necessidade) {
    $('#titulo-pagina').textContent = 'Editar necessidade';
    $('#migalha-atual').textContent = 'Editar necessidade';
    document.title = 'Editar necessidade · Conecta Doações';
  }

  /* RN-09: ONG não verificada não cadastra necessidades */
  if (!ong.verificada) {
    $('#area-alerta').append(alerta('aviso', 'Sua ONG ainda não foi verificada.', 'Você poderá cadastrar necessidades depois que o administrador aprovar o cadastro.'));
    /* Desativa o botão de salvar */
    $('#botao-salvar').setAttribute('disabled', '');
  }

  /* Listas de categoria e unidade */
  preencherSelect($('#id_categoria'), tabela('categoria'), { valor: (c) => c.id_categoria, rotulo: (c) => c.nome, primeira: 'Selecione a categoria' });
  preencherSelect($('#unidade'), UNIDADES, { valor: (u) => u, rotulo: (u) => u });

  /* No modo edição, preenche o formulário com os dados atuais */
  /* (formulario.item acha o campo pelo atributo name="item"; .value é o texto dentro dele) */
  if (necessidade) {
    formulario.item.value = necessidade.item;
    formulario.id_categoria.value = necessidade.id_categoria;
    formulario.quantidade.value = necessidade.quantidade;
    formulario.unidade.value = necessidade.unidade;
    formulario.prioridade.value = necessidade.prioridade;
    formulario.descricao.value = necessidade.descricao ?? '';
    formulario.precisa_ate.value = necessidade.precisa_ate ?? '';
  }

  /* Campanhas marcadas para pedir vínculo (guardadas aqui para não perder a marca ao redesenhar a lista) */
  /* Um Set é um conjunto: guarda valores sem repetir. Aqui, ids de campanhas (.add, .delete, .has, .size) */
  const marcadas = new Set();

  /* Desenha a lista de campanhas ativas que pedem a categoria escolhida (RN-30) */
  function desenharCampanhas() {
    /* Categoria escolhida (0 se nenhuma) e a caixa onde a lista aparece */
    const idCategoria = Number(formulario.id_categoria.value);
    const lista = $('#lista-campanhas');

    /* Sem categoria escolhida: mostra uma dica e para */
    if (!idCategoria) {
      preencher(lista, el('p', { class: 'campo-ajuda lista-vazia' }, 'Escolha a categoria para ver as campanhas que combinam com o item.'));
      atualizarRodape();
      return;
    }

    /* Um "objeto de necessidade" provisório basta para a regra de compatibilidade */
    const provisoria = { id_necessidade: necessidade?.id_necessidade ?? -1, id_categoria: idCategoria, situacao: 'ativa' };
    /* Campanhas ativas que pedem essa categoria */
    const campanhas = campanhasCompativeis(provisoria);

    /* Remove marcas de campanhas que deixaram de ser compatíveis */
    marcadas.forEach((id) => { if (!campanhas.some((c) => c.id_campanha === id)) marcadas.delete(id); });

    if (campanhas.length === 0) {
      preencher(lista, el('p', { class: 'campo-ajuda lista-vazia' }, 'Nenhuma campanha ativa pede esta categoria agora.'));
    } else {
      /* Uma linha com caixa de seleção (checkbox) para cada campanha compatível */
      preencher(lista, campanhas.map((campanha) => {
        /* Textos das metas da campanha que pedem esta categoria, separados por vírgula */
        const pede = metasDaCampanha(campanha.id_campanha).filter((m) => m.id_categoria === idCategoria).map((m) => m.item).join(', ');
        /* Id do checkbox, ligado ao <label> pelo atributo for */
        const id = `campanha-${campanha.id_campanha}`;
        return el('div', { class: 'item' },
          el('div', { class: 'opcao' },
            el('input', {
              type: 'checkbox', id, value: campanha.id_campanha, checked: marcadas.has(campanha.id_campanha),
              /* Ao marcar ou desmarcar: guarda ou tira o id do conjunto e atualiza o rodapé */
              onchange: (evento) => {
                if (evento.target.checked) marcadas.add(campanha.id_campanha); else marcadas.delete(campanha.id_campanha);
                atualizarRodape();
              }
            }),
            el('label', { for: id }, `${campanha.titulo} · pede ${pede || 'qualquer categoria'} · até ${formatarData(campanha.data_fim)}`)));
      }));
    }
    atualizarRodape();
  }

  /* Rodapé: "1 pedido será enviado ao salvar" */
  function atualizarRodape() {
    /* Quantas campanhas estão marcadas */
    const n = marcadas.size;
    $('#rodape-campanhas').textContent = n === 0 ? 'Nenhum pedido será enviado.' : `${n} ${n === 1 ? 'pedido será enviado' : 'pedidos serão enviados'} ao salvar.`;
  }

  /* Edição: mostra os vínculos que a necessidade já tem, com botão para desvincular */
  function desenharVinculados() {
    const area = $('#vinculados');
    /* No modo "cadastrar" não há vínculos ainda */
    if (!necessidade) return;
    /* Vínculos desta necessidade, sem os recusados */
    const vinculos = vinculosDaNecessidade(necessidade.id_necessidade).filter((v) => v.vinculo.status !== 'recusado');
    /* Nenhum vínculo: esvazia a área e para (preencher sem filhos limpa a caixa) */
    if (vinculos.length === 0) { preencher(area); return; }
    preencher(area,
      el('h3', { class: 'texto-rotulo' }, 'Campanhas já vinculadas'),
      el('ul', { class: 'lista-marcavel', role: 'list' }, vinculos.map(({ vinculo, campanha }) =>
        el('li', { class: 'item' },
          el('span', { class: 'cresce' }, campanha.titulo),
          seloVinculo(vinculo.status),
          el('button', {
            type: 'button', class: 'acao acao-perigo', 'aria-label': `Desvincular de ${campanha.titulo}`,
            /* Ao clicar: remove o vínculo e redesenha as duas listas */
            onclick: () => { removerVinculo(campanha.id_campanha, necessidade.id_necessidade); desenharVinculados(); desenharCampanhas(); }
          }, 'Desvincular')))));
  }

  /* Pré-visualização: como o doador vê o item */
  function desenharPrevia() {
    /* Lê o que está digitado e monta os textos (com valores padrão enquanto o campo está vazio) */
    const dados = lerFormulario(formulario);
    const categoria = dados.id_categoria ? buscar('categoria', dados.id_categoria).nome : 'Categoria';
    const quantidade = dados.quantidade ? formatarQuantidade(dados.quantidade, dados.unidade) : 'Quantidade';
    /* [...marcadas] transforma o conjunto em lista; [0] pega a primeira campanha marcada (ou undefined) */
    const primeiraCampanha = [...marcadas][0];
    preencher($('#previa'),
      el('h3', {}, dados.item.trim() || 'Nome do item'),
      el('p', { class: 'texto-apoio' }, `${categoria} · ${quantidade}`),
      el('div', {}, seloPrioridade(dados.prioridade)),
      primeiraCampanha ? el('p', { class: 'texto-legenda' }, `Campanha: ${buscar('campanha', primeiraCampanha).titulo} (aguardando aceite)`) : '',
      el('span', { class: 'botao botao-primario', 'aria-hidden': 'true' }, 'Quero doar'));
  }

  /* Salvar: valida, grava e envia os pedidos de vínculo */
  formulario.addEventListener('submit', (evento) => {
    /* Impede o navegador de recarregar a página */
    evento.preventDefault();
    limparErros(formulario);
    const dados = lerFormulario(formulario);
    /* Objeto onde juntamos os erros, campo por campo */
    const erros = {};

    /* Validações */
    if (!obrigatorio(dados.item)) erros.item = 'Informe o nome do item, por exemplo "Cobertor de casal".';
    if (!dados.id_categoria) erros.id_categoria = 'Escolha uma das categorias da lista.';
    if (!inteiroPositivo(dados.quantidade)) {
      erros.quantidade = 'Informe uma quantidade maior que zero, só com números inteiros.';
    } else if (necessidade && Number(dados.quantidade) < prometido(necessidade.id_necessidade)) {
      /* Na edição, a quantidade não pode ficar abaixo do que os doadores já prometeram */
      erros.quantidade = `Os doadores já prometeram ${prometido(necessidade.id_necessidade)}. A quantidade não pode ser menor que isso.`;
    }
    /* A data limite não pode ser passada (a não ser que seja a mesma que já estava salva) */
    if (dados.precisa_ate && dados.precisa_ate < hojeISO() && dados.precisa_ate !== necessidade?.precisa_ate) {
      erros.precisa_ate = 'Escolha uma data de hoje em diante.';
    }
    /* Se houve algum erro, mostra e para por aqui */
    if (mostrarErros(formulario, erros)) return;

    /* Campos prontos para gravar (texto aparado, números convertidos, vazios viram null) */
    const campos = {
      id_categoria: Number(dados.id_categoria),
      item: dados.item.trim(),
      descricao: dados.descricao.trim() || null,
      quantidade: Number(dados.quantidade),
      unidade: dados.unidade,
      prioridade: dados.prioridade,
      precisa_ate: dados.precisa_ate || null,
      data_atualizacao: hojeISO()
    };

    /* Grava: atualiza a necessidade existente ou insere uma nova (que nasce ativa) */
    let idNecessidade;
    if (necessidade) {
      atualizar('necessidade', necessidade.id_necessidade, campos);
      idNecessidade = necessidade.id_necessidade;
    } else {
      idNecessidade = inserir('necessidade', { ...campos, id_ong: ong.id_ong, situacao: 'ativa', data_cadastro: hojeISO() }).id_necessidade;
    }

    /* RN-32: pedidos de vínculo (o pedido nasce pendente; se a campanha é da própria ONG, já nasce aceito) */
    marcadas.forEach((idCampanha) => pedirVinculo(idCampanha, idNecessidade, ong.id_ong));

    /* Deixa um aviso para a próxima página e volta para a lista de necessidades */
    guardarAviso('sucesso', 'Necessidade salva.',
      marcadas.size ? `${marcadas.size} ${marcadas.size === 1 ? 'pedido de vínculo enviado' : 'pedidos de vínculo enviados'}.` : null);
    ir('necessidades');
  });

  /* Qualquer mudança nos campos atualiza a pré-visualização; mudar a categoria refaz a lista de campanhas */
  formulario.addEventListener('input', desenharPrevia);
  formulario.id_categoria.addEventListener('change', () => { desenharCampanhas(); desenharPrevia(); });

  /* Primeira pintura da página */
  desenharVinculados();
  desenharCampanhas();
  desenharPrevia();
}
