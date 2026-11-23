export const raiz = document.body.dataset.raiz ?? './';

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

export function url(nome, parametros = null) {
  const base = raiz + ROTAS[nome];
  if (!parametros) return base;
  const consulta = new URLSearchParams(parametros).toString();
  return consulta ? `${base}?${consulta}` : base;
}

export function caminhoAbsoluto(nome, parametros = null) {
  const endereco = new URL(url(nome, parametros), window.location.href);
  return endereco.pathname + endereco.search;
}

export function ir(nome, parametros = null) {
  window.location.href = url(nome, parametros);
}

export function parametro(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

export function rotaInicialDoPerfil(perfil) {
  if (perfil === 'ong') return 'painelOng';
  if (perfil === 'admin') return 'painelAdmin';
  return 'inicio';
}
