/*
  doar.js
  Página: paginas/doador/doar.html (tela 05: Registrar doação para uma necessidade).
  Para que serve: valida e registra a doação. Regras: quantidade maior que zero e até o que falta (RN-39),
  retirada só se a ONG aceita e pede o endereço do doador (RN-37), data prevista de hoje em diante,
  e só o doador registra (RN-36). A doação nasce "oferecida" (RN-40).
  Depende de: pagina.js, armazenamento.js, regras de doações e necessidades, componentes de formulário.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { buscar } from '../../nucleo/armazenamento.js';
import { ir, parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { hojeISO, formatarData, formatarQuantidade } from '../../utilitarios/formatacao.js';
import { necessidadesDaOng, faltam } from '../../regras/necessidades.js';
import { validarDoacao, registrarDoacao } from '../../regras/doacoes.js';
import { mostrarErros, limparErros, lerFormulario, preencherSelect } from '../../componentes/formulario.js';
import { alerta, guardarAviso } from '../../componentes/alertas.js';

function montar(usuario) {
  const formulario = $('#formulario-doacao');

  /* Descobre a ONG e o item pelos parâmetros ?necessidade= ou ?ong= */
  const necessidadeUrl = parametro('necessidade') ? buscar('necessidade', parametro('necessidade')) : null;
  const ong = necessidadeUrl ? buscar('ong', necessidadeUrl.id_ong) : buscar('ong', parametro('ong'));
  if (!ong || !ong.verificada) {
    $('#area-alerta').append(alerta('erro', 'Escolha uma ONG antes de doar.', 'Abra a lista de ONGs e use o botão "Quero doar".'));
    formulario.hidden = true;
    return;
  }

  const cidade = buscar('cidade', ong.id_cidade);
  $('#ong-selecionada').value = `${ong.nome} (${cidade.nome})`;
  $('#migalha-ong').textContent = ong.nome;
  $('#migalha-ong').href = `../publico/ong.html?id=${ong.id_ong}`;
  $('#cancelar').href = `../publico/ong.html?id=${ong.id_ong}`;

  /* Itens que ainda precisam de doação */
  const itens = necessidadesDaOng(ong.id_ong).filter((n) => n.situacao === 'ativa' && faltam(n) > 0);
  if (itens.length === 0) {
    $('#area-alerta').append(alerta('info', 'Esta ONG já recebeu promessas para tudo o que pedia.', 'Escolha outra ONG ou aguarde novos pedidos.'));
    formulario.hidden = true;
    return;
  }
  preencherSelect($('#id_necessidade'), itens, { valor: (n) => n.id_necessidade, rotulo: (n) => n.item, primeira: 'Selecione o item', selecionado: necessidadeUrl?.id_necessidade ?? null });

  /* RN-37: se a ONG não aceita retirada, essa opção fica desativada */
  $('#forma-retirada').disabled = !ong.aceita_retirada;
  if (!ong.aceita_retirada) $('#forma-retirada').closest('.opcao').append(el('span', { class: 'campo-ajuda' }, '(esta ONG não faz retirada)'));
  $('#ajuda-data').textContent = `Horário de recebimento: ${ong.horario_atendimento ?? 'combine com a ONG'}`;
  $('#dataPrevista').min = hojeISO();

  /* Atualiza o texto "(faltam 30)" e o resumo ao lado */
  function atualizar() {
    const dados = lerFormulario(formulario);
    const necessidade = dados.idNecessidade ? buscar('necessidade', dados.idNecessidade) : null;
    $('#ajuda-quantidade').textContent = necessidade ? `(faltam ${faltam(necessidade)} ${necessidade.unidade})` : 'Escolha o item para ver quanto falta.';
    $('#campo-retirada').hidden = dados.forma !== 'retirada';
    preencher($('#resumo'),
      el('dt', {}, 'ONG'), el('dd', {}, ong.nome),
      el('dt', {}, 'Item'), el('dd', {}, necessidade ? `${necessidade.item}${dados.quantidade ? ` · ${formatarQuantidade(dados.quantidade, necessidade.unidade)}` : ''}` : '—'),
      el('dt', {}, 'Entrega'), el('dd', {}, dados.forma === 'retirada' ? 'Retirada no seu endereço' : `Na ONG${dados.dataPrevista ? ` em ${formatarData(dados.dataPrevista)}` : ''}`),
      el('dt', {}, 'Endereço'), el('dd', {}, dados.forma === 'retirada' ? (dados.enderecoRetirada || '—') : ong.endereco));
  }

  formulario.addEventListener('input', atualizar);
  formulario.addEventListener('change', atualizar);

  /* Confirmar doação */
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limparErros(formulario);
    const dados = lerFormulario(formulario);
    const erros = {};
    if (!dados.idNecessidade) erros.idNecessidade = 'Escolha o item que você vai doar.';
    else Object.assign(erros, validarDoacao({ ...dados, idNecessidade: Number(dados.idNecessidade), idMeta: null }));

    if (erros.geral) {
      $('#area-alerta').replaceChildren(alerta('erro', erros.geral));
      delete erros.geral;
    }
    if (mostrarErros(formulario, erros)) return;

    registrarDoacao({ ...dados, idDoador: usuario.id_usuario, idNecessidade: Number(dados.idNecessidade), idMeta: null });
    guardarAviso('sucesso', 'Doação registrada com sucesso!', `A ONG ${ong.nome} foi avisada.`);
    ir('minhasDoacoes');
  });

  atualizar();
}

const contexto = iniciarPagina({ perfis: ['doador'] });
if (contexto) montar(contexto.usuario);
