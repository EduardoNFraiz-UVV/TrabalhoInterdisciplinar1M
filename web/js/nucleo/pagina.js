import { usuarioAtual, exigirPerfil, ongDoUsuario } from './sessao.js';
import { montarCabecalho } from '../componentes/cabecalho.js';
import { montarRodape } from '../componentes/rodape.js';
import { url, rotaInicialDoPerfil } from './caminhos.js';

export function iniciarPagina({ perfis = null, pagina = null } = {}) {
  const usuario = perfis ? exigirPerfil(perfis) : usuarioAtual();
  if (perfis && !usuario) return null;

  const idPagina = typeof pagina === 'function' ? pagina(usuario) : (pagina ?? document.body.dataset.pagina);

  montarCabecalho(usuario, idPagina);
  montarRodape();

  requestAnimationFrame(() => document.body.classList.add('pronto'));

  document.querySelectorAll('[data-link-inicio]').forEach((link) => {
    link.href = url(usuario ? rotaInicialDoPerfil(usuario.perfil) : 'apresentacao');
  });
  return { usuario, ong: ongDoUsuario(usuario) };
}
