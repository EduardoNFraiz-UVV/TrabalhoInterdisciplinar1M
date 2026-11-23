/*
  ongs.js
  Página: paginas/publico/ongs.html (tela 03: ONGs cadastradas).
  Para que serve: filtra as ONGs verificadas por nome, categoria (que ela precisa), cidade e "só com
  itens urgentes", mostra quantas foram encontradas e pagina os cartões (6 por página).
  Depende de: pagina.js, armazenamento.js, regras de necessidades, componentes de cartões e paginação.
*/

/* Funções de outros arquivos que usamos aqui */
import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { normalizar } from '../../utilitarios/formatacao.js';
import { semRepetidos } from '../../utilitarios/listas.js';
import { necessidadesDaOng, itensUrgentes } from '../../regras/necessidades.js';
import { cartaoOng } from '../../componentes/cartoes.js';
import { criarPaginacao, fatiar, preencherPagina } from '../../componentes/paginacao.js';
import { preencherSelect } from '../../componentes/formulario.js';
import { icone } from '../../componentes/icones.js';

/* Quantas ONGs aparecem em cada página */
const POR_PAGINA = 6;

function montar() {
  /* Página atual da paginação (começa na 1) */
  let pagina = 1;

  /* Cria o campo de busca por nome e o coloca na página, junto com o ícone de lupa */
  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Nome da ONG', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  /* Só ONGs verificadas aparecem na lista pública */
  const ongs = tabela('ong').filter((o) => o.verificada);
  /* Preenche o filtro de categorias com a tabela categoria */
  preencherSelect($('#filtro-categoria'), tabela('categoria'), { valor: (c) => c.id_categoria, rotulo: (c) => c.nome, primeira: 'Todas' });
  /* Cidades das ONGs, sem repetir, trocando cada id pelo registro da cidade e ordenando pelo nome */
  const cidades = semRepetidos(ongs.map((o) => o.id_cidade)).map((id) => buscar('cidade', id)).sort((a, b) => a.nome.localeCompare(b.nome));
  /* Preenche o filtro de cidades */
  preencherSelect($('#filtro-cidade'), cidades, { valor: (c) => c.id_cidade, rotulo: (c) => c.nome, primeira: 'Todas' });

  /* Lista as ONGs que passam por todos os filtros */
  function filtradas() {
    /* Valores atuais dos filtros */
    const termo = normalizar(campoBusca.value);
    const categoria = $('#filtro-categoria').value;
    const cidade = $('#filtro-cidade').value;
    const soUrgentes = $('#filtro-urgentes').checked;
    /* Cada linha abaixo é um filtro. "!filtro ||" significa: se o filtro está vazio, ele não exclui ninguém */
    return ongs.filter((o) => (!termo || normalizar(o.nome).includes(termo))
      && (!cidade || o.id_cidade === Number(cidade))
      && (!categoria || necessidadesDaOng(o.id_ong).some((n) => n.situacao === 'ativa' && n.id_categoria === Number(categoria)))
      && (!soUrgentes || itensUrgentes(o.id_ong) > 0));
  }

  /* Desenha a contagem, os cartões e a paginação */
  function desenhar() {
    const lista = filtradas();
    /* Lista de textos com os filtros que estão ativos (para mostrar na contagem) */
    const ativos = [];
    if (campoBusca.value.trim()) ativos.push(`“${campoBusca.value.trim()}”`);
    if ($('#filtro-categoria').value) ativos.push($('#filtro-categoria').selectedOptions[0].text);
    if ($('#filtro-cidade').value) ativos.push($('#filtro-cidade').selectedOptions[0].text);
    if ($('#filtro-urgentes').checked) ativos.push('só urgentes');
    /* Frase de contagem, com singular/plural e, se houver, os filtros ativos */
    $('#contagem').textContent = `${lista.length} ${lista.length === 1 ? 'ONG encontrada' : 'ONGs encontradas'}${ativos.length ? ` · Filtros ativos: ${ativos.join(', ')}` : ''}`;

    /* Volta para a primeira página se a atual deixou de existir (filtro ficou mais restrito) */
    if ((pagina - 1) * POR_PAGINA >= lista.length) pagina = 1;

    /* O que aparece em uma página: os cartões dela (ou uma frase, se nenhuma ONG passou nos filtros) */
    const cartoesDaPagina = (numero) => (lista.length === 0
      ? el('p', { class: 'texto-apoio' }, 'Nenhuma ONG encontrada com esses filtros. Tente limpar os filtros.')
      : fatiar(lista, numero, POR_PAGINA).map((ong) => cartaoOng(ong, 'h3')));
    /* Mostra a página atual com a altura da página mais alta, para a paginação não mudar de lugar */
    preencherPagina($('#lista'), { total: lista.length, porPagina: POR_PAGINA, pagina, conteudo: cartoesDaPagina });

    /* Desenha os botões da paginação; ao escolher outra página, guarda o número e desenha de novo */
    preencher($('#paginacao'), criarPaginacao({ total: lista.length, porPagina: POR_PAGINA, pagina, aoMudar: (nova) => { pagina = nova; desenhar(); } }));
  }

  /* O formulário de filtros não deve recarregar a página ao ser enviado */
  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());
  /* Ao digitar na busca, volta para a página 1 e redesenha */
  campoBusca.addEventListener('input', () => { pagina = 1; desenhar(); });
  /* O mesmo ao mudar qualquer filtro (categoria, cidade, "só urgentes") */
  ['#filtro-categoria', '#filtro-cidade', '#filtro-urgentes'].forEach((seletor) => $(seletor).addEventListener('change', () => { pagina = 1; desenhar(); }));

  /* "Limpar filtros" volta tudo ao padrão */
  $('#limpar-filtros').addEventListener('click', () => {
    /* reset() devolve todos os campos do formulário ao valor inicial */
    $('#formulario-filtros').reset();
    pagina = 1;
    desenhar();
  });

  /* Primeira pintura da página */
  desenhar();
}

/* Só monta a página se iniciarPagina não estiver redirecionando */
if (iniciarPagina({ perfis: null })) montar();
