/*
  grafico.js
  Para que serve: desenha um gráfico de barras em SVG (sem biblioteca), com o valor escrito sobre cada
  barra e o nome embaixo. Usado no relatório "Doações recebidas por mês" do painel do administrador.
  Quem usa: js/paginas/admin/painel.js.
  Depende de: nada. O visual está em css/componentes/grafico.css.
*/

/* Endereço do padrão SVG: elementos SVG precisam ser criados com este "espaço de nomes" */
const SVG_NS = 'http://www.w3.org/2000/svg';

/* Cria um elemento SVG com atributos */
function elementoSvg(tag, atributos = {}, texto = null) {
  const no = document.createElementNS(SVG_NS, tag);
  Object.entries(atributos).forEach(([chave, valor]) => no.setAttribute(chave, valor));
  if (texto !== null) no.textContent = texto;
  return no;
}

/*
  Gráfico de barras.
  dados: lista de { rotulo, valor } (ex.: { rotulo: 'Jun', valor: 31 }).
  descricao: texto que leitores de tela leem para entender o gráfico.
  Devolve o elemento <svg>.
*/
export function graficoBarras(dados, descricao) {
  const largura = 640;
  const altura = 280;
  const margem = { topo: 32, base: 40, lados: 16 };
  const areaAltura = altura - margem.topo - margem.base;
  const maior = Math.max(1, ...dados.map((d) => d.valor));
  const espaco = (largura - margem.lados * 2) / dados.length;     /* largura reservada para cada barra */
  const larguraBarra = Math.min(64, espaco * 0.6);

  const svg = elementoSvg('svg', {
    viewBox: `0 0 ${largura} ${altura}`,
    class: 'grafico',
    role: 'img',
    'aria-label': descricao
  });

  /* Linha de base (eixo horizontal) */
  svg.append(elementoSvg('line', { x1: margem.lados, x2: largura - margem.lados, y1: altura - margem.base, y2: altura - margem.base, class: 'grafico-eixo' }));

  dados.forEach((dado, indice) => {
    const alturaBarra = (dado.valor / maior) * areaAltura;
    const x = margem.lados + indice * espaco + (espaco - larguraBarra) / 2;
    const y = altura - margem.base - alturaBarra;

    svg.append(elementoSvg('rect', { x, y, width: larguraBarra, height: alturaBarra, rx: 6, class: 'grafico-barra' }));
    /* Valor escrito acima da barra */
    svg.append(elementoSvg('text', { x: x + larguraBarra / 2, y: y - 8, class: 'grafico-valor', 'text-anchor': 'middle' }, String(dado.valor)));
    /* Nome do mês abaixo do eixo */
    svg.append(elementoSvg('text', { x: x + larguraBarra / 2, y: altura - margem.base + 22, class: 'grafico-rotulo', 'text-anchor': 'middle' }, dado.rotulo));
  });
  return svg;
}
