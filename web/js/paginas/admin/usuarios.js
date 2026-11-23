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

const POR_PAGINA = 10;
const NOME_PERFIL = { doador: 'Doador', ong: 'ONG', admin: 'Administrador' };

function montar() {
  const areaAlerta = $('#area-alerta');
  const abaDaUrl = parametro('aba');
  let abaAtual = ['doador', 'ong', 'admin'].includes(abaDaUrl) ? abaDaUrl : 'todos';
  let pagina = 1;

  const campoBusca = el('input', { type: 'search', id: 'filtro-busca', placeholder: 'Nome ou e-mail', autocomplete: 'off' });
  $('#campo-busca').append(icone('search', 18), campoBusca);

  const abas = criarAbas({
    rotulo: 'Filtrar usuários por perfil',
    abas: [
      { id: 'todos', rotulo: 'Todos', contador: 0 },
      { id: 'doador', rotulo: 'Doadores', contador: 0 },
      { id: 'ong', rotulo: 'ONGs', contador: 0 },
      { id: 'admin', rotulo: 'Administradores', contador: 0 }
    ],
    ativa: abaAtual,
    aoMudar: (id) => { abaAtual = id; pagina = 1; desenhar(); }
  });
  $('#abas').append(abas.elemento);

  function desenhar() {
    const termo = normalizar(campoBusca.value);
    const situacao = $('#filtro-situacao').value;
    const base = tabela('usuario')
      .filter((u) => !termo || normalizar(u.nome).includes(termo) || normalizar(u.email).includes(termo))
      .filter((u) => !situacao || (situacao === 'ativo') === u.ativo);

    abas.atualizarContadores({
      todos: base.length,
      doador: base.filter((u) => u.perfil === 'doador').length,
      ong: base.filter((u) => u.perfil === 'ong').length,
      admin: base.filter((u) => u.perfil === 'admin').length
    });

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
            if (u.perfil === 'admin') return '';
            return u.ativo
              ? el('button', { type: 'button', class: 'acao acao-perigo', 'aria-label': `Bloquear ${u.nome}`, onclick: () => bloquear(u) }, 'Bloquear')
              : el('button', { type: 'button', class: 'acao acao-sucesso', 'aria-label': `Desbloquear ${u.nome}`, onclick: () => desbloquear(u) }, 'Desbloquear');
          }
        }
      ]
    }));
    preencher($('#paginacao'), criarPaginacao({ total: linhas.length, porPagina: POR_PAGINA, pagina, aoMudar: (nova) => { pagina = nova; desenhar(); } }));
  }

  async function bloquear(usuario) {
    const ok = await confirmar({
      titulo: 'Bloquear usuário?',
      texto: 'O usuário não poderá entrar nem registrar doações. Você pode desbloquear o acesso depois.',
      rotuloConfirmar: 'Bloquear usuário'
    });
    if (!ok) return;
    definirBloqueio(usuario.id_usuario, true);
    mostrarAlerta(areaAlerta, 'info', 'Usuário bloqueado.', `${usuario.nome} não consegue mais entrar.`);
    desenhar();
  }

  function desbloquear(usuario) {
    definirBloqueio(usuario.id_usuario, false);
    mostrarAlerta(areaAlerta, 'sucesso', 'Usuário desbloqueado.', `${usuario.nome} já pode entrar de novo.`);
    desenhar();
  }

  $('#formulario-filtros').addEventListener('submit', (evento) => evento.preventDefault());
  campoBusca.addEventListener('input', () => { pagina = 1; desenhar(); });
  $('#filtro-situacao').addEventListener('change', () => { pagina = 1; desenhar(); });
  desenhar();
}

if (iniciarPagina({ perfis: ['admin'] })) montar();
