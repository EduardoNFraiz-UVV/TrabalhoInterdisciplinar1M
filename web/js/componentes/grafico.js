/*
  grafico.js
  Para que serve: desenha um gráfico de barras em SVG (sem biblioteca), com o valor escrito sobre cada
  barra e o nome embaixo. Usado no relatório "Doações recebidas por mês" do painel do administrador.
  Quem usa: js/paginas/admin/painel.js.
  Depende de: nada. O visual está em css/componentes/grafico.css.

  Ideia do gráfico: o desenho é uma "tela" de 640 x 280. Cada barra é um retângulo (<rect>) cuja
  altura é proporcional ao valor; a maior barra ocupa toda a altura disponível.
*/

/* Endereço do padrão SVG: elementos SVG precisam ser criados com este "espaço de nomes" */
const SVG_NS = 'http://www.w3.org/2000/svg';

/* Cria um elemento SVG com atributos */
function elementoSvg(tag, atributos = {}, texto = null) {
  /* createElementNS é a versão de createElement para SVG (precisa do espaço de nomes) */
  const no = document.createElementNS(SVG_NS, tag);
  /* Coloca cada atributo do objeto no elemento */
  Object.entries(atributos).forEach(([chave, valor]) => no.setAttribute(chave, valor));
  /* Se foi passado um texto, coloca dentro do elemento */
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
  /* Tamanho da tela de desenho */
  const largura = 640;
  const altura = 280;
  /* Espaços vazios em volta: em cima (para o número), embaixo (para o nome) e nos lados */
  const margem = { topo: 32, base: 40, lados: 16 };
  /* Altura que sobra para as barras */
  const areaAltura = altura - margem.topo - margem.base;
  /* Maior valor dos dados (pelo menos 1, para nunca dividir por zero). O "..." espalha a lista como argumentos */
  const maior = Math.max(1, ...dados.map((d) => d.valor));
  const espaco = (largura - margem.lados * 2) / dados.length;     /* largura reservada para cada barra */
  /* Largura da barra: 60% do espaço, mas nunca mais que 64 */
  const larguraBarra = Math.min(64, espaco * 0.6);

  /* O elemento <svg> principal. role="img" + aria-label: leitor de tela lê a descrição como uma imagem */
  const svg = elementoSvg('svg', {
    viewBox: `0 0 ${largura} ${altura}`,
    class: 'grafico',
    role: 'img',
    'aria-label': descricao
  });

  /* Linha de base (eixo horizontal) */
  svg.append(elementoSvg('line', { x1: margem.lados, x2: largura - margem.lados, y1: altura - margem.base, y2: altura - margem.base, class: 'grafico-eixo' }));

  /* Para cada dado, desenha a barra, o valor e o nome */
  dados.forEach((dado, indice) => {
    /* Altura da barra: regra de três com o maior valor */
    const alturaBarra = (dado.valor / maior) * areaAltura;
    /* Posição horizontal (x) da barra, centralizada no espaço dela */
    const x = margem.lados + indice * espaco + (espaco - larguraBarra) / 2;
    /* Posição vertical (y) do topo da barra: o SVG conta de cima para baixo, por isso subtraímos */
    const y = altura - margem.base - alturaBarra;

    /* A barra: um retângulo com cantos arredondados (rx) */
    svg.append(elementoSvg('rect', { x, y, width: larguraBarra, height: alturaBarra, rx: 6, class: 'grafico-barra' }));
    /* Valor escrito acima da barra */
    svg.append(elementoSvg('text', { x: x + larguraBarra / 2, y: y - 8, class: 'grafico-valor', 'text-anchor': 'middle' }, String(dado.valor)));
    /* Nome do mês abaixo do eixo */
    svg.append(elementoSvg('text', { x: x + larguraBarra / 2, y: altura - margem.base + 22, class: 'grafico-rotulo', 'text-anchor': 'middle' }, dado.rotulo));
  });
  /* Devolve o desenho pronto */
  return svg;
}
