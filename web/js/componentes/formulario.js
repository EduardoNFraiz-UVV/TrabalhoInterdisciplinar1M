/*
  formulario.js
  Para que serve: ajudantes para formulários: ler os valores digitados, mostrar e limpar
  mensagens de erro embaixo dos campos (com ícone e borda vermelha, como no guia) e preencher
  listas de opções (<select>).
  Quem usa: todas as páginas com <form>.
  Depende de: dom.js e icones.js. O visual está em css/componentes/campos.css.
*/

/* Funções de outros arquivos que usamos aqui */
import { el } from '../utilitarios/dom.js';
import { icone } from './icones.js';

/* Lê todos os campos de um formulário e devolve um objeto { nomeDoCampo: valor } */
export function lerFormulario(formulario) {
  /* FormData reúne os campos que têm atributo name; Object.fromEntries transforma isso em um objeto */
  return Object.fromEntries(new FormData(formulario));
}

/* Remove todas as mensagens de erro e o destaque vermelho do formulário */
export function limparErros(formulario) {
  /* Apaga cada mensagem de erro que estiver na tela */
  formulario.querySelectorAll('.campo-erro').forEach((mensagem) => mensagem.remove());
  /* Tira a classe de destaque vermelho de cada campo */
  formulario.querySelectorAll('.campo-invalido').forEach((campo) => campo.classList.remove('campo-invalido'));
  /* Tira o aviso "inválido" que os leitores de tela usam */
  formulario.querySelectorAll('[aria-invalid]').forEach((entrada) => entrada.removeAttribute('aria-invalid'));
}

/* Mostra a mensagem de erro logo abaixo do campo de nome informado (name="...") */
function mostrarErro(formulario, nome, mensagem) {
  /* Acha o <input> pelo atributo name, e a caixa .campo que o envolve */
  const entrada = formulario.querySelector(`[name="${nome}"]`);
  const campo = entrada?.closest('.campo');
  /* Se não achou um dos dois, não há onde mostrar o erro */
  if (!entrada || !campo) return null;
  /* Id da mensagem, para ligá-la ao campo */
  const id = `erro-${nome}`;
  /* Deixa o campo com o destaque vermelho e marca como inválido */
  campo.classList.add('campo-invalido');
  entrada.setAttribute('aria-invalid', 'true');
  entrada.setAttribute('aria-describedby', id);                /* leitor de tela lê o erro junto do campo */
  /* Cria a mensagem (ícone + texto) e a coloca dentro da caixa do campo */
  campo.append(el('div', { class: 'campo-erro', id }, icone('alert', 16), mensagem));
  /* Devolve o campo, para quem chamou poder pôr o foco nele */
  return entrada;
}

/*
  Mostra vários erros de uma vez e põe o foco no primeiro campo com problema.
  erros: objeto { nomeDoCampo: 'mensagem' }. Devolve true se havia algum erro.
*/
export function mostrarErros(formulario, erros) {
  /* Começa limpando os erros da tentativa anterior */
  limparErros(formulario);
  /* Vai guardar o primeiro campo com erro */
  let primeira = null;
  /* Para cada par nome/mensagem do objeto de erros */
  Object.entries(erros).forEach(([nome, mensagem]) => {
    const entrada = mostrarErro(formulario, nome, mensagem);
    /* Só o primeiro campo com erro é guardado */
    if (entrada && !primeira) primeira = entrada;
  });
  /* Leva o cursor ao primeiro campo com erro (?. só chama focus se ele existir) */
  primeira?.focus();
  /* true se havia pelo menos um erro */
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
  /* Esvazia as opções que existiam */
  seletor.replaceChildren();
  /* Opção inicial sem valor (ex.: "Todas" ou "Selecione"), se foi pedida */
  if (primeira) seletor.append(el('option', { value: '' }, primeira));
  /* Uma <option> para cada item da lista */
  itens.forEach((item) => {
    /* Valor da opção, sempre como texto */
    const v = String(valor(item));
    /* A opção começa escolhida se o valor dela é o "selecionado" */
    seletor.append(el('option', { value: v, selected: selecionado !== null && String(selecionado) === v }, rotulo(item)));
  });
}
