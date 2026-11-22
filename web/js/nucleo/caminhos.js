/*
  caminhos.js
  Para que serve: guarda o endereço (caminho) de TODAS as páginas do site e monta os links
  entre elas. Como as páginas ficam em pastas diferentes, cada <body> informa onde fica a
  raiz do site no atributo data-raiz (ex.: data-raiz="../../"), e este arquivo usa isso.
  Quem usa: cabeçalho, sessão e todas as páginas que criam links ou redirecionam.
  Depende de: nada.
*/

/* Raiz do site, lida do <body data-raiz="...">. Na página index.html é './' */
/* document.body.dataset.raiz lê o atributo data-raiz; o ?? './' é o valor usado se ele não existir */
export const raiz = document.body.dataset.raiz ?? './';

/* Tabela com o nome de cada rota e o caminho do arquivo a partir da raiz do site */
export const ROTAS = {
  /* Páginas públicas (qualquer pessoa abre) */
  apresentacao: 'index.html',
  login: 'paginas/publico/login.html',
  criarConta: 'paginas/publico/criar-conta.html',
  esqueciSenha: 'paginas/publico/esqueci-senha.html',
  ajuda: 'paginas/publico/ajuda.html',
  ongs: 'paginas/publico/ongs.html',
  ong: 'paginas/publico/ong.html',
  campanha: 'paginas/publico/campanha.html',
  campanhasAtivas: 'paginas/publico/campanhas-ativas.html',

  /* Páginas do doador */
  inicio: 'paginas/doador/inicio.html',
  minhasDoacoes: 'paginas/doador/minhas-doacoes.html',
  doar: 'paginas/doador/doar.html',
  doarCampanha: 'paginas/doador/doar-campanha.html',
  perfilDoador: 'paginas/doador/perfil.html',

  /* Páginas da ONG */
  painelOng: 'paginas/ong/painel.html',
  necessidades: 'paginas/ong/necessidades.html',
  necessidadeForm: 'paginas/ong/necessidade-form.html',
  doacoesRecebidas: 'paginas/ong/doacoes-recebidas.html',
  campanhaFormOng: 'paginas/ong/campanha-form.html',
  perfilOng: 'paginas/ong/perfil.html',

  /* Páginas do administrador */
  painelAdmin: 'paginas/admin/painel.html',
  aprovacoes: 'paginas/admin/aprovacoes.html',
  campanhasAdmin: 'paginas/admin/campanhas.html',
  usuarios: 'paginas/admin/usuarios.html',
  campanhaFormAdmin: 'paginas/admin/campanha-form.html',
  doacoesCampanhas: 'paginas/admin/doacoes-campanhas.html'
};

/*
  Monta o endereço de uma rota. Exemplo: url('ong', { id: 3 }) devolve
  '../../paginas/publico/ong.html?id=3' (o começo depende de onde a página atual está).
  parametros: objeto opcional que vira a parte "?chave=valor" do endereço.
*/
export function url(nome, parametros = null) {
  /* Raiz do site + caminho da rota */
  const base = raiz + ROTAS[nome];
  /* Sem parâmetros: o endereço é só a base */
  if (!parametros) return base;
  /* URLSearchParams transforma { id: 3 } no texto "id=3" (já cuidando de espaços e acentos) */
  const consulta = new URLSearchParams(parametros).toString();
  /* Se sobrou algum parâmetro, junta com "?"; senão devolve só a base */
  return consulta ? `${base}?${consulta}` : base;
}

/* Caminho completo a partir da raiz do servidor (ex.: /web/paginas/doador/doar.html?ong=1).
   Usado no parâmetro "retorno" do login, para voltar à página que a pessoa queria abrir */
export function caminhoAbsoluto(nome, parametros = null) {
  /* new URL resolve o endereço relativo a partir do endereço da página atual */
  const endereco = new URL(url(nome, parametros), window.location.href);
  /* Devolve só a parte do caminho e dos parâmetros (sem "http://servidor") */
  return endereco.pathname + endereco.search;
}

/* Leva o navegador para outra página do site */
export function ir(nome, parametros = null) {
  /* Mudar window.location.href faz o navegador abrir o endereço */
  window.location.href = url(nome, parametros);
}

/* Lê um parâmetro do endereço atual. Exemplo: em ?id=3, parametro('id') devolve '3' */
export function parametro(nome) {
  /* window.location.search é a parte "?id=3" do endereço; .get pega o valor da chave pedida */
  return new URLSearchParams(window.location.search).get(nome);
}

/* Qual é a tela inicial de cada tipo de usuário */
export function rotaInicialDoPerfil(perfil) {
  /* ONG e administrador têm painéis próprios */
  if (perfil === 'ong') return 'painelOng';
  if (perfil === 'admin') return 'painelAdmin';
  /* Qualquer outro perfil (doador) começa em "inicio" */
  return 'inicio';
}
