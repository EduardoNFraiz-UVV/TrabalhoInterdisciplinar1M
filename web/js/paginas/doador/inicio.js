/*
  inicio.js
  Página: paginas/doador/inicio.html (tela 02: Início do doador).
  Para que serve: o doador busca necessidades por item, ONG ou cidade, filtra por categoria (abas),
  vê a campanha em destaque e a tabela de necessidades. Por padrão mostra só as URGENTES (RN-13);
  "Ver todas as necessidades" mostra todas as ativas, com paginação.
  Depende de: pagina.js, regras, componentes de abas, tabela, cartões, paginação e ações de doação.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarQuantidade, normalizar } from '../../utilitarios/formatacao.js';
import { necessidadesAtivas, faltam, itensUrgentes } from '../../regras/necessidades.js';
import { campanhasAtivas, quantidadeDeOngs } from '../../regras/campanhas.js';
import { criarAbas } from '../../componentes/abas.js';
import { criarTabela } from '../../componentes/tabela.js';
import { criarPaginacao, fatiar } from '../../componentes/paginacao.js';
import { cartaoOng, cartaoCampanha } from '../../componentes/cartoes.js';
import { seloPrioridade } from '../../componentes/selos.js';
import { botaoDoar } from '../../componentes/acoes-doacao.js';
import { icone } from '../../componentes/icones.js';
import { exibirAvisoGuardado } from '../../componentes/alertas.js';

const POR_PAGINA = 8;

function montar(usuario) {
  exibirAvisoGuardado($('#area-alerta'));     /* aviso deixado pela página anterior (ex.: "Conta criada!") */
  let categoria = '';          /* '' = todas as categorias */
  let verTodas = false;        /* false = só urgentes; true = todas as necessidades ativas */
  let pagina = 1;

  /* Campo de busca com ícone */
  const campoBusca = el('input', { type: 'search', id: 'busca', 'aria-label': 'Pesquise por item, ONG ou cidade', placeholder: 'Pesquise por item, ONG ou cidade (ex.: cobertores)', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  /* Abas de categoria: "Todas" mais as 8 categorias */
  const abas = criarAbas({
    rotulo: 'Filtrar por categoria',
    abas: [{ id: '', rotulo: 'Todas' }, ...tabela('categoria').map((c) => ({ id: String(c.id_categoria), rotulo: c.nome }))],
    ativa: '',
    aoMudar: (id) => { categoria = id; pagina = 1; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  /* Campanha em destaque: a ativa com mais ONGs participantes */
  const ativas = campanhasAtivas().sort((a, b) => quantidadeDeOngs(b.id_campanha) - quantidadeDeOngs(a.id_campanha));
  if (ativas[0]) preencher($('#campanha-destaque'), cartaoCampanha(ativas[0], 'h2'));

  /* ONGs com mais itens urgentes na lateral */
  const ongsComUrgencia = tabela('ong').filter((o) => o.verificada).sort((a, b) => itensUrgentes(b.id_ong) - itensUrgentes(a.id_ong)).slice(0, 2);
  preencher($('#ongs-destaque'), ongsComUrgencia.map((ong) => cartaoOng(ong, 'h3')));

  /* Necessidades que passam pela busca, pela categoria e pelo modo (urgentes ou todas) */
  function filtradas() {
    const termo = normalizar(campoBusca.value);
    const buscando = termo !== '' || categoria !== '';
    return necessidadesAtivas().filter((n) => {
      const ong = buscar('ong', n.id_ong);
      const cidade = buscar('cidade', ong.id_cidade).nome;
      return faltam(n) > 0
        && (!categoria || n.id_categoria === Number(categoria))
        && (!termo || [n.item, ong.nome, cidade].some((texto) => normalizar(texto).includes(termo)))
        && (verTodas || buscando || n.prioridade === 'urgente');
    });
  }

  function desenhar() {
    const lista = filtradas();
    const buscando = campoBusca.value.trim() !== '' || categoria !== '';
    $('#titulo-tabela').textContent = buscando ? 'Resultados da busca' : verTodas ? 'Todas as necessidades' : 'Necessidades urgentes';
    $('#alternar-lista').textContent = verTodas ? 'Ver só as urgentes' : 'Ver todas as necessidades';
    $('#alternar-lista').hidden = buscando;
    $('#contagem').textContent = `${lista.length} ${lista.length === 1 ? 'necessidade encontrada' : 'necessidades encontradas'}`;
    if ((pagina - 1) * POR_PAGINA >= lista.length) pagina = 1;

    preencher($('#lista'), criarTabela({
      legenda: 'Necessidades das ONGs',
      linhas: fatiar(lista, pagina, POR_PAGINA),
      vazio: 'Nenhuma necessidade encontrada. Tente outra palavra ou outra categoria.',
      colunas: [
        { titulo: 'Item', render: (n) => el('strong', {}, n.item) },
        { titulo: 'Categoria', render: (n) => buscar('categoria', n.id_categoria).nome },
        { titulo: 'ONG', render: (n) => el('a', { href: `../publico/ong.html?id=${n.id_ong}` }, buscar('ong', n.id_ong).nome) },
        { titulo: 'Faltam', classe: 'numerico', render: (n) => formatarQuantidade(faltam(n), n.unidade) },
        { titulo: 'Prioridade', render: (n) => seloPrioridade(n.prioridade) },
        { titulo: 'Ação', classe: 'acoes', render: (n) => botaoDoar(usuario, 'doar', { necessidade: n.id_necessidade }, { rotuloAcessivel: `Quero doar ${n.item}` }) }
      ]
    }));
    preencher($('#paginacao'), criarPaginacao({ total: lista.length, porPagina: POR_PAGINA, pagina, aoMudar: (nova) => { pagina = nova; desenhar(); } }));
  }

  /* Buscar: pelo botão, pela tecla Enter ou enquanto digita */
  $('#formulario-busca').addEventListener('submit', (evento) => { evento.preventDefault(); pagina = 1; desenhar(); });
  campoBusca.addEventListener('input', () => { pagina = 1; desenhar(); });
  $('#alternar-lista').addEventListener('click', () => { verTodas = !verTodas; pagina = 1; desenhar(); });

  desenhar();
}

const contexto = iniciarPagina({ perfis: ['doador'] });
if (contexto) montar(contexto.usuario);
