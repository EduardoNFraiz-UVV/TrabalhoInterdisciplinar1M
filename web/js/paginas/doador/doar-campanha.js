import { iniciarPagina } from '../../nucleo/pagina.js';
import { buscar } from '../../nucleo/armazenamento.js';
import { ir, parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { hojeISO, formatarData, formatarQuantidade } from '../../utilitarios/formatacao.js';
import { metasDaCampanha, faltamDaMeta, textoCidades, nomeCriador } from '../../regras/campanhas.js';
import { validarDoacao, registrarDoacao } from '../../regras/doacoes.js';
import { mostrarErros, limparErros, lerFormulario, preencherSelect } from '../../componentes/formulario.js';
import { alerta, guardarAviso } from '../../componentes/alertas.js';

function montar(usuario) {
  const formulario = $('#formulario-doacao');

  const metaUrl = parametro('meta') ? buscar('campanha_meta', parametro('meta')) : null;
  const campanha = buscar('campanha', metaUrl ? metaUrl.id_campanha : parametro('campanha'));
  if (!campanha || campanha.status !== 'ativa') {
    $('#area-alerta').append(alerta('erro', 'Esta campanha não recebe doações agora.', 'Ela pode ter sido encerrada. Veja as campanhas ativas.'));
    formulario.hidden = true;
    return;
  }

  $('#campanha-selecionada').value = `${campanha.titulo} (${textoCidades(campanha.id_campanha)})`;
  $('#migalha-campanha').href = `../publico/campanha.html?id=${campanha.id_campanha}`;
  $('#cancelar').href = `../publico/campanha.html?id=${campanha.id_campanha}`;

  const metas = metasDaCampanha(campanha.id_campanha).filter((m) => faltamDaMeta(m) > 0);
  if (metas.length === 0) {
    $('#area-alerta').append(alerta('info', 'As metas desta campanha já foram prometidas.', 'Obrigado por querer ajudar! Veja as necessidades de ONGs vinculadas à campanha.'));
    formulario.hidden = true;
    return;
  }
  preencherSelect($('#idMeta'), metas, { valor: (m) => m.id_meta, rotulo: (m) => `${m.item} (${buscar('categoria', m.id_categoria).nome})`, primeira: 'Selecione a meta', selecionado: metaUrl?.id_meta ?? null });
  $('#ajuda-data').textContent = `Horário de recebimento: ${campanha.horario_recebimento ?? 'combine com quem recebe'}`;
  $('#dataPrevista').min = hojeISO();

  function atualizar() {
    const dados = lerFormulario(formulario);
    const meta = dados.idMeta ? buscar('campanha_meta', dados.idMeta) : null;
    $('#ajuda-quantidade').textContent = meta ? `Faltam ${formatarQuantidade(faltamDaMeta(meta), meta.unidade)}` : 'Escolha a meta para ver quanto falta.';
    preencher($('#resumo'),
      el('dt', {}, 'Campanha'), el('dd', {}, campanha.titulo),
      el('dt', {}, 'Meta'), el('dd', {}, meta ? `${meta.item}${dados.quantidade ? ` · ${formatarQuantidade(dados.quantidade, meta.unidade)}` : ''}` : '—'),
      el('dt', {}, 'Entrega'), el('dd', {}, `No endereço da campanha${dados.dataPrevista ? ` em ${formatarData(dados.dataPrevista)}` : ''}`),
      el('dt', {}, 'Endereço'), el('dd', {}, campanha.endereco_recebimento),
      el('dt', {}, 'Quem recebe'), el('dd', {}, nomeCriador(campanha)));
  }
  formulario.addEventListener('input', atualizar);
  formulario.addEventListener('change', atualizar);

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limparErros(formulario);
    const dados = lerFormulario(formulario);
    const erros = {};
    if (!dados.idMeta) erros.idMeta = 'Escolha a meta que você vai ajudar.';
    else Object.assign(erros, validarDoacao({ ...dados, idMeta: Number(dados.idMeta), idNecessidade: null, forma: 'levar' }));

    if (erros.geral) {
      $('#area-alerta').replaceChildren(alerta('erro', erros.geral));
      delete erros.geral;
    }
    if (mostrarErros(formulario, erros)) return;

    registrarDoacao({ ...dados, forma: 'levar', idDoador: usuario.id_usuario, idMeta: Number(dados.idMeta), idNecessidade: null });
    guardarAviso('sucesso', 'Doação registrada com sucesso!', `Quem criou a campanha "${campanha.titulo}" foi avisado.`);
    ir('minhasDoacoes');
  });

  atualizar();
}

const contexto = iniciarPagina({ perfis: ['doador'] });
if (contexto) montar(contexto.usuario);
