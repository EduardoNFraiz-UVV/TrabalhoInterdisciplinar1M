/*
  alertas.js
  Para que serve: cria caixas de aviso (sucesso, erro, aviso, informação), cada uma com ícone,
  título e detalhe, e funções para mostrá-las dentro de uma área da página.
  Quem usa: formulários e páginas que avisam o resultado de uma ação.
  Depende de: dom.js e icones.js. O visual está em css/componentes/alertas.css.
*/

/* Funções de outros arquivos que usamos aqui */
import { el, preencher } from '../utilitarios/dom.js';
import { icone } from './icones.js';

/* Ícone de cada tipo de alerta */
const ICONE_POR_TIPO = { sucesso: 'check', erro: 'alert', aviso: 'alert', info: 'info' };

/*
  Cria o elemento do alerta.
  tipo: 'sucesso', 'erro', 'aviso' ou 'info'.
  O alerta de erro usa role="alert" (leitor de tela lê na hora); os outros usam role="status".
*/
export function alerta(tipo, titulo, detalhe = null) {
  /* A caixa: a classe "alerta-<tipo>" define a cor; o role define como o leitor de tela anuncia */
  return el('div', { class: `alerta alerta-${tipo}`, role: tipo === 'erro' ? 'alert' : 'status' },
    /* Ícone do tipo de alerta */
    icone(ICONE_POR_TIPO[tipo], 20),
    /* Bloco com o título e, se houver, o detalhe */
    el('div', {},
      el('div', { class: 'alerta-titulo' }, titulo),
      detalhe ? el('div', { class: 'alerta-detalhe' }, detalhe) : null));
}

/* Mostra um alerta dentro de uma área (substitui o que estava lá). Se a área não existir, não faz nada */
export function mostrarAlerta(area, tipo, titulo, detalhe = null) {
  if (area) preencher(area, alerta(tipo, titulo, detalhe));
}

/* Esvazia a área de alertas */
export function limparAlerta(area) {
  if (area) area.replaceChildren();
}

/* Chave onde guardamos um aviso para a PRÓXIMA página (ex.: "Necessidade salva" depois de redirecionar) */
const CHAVE_AVISO = 'conecta.aviso';

/* Guarda um aviso no sessionStorage para ser mostrado na página seguinte */
export function guardarAviso(tipo, titulo, detalhe = null) {
  /* O sessionStorage só guarda texto, então o objeto vira texto JSON */
  sessionStorage.setItem(CHAVE_AVISO, JSON.stringify({ tipo, titulo, detalhe }));
}

/* Mostra o aviso guardado (se houver) na área informada e o apaga, para aparecer uma vez só */
export function exibirAvisoGuardado(area) {
  /* Lê o texto guardado; se não há aviso, não faz nada */
  const texto = sessionStorage.getItem(CHAVE_AVISO);
  if (!texto) return;
  /* Apaga o aviso para ele não aparecer de novo */
  sessionStorage.removeItem(CHAVE_AVISO);
  /* Transforma o texto JSON de volta em objeto e separa os três campos */
  const { tipo, titulo, detalhe } = JSON.parse(texto);
  /* Mostra o aviso na tela */
  mostrarAlerta(area, tipo, titulo, detalhe);
}
