/*
  ongs.js
  Página: paginas/publico/ongs.html (tela 03: ONGs cadastradas).
  Para que serve: filtra as ONGs verificadas por nome, categoria (que ela precisa), cidade e "só com
  itens urgentes", mostra quantas foram encontradas e pagina os cartões (6 por página).
  Depende de: pagina.js, armazenamento.js, regras de necessidades, componentes de cartões e paginação.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { normalizar } from '../../utilitarios/formatacao.js';
import { necessidadesDaOng, itensUrgentes } from '../../regras/necessidades.js';
import { cartaoOng } from '../../componentes/cartoes.js';
import { criarPaginacao, fatiar } from '../../componentes/paginacao.js';
import { preencherSelect } from '../../componentes/formulario.js';
import { icone } from '../../componentes/icones.js';

const POR_PAGINA = 6;

function montar() {
  let pagina = 1;

  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Nome da ONG', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  const ongs = tabela('ong').filter((o) => o.verificada);
  preencherSelect($('#filtro-categoria'), tabela('categoria'), { valor: (c) => c.id_categoria, rotulo: (c) => c.nome, primeira: 'Todas' });
  const cidades = [...new Set(ongs.map((o) => o.id_cidade))].map((id) => buscar('cidade', id)).sort((a, b) => a.nome.localeCompare(b.nome));
  preencherSelect($('#filtro-cidade'), cidades, { valor: (c) => c.id_cidade, rotulo: (c) => c.nome, primeira: 'Todas' });

  /* Lista as ONGs que passam por todos os filtros */
  function filtradas() {
    const termo = normalizar(campoBusca.value);
    const categoria = $('#filtro-categoria').value;
    const cidade = $('#filtro-cidade').value;
    const soUrgentes = $('#filtro-urgentes').checked;
    return ongs.filter((o) => (!termo || normalizar(o.nome).includes(termo))
      && (!cidade || o.id_cidade === Number(cidade))
      && (!categoria || necessidadesDaOng(o.id_ong).some((n) => n.situacao === 'ativa' && n.id_categoria === Number(categoria)))
      && (!soUrgentes || itensUrgentes(o.id_ong) > 0));
  }

  function desenhar() {
    const lista = filtradas();
    const ativos = [];
    if (campoBusca.value.trim()) ativos.push(`“${campoBusca.value.trim()}”`);
    if ($('#filtro-categoria').value) ativos.push($('#filtro-categoria').selectedOptions[0].text);
    if ($('#filtro-cidade').value) ativos.push($('#filtro-cidade').selectedOptions[0].text);
    if ($('#filtro-urgentes').checked) ativos.push('só urgentes');
    $('#contagem').textContent = `${lista.length} ${lista.length === 1 ? 'ONG encontrada' : 'ONGs encontradas'}${ativos.length ? ` · Filtros ativos: ${ativos.join(', ')}` : ''}`;

    /* Volta para a primeira página se a atual deixou de existir (filtro ficou mais restrito) */
    if ((pagina - 1) * POR_PAGINA >= lista.length) pagina = 1;

    preencher($('#lista'), lista.length === 0
      ? el('p', { class: 'texto-apoio' }, 'Nenhuma ONG encontrada com esses filtros. Tente limpar os filtros.')
      : fatiar(lista, pagina, POR_PAGINA).map((ong) => cartaoOng(ong, 'h3')));

    preencher($('#paginacao'), criarPaginacao({ total: lista.length, porPagina: POR_PAGINA, pagina, aoMudar: (nova) => { pagina = nova; desenhar(); } }));
  }

  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());
  campoBusca.addEventListener('input', () => { pagina = 1; desenhar(); });
  ['#filtro-categoria', '#filtro-cidade', '#filtro-urgentes'].forEach((seletor) => $(seletor).addEventListener('change', () => { pagina = 1; desenhar(); }));

  /* "Limpar filtros" volta tudo ao padrão */
  $('#limpar-filtros').addEventListener('click', () => {
    $('#formulario-filtros').reset();
    pagina = 1;
    desenhar();
  });

  desenhar();
}

if (iniciarPagina({ perfis: null })) montar();
