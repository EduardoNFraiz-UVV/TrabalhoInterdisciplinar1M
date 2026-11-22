/*
  usuarios.js
  Página: paginas/admin/usuarios.html (tela 14: Usuários).
  Para que serve: lista os usuários da plataforma com abas por perfil, busca e filtro de situação,
  paginada; bloqueia e desbloqueia contas (RN-04). Administradores não têm ação de bloqueio.
  Depende de: pagina.js, regras de contas, componentes de abas, tabela, paginação, selos e diálogo.
*/

/* Funções de outros arquivos que usamos aqui */
import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, buscar } from '../../nucleo/armazenamento.js';
import { parametro } from '../../nucleo/caminhos.js';
import { el, $, preencher } from '../../utilitarios/dom.js';
import { formatarData, normalizar } from '../../utilitarios/formatacao.js';
import { definirBloqueio } from '../../regras/contas.js';
import { criarAbas } from '../../componentes/abas.js';
import { criarTabela } from '../../componentes/tabela.js';
import { criarPaginacao, fatiar } from '../../componentes/paginacao.js';
import { seloUsuario } from '../../componentes/selos.js';
import { confirmar } from '../../componentes/dialogo.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { icone } from '../../componentes/icones.js';

/* Quantos usuários aparecem em cada página e o nome mostrado para cada perfil */
const POR_PAGINA = 10;
const NOME_PERFIL = { doador: 'Doador', ong: 'ONG', admin: 'Administrador' };

function montar() {
  /* Área de avisos da página */
  const areaAlerta = $('#area-alerta');
  /* A URL pode pedir uma aba (?aba=ong); se o valor não é um perfil válido, usa "todos" */
  const abaDaUrl = parametro('aba');
  let abaAtual = ['doador', 'ong', 'admin'].includes(abaDaUrl) ? abaDaUrl : 'todos';
  /* Página atual da paginação */
  let pagina = 1;

  /* Campo de busca com ícone */
  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Nome ou e-mail', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  /* Abas por perfil, com contador (os números são atualizados em desenhar) */
  const abas = criarAbas({
    rotulo: 'Filtrar usuários por perfil',
    abas: [
      { id: 'todos', rotulo: 'Todos', contador: 0 },
      { id: 'doador', rotulo: 'Doadores', contador: 0 },
      { id: 'ong', rotulo: 'ONGs', contador: 0 },
      { id: 'admin', rotulo: 'Administradores', contador: 0 }
    ],
    ativa: abaAtual,
    /* Ao trocar de aba: guarda o id, volta para a página 1 e redesenha */
    aoMudar: (id) => { abaAtual = id; pagina = 1; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  /* Desenha os contadores, a tabela e a paginação */
  function desenhar() {
    /* Valores atuais da busca e do filtro de situação */
    const termo = normalizar(campoBusca.value);
    const situacao = $('#filtro-situacao').value;
    /* Usuários que passam na busca (nome ou e-mail) e na situação */
    const base = tabela('usuario')
      .filter((u) => !termo || normalizar(u.nome).includes(termo) || normalizar(u.email).includes(termo))
      /* Situação: compara "é ativo?" (true/false) com a coluna ativo do usuário */
      .filter((u) => !situacao || (situacao === 'ativo') === u.ativo);

    /* Números das abas: quantos usuários há em cada perfil */
    abas.atualizarContadores({
      todos: base.length,
      doador: base.filter((u) => u.perfil === 'doador').length,
      ong: base.filter((u) => u.perfil === 'ong').length,
      admin: base.filter((u) => u.perfil === 'admin').length
    });

    /* Linhas da aba atual; volta para a página 1 se a atual deixou de existir */
    const linhas = base.filter((u) => abaAtual === 'todos' || u.perfil === abaAtual);
    if ((pagina - 1) * POR_PAGINA >= linhas.length) pagina = 1;

    preencher($('#lista'), criarTabela({
      legenda: 'Usuários da plataforma',
      linhas: fatiar(linhas, pagina, POR_PAGINA),
      vazio: 'Nenhum usuário encontrado.',
      colunas: [
        { titulo: 'Nome', render: (u) => el('strong', {}, u.nome) },
        { titulo: 'E-mail', render: (u) => u.email },
        { titulo: 'Perfil', render: (u) => NOME_PERFIL[u.perfil] },
        { titulo: 'Cidade', render: (u) => buscar('cidade', u.id_cidade).nome },
        { titulo: 'Cadastro', render: (u) => formatarData(u.data_cadastro) },
        { titulo: 'Situação', render: (u) => seloUsuario(u.ativo) },
        {
          titulo: 'Ação',
          classe: 'acoes',
          render: (u) => {
            /* Administradores não têm botão de bloqueio */
            if (u.perfil === 'admin') return '';
            /* Usuário ativo: botão "Bloquear". Bloqueado: botão "Desbloquear" */
            return u.ativo
              ? el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Bloquear ${u.nome}`, onclick: () => bloquear(u) }, 'Bloquear')
              : el('button', { type: 'button', class: 'acao acao-sucesso', 'aria-label': `Desbloquear ${u.nome}`, onclick: () => desbloquear(u) }, 'Desbloquear');
          }
        }
      ]
    }));
    /* Botões da paginação; ao escolher outra página, guarda o número e redesenha */
    preencher($('#paginacao'), criarPaginacao({ total: linhas.length, porPagina: POR_PAGINA, pagina, aoMudar: (nova) => { pagina = nova; desenhar(); } }));
  }

  /* Bloquear: pede confirmação antes. "async" porque esperamos (await) a resposta do diálogo */
  async function bloquear(usuario) {
    const ok = await confirmar({
      titulo: 'Bloquear usuário?',
      texto: 'O usuário não poderá entrar nem registrar doações. Você pode desbloquear o acesso depois.',
      rotuloConfirmar: 'Bloquear usuário'
    });
    /* Se desistiu, não faz nada */
    if (!ok) return;
    /* true = bloqueado */
    definirBloqueio(usuario.id_usuario, true);
    mostrarAlerta(areaAlerta, 'info', 'Usuário bloqueado.', `${usuario.nome} não consegue mais entrar.`);
    desenhar();
  }

  /* Desbloquear: sem confirmação */
  function desbloquear(usuario) {
    /* false = não bloqueado */
    definirBloqueio(usuario.id_usuario, false);
    mostrarAlerta(areaAlerta, 'sucesso', 'Usuário desbloqueado.', `${usuario.nome} já pode entrar de novo.`);
    desenhar();
  }

  /* O formulário de filtros não deve recarregar a página ao ser enviado */
  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());
  /* Ao digitar na busca ou mudar a situação: volta para a página 1 e redesenha */
  campoBusca.addEventListener('input', () => { pagina = 1; desenhar(); });
  $('#filtro-situacao').addEventListener('change', () => { pagina = 1; desenhar(); });
  /* Primeira pintura da página */
  desenhar();
}

/* Confere o login (só administrador) e monta cabeçalho e rodapé; depois monta a página */
if (iniciarPagina({ perfis: ['admin'] })) montar();
