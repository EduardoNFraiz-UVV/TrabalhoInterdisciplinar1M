import { iniciarPagina } from '../../nucleo/pagina.js';
import { entrar, retornoSeguro } from '../../nucleo/sessao.js';
import { ir, parametro, rotaInicialDoPerfil } from '../../nucleo/caminhos.js';
import { lerFormulario, mostrarErros, limparErros } from '../../componentes/formulario.js';
import { mostrarAlerta, limparAlerta } from '../../componentes/alertas.js';
import { icone } from '../../componentes/icones.js';

const contexto = iniciarPagina({ perfis: null });

if (contexto?.usuario) {
  ir(rotaInicialDoPerfil(contexto.usuario.perfil));
}

document.getElementById('logo-login').append(icone('heart', 28));

const formulario = document.getElementById('formulario-login');
const areaAlerta = document.getElementById('area-alerta');

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErros(formulario);
  limparAlerta(areaAlerta);

  const dados = lerFormulario(formulario);

  const erros = {};
  if (!dados.identificador.trim()) erros.identificador = 'Informe seu e-mail ou usuário.';
  if (!dados.senha) erros.senha = 'Informe sua senha.';
  if (mostrarErros(formulario, erros)) return;

  let resultado;
  try {
    resultado = await entrar(dados.identificador, dados.senha, dados.lembrar === 'on');
  } catch (erro) {
    mostrarAlerta(areaAlerta, 'erro', 'Não foi possível validar a senha.', 'Abra o site pelo endereço publicado (https) ou por um servidor local.');
    return;
  }

  if (!resultado.ok) {
    if (resultado.motivo === 'bloqueado') {
      mostrarAlerta(areaAlerta, 'erro', 'Esta conta está bloqueada.', 'Fale com a administração da plataforma para entender o motivo.');
    } else {
      mostrarErros(formulario, { senha: 'E-mail ou senha incorretos. Tente novamente.' });
      mostrarAlerta(areaAlerta, 'erro', 'E-mail ou senha incorretos.', "Confira os dados ou use 'Esqueci minha senha'.");
    }
    return;
  }

  const retorno = retornoSeguro(parametro('retorno'));
  if (retorno) {
    window.location.href = retorno;
  } else {
    ir(rotaInicialDoPerfil(resultado.usuario.perfil));
  }
});

document.getElementById('formulario-conta').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const tipo = new FormData(evento.target).get('tipo');
  ir('criarConta', { tipo });
});
