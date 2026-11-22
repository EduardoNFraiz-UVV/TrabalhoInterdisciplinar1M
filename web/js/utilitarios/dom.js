export function adicionar(no, filhos) {
  for (const filho of filhos.flat(Infinity)) {
    if (filho === null || filho === undefined || filho === false) continue;
    no.append(filho instanceof Node ? filho : String(filho));
  }
  return no;
}

export function el(tag, atributos = {}, ...filhos) {
  const no = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos ?? {})) {
    if (valor === null || valor === undefined || valor === false) continue;
    if (chave === 'class') {
      no.className = valor;
    } else if (chave === 'dataset') {
      Object.assign(no.dataset, valor);
    } else if (chave.startsWith('on') && typeof valor === 'function') {
      no.addEventListener(chave.slice(2).toLowerCase(), valor);
    } else if (valor === true) {
      no.setAttribute(chave, '');
    } else {
      no.setAttribute(chave, valor);
    }
  }
  return adicionar(no, filhos);
}

export function $(seletor, raiz = document) {
  return raiz.querySelector(seletor);
}

export function $$(seletor, raiz = document) {
  return Array.from(raiz.querySelectorAll(seletor));
}

export function limpar(no) {
  no.replaceChildren();
  return no;
}

export function preencher(no, ...filhos) {
  limpar(no);
  return adicionar(no, filhos);
}
