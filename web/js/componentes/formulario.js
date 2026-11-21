/*
  formulario.js
  Para que serve: ajudantes para formulários: ler os valores digitados, mostrar e limpar
  mensagens de erro embaixo dos campos (com ícone e borda vermelha, como no guia) e preencher
  listas de opções (<select>).
  Quem usa: todas as páginas com <form>.
  Depende de: dom.js e icones.js. O visual está em css/componentes/campos.css.
*/

import { el } from '../utilitarios/dom.js';
import { icone } from './icones.js';

/* Lê todos os campos de um formulário e devolve um objeto { nomeDoCampo: valor } */
export function lerFormulario(formulario) {
  return Object.fromEntries(new FormData(formulario));
}

/* Remove todas as mensagens de erro e o destaque vermelho do formulário */
export function limparErros(formulario) {
  formulario.querySelectorAll('.campo-erro').forEach((mensagem) => mensagem.remove());
  formulario.querySelectorAll('.campo-invalido').forEach((campo) => campo.classList.remove('campo-invalido'));
  formulario.querySelectorAll('[aria-invalid]').forEach((entrada) => entrada.removeAttribute('aria-invalid'));
}

/* Mostra a mensagem de erro logo abaixo do campo de nome informado (name="...") */
function mostrarErro(formulario, nome, mensagem) {
  const entrada = formulario.querySelector(`[name="${nome}"]`);
  const campo = entrada?.closest('.campo');
  if (!entrada || !campo) return null;
  const id = `erro-${nome}`;
  campo.classList.add('campo-invalido');
  entrada.setAttribute('aria-invalid', 'true');
  entrada.setAttribute('aria-describedby', id);                /* leitor de tela lê o erro junto do campo */
  campo.append(el('div', { class: 'campo-erro', id }, icone('alert', 16), mensagem));
  return entrada;
}

/*
  Mostra vários erros de uma vez e põe o foco no primeiro campo com problema.
  erros: objeto { nomeDoCampo: 'mensagem' }. Devolve true se havia algum erro.
*/
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

/*
  Preenche um <select> com opções.
  seletor: o elemento <select>;
  itens: lista de objetos; valor e rotulo dizem quais campos usar como value e como texto
         (funções recebem o item). primeira: texto de uma opção inicial vazia (ex.: "Selecione").
  selecionado: valor que deve começar escolhido.
*/
export function preencherSelect(seletor, itens, { valor, rotulo, primeira = null, selecionado = null }) {
  seletor.replaceChildren();
  if (primeira) seletor.append(el('option', { value: '' }, primeira));
  itens.forEach((item) => {
    const v = String(valor(item));
    seletor.append(el('option', { value: v, selected: selecionado !== null && String(selecionado) === v }, rotulo(item)));
  });
}
