import { tabela, buscar, atualizar } from './armazenamento.js';
import { ir, rotaInicialDoPerfil } from './caminhos.js';

const CHAVE_SESSAO = 'conecta.sessao';

export async function hashSenha(texto) {
  const bytes = new TextEncoder().encode(texto);
  const resumo = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(resumo))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function limparSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  localStorage.removeItem(CHAVE_SESSAO);
}

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

export function usuarioAtual() {
  const id = sessionStorage.getItem(CHAVE_SESSAO) ?? localStorage.getItem(CHAVE_SESSAO);
  if (!id) return null;
  const usuario = buscar('usuario', id);
  return usuario && usuario.ativo ? usuario : null;
}

export function sair() {
  limparSessao();
  ir('login');
}

export async function trocarSenha(usuario, senhaAtual, senhaNova) {
  if ((await hashSenha(senhaAtual)) !== usuario.senha_hash) return false;
  atualizar('usuario', usuario.id_usuario, { senha_hash: await hashSenha(senhaNova) });
  return true;
}

export function ongDoUsuario(usuario) {
  if (!usuario || usuario.perfil !== 'ong') return null;
  return tabela('ong').find((ong) => ong.id_usuario === usuario.id_usuario) ?? null;
}

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

export function retornoSeguro(valor) {
  if (!valor || !valor.startsWith('/') || valor.startsWith('//')) return null;
  return valor.includes('.html') ? valor : null;
}
