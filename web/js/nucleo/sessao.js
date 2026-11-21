/*
  sessao.js
  Para que serve: controla quem está logado. Valida o login em JavaScript (como pede o
  enunciado), guarda o usuário da sessão, e protege as páginas por perfil (doador, ong, admin).
  Quem usa: pagina.js, página de login, criar conta e perfis.
  Depende de: armazenamento.js (tabela de usuários) e caminhos.js (para redirecionar).

  Login: o campo aceita o e-mail inteiro OU só a parte antes do @ (ex.: "doador").
  A senha digitada vira um SHA-256 e é comparada com a coluna senha_hash do usuário.
*/

import { tabela, buscar, atualizar } from './armazenamento.js';
import { ir, rotaInicialDoPerfil } from './caminhos.js';

/* Chave onde guardamos o id do usuário logado */
const CHAVE_SESSAO = 'conecta.sessao';

/* Transforma um texto em SHA-256 (64 letras e números). Usa a API Web Crypto do navegador */
export async function hashSenha(texto) {
  const bytes = new TextEncoder().encode(texto);
  const resumo = await crypto.subtle.digest('SHA-256', bytes);
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
  const alvo = identificador.trim().toLowerCase();
  const usuario = tabela('usuario').find((u) => {
    const email = u.email.toLowerCase();
    return email === alvo || email.split('@')[0] === alvo;
  });
  if (!usuario) return { ok: false, motivo: 'credenciais' };

  const hash = await hashSenha(senha);
  if (hash !== usuario.senha_hash) return { ok: false, motivo: 'credenciais' };
  if (!usuario.ativo) return { ok: false, motivo: 'bloqueado' };

  limparSessao();
  (lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, String(usuario.id_usuario));
  return { ok: true, usuario };
}

/* Devolve o usuário logado (registro da tabela usuario) ou null se ninguém entrou */
export function usuarioAtual() {
  const id = sessionStorage.getItem(CHAVE_SESSAO) ?? localStorage.getItem(CHAVE_SESSAO);
  if (!id) return null;
  const usuario = buscar('usuario', id);
  return usuario && usuario.ativo ? usuario : null;
}

/* Sai da conta e volta para a tela de entrada */
export function sair() {
  limparSessao();
  ir('login');
}

/*
  Troca a senha do usuário. Confere a senha atual (hash) e grava o hash da nova.
  Devolve true se trocou, ou false se a senha atual estava errada.
*/
export async function trocarSenha(usuario, senhaAtual, senhaNova) {
  if ((await hashSenha(senhaAtual)) !== usuario.senha_hash) return false;
  atualizar('usuario', usuario.id_usuario, { senha_hash: await hashSenha(senhaNova) });
  return true;
}

/* Devolve a ONG que o usuário representa (ou null se ele não for representante de ONG) */
export function ongDoUsuario(usuario) {
  if (!usuario || usuario.perfil !== 'ong') return null;
  return tabela('ong').find((ong) => ong.id_usuario === usuario.id_usuario) ?? null;
}

/*
  Protege uma página. perfis é a lista de perfis que podem abrir a página.
  - Sem login: vai para a tela de entrada, guardando a página para voltar depois (parâmetro retorno).
  - Perfil errado: vai para a tela inicial do próprio perfil.
  Devolve o usuário se a página pode abrir, ou null se o navegador está sendo redirecionado.
*/
export function exigirPerfil(perfis) {
  const usuario = usuarioAtual();
  if (!usuario) {
    ir('login', { retorno: window.location.pathname + window.location.search });
    return null;
  }
  if (!perfis.includes(usuario.perfil)) {
    ir(rotaInicialDoPerfil(usuario.perfil));
    return null;
  }
  return usuario;
}

/* Valida o endereço de retorno do login: só aceita caminhos do próprio site (evita redirecionar para outro site) */
export function retornoSeguro(valor) {
  if (!valor || !valor.startsWith('/') || valor.startsWith('//')) return null;
  return valor.includes('.html') ? valor : null;
}
