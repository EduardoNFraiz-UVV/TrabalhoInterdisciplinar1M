/*
  validacoes.js
  Para que serve: funções pequenas que respondem "este valor é válido?" (true ou false).
  São usadas pelos formulários antes de salvar qualquer dado.
  Quem usa: regras de doação e páginas com formulário.
  Depende de: formatacao.js (hojeISO).
*/

import { hojeISO } from '../utilitarios/formatacao.js';

/* Campo obrigatório: não pode estar vazio nem só com espaços */
export function obrigatorio(valor) {
  return String(valor ?? '').trim() !== '';
}

/* Número inteiro maior que zero (a regra de quantidade das necessidades, metas e doações) */
export function inteiroPositivo(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0;
}

/* E-mail no formato básico texto@dominio.ext */
export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim());
}

/* CNPJ no formato 00.000.000/0000-00 (só confere o formato, não calcula os dígitos) */
export function cnpjValido(valor) {
  return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(String(valor).trim());
}

/* Data de hoje em diante (a "data prevista" de entrega nunca pode estar no passado) */
export function dataDeHojeEmDiante(iso) {
  return Boolean(iso) && iso >= hojeISO();
}

/* A data de fim não pode ser anterior à de início (regra ck_campanha_datas do banco) */
export function periodoValido(inicio, fim) {
  return Boolean(inicio) && Boolean(fim) && fim >= inicio;
}

/* Senha com pelo menos 6 caracteres */
export function senhaValida(valor) {
  return String(valor).length >= 6;
}
