/*
  cabecalho.js
  Para que serve: monta o cabeçalho de todas as telas: marca "Conecta Doações", menu do perfil
  (doador, ONG ou administrador), link "Ajuda", saudação e botão "Sair". Para quem não entrou
  (visitante), mostra o menu público e o botão "Entrar". No celular o menu fica recolhido.
  Quem usa: pagina.js, que chama montarCabecalho() em todas as páginas.
  Depende de: dom.js, icones.js, caminhos.js, sessao.js e formatacao.js.
*/

/* Funções de outros arquivos que usamos aqui */
import { el } from '../utilitarios/dom.js';
import { icone } from './icones.js';
import { url, rotaInicialDoPerfil } from '../nucleo/caminhos.js';
import { sair } from '../nucleo/sessao.js';
import { primeiroNome } from '../utilitarios/formatacao.js';

/* Menu de cada perfil: [id da página, texto do link, nome da rota]. O id é comparado com o
   data-pagina do <body> para marcar o item atual (fundo primary-soft) */
const MENUS = {
  doador: [
    ['inicio', 'Início', 'inicio'],
    ['ongs', 'ONGs', 'ongs'],
    ['minhas-doacoes', 'Minhas doações', 'minhasDoacoes'],
    ['perfil', 'Perfil', 'perfilDoador']
  ],
  ong: [
    ['painel', 'Painel', 'painelOng'],
    ['necessidades', 'Necessidades', 'necessidades'],
    ['doacoes-recebidas', 'Doações recebidas', 'doacoesRecebidas'],
    ['perfil', 'Perfil da ONG', 'perfilOng']
  ],
  admin: [
    ['painel', 'Painel', 'painelAdmin'],
    ['aprovacoes', 'Aprovações', 'aprovacoes'],
    ['campanhas', 'Campanhas', 'campanhasAdmin'],
    ['usuarios', 'Usuários', 'usuarios']
  ]
};

/* Menu do visitante: [id da página, texto, endereço pronto] */
function menuPublico() {
  return [
    ['como-funciona', 'Como funciona', `${url('apresentacao')}#como-funciona`],
    ['campanhas-ativas', 'Campanhas', url('campanhasAtivas')],
    ['ongs', 'ONGs', url('ongs')],
    ['projetos', 'Projetos sociais', `${url('apresentacao')}#projetos`]
  ];
}

/*
  Monta o cabeçalho dentro do elemento <header id="cabecalho"> da página.
  usuario: registro do usuário logado, ou null para visitante.
  paginaAtual: id da página atual, para marcar o item do menu (aria-current="page").
*/
export function montarCabecalho(usuario, paginaAtual) {
  /* Acha o <header id="cabecalho"> da página; se a página não tem, não há onde montar */
  const destino = document.getElementById('cabecalho');
  if (!destino) return;
  /* Coloca a classe "cabecalho" nele para o CSS estilizar */
  destino.classList.add('cabecalho');

  /* Itens do menu: [{ id, texto, href }] conforme o perfil */
  /* Logado: usa o menu do perfil, trocando cada nome de rota pelo endereço (url).
     Visitante: usa o menu público. Os colchetes ([id, texto, rota]) separam cada item da lista em variáveis */
  const itens = usuario
    ? MENUS[usuario.perfil].map(([id, texto, rota]) => ({ id, texto, href: url(rota) }))
    : menuPublico().map(([id, texto, href]) => ({ id, texto, href }));

  /* Marca "Início" no link da marca conforme o perfil: quem está logado vai para a tela inicial dele */
  const hrefMarca = usuario ? url(rotaInicialDoPerfil(usuario.perfil)) : url('apresentacao');

  /* Lista do menu: um <li> com um link <a> para cada item. aria-current="page" marca a página em que estamos */
  const lista = el('ul', { class: 'menu', role: 'list' }, itens.map((item) =>
    el('li', {}, el('a', { href: item.href, 'aria-current': item.id === paginaAtual ? 'page' : null }, item.texto))));

  /* Lado direito: logado mostra Ajuda, saudação e Sair; visitante mostra Ajuda e Entrar */
  const usuarioArea = el('div', { class: 'cabecalho-usuario' },
    /* Link de ajuda (aparece para todos) */
    el('a', { href: url('ajuda') }, icone('help', 18), 'Ajuda'),
    /* Logado: saudação + botão Sair (uma lista de dois elementos). Visitante: botão Entrar */
    usuario
      ? [el('span', {}, `Olá, ${primeiroNome(usuario.nome)}`),
         el('button', { type: 'button', class: 'botao botao-discreto botao-pequeno', onclick: sair }, 'Sair')]
      : el('a', { href: url('login'), class: 'botao botao-primario botao-pequeno' }, 'Entrar'));

  /* Painel que o botão "Menu" abre e fecha no celular */
  const painel = el('div', { class: 'cabecalho-painel', id: 'painel-cabecalho' },
    el('nav', { 'aria-label': 'Menu principal' }, lista),
    usuarioArea);

  /* Botão do menu recolhido (só aparece em telas pequenas, por causa do CSS) */
  const botaoMenu = el('button', {
    type: 'button',
    class: 'botao botao-secundario botao-pequeno botao-menu',
    'aria-expanded': 'false',              /* avisa o leitor de tela que o menu começa fechado */
    'aria-controls': 'painel-cabecalho',   /* diz qual painel este botão abre e fecha */
    onclick: () => {
      /* classList.toggle liga/desliga a classe "aberto" e devolve true se ficou ligada */
      const aberto = painel.classList.toggle('aberto');
      /* Atualiza o aviso para o leitor de tela: menu aberto ("true") ou fechado ("false") */
      botaoMenu.setAttribute('aria-expanded', String(aberto));
    }
  }, icone('menu', 18), 'Menu');

  /* Coloca tudo dentro do <header>: a marca, o botão de menu e o painel */
  destino.replaceChildren(
    el('div', { class: 'cabecalho-interno' },
      el('a', { class: 'marca', href: hrefMarca }, icone('heart', 22), 'Conecta Doações'),
      botaoMenu,
      painel));
}
