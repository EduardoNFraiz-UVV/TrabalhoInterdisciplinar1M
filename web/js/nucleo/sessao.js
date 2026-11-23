/*
  sessao.js
  Para que serve: controla quem está logado. Valida o login em JavaScript (como pede o
  enunciado), guarda o usuário da sessão, e protege as páginas por perfil (doador, ong, admin).
  Quem usa: pagina.js, página de login, criar conta e perfis.
  Depende de: armazenamento.js (tabela de usuários) e caminhos.js (para redirecionar).

  Login: o campo aceita o e-mail inteiro OU só a parte antes do @ (ex.: "doador").
  A senha digitada vira um SHA-256 e é comparada com a coluna senha_hash do usuário.

  Duas "gavetas" do navegador guardam o login:
    sessionStorage = some quando a aba é fechada;
    localStorage   = continua depois de fechar o navegador (usado quando marca "Lembrar de mim").
*/

/* Funções de outros arquivos que usamos aqui */
import { tabela, buscar, atualizar } from './armazenamento.js';
import { ir, rotaInicialDoPerfil } from './caminhos.js';

/* Chave onde guardamos o id do usuário logado */
const CHAVE_SESSAO = 'conecta.sessao';

/* Transforma um texto em SHA-256 (64 letras e números). Usa a API Web Crypto do navegador.
   É "async" porque o cálculo devolve uma promessa: precisamos esperar (await) o resultado. */
export async function hashSenha(texto) {
  /* O cálculo trabalha com bytes, então convertemos o texto em bytes */
  const bytes = new TextEncoder().encode(texto);
  /* Calcula o resumo SHA-256 e espera o resultado chegar */
  const resumo = await crypto.subtle.digest('SHA-256', bytes);
  /* Converte os bytes do resumo em texto hexadecimal: cada byte vira 2 caracteres (0-9 e a-f) */
  return Array.from(new Uint8Array(resumo))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/* Apaga a sessão tanto do sessionStorage (até fechar a aba) quanto do localStorage (lembrar-me) */
function limparSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  localStorage.removeItem(CHAVE_SESSAO);
}

/*
  Tenta entrar. Devolve um objeto:
    { ok: true, usuario }                      quando deu certo;
    { ok: false, motivo: 'credenciais' }       quando usuário ou senha estão errados;
    { ok: false, motivo: 'bloqueado' }         quando a conta foi bloqueada pelo administrador.
  lembrar: se true, a sessão fica salva mesmo depois de fechar o navegador.
*/
export async function entrar(identificador, senha, lembrar) {
  /* Tira espaços das pontas e deixa em minúsculas, para "Doador " e "doador" valerem igual */
  const alvo = identificador.trim().toLowerCase();
  /* Procura, na tabela de usuários, quem tem esse e-mail (inteiro ou só a parte antes do @) */
  const usuario = tabela('usuario').find((u) => {
    const email = u.email.toLowerCase();
    return email === alvo || email.split('@')[0] === alvo;
  });
  /* Ninguém com esse login: avisa que as credenciais estão erradas */
  if (!usuario) return { ok: false, motivo: 'credenciais' };

  /* Calcula o SHA-256 da senha digitada e compara com o guardado no banco */
  const hash = await hashSenha(senha);
  if (hash !== usuario.senha_hash) return { ok: false, motivo: 'credenciais' };
  /* Senha certa, mas a conta foi bloqueada pelo administrador */
  if (!usuario.ativo) return { ok: false, motivo: 'bloqueado' };

  /* Tudo certo: apaga qualquer sessão antiga */
  limparSessao();
  /* Guarda o id do usuário: no localStorage se marcou "lembrar", senão no sessionStorage */
  (lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, String(usuario.id_usuario));
  /* Avisa que deu certo e entrega o usuário */
  return { ok: true, usuario };
}

/* Devolve o usuário logado (registro da tabela usuario) ou null se ninguém entrou */
export function usuarioAtual() {
  /* Procura o id primeiro no sessionStorage e, se não houver, no localStorage */
  const id = sessionStorage.getItem(CHAVE_SESSAO) ?? localStorage.getItem(CHAVE_SESSAO);
  /* Sem id guardado: ninguém está logado */
  if (!id) return null;
  /* Busca o registro do usuário na tabela */
  const usuario = buscar('usuario', id);
  /* Só vale se o usuário existe e a conta continua ativa */
  return usuario && usuario.ativo ? usuario : null;
}

/* Sai da conta e volta para a tela de entrada */
export function sair() {
  /* Apaga o id guardado */
  limparSessao();
  /* Vai para a página de login */
  ir('login');
}

/*
  Troca a senha do usuário. Confere a senha atual (hash) e grava o hash da nova.
  Devolve true se trocou, ou false se a senha atual estava errada.
*/
export async function trocarSenha(usuario, senhaAtual, senhaNova) {
  /* Se o resumo da senha atual não bate com o guardado, não troca */
  if ((await hashSenha(senhaAtual)) !== usuario.senha_hash) return false;
  /* Grava o resumo da senha nova (a senha em si nunca é guardada) */
  atualizar('usuario', usuario.id_usuario, { senha_hash: await hashSenha(senhaNova) });
  return true;
}

/* Devolve a ONG que o usuário representa (ou null se ele não for representante de ONG) */
export function ongDoUsuario(usuario) {
  /* Visitante (sem usuário) ou perfil que não é ONG: não tem ONG */
  if (!usuario || usuario.perfil !== 'ong') return null;
  /* Acha a ONG cujo id_usuario é o do usuário logado; ?? null devolve null se não achar */
  return tabela('ong').find((ong) => ong.id_usuario === usuario.id_usuario) ?? null;
}

/*
  Protege uma página. perfis é a lista de perfis que podem abrir a página.
  - Sem login: vai para a tela de entrada, guardando a página para voltar depois (parâmetro retorno).
  - Perfil errado: vai para a tela inicial do próprio perfil.
  Devolve o usuário se a página pode abrir, ou null se o navegador está sendo redirecionado.
*/
export function exigirPerfil(perfis) {
  /* Quem está logado agora (ou null) */
  const usuario = usuarioAtual();
  /* Ninguém logado: manda para o login e guarda o endereço atual para voltar depois */
  if (!usuario) {
    ir('login', { retorno: window.location.pathname + window.location.search });
    return null;
  }
  /* Logado, mas com um perfil que não pode ver esta página: manda para a página inicial dele */
  if (!perfis.includes(usuario.perfil)) {
    ir(rotaInicialDoPerfil(usuario.perfil));
    return null;
  }
  /* Pode abrir: devolve o usuário */
  return usuario;
}

/* Valida o endereço de retorno do login: só aceita caminhos do próprio site (evita redirecionar para outro site) */
export function retornoSeguro(valor) {
  /* Precisa começar com uma barra (caminho do próprio site) e não com duas (que seria outro site) */
  if (!valor || !valor.startsWith('/') || valor.startsWith('//')) return null;
  /* Só aceita endereços que apontam para uma página .html */
  return valor.includes('.html') ? valor : null;
}
