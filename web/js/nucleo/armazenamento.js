import { gerarDadosIniciais, VERSAO_DADOS } from './dados-iniciais.js';

const CHAVE_DADOS = 'conecta.dados';
const CHAVE_VERSAO = 'conecta.versao';

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

let dados = null;

export function salvar() {
  try {
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
    localStorage.setItem(CHAVE_VERSAO, String(VERSAO_DADOS));
  } catch (erro) {
    console.warn('Não foi possível salvar os dados no navegador.', erro);
  }
}

export function restaurar() {
  dados = gerarDadosIniciais();
  salvar();
  return dados;
}

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

export function tabela(nome) {
  return carregar()[nome];
}

export function buscar(nome, id) {
  const chave = CHAVES_PRIMARIAS[nome];
  return tabela(nome).find((registro) => registro[chave] === Number(id));
}

function proximoId(nome) {
  const chave = CHAVES_PRIMARIAS[nome];
  let maior = 0;
  for (const registro of tabela(nome)) {
    maior = Math.max(maior, registro[chave]);
  }
  return maior + 1;
}

export function inserir(nome, registro) {
  const chave = CHAVES_PRIMARIAS[nome];
  if (chave) registro[chave] = proximoId(nome);
  tabela(nome).push(registro);
  salvar();
  return registro;
}

export function atualizar(nome, id, campos) {
  const registro = buscar(nome, id);
  if (registro) {
    Object.assign(registro, campos);
    salvar();
  }
  return registro;
}

export function remover(nome, id) {
  const chave = CHAVES_PRIMARIAS[nome];
  const lista = tabela(nome);
  const posicao = lista.findIndex((registro) => registro[chave] === Number(id));
  if (posicao >= 0) {
    lista.splice(posicao, 1);
    salvar();
  }
}

export function removerOnde(nome, teste) {
  const lista = tabela(nome);
  for (let i = lista.length - 1; i >= 0; i--) {
    if (teste(lista[i])) lista.splice(i, 1);
  }
  salvar();
}
