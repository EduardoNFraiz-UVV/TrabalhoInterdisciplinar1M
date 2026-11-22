/*
  listas.js
  Para que serve: duas ferramentas pequenas para trabalhar com listas (arrays):
  somar as quantidades de uma lista de registros e tirar os valores repetidos.
  Quem usa: regras de campanhas, necessidades, relatórios, o formulário de campanha e a lista de ONGs.
  Depende de: nada.
*/

/* Soma o campo "quantidade" de todos os itens da lista. Se a lista estiver vazia, devolve 0 */
export function somarQuantidades(lista) {
  let total = 0;
  for (const item of lista) {
    total += item.quantidade;
  }
  return total;
}

/* Devolve uma lista nova sem valores repetidos, na ordem em que cada valor apareceu pela primeira vez */
export function semRepetidos(lista) {
  const unicos = [];
  for (const valor of lista) {
    if (!unicos.includes(valor)) unicos.push(valor);
  }
  return unicos;
}
