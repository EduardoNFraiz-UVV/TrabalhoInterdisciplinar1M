/*
  doar-campanha.js
  Página: paginas/doador/doar-campanha.html (tela 18: Registrar doação para a campanha).
  Para que serve: registra uma doação a uma META geral da campanha. A entrega é só "levar" (RN-38) e
  a campanha precisa estar ativa (RN-42). Quem recebe é quem criou a campanha (ONG ou administração).
  Depende de: pagina.js, armazenamento.js, regras de campanhas e doações, componentes de formulário.
*/

/* Funções de outros arquivos que usamos aqui */
import { iniciarPagina } from '../../nucleo/pagina.js';
import { buscar } from '../../nucleo/armazenamento.js';
import { ir, parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { hojeISO, formatarData, formatarQuantidade } from '../../utilitarios/formatacao.js';
import { metasDaCampanha, faltamDaMeta, textoCidades, nomeCriador } from '../../regras/campanhas.js';
import { validarDoacao, registrarDoacao } from '../../regras/doacoes.js';
import { mostrarErros, limparErros, lerFormulario, preencherSelect } from '../../componentes/formulario.js';
import { alerta, guardarAviso } from '../../componentes/alertas.js';

/* usuario: o doador logado */
function montar(usuario) {
  /* O formulário da página */
  const formulario = $('#formulario-doacao');

  /* A meta vem do parâmetro ?meta= (botão "Doar para esta meta") ou a campanha vem de ?campanha= */
  const metaUrl = parametro('meta') ? buscar('campanha_meta', parametro('meta')) : null;
  const campanha = buscar('campanha', metaUrl ? metaUrl.id_campanha : parametro('campanha'));
  /* Campanha inexistente ou que não está ativa: avisa, esconde o formulário e para */
  if (!campanha || campanha.status !== 'ativa') {
    $('#area-alerta').append(alerta('erro', 'Esta campanha não recebe doações agora.', 'Ela pode ter sido encerrada. Veja as campanhas ativas.'));
    formulario.hidden = true;
    return;
  }

  /* Preenche o campo (bloqueado) com a campanha e ajusta os links de "voltar" */
  $('#campanha-selecionada').value = `${campanha.titulo} (${textoCidades(campanha.id_campanha)})`;
  $('#migalha-campanha').href = `../publico/campanha.html?id=${campanha.id_campanha}`;
  $('#cancelar').href = `../publico/campanha.html?id=${campanha.id_campanha}`;

  /* Metas que ainda precisam de doação */
  const metas = metasDaCampanha(campanha.id_campanha).filter((m) => faltamDaMeta(m) > 0);
  /* Todas as metas já prometidas: avisa e esconde o formulário */
  if (metas.length === 0) {
    $('#area-alerta').append(alerta('info', 'As metas desta campanha já foram prometidas.', 'Obrigado por querer ajudar! Veja as necessidades de ONGs vinculadas à campanha.'));
    formulario.hidden = true;
    return;
  }
  /* Lista de metas: se veio ?meta=, aquela meta já começa escolhida */
  preencherSelect($('#idMeta'), metas, { valor: (m) => m.id_meta, rotulo: (m) => `${m.item} (${buscar('categoria', m.id_categoria).nome})`, primeira: 'Selecione a meta', selecionado: metaUrl?.id_meta ?? null });
  /* Texto de ajuda sobre o horário e data mínima (hoje) do campo de data */
  $('#ajuda-data').textContent = `Horário de recebimento: ${campanha.horario_recebimento ?? 'combine com quem recebe'}`;
  $('#dataPrevista').min = hojeISO();

  /* Atualiza o texto "Faltam N" e o resumo ao lado */
  function atualizar() {
    /* Lê o que está digitado e acha a meta escolhida (null se nenhuma) */
    const dados = lerFormulario(formulario);
    const meta = dados.idMeta ? buscar('campanha_meta', dados.idMeta) : null;
    /* "Faltam 490 L": quanto falta já com a unidade da meta */
    $('#ajuda-quantidade').textContent = meta ? `Faltam ${formatarQuantidade(faltamDaMeta(meta), meta.unidade)}` : 'Escolha a meta para ver quanto falta.';
    /* Resumo ao lado do formulário (<dl>: pares nome/valor) */
    preencher($('#resumo'),
      el('dt', {}, 'Campanha'), el('dd', {}, campanha.titulo),
      el('dt', {}, 'Meta'), el('dd', {}, meta ? `${meta.item}${dados.quantidade ? ` · ${formatarQuantidade(dados.quantidade, meta.unidade)}` : ''}` : '—'),
      el('dt', {}, 'Entrega'), el('dd', {}, `No endereço da campanha${dados.dataPrevista ? ` em ${formatarData(dados.dataPrevista)}` : ''}`),
      el('dt', {}, 'Endereço'), el('dd', {}, campanha.endereco_recebimento),
      el('dt', {}, 'Quem recebe'), el('dd', {}, nomeCriador(campanha)));
  }
  /* Atualiza o resumo enquanto a pessoa digita ou muda qualquer campo */
  formulario.addEventListener('input', atualizar);
  formulario.addEventListener('change', atualizar);

  /* Ao enviar o formulário */
  formulario.addEventListener('submit', (evento) => {
    /* Impede o navegador de recarregar a página */
    evento.preventDefault();
    limparErros(formulario);
    const dados = lerFormulario(formulario);
    /* Objeto onde juntamos os erros */
    const erros = {};
    /* Sem meta escolhida: erro direto. Com meta: as regras de doacoes.js validam o resto (a forma é sempre "levar") */
    if (!dados.idMeta) erros.idMeta = 'Escolha a meta que você vai ajudar.';
    else Object.assign(erros, validarDoacao({ ...dados, idMeta: Number(dados.idMeta), idNecessidade: null, forma: 'levar' }));

    /* Erro "geral" vai para a área de avisos, não para um campo */
    if (erros.geral) {
      $('#area-alerta').replaceChildren(alerta('erro', erros.geral));
      delete erros.geral;
    }
    /* Se sobrou algum erro de campo, mostra e para por aqui */
    if (mostrarErros(formulario, erros)) return;

    /* Tudo certo: grava a doação, deixa um aviso para a próxima página e vai para "Minhas doações" */
    registrarDoacao({ ...dados, forma: 'levar', idDoador: usuario.id_usuario, idMeta: Number(dados.idMeta), idNecessidade: null });
    guardarAviso('sucesso', 'Doação registrada com sucesso!', `Quem criou a campanha "${campanha.titulo}" foi avisado.`);
    ir('minhasDoacoes');
  });

  /* Primeira pintura do resumo */
  atualizar();
}

/* Confere o login (só doador) e monta cabeçalho e rodapé; depois monta a página */
const contexto = iniciarPagina({ perfis: ['doador'] });
if (contexto) montar(contexto.usuario);
