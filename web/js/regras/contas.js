/*
  contas.js
  Para que serve: regras de contas de usuário e de ONGs: criar conta de doador e de ONG (RN-01, RN-05 a
  RN-08), aprovar ou recusar ONG (RN-08), bloquear e desbloquear usuários (RN-04).
  Quem usa: criar conta, aprovações e usuários.
  Depende de: armazenamento.js, sessao.js (hash da senha) e formatacao.js.
*/

/* Funções de outros arquivos que usamos aqui */
import { tabela, buscar, inserir, atualizar, removerOnde } from '../nucleo/armazenamento.js';
import { hashSenha } from '../nucleo/sessao.js';
import { hojeISO } from '../utilitarios/formatacao.js';

/* RN-05: o e-mail é único. Compara sem diferenciar maiúsculas de minúsculas */
export function emailJaExiste(email) {
  /* some devolve true se ALGUM usuário tiver o mesmo e-mail */
  return tabela('usuario').some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

/* RN-05: o CNPJ da ONG também é único */
export function cnpjJaExiste(cnpj) {
  return tabela('ong').some((o) => o.cnpj === cnpj.trim());
}

/* Cria a conta de um doador (perfil "doador") e devolve o usuário criado */
export async function criarContaDoador({ nome, email, senha, telefone, idCidade }) {
  /* inserir grava o novo registro na tabela e devolve ele (com o id gerado) */
  return inserir('usuario', {
    nome: nome.trim(),
    email: email.trim(),
    senha_hash: await hashSenha(senha),       /* guardamos só o resumo SHA-256, nunca a senha */
    telefone: telefone.trim() || null,        /* telefone vazio vira null (sem valor) */
    perfil: 'doador',
    id_cidade: Number(idCidade),              /* o select entrega texto; o banco guarda número */
    data_cadastro: hojeISO(),
    ativo: true
  });
}

/*
  Cria a conta de um representante de ONG (perfil "ong") e o registro da ONG, que nasce NÃO VERIFICADA (RN-08).
  Enquanto o administrador não aprova, a ONG não cadastra necessidades nem solicita campanhas (RN-09).
  dados: campos do representante (nome, email, senha, telefone, idCidade) e da ONG (nomeOng, cnpj, descricao,
  endereco, horario, telefoneOng, emailOng, aceitaRetirada).
*/
export async function criarContaOng(dados) {
  /* Primeiro cria a conta de usuário (do mesmo jeito que a do doador) */
  const usuario = await criarContaDoador({ nome: dados.nome, email: dados.email, senha: dados.senha, telefone: dados.telefone, idCidade: dados.idCidade });
  /* Troca o perfil dele de "doador" para "ong" */
  atualizar('usuario', usuario.id_usuario, { perfil: 'ong' });
  /* Cria o registro da ONG, ligado ao usuário pelo id_usuario */
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
    verificada: false,                        /* nasce não verificada até o administrador aprovar */
    data_cadastro: hojeISO()
  });
  /* Devolve o usuário criado */
  return usuario;
}

/* RN-08: o administrador aprova a ONG, que recebe o selo "ONG verificada" */
export function aprovarOng(idOng) {
  atualizar('ong', idOng, { verificada: true });
}

/* Recusar o cadastro: remove a ONG e o usuário que a representa (ela ainda não tem necessidades nem doações) */
export function recusarOng(idOng) {
  /* Acha a ONG (precisamos dela para saber qual é o usuário) */
  const ong = buscar('ong', idOng);
  if (!ong) return;
  /* Apaga a ONG e depois o usuário que a representava */
  removerOnde('ong', (o) => o.id_ong === idOng);
  removerOnde('usuario', (u) => u.id_usuario === ong.id_usuario);
}

/* RN-04: bloqueia ou desbloqueia um usuário. Usuário bloqueado (ativo = false) não entra no site */
export function definirBloqueio(idUsuario, bloqueado) {
  /* "ativo" é o contrário de "bloqueado" */
  atualizar('usuario', idUsuario, { ativo: !bloqueado });
}
