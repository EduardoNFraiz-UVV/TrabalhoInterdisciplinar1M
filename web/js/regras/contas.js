import { tabela, buscar, inserir, atualizar, removerOnde } from '../nucleo/armazenamento.js';
import { hashSenha } from '../nucleo/sessao.js';
import { hojeISO } from '../utilitarios/formatacao.js';

export function emailJaExiste(email) {
  return tabela('usuario').some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function cnpjJaExiste(cnpj) {
  return tabela('ong').some((o) => o.cnpj === cnpj.trim());
}

export async function criarContaDoador({ nome, email, senha, telefone, idCidade }) {
  return inserir('usuario', {
    nome: nome.trim(),
    email: email.trim(),
    senha_hash: await hashSenha(senha),
    telefone: telefone.trim() || null,
    perfil: 'doador',
    id_cidade: Number(idCidade),
    data_cadastro: hojeISO(),
    ativo: true
  });
}

export async function criarContaOng(dados) {
  const usuario = await criarContaDoador({ nome: dados.nome, email: dados.email, senha: dados.senha, telefone: dados.telefone, idCidade: dados.idCidade });
  atualizar('usuario', usuario.id_usuario, { perfil: 'ong' });
  inserir('ong', {
    id_usuario: usuario.id_usuario,
    id_cidade: Number(dados.idCidade),
    nome: dados.nomeOng.trim(),
    cnpj: dados.cnpj.trim(),
    descricao: dados.descricao.trim(),
    endereco: dados.endereco.trim(),
    horario_atendimento: dados.horario.trim() || null,
    telefone: dados.telefoneOng.trim() || null,
    email_contato: dados.emailOng.trim() || null,
    aceita_retirada: Boolean(dados.aceitaRetirada),
    verificada: false,
    data_cadastro: hojeISO()
  });
  return usuario;
}

export function aprovarOng(idOng) {
  atualizar('ong', idOng, { verificada: true });
}

export function recusarOng(idOng) {
  const ong = buscar('ong', idOng);
  if (!ong) return;
  removerOnde('ong', (o) => o.id_ong === idOng);
  removerOnde('usuario', (u) => u.id_usuario === ong.id_usuario);
}

export function definirBloqueio(idUsuario, bloqueado) {
  atualizar('usuario', idUsuario, { ativo: !bloqueado });
}
