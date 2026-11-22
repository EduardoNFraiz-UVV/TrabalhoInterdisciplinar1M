/*
  acoes-doacao.js
  Para que serve: cria o botão/link "Quero doar" (e "Doar para esta meta") respeitando quem está logado:
    - doador: vai direto para o formulário de doação;
    - visitante: vai para o login e, depois de entrar, volta para o formulário (parâmetro retorno);
    - ONG e administrador: o botão não aparece, porque só o doador registra doações (RN-36).
  Quem usa: tabelas e cartões das páginas públicas e do doador.
  Depende de: dom.js e caminhos.js.
*/

/* Funções de outros arquivos que usamos aqui */
import { el } from '../utilitarios/dom.js';
import { url, caminhoAbsoluto } from '../nucleo/caminhos.js';

/*
  usuario: usuário logado ou null. rota: nome da rota do formulário ('doar' ou 'doarCampanha').
  parametros: parâmetros do formulário (ex.: { necessidade: 3 }). rotulo: texto do botão.
  rotuloAcessivel: texto que o leitor de tela fala (ex.: "Quero doar Cobertores de casal").
  tipo: 'primario' ou 'secundario'. Devolve o link, ou null se o perfil não pode doar.
*/
export function botaoDoar(usuario, rota, parametros, { rotulo = 'Quero doar', rotuloAcessivel = null, tipo = 'secundario', pequeno = true } = {}) {
  /* Logado como ONG ou administrador: não mostra o botão (devolve null) */
  if (usuario && usuario.perfil !== 'doador') return null;
  /* Doador logado: vai direto ao formulário. Visitante: vai ao login, guardando o formulário como "retorno" */
  const href = usuario
    ? url(rota, parametros)
    : url('login', { retorno: caminhoAbsoluto(rota, parametros) });
  /* O botão é um link <a> com aparência de botão (ele leva a outra página) */
  return el('a', {
    class: `botao botao-${tipo}${pequeno ? ' botao-pequeno' : ''}`,   /* cor e tamanho do botão */
    href,
    'aria-label': rotuloAcessivel                                      /* texto mais completo para leitor de tela */
  }, rotulo);
}
