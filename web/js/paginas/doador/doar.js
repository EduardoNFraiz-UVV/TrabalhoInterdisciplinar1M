/*
  doar.js
  Página: paginas/doador/doar.html (tela 05: Registrar doação para uma necessidade).
  Para que serve: valida e registra a doação. Regras: quantidade maior que zero e até o que falta (RN-39),
  retirada só se a ONG aceita e pede o endereço do doador (RN-37), data prevista de hoje em diante,
  e só o doador registra (RN-36). A doação nasce "oferecida" (RN-40).
  Depende de: pagina.js, armazenamento.js, regras de doações e necessidades, componentes de formulário.
*/

/* Funções de outros arquivos que usamos aqui */
import { iniciarPagina } from '../../nucleo/pagina.js';
import { buscar } from '../../nucleo/armazenamento.js';
import { ir, parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { hojeISO, formatarData, formatarQuantidade } from '../../utilitarios/formatacao.js';
import { necessidadesDaOng, faltam } from '../../regras/necessidades.js';
import { validarDoacao, registrarDoacao } from '../../regras/doacoes.js';
import { mostrarErros, limparErros, lerFormulario, preencherSelect } from '../../componentes/formulario.js';
import { alerta, guardarAviso } from '../../componentes/alertas.js';

/* usuario: o doador logado */
function montar(usuario) {
  /* O formulário da página */
  const formulario = $('#formulario-doacao');

  /* Descobre a ONG e o item pelos parâmetros ?necessidade= ou ?ong= */
  /* Se a URL traz uma necessidade, buscamos ela e, a partir dela, a ONG; senão usamos o parâmetro ?ong= */
  const necessidadeUrl = parametro('necessidade') ? buscar('necessidade', parametro('necessidade')) : null;
  const ong = necessidadeUrl ? buscar('ong', necessidadeUrl.id_ong) : buscar('ong', parametro('ong'));
  /* Sem ONG válida (ou não verificada): mostra um erro, esconde o formulário e para */
  if (!ong || !ong.verificada) {
    $('#area-alerta').append(alerta('erro', 'Escolha uma ONG antes de doar.', 'Abra a lista de ONGs e use o botão "Quero doar".'));
    formulario.hidden = true;
    return;
  }

  /* Preenche o campo (bloqueado) com o nome da ONG e ajusta os links de "voltar" para o perfil dela */
  const cidade = buscar('cidade', ong.id_cidade);
  $('#ong-selecionada').value = `${ong.nome} (${cidade.nome})`;
  $('#migalha-ong').textContent = ong.nome;
  $('#migalha-ong').href = `../publico/ong.html?id=${ong.id_ong}`;
  $('#cancelar').href = `../publico/ong.html?id=${ong.id_ong}`;

  /* Itens que ainda precisam de doação */
  const itens = necessidadesDaOng(ong.id_ong).filter((n) => n.situacao === 'ativa' && faltam(n) > 0);
  /* Se nada falta, avisa e esconde o formulário */
  if (itens.length === 0) {
    $('#area-alerta').append(alerta('info', 'Esta ONG já recebeu promessas para tudo o que pedia.', 'Escolha outra ONG ou aguarde novos pedidos.'));
    formulario.hidden = true;
    return;
  }
  /* Lista de itens: se veio ?necessidade=, aquele item já começa escolhido */
  preencherSelect($('#id_necessidade'), itens, { valor: (n) => n.id_necessidade, rotulo: (n) => n.item, primeira: 'Selecione o item', selecionado: necessidadeUrl?.id_necessidade ?? null });

  /* RN-37: se a ONG não aceita retirada, essa opção fica desativada */
  $('#forma-retirada').disabled = !ong.aceita_retirada;
  if (!ong.aceita_retirada) $('#forma-retirada').closest('.opcao').append(el('span', { class: 'campo-ajuda' }, '(esta ONG não faz retirada)'));
  /* Texto de ajuda sobre o horário e data mínima (hoje) do campo de data */
  $('#ajuda-data').textContent = `Horário de recebimento: ${ong.horario_atendimento ?? 'combine com a ONG'}`;
  $('#dataPrevista').min = hojeISO();

  /* Atualiza o texto "(faltam 30)" e o resumo ao lado */
  function atualizar() {
    /* Lê o que está digitado agora e acha a necessidade escolhida (null se nenhuma) */
    const dados = lerFormulario(formulario);
    const necessidade = dados.idNecessidade ? buscar('necessidade', dados.idNecessidade) : null;
    /* Mostra quanto ainda falta do item escolhido */
    $('#ajuda-quantidade').textContent = necessidade ? `(faltam ${faltam(necessidade)} ${necessidade.unidade})` : 'Escolha o item para ver quanto falta.';
    /* O campo de endereço de retirada só aparece se a forma escolhida é "retirada" */
    $('#campo-retirada').hidden = dados.forma !== 'retirada';
    /* Resumo ao lado do formulário (<dl>: pares nome/valor) */
    preencher($('#resumo'),
      el('dt', {}, 'ONG'), el('dd', {}, ong.nome),
      el('dt', {}, 'Item'), el('dd', {}, necessidade ? `${necessidade.item}${dados.quantidade ? ` · ${formatarQuantidade(dados.quantidade, necessidade.unidade)}` : ''}` : '—'),
      el('dt', {}, 'Entrega'), el('dd', {}, dados.forma === 'retirada' ? 'Retirada no seu endereço' : `Na ONG${dados.dataPrevista ? ` em ${formatarData(dados.dataPrevista)}` : ''}`),
      el('dt', {}, 'Endereço'), el('dd', {}, dados.forma === 'retirada' ? (dados.enderecoRetirada || '—') : ong.endereco));
  }

  /* Atualiza o resumo enquanto a pessoa digita ou muda qualquer campo */
  formulario.addEventListener('input', atualizar);
  formulario.addEventListener('change', atualizar);

  /* Confirmar doação */
  formulario.addEventListener('submit', (evento) => {
    /* Impede o navegador de recarregar a página */
    evento.preventDefault();
    limparErros(formulario);
    const dados = lerFormulario(formulario);
    /* Objeto onde juntamos os erros */
    const erros = {};
    /* Sem item escolhido: erro direto. Com item: as regras de doacoes.js validam o resto */
    if (!dados.idNecessidade) erros.idNecessidade = 'Escolha o item que você vai doar.';
    else Object.assign(erros, validarDoacao({ ...dados, idNecessidade: Number(dados.idNecessidade), idMeta: null }));

    /* Erro "geral" (ex.: necessidade já concluída) vai para a área de avisos, não para um campo */
    if (erros.geral) {
      $('#area-alerta').replaceChildren(alerta('erro', erros.geral));
      delete erros.geral;
    }
    /* Se sobrou algum erro de campo, mostra e para por aqui */
    if (mostrarErros(formulario, erros)) return;

    /* Tudo certo: grava a doação (nasce "oferecida"), deixa um aviso para a próxima página e vai para "Minhas doações" */
    registrarDoacao({ ...dados, idDoador: usuario.id_usuario, idNecessidade: Number(dados.idNecessidade), idMeta: null });
    guardarAviso('sucesso', 'Doação registrada com sucesso!', `A ONG ${ong.nome} foi avisada.`);
    ir('minhasDoacoes');
  });

  /* Primeira pintura do resumo */
  atualizar();
}

/* Confere o login (só doador) e monta cabeçalho e rodapé; depois monta a página */
const contexto = iniciarPagina({ perfis: ['doador'] });
if (contexto) montar(contexto.usuario);
