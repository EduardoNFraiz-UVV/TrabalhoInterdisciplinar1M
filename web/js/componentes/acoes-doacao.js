/*
  acoes-doacao.js
  Para que serve: cria o botão/link "Quero doar" (e "Doar para esta meta") respeitando quem está logado:
    - doador: vai direto para o formulário de doação;
    - visitante: vai para o login e, depois de entrar, volta para o formulário (parâmetro retorno);
    - ONG e administrador: o botão não aparece, porque só o doador registra doações (RN-36).
  Quem usa: tabelas e cartões das páginas públicas e do doador.
  Depende de: dom.js e caminhos.js.
*/

import { el } from '../utilitarios/dom.js';
import { url, caminhoAbsoluto } from '../nucleo/caminhos.js';

/*
  usuario: usuário logado ou null. rota: nome da rota do formulário ('doar' ou 'doarCampanha').
  parametros: parâmetros do formulário (ex.: { necessidade: 3 }). rotulo: texto do botão.
  rotuloAcessivel: texto que o leitor de tela fala (ex.: "Quero doar Cobertores de casal").
  tipo: 'primario' ou 'secundario'. Devolve o link, ou null se o perfil não pode doar.
*/
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
