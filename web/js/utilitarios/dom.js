/*
  dom.js
  Para que serve: ferramentas para criar e encontrar elementos HTML pelo JavaScript.
  A função principal é el(): ela cria uma tag, coloca atributos e filhos, e devolve o elemento.
  Quem usa: todos os componentes e páginas.
  Depende de: nada.

  Por que usar el() em vez de escrever HTML dentro de texto (innerHTML)?
  Porque o texto passado como filho entra como TEXTO PURO. Assim, se alguém digitar
  "<script>" num formulário, o navegador mostra as letras e não executa nada (segurança).
*/

/* Adiciona filhos a um elemento. Aceita textos, elementos, listas de filhos e ignora vazios */
export function adicionar(no, filhos) {
  for (const filho of filhos.flat(Infinity)) {
    if (filho === null || filho === undefined || filho === false) continue;   /* pula o que é vazio */
    no.append(filho instanceof Node ? filho : String(filho));                  /* elemento ou texto */
  }
  return no;
}

/*
  Cria um elemento.
  tag: nome da tag, como 'div' ou 'button'.
  atributos: objeto com os atributos. Chaves especiais:
    class    -> define as classes CSS
    dataset  -> define atributos data-*
    onclick  -> (e qualquer on...) registra um ouvinte de evento
    valor true -> atributo sem valor (ex.: disabled)
    valor false/null/undefined -> atributo é ignorado
  filhos: conteúdo do elemento (textos ou outros elementos).
*/
export function el(tag, atributos = {}, ...filhos) {
  const no = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos ?? {})) {
    if (valor === null || valor === undefined || valor === false) continue;
    if (chave === 'class') {
      no.className = valor;
    } else if (chave === 'dataset') {
      Object.assign(no.dataset, valor);
    } else if (chave.startsWith('on') && typeof valor === 'function') {
      no.addEventListener(chave.slice(2).toLowerCase(), valor);   /* 'onclick' -> 'click' */
    } else if (valor === true) {
      no.setAttribute(chave, '');
    } else {
      no.setAttribute(chave, valor);
    }
  }
  return adicionar(no, filhos);
}

/* Atalho para querySelector: encontra o primeiro elemento que combina com o seletor CSS */
export function $(seletor, raiz = document) {
  return raiz.querySelector(seletor);
}

/* Atalho para querySelectorAll, já devolvendo uma lista de verdade (Array) */
export function $$(seletor, raiz = document) {
  return Array.from(raiz.querySelectorAll(seletor));
}

/* Apaga todo o conteúdo de um elemento e o devolve (para encadear) */
export function limpar(no) {
  no.replaceChildren();
  return no;
}

/* Troca todo o conteúdo de um elemento pelos novos filhos */
export function preencher(no, ...filhos) {
  limpar(no);
  return adicionar(no, filhos);
}
