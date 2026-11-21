/*
  armazenamento.js
  Para que serve: é o "banco de dados" do site. Guarda as tabelas dentro do navegador, no
  localStorage (um espaço de texto que fica salvo mesmo depois de fechar a página), e oferece
  funções para ler, inserir, atualizar e remover registros.
  Quem usa: sessão, regras e todas as páginas.
  Depende de: dados-iniciais.js (conteúdo de exemplo).

  Como funciona: o objeto com todas as tabelas é convertido em texto (JSON) e salvo em UMA chave
  do localStorage. Ao abrir qualquer página, lemos esse texto e o transformamos de novo em objeto.
  Se ainda não existir nada salvo, usamos os dados de exemplo.
*/

import { gerarDadosIniciais, VERSAO_DADOS } from './dados-iniciais.js';

/* Nomes das chaves usadas no localStorage */
const CHAVE_DADOS = 'conecta.dados';
const CHAVE_VERSAO = 'conecta.versao';

/* Nome da coluna que é a chave primária (identificador) de cada tabela.
   As tabelas de ligação (campanha_cidade e campanha_necessidade) têm chave composta e ficam de fora. */
const CHAVES_PRIMARIAS = {
  cidade: 'id_cidade',
  categoria: 'id_categoria',
  usuario: 'id_usuario',
  ong: 'id_ong',
  campanha: 'id_campanha',
  campanha_meta: 'id_meta',
  necessidade: 'id_necessidade',
  doacao: 'id_doacao'
};

/* Cópia dos dados na memória desta página, para não ler o localStorage a cada consulta */
let dados = null;

/* Grava as tabelas no localStorage. Se o navegador bloquear (modo privado), só avisa no console */
export function salvar() {
  try {
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
    localStorage.setItem(CHAVE_VERSAO, String(VERSAO_DADOS));
  } catch (erro) {
    console.warn('Não foi possível salvar os dados no navegador.', erro);
  }
}

/* Volta tudo para os dados de exemplo e salva. Usada pelo botão "Restaurar dados de exemplo" */
export function restaurar() {
  dados = gerarDadosIniciais();
  salvar();
  return dados;
}

/* Carrega as tabelas: do localStorage, se houver e a versão for a atual; senão, dos dados de exemplo */
function carregar() {
  if (dados) return dados;
  try {
    const texto = localStorage.getItem(CHAVE_DADOS);
    const versao = Number(localStorage.getItem(CHAVE_VERSAO));
    if (texto && versao === VERSAO_DADOS) {
      dados = JSON.parse(texto);
      return dados;
    }
  } catch (erro) {
    console.warn('Não foi possível ler os dados salvos. Usando os dados de exemplo.', erro);
  }
  return restaurar();
}

/* Devolve a lista (array) de registros de uma tabela. Exemplo: tabela('ong') */
export function tabela(nome) {
  return carregar()[nome];
}

/* Procura um registro pelo id da chave primária. Exemplo: buscar('ong', 3). Devolve undefined se não achar */
export function buscar(nome, id) {
  const chave = CHAVES_PRIMARIAS[nome];
  return tabela(nome).find((registro) => registro[chave] === Number(id));
}

/* Calcula o próximo id livre de uma tabela (maior id atual + 1), como um SERIAL do PostgreSQL */
function proximoId(nome) {
  const chave = CHAVES_PRIMARIAS[nome];
  return tabela(nome).reduce((maior, registro) => Math.max(maior, registro[chave]), 0) + 1;
}

/* Insere um registro novo. Se a tabela tem chave primária simples, o id é gerado aqui. Devolve o registro */
export function inserir(nome, registro) {
  const chave = CHAVES_PRIMARIAS[nome];
  if (chave) registro[chave] = proximoId(nome);
  tabela(nome).push(registro);
  salvar();
  return registro;
}

/* Atualiza campos de um registro existente. Exemplo: atualizar('doacao', 5, { status: 'aceita' }) */
export function atualizar(nome, id, campos) {
  const registro = buscar(nome, id);
  if (registro) {
    Object.assign(registro, campos);
    salvar();
  }
  return registro;
}

/* Remove o registro de id informado */
export function remover(nome, id) {
  const chave = CHAVES_PRIMARIAS[nome];
  const lista = tabela(nome);
  const posicao = lista.findIndex((registro) => registro[chave] === Number(id));
  if (posicao >= 0) {
    lista.splice(posicao, 1);
    salvar();
  }
}

/* Remove todos os registros que combinam com a função de teste (usada nas tabelas de ligação) */
export function removerOnde(nome, teste) {
  const lista = tabela(nome);
  for (let i = lista.length - 1; i >= 0; i--) {
    if (teste(lista[i])) lista.splice(i, 1);
  }
  salvar();
}
