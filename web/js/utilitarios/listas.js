export function somarQuantidades(lista) {
  let total = 0;
  for (const item of lista) {
    total += item.quantidade;
  }
  return total;
}

export function semRepetidos(lista) {
  const unicos = [];
  for (const valor of lista) {
    if (!unicos.includes(valor)) unicos.push(valor);
  }
  return unicos;
}
