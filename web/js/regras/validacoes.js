import { hojeISO } from '../utilitarios/formatacao.js';

export function obrigatorio(valor) {
  return String(valor ?? '').trim() !== '';
}

export function inteiroPositivo(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0;
}

export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim());
}

export function cnpjValido(valor) {
  return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(String(valor).trim());
}

export function dataDeHojeEmDiante(iso) {
  return Boolean(iso) && iso >= hojeISO();
}

export function periodoValido(inicio, fim) {
  return Boolean(inicio) && Boolean(fim) && fim >= inicio;
}

export function senhaValida(valor) {
  return String(valor).length >= 6;
}
