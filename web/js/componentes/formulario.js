import { el } from '../utilitarios/dom.js';
import { icone } from './icones.js';

export function lerFormulario(formulario) {
  return Object.fromEntries(new FormData(formulario));
}

export function limparErros(formulario) {
  formulario.querySelectorAll('.campo-erro').forEach((mensagem) => mensagem.remove());
  formulario.querySelectorAll('.campo-invalido').forEach((campo) => campo.classList.remove('campo-invalido'));
  formulario.querySelectorAll('[aria-invalid]').forEach((entrada) => entrada.removeAttribute('aria-invalid'));
}

function mostrarErro(formulario, nome, mensagem) {
  const entrada = formulario.querySelector(`[name="${nome}"]`);
  const campo = entrada?.closest('.campo');
  if (!entrada || !campo) return null;
  const id = `erro-${nome}`;
  campo.classList.add('campo-invalido');
  entrada.setAttribute('aria-invalid', 'true');
  entrada.setAttribute('aria-describedby', id);
  campo.append(el('div', { class: 'campo-erro', id }, icone('alert', 16), mensagem));
  return entrada;
}

export function mostrarErros(formulario, erros) {
  limparErros(formulario);
  let primeira = null;
  Object.entries(erros).forEach(([nome, mensagem]) => {
    const entrada = mostrarErro(formulario, nome, mensagem);
    if (entrada && !primeira) primeira = entrada;
  });
  primeira?.focus();
  return Object.keys(erros).length > 0;
}

export function preencherSelect(seletor, itens, { valor, rotulo, primeira = null, selecionado = null }) {
  seletor.replaceChildren();
  if (primeira) seletor.append(el('option', { value: '' }, primeira));
  itens.forEach((item) => {
    const v = String(valor(item));
    seletor.append(el('option', { value: v, selected: selecionado !== null && String(selecionado) === v }, rotulo(item)));
  });
}
