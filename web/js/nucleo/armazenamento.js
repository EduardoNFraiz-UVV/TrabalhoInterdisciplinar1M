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

  Vocabulário usado nos comentários:
    tabela    = uma lista (array) de registros, como uma tabela do banco de dados;
    registro  = um objeto com os campos de uma linha da tabela (ex.: { id_ong: 3, nome: '...' }).
*/

/* Traz de outro arquivo a função que cria os dados de exemplo e o número da versão desses dados */
import { gerarDadosIniciais, VERSAO_DADOS } from './dados-iniciais.js';

/* Nomes das chaves usadas no localStorage (cada chave guarda um texto) */
const CHAVE_DADOS = 'conecta.dados';     /* o texto com TODAS as tabelas */
const CHAVE_VERSAO = 'conecta.versao';   /* a versão dos dados salvos */

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
let dados = null;   /* null = ainda não carregamos */

/* Grava as tabelas no localStorage. Se o navegador bloquear (modo privado), só avisa no console */
export function salvar() {
  try {
    /* JSON.stringify transforma o objeto em texto, porque o localStorage só guarda texto */
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
    /* Guarda também a versão dos dados (como texto) */
    localStorage.setItem(CHAVE_VERSAO, String(VERSAO_DADOS));
  } catch (erro) {
    /* Se der erro, não quebramos o site: só deixamos um aviso no console do navegador */
    console.warn('Não foi possível salvar os dados no navegador.', erro);
  }
}

/* Volta tudo para os dados de exemplo e salva. Usada pelo botão "Restaurar dados de exemplo" */
export function restaurar() {
  /* Cria as tabelas de exemplo do zero */
  dados = gerarDadosIniciais();
  /* Grava no localStorage */
  salvar();
  /* Devolve as tabelas para quem pediu */
  return dados;
}

/* Carrega as tabelas: do localStorage, se houver e a versão for a atual; senão, dos dados de exemplo */
function carregar() {
  /* Se já carregamos antes, devolve a cópia que está na memória */
  if (dados) return dados;
  try {
    /* Lê o texto salvo e a versão salva */
    const texto = localStorage.getItem(CHAVE_DADOS);
    const versao = Number(localStorage.getItem(CHAVE_VERSAO));
    /* Só usa o que está salvo se existir texto e a versão for a atual */
    if (texto && versao === VERSAO_DADOS) {
      /* JSON.parse faz o caminho inverso: transforma o texto de volta em objeto */
      dados = JSON.parse(texto);
      return dados;
    }
  } catch (erro) {
    /* Texto estragado ou localStorage bloqueado: avisa e cai nos dados de exemplo */
    console.warn('Não foi possível ler os dados salvos. Usando os dados de exemplo.', erro);
  }
  /* Chegou aqui: não há dados válidos salvos, então começa com os dados de exemplo */
  return restaurar();
}

/* Devolve a lista (array) de registros de uma tabela. Exemplo: tabela('ong') */
export function tabela(nome) {
  /* carregar() devolve todas as tabelas; [nome] escolhe a que foi pedida */
  return carregar()[nome];
}

/* Procura um registro pelo id da chave primária. Exemplo: buscar('ong', 3). Devolve undefined se não achar */
export function buscar(nome, id) {
  /* Descobre qual é a coluna do id nessa tabela (ex.: 'id_ong') */
  const chave = CHAVES_PRIMARIAS[nome];
  /* find devolve o primeiro registro cujo id é igual; Number(id) aceita o id vindo como texto da URL */
  return tabela(nome).find((registro) => registro[chave] === Number(id));
}

/* Calcula o próximo id livre de uma tabela (maior id atual + 1), como um SERIAL do PostgreSQL */
function proximoId(nome) {
  /* Coluna do id desta tabela */
  const chave = CHAVES_PRIMARIAS[nome];
  /* Começa em 0 e vai guardando o maior id encontrado */
  let maior = 0;
  /* Percorre todos os registros da tabela, um de cada vez */
  for (const registro of tabela(nome)) {
    /* Math.max fica com o maior entre o que já tínhamos e o id deste registro */
    maior = Math.max(maior, registro[chave]);
  }
  /* O próximo id é o maior mais um */
  return maior + 1;
}

/* Insere um registro novo. Se a tabela tem chave primária simples, o id é gerado aqui. Devolve o registro */
export function inserir(nome, registro) {
  /* Coluna do id desta tabela (fica vazia nas tabelas de ligação) */
  const chave = CHAVES_PRIMARIAS[nome];
  /* Se a tabela tem chave primária, coloca nela o próximo id livre */
  if (chave) registro[chave] = proximoId(nome);
  /* push acrescenta o registro no fim da lista */
  tabela(nome).push(registro);
  /* Grava a mudança no localStorage */
  salvar();
  /* Devolve o registro já com o id */
  return registro;
}

/* Atualiza campos de um registro existente. Exemplo: atualizar('doacao', 5, { status: 'aceita' }) */
export function atualizar(nome, id, campos) {
  /* Procura o registro que será alterado */
  const registro = buscar(nome, id);
  /* Só altera se ele existir */
  if (registro) {
    /* Object.assign copia os campos novos para dentro do registro, trocando os valores antigos */
    Object.assign(registro, campos);
    /* Grava a mudança */
    salvar();
  }
  /* Devolve o registro (ou undefined, se não existia) */
  return registro;
}

/* Remove o registro de id informado */
export function remover(nome, id) {
  /* Coluna do id e lista de registros da tabela */
  const chave = CHAVES_PRIMARIAS[nome];
  const lista = tabela(nome);
  /* findIndex devolve a posição do registro na lista (ou -1 se não achar) */
  const posicao = lista.findIndex((registro) => registro[chave] === Number(id));
  /* Só remove se achou (posição 0 ou maior) */
  if (posicao >= 0) {
    /* splice(posição, 1) tira 1 item a partir dessa posição */
    lista.splice(posicao, 1);
    /* Grava a mudança */
    salvar();
  }
}

/* Remove todos os registros que combinam com a função de teste (usada nas tabelas de ligação) */
export function removerOnde(nome, teste) {
  /* Lista de registros da tabela */
  const lista = tabela(nome);
  /* Percorre de trás para frente: assim, remover um item não muda a posição dos que ainda faltam ver */
  for (let i = lista.length - 1; i >= 0; i--) {
    /* Se a função de teste diz "sim" para este registro, ele sai da lista */
    if (teste(lista[i])) lista.splice(i, 1);
  }
  /* Grava a mudança */
  salvar();
}
