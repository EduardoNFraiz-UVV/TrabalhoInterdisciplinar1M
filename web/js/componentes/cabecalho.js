import { el } from '../utilitarios/dom.js';
import { icone } from './icones.js';
import { url, rotaInicialDoPerfil } from '../nucleo/caminhos.js';
import { sair } from '../nucleo/sessao.js';
import { primeiroNome } from '../utilitarios/formatacao.js';

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

function menuPublico() {
  return [
    ['como-funciona', 'Como funciona', `${url('apresentacao')}#como-funciona`],
    ['campanhas-ativas', 'Campanhas', url('campanhasAtivas')],
    ['ongs', 'ONGs', url('ongs')],
    ['projetos', 'Projetos sociais', `${url('apresentacao')}#projetos`]
  ];
}

export function montarCabecalho(usuario, paginaAtual) {
  const destino = document.getElementById('cabecalho');
  if (!destino) return;
  destino.classList.add('cabecalho');

  const itens = usuario
    ? MENUS[usuario.perfil].map(([id, texto, rota]) => ({ id, texto, href: url(rota) }))
    : menuPublico().map(([id, texto, href]) => ({ id, texto, href }));

  const hrefMarca = usuario ? url(rotaInicialDoPerfil(usuario.perfil)) : url('apresentacao');

  const lista = el('ul', { class: 'menu', role: 'list' }, itens.map((item) =>
    el('li', {}, el('a', { href: item.href, 'aria-current': item.id === paginaAtual ? 'page' : null }, item.texto))));

  const usuarioArea = el('div', { class: 'cabecalho-usuario' },
    el('a', { href: url('ajuda') }, icone('help', 18), 'Ajuda'),
    usuario
      ? [el('span', {}, `Olá, ${primeiroNome(usuario.nome)}`),
         el('button', { type: 'button', class: 'botao botao-discreto botao-pequeno', onclick: sair }, 'Sair')]
      : el('a', { href: url('login'), class: 'botao botao-primario botao-pequeno' }, 'Entrar'));

  const painel = el('div', { class: 'cabecalho-painel', id: 'painel-cabecalho' },
    el('nav', { 'aria-label': 'Menu principal' }, lista),
    usuarioArea);

  const botaoMenu = el('button', {
    type: 'button',
    class: 'botao botao-secundario botao-pequeno botao-menu',
    'aria-expanded': 'false',
    'aria-controls': 'painel-cabecalho',
    onclick: () => {
      const aberto = painel.classList.toggle('aberto');
      botaoMenu.setAttribute('aria-expanded', String(aberto));
    }
  }, icone('menu', 18), 'Menu');

  destino.replaceChildren(
    el('div', { class: 'cabecalho-interno' },
      el('a', { class: 'marca', href: hrefMarca }, icone('heart', 22), 'Conecta Doações'),
      botaoMenu,
      painel));
}
