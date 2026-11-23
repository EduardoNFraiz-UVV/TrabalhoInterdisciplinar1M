const SVG_NS = 'http://www.w3.org/2000/svg';

function elementoSvg(tag, atributos = {}, texto = null) {
  const no = document.createElementNS(SVG_NS, tag);
  Object.entries(atributos).forEach(([chave, valor]) => no.setAttribute(chave, valor));
  if (texto !== null) no.textContent = texto;
  return no;
}

export function graficoBarras(dados, descricao) {
  const largura = 640;
  const altura = 280;
  const margem = { topo: 32, base: 40, lados: 16 };
  const areaAltura = altura - margem.topo - margem.base;
  const maior = Math.max(1, ...dados.map((d) => d.valor));
  const espaco = (largura - margem.lados * 2) / dados.length;
  const larguraBarra = Math.min(64, espaco * 0.6);

  const svg = elementoSvg('svg', {
    viewBox: `0 0 ${largura} ${altura}`,
    class: 'grafico',
    role: 'img',
    'aria-label': descricao
  });

  svg.append(elementoSvg('line', { x1: margem.lados, x2: largura - margem.lados, y1: altura - margem.base, y2: altura - margem.base, class: 'grafico-eixo' }));

  dados.forEach((dado, indice) => {
    const alturaBarra = (dado.valor / maior) * areaAltura;
    const x = margem.lados + indice * espaco + (espaco - larguraBarra) / 2;
    const y = altura - margem.base - alturaBarra;

    svg.append(elementoSvg('rect', { x, y, width: larguraBarra, height: alturaBarra, rx: 6, class: 'grafico-barra' }));
    svg.append(elementoSvg('text', { x: x + larguraBarra / 2, y: y - 8, class: 'grafico-valor', 'text-anchor': 'middle' }, String(dado.valor)));
    svg.append(elementoSvg('text', { x: x + larguraBarra / 2, y: altura - margem.base + 22, class: 'grafico-rotulo', 'text-anchor': 'middle' }, dado.rotulo));
  });
  return svg;
}
