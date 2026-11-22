import { el } from '../utilitarios/dom.js';
import { url, caminhoAbsoluto } from '../nucleo/caminhos.js';

export function botaoDoar(usuario, rota, parametros, { rotulo = 'Quero doar', rotuloAcessivel = null, tipo = 'secundario', pequeno = true } = {}) {
  if (usuario && usuario.perfil !== 'doador') return null;
  const href = usuario
    ? url(rota, parametros)
    : url('login', { retorno: caminhoAbsoluto(rota, parametros) });
  return el('a', {
    class: `botao botao-${tipo}${pequeno ? ' botao-pequeno' : ''}`,
    href,
    'aria-label': rotuloAcessivel
  }, rotulo);
}
