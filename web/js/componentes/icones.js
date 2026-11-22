/*
  icones.js
  Para que serve: guarda os ícones do guia de estilo (traço de 2 px, grade de 24 px) como
  desenhos SVG e entrega um ícone pronto com a função icone('nome').
  Quem usa: cabeçalho, selos, alertas, cartões e páginas.
  Depende de: nada.
  Regra do guia: ícones sempre acompanham um texto (por isso são escondidos de leitores de tela).

  O que é SVG: um desenho feito de texto (linhas, círculos e caminhos). Como é texto,
  ele não perde qualidade ao aumentar e muda de cor junto com o texto (stroke="currentColor").
*/

/* Desenho de cada ícone: é o miolo do <svg> (linhas, círculos e caminhos) */
const DESENHOS = {
  /* lupa de busca */
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  /* sinal de certo */
  check: '<path d="M20 6 9 17l-5-5"/>',
  /* X (fechar ou recusar) */
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  /* triângulo de atenção */
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  /* círculo com "i" de informação */
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  /* marcador de localização */
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  /* relógio */
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  /* telefone */
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  /* caminhão */
  truck: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  /* coração */
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  /* círculo com sinal de certo (ONG verificada) */
  verified: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  /* seta para a direita */
  chevron: '<path d="m9 18 6-6-6-6"/>',
  /* sinal de mais */
  plus: '<path d="M12 5v14M5 12h14"/>',
  /* lápis (editar) */
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  /* lixeira (excluir) */
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  /* círculo com interrogação (ajuda) */
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
  /* caixa (pacote) */
  package: '<path d="m7.5 4.3 9 5.2M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  /* três linhas (menu) */
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  /* silhueta de pessoa */
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
};

/*
  Cria o elemento <svg> de um ícone.
  nome: uma das chaves de DESENHOS (ex.: 'search').
  tamanho: largura e altura em pixels (padrão 20).
  Devolve o elemento pronto para ser colocado na página.
*/
export function icone(nome, tamanho = 20) {
  /* Uma caixa <div> temporária, só para o navegador transformar o texto em elemento */
  const apoio = document.createElement('div');
  /* O desenho vem deste arquivo (nunca do usuário), então é seguro usar innerHTML aqui */
  apoio.innerHTML =
    /* Abre a tag <svg> com o tamanho pedido e a "tela" de desenho de 24 x 24 */
    `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" ` +
    /* Sem preenchimento, só traço (da cor do texto), com pontas e cantos arredondados */
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    /* aria-hidden: leitores de tela ignoram o ícone (o texto ao lado já diz tudo). Depois entra o desenho */
    `aria-hidden="true" focusable="false">${DESENHOS[nome] ?? ''}</svg>`;
  /* O <svg> é o primeiro (e único) elemento dentro da caixa temporária */
  return apoio.firstElementChild;
}
