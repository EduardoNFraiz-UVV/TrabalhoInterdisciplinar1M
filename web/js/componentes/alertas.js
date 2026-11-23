import { el, preencher } from '../utilitarios/dom.js';
import { icone } from './icones.js';

const ICONE_POR_TIPO = { sucesso: 'check', erro: 'alert', aviso: 'alert', info: 'info' };

export function alerta(tipo, titulo, detalhe = null) {
  return el('div', { class: `alerta alerta-${tipo}`, role: tipo === 'erro' ? 'alert' : 'status' },
    icone(ICONE_POR_TIPO[tipo], 20),
    el('div', {},
      el('div', { class: 'alerta-titulo' }, titulo),
      detalhe ? el('div', { class: 'alerta-detalhe' }, detalhe) : null));
}

export function mostrarAlerta(area, tipo, titulo, detalhe = null) {
  if (area) preencher(area, alerta(tipo, titulo, detalhe));
}

export function limparAlerta(area) {
  if (area) area.replaceChildren();
}

const CHAVE_AVISO = 'conecta.aviso';

export function guardarAviso(tipo, titulo, detalhe = null) {
  sessionStorage.setItem(CHAVE_AVISO, JSON.stringify({ tipo, titulo, detalhe }));
}

export function exibirAvisoGuardado(area) {
  const texto = sessionStorage.getItem(CHAVE_AVISO);
  if (!texto) return;
  sessionStorage.removeItem(CHAVE_AVISO);
  const { tipo, titulo, detalhe } = JSON.parse(texto);
  mostrarAlerta(area, tipo, titulo, detalhe);
}
