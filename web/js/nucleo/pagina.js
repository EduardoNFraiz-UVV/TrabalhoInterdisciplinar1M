/*
  pagina.js
  Para que serve: é o primeiro comando que TODA página executa. Confere se o usuário pode abrir a
  página (proteção por perfil), monta o cabeçalho e o rodapé e entrega o usuário para a página usar.
  Quem usa: o arquivo JS de cada página (js/paginas/...).
  Depende de: sessao.js, cabecalho.js e rodape.js.

  Como usar numa página:
    const contexto = iniciarPagina({ perfis: ['doador'], pagina: 'inicio' });
    if (contexto) { ...montar a página usando contexto.usuario ... }
  Se contexto for null, o navegador está sendo redirecionado (sem login ou perfil errado).
*/

import { usuarioAtual, exigirPerfil, ongDoUsuario } from './sessao.js';
import { montarCabecalho } from '../componentes/cabecalho.js';
import { montarRodape } from '../componentes/rodape.js';
import { url, rotaInicialDoPerfil } from './caminhos.js';

/*
  opcoes:
    perfis: lista de perfis que podem abrir a página, ou null para página pública (qualquer pessoa);
    pagina: id da página no menu (texto), ou função que recebe o usuário e devolve o id.
            Se não for informado, usa o atributo data-pagina do <body>.
  Devolve { usuario, ong } ou null (quando está redirecionando).
  usuario é null para visitantes; ong é a ONG do usuário quando ele é representante de ONG.
*/
export function iniciarPagina({ perfis = null, pagina = null } = {}) {
  /* Páginas protegidas: confere login e perfil */
  const usuario = perfis ? exigirPerfil(perfis) : usuarioAtual();
  if (perfis && !usuario) return null;

  /* Descobre qual item do menu marcar como atual */
  const idPagina = typeof pagina === 'function' ? pagina(usuario) : (pagina ?? document.body.dataset.pagina);

  montarCabecalho(usuario, idPagina);
  montarRodape();

  /* Links marcados com data-link-inicio (primeiro item do breadcrumb) levam à tela inicial de quem está logado */
  document.querySelectorAll('[data-link-inicio]').forEach((link) => {
    link.href = url(usuario ? rotaInicialDoPerfil(usuario.perfil) : 'apresentacao');
  });
  return { usuario, ong: ongDoUsuario(usuario) };
}
