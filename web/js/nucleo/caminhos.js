/*
  caminhos.js
  Para que serve: guarda o endereço (caminho) de TODAS as páginas do site e monta os links
  entre elas. Como as páginas ficam em pastas diferentes, cada <body> informa onde fica a
  raiz do site no atributo data-raiz (ex.: data-raiz="../../"), e este arquivo usa isso.
  Quem usa: cabeçalho, sessão e todas as páginas que criam links ou redirecionam.
  Depende de: nada.
*/

/* Raiz do site, lida do <body data-raiz="...">. Na página index.html é './' */
export const raiz = document.body.dataset.raiz ?? './';

/* Tabela com o nome de cada rota e o caminho do arquivo a partir da raiz do site */
export const ROTAS = {
  apresentacao: 'index.html',
  login: 'paginas/publico/login.html',
  criarConta: 'paginas/publico/criar-conta.html',
  esqueciSenha: 'paginas/publico/esqueci-senha.html',
  ajuda: 'paginas/publico/ajuda.html',
  ongs: 'paginas/publico/ongs.html',
  ong: 'paginas/publico/ong.html',
  campanha: 'paginas/publico/campanha.html',
  campanhasAtivas: 'paginas/publico/campanhas-ativas.html',

  inicio: 'paginas/doador/inicio.html',
  minhasDoacoes: 'paginas/doador/minhas-doacoes.html',
  doar: 'paginas/doador/doar.html',
  doarCampanha: 'paginas/doador/doar-campanha.html',
  perfilDoador: 'paginas/doador/perfil.html',

  painelOng: 'paginas/ong/painel.html',
  necessidades: 'paginas/ong/necessidades.html',
  necessidadeForm: 'paginas/ong/necessidade-form.html',
  doacoesRecebidas: 'paginas/ong/doacoes-recebidas.html',
  campanhaFormOng: 'paginas/ong/campanha-form.html',
  perfilOng: 'paginas/ong/perfil.html',

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
  const base = raiz + ROTAS[nome];
  if (!parametros) return base;
  const consulta = new URLSearchParams(parametros).toString();
  return consulta ? `${base}?${consulta}` : base;
}

/* Caminho completo a partir da raiz do servidor (ex.: /web/paginas/doador/doar.html?ong=1).
   Usado no parâmetro "retorno" do login, para voltar à página que a pessoa queria abrir */
export function caminhoAbsoluto(nome, parametros = null) {
  const endereco = new URL(url(nome, parametros), window.location.href);
  return endereco.pathname + endereco.search;
}

/* Leva o navegador para outra página do site */
export function ir(nome, parametros = null) {
  window.location.href = url(nome, parametros);
}

/* Lê um parâmetro do endereço atual. Exemplo: em ?id=3, parametro('id') devolve '3' */
export function parametro(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

/* Qual é a tela inicial de cada tipo de usuário */
export function rotaInicialDoPerfil(perfil) {
  if (perfil === 'ong') return 'painelOng';
  if (perfil === 'admin') return 'painelAdmin';
  return 'inicio';
}
