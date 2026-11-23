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

const contexto = iniciarPagina({ perfis: ['ong'] });
if (contexto) montar(contexto.ong);

function montar(ong) {
  const formulario = $('#formulario-necessidade');

  const idEdicao = parametro('id');
  const necessidade = idEdicao ? buscar('necessidade', idEdicao) : null;
  if (idEdicao && (!necessidade || necessidade.id_ong !== ong.id_ong)) {
    ir('necessidades');
    return;
  }

  if (necessidade) {
    $('#titulo-pagina').textContent = 'Editar necessidade';
    $('#migalha-atual').textContent = 'Editar necessidade';
    document.title = 'Editar necessidade · Conecta Doações';
  }

  if (!ong.verificada) {
    $('#area-alerta').append(alerta('aviso', 'Sua ONG ainda não foi verificada.', 'Você poderá cadastrar necessidades depois que o administrador aprovar o cadastro.'));
    $('#botao-salvar').setAttribute('disabled', '');
  }

  preencherSelect($('#id_categoria'), tabela('categoria'), { valor: (c) => c.id_categoria, rotulo: (c) => c.nome, primeira: 'Selecione a categoria' });
  preencherSelect($('#unidade'), UNIDADES, { valor: (u) => u, rotulo: (u) => u });

  if (necessidade) {
    formulario.item.value = necessidade.item;
    formulario.id_categoria.value = necessidade.id_categoria;
    formulario.quantidade.value = necessidade.quantidade;
    formulario.unidade.value = necessidade.unidade;
    formulario.prioridade.value = necessidade.prioridade;
    formulario.descricao.value = necessidade.descricao ?? '';
    formulario.precisa_ate.value = necessidade.precisa_ate ?? '';
  }

  const marcadas = new Set();

  function desenharCampanhas() {
    const idCategoria = Number(formulario.id_categoria.value);
    const lista = $('#lista-campanhas');

    if (!idCategoria) {
      preencher(lista, el('p', { class: 'campo-ajuda lista-vazia' }, 'Escolha a categoria para ver as campanhas que combinam com o item.'));
      atualizarRodape();
      return;
    }

    const provisoria = { id_necessidade: necessidade?.id_necessidade ?? -1, id_categoria: idCategoria, situacao: 'ativa' };
    const campanhas = campanhasCompativeis(provisoria);

    marcadas.forEach((id) => { if (!campanhas.some((c) => c.id_campanha === id)) marcadas.delete(id); });

    if (campanhas.length === 0) {
      preencher(lista, el('p', { class: 'campo-ajuda lista-vazia' }, 'Nenhuma campanha ativa pede esta categoria agora.'));
    } else {
      preencher(lista, campanhas.map((campanha) => {
        const pede = metasDaCampanha(campanha.id_campanha).filter((m) => m.id_categoria === idCategoria).map((m) => m.item).join(', ');
        const id = `campanha-${campanha.id_campanha}`;
        return el('div', { class: 'item' },
          el('div', { class: 'opcao' },
            el('input', {
              type: 'checkbox', id, value: campanha.id_campanha, checked: marcadas.has(campanha.id_campanha),
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

  function atualizarRodape() {
    const n = marcadas.size;
    $('#rodape-campanhas').textContent = n === 0 ? 'Nenhum pedido será enviado.' : `${n} ${n === 1 ? 'pedido será enviado' : 'pedidos serão enviados'} ao salvar.`;
  }

  function desenharVinculados() {
    const area = $('#vinculados');
    if (!necessidade) return;
    const vinculos = vinculosDaNecessidade(necessidade.id_necessidade).filter((v) => v.vinculo.status !== 'recusado');
    if (vinculos.length === 0) { preencher(area); return; }
    preencher(area,
      el('h3', { class: 'texto-rotulo' }, 'Campanhas já vinculadas'),
      el('ul', { class: 'lista-marcavel', role: 'list' }, vinculos.map(({ vinculo, campanha }) =>
        el('li', { class: 'item' },
          el('span', { class: 'cresce' }, campanha.titulo),
          seloVinculo(vinculo.status),
          el('button', {
            type: 'button', class: 'acao acao-perigo', 'aria-label': `Desvincular de ${campanha.titulo}`,
            onclick: () => { removerVinculo(campanha.id_campanha, necessidade.id_necessidade); desenharVinculados(); desenharCampanhas(); }
          }, 'Desvincular')))));
  }

  function desenharPrevia() {
    const dados = lerFormulario(formulario);
    const categoria = dados.id_categoria ? buscar('categoria', dados.id_categoria).nome : 'Categoria';
    const quantidade = dados.quantidade ? formatarQuantidade(dados.quantidade, dados.unidade) : 'Quantidade';
    const primeiraCampanha = [...marcadas][0];
    preencher($('#previa'),
      el('h3', {}, dados.item.trim() || 'Nome do item'),
      el('p', { class: 'texto-apoio' }, `${categoria} · ${quantidade}`),
      el('div', {}, seloPrioridade(dados.prioridade)),
      primeiraCampanha ? el('p', { class: 'texto-legenda' }, `Campanha: ${buscar('campanha', primeiraCampanha).titulo} (aguardando aceite)`) : '',
      el('span', { class: 'botao botao-primario', 'aria-hidden': 'true' }, 'Quero doar'));
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limparErros(formulario);
    const dados = lerFormulario(formulario);
    const erros = {};

    if (!obrigatorio(dados.item)) erros.item = 'Informe o nome do item, por exemplo "Cobertor de casal".';
    if (!dados.id_categoria) erros.id_categoria = 'Escolha uma das categorias da lista.';
    if (!inteiroPositivo(dados.quantidade)) {
      erros.quantidade = 'Informe uma quantidade maior que zero, só com números inteiros.';
    } else if (necessidade && Number(dados.quantidade) < prometido(necessidade.id_necessidade)) {
      erros.quantidade = `Os doadores já prometeram ${prometido(necessidade.id_necessidade)}. A quantidade não pode ser menor que isso.`;
    }
    if (dados.precisa_ate && dados.precisa_ate < hojeISO() && dados.precisa_ate !== necessidade?.precisa_ate) {
      erros.precisa_ate = 'Escolha uma data de hoje em diante.';
    }
    if (mostrarErros(formulario, erros)) return;

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

    let idNecessidade;
    if (necessidade) {
      atualizar('necessidade', necessidade.id_necessidade, campos);
      idNecessidade = necessidade.id_necessidade;
    } else {
      idNecessidade = inserir('necessidade', { ...campos, id_ong: ong.id_ong, situacao: 'ativa', data_cadastro: hojeISO() }).id_necessidade;
    }

    marcadas.forEach((idCampanha) => pedirVinculo(idCampanha, idNecessidade, ong.id_ong));

    guardarAviso('sucesso', 'Necessidade salva.',
      marcadas.size ? `${marcadas.size} ${marcadas.size === 1 ? 'pedido de vínculo enviado' : 'pedidos de vínculo enviados'}.` : null);
    ir('necessidades');
  });

  formulario.addEventListener('input', desenharPrevia);
  formulario.id_categoria.addEventListener('change', () => { desenharCampanhas(); desenharPrevia(); });

  desenharVinculados();
  desenharCampanhas();
  desenharPrevia();
}
