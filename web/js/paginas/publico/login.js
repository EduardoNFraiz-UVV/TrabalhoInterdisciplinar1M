/*
  login.js
  Página: paginas/publico/login.html (tela 01 do Figma).
  Para que serve: valida usuário e senha em JavaScript, mostra o erro do guia de estilo e leva
  cada perfil para a sua tela inicial. Também envia para "Criar conta" com o tipo escolhido.
  Depende de: pagina.js, sessao.js, caminhos.js, formulario.js, alertas.js e icones.js.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { entrar, retornoSeguro } from '../../nucleo/sessao.js';
import { ir, parametro, rotaInicialDoPerfil } from '../../nucleo/caminhos.js';
import { lerFormulario, mostrarErros, limparErros } from '../../componentes/formulario.js';
import { mostrarAlerta, limparAlerta } from '../../componentes/alertas.js';
import { icone } from '../../componentes/icones.js';

/* Monta cabeçalho e rodapé. A página é pública, então não pede login */
const contexto = iniciarPagina({ perfis: null });

/* Quem já está logado não precisa ver o login: vai direto para a tela inicial do perfil */
if (contexto?.usuario) {
  ir(rotaInicialDoPerfil(contexto.usuario.perfil));
}

/* Coloca o ícone de coração no quadrado da marca */
document.getElementById('logo-login').append(icone('heart', 28));

const formulario = document.getElementById('formulario-login');
const areaAlerta = document.getElementById('area-alerta');

/* Quando o formulário é enviado (clique em Entrar ou tecla Enter) */
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();                  /* impede o navegador de recarregar a página */
  limparErros(formulario);
  limparAlerta(areaAlerta);

  const dados = lerFormulario(formulario);

  /* Campos vazios: mostra o erro de preenchimento */
  const erros = {};
  if (!dados.identificador.trim()) erros.identificador = 'Informe seu e-mail ou usuário.';
  if (!dados.senha) erros.senha = 'Informe sua senha.';
  if (mostrarErros(formulario, erros)) return;

  let resultado;
  try {
    resultado = await entrar(dados.identificador, dados.senha, dados.lembrar === 'on');
  } catch (erro) {
    /* A API de criptografia só existe em endereços seguros (https ou localhost) */
    mostrarAlerta(areaAlerta, 'erro', 'Não foi possível validar a senha.', 'Abra o site pelo endereço publicado (https) ou por um servidor local.');
    return;
  }

  if (!resultado.ok) {
    if (resultado.motivo === 'bloqueado') {
      mostrarAlerta(areaAlerta, 'erro', 'Esta conta está bloqueada.', 'Fale com a administração da plataforma para entender o motivo.');
    } else {
      /* Estado de erro do guia: borda vermelha no campo, ícone alert e mensagem que diz como resolver */
      mostrarErros(formulario, { senha: 'E-mail ou senha incorretos. Tente novamente.' });
      mostrarAlerta(areaAlerta, 'erro', 'E-mail ou senha incorretos.', "Confira os dados ou use 'Esqueci minha senha'.");
    }
    return;
  }

  /* Deu certo: volta para a página que o usuário queria abrir (se houver) ou vai para a tela inicial do perfil */
  const retorno = retornoSeguro(parametro('retorno'));
  if (retorno) {
    window.location.href = retorno;
  } else {
    ir(rotaInicialDoPerfil(resultado.usuario.perfil));
  }
});

/* "Criar conta": leva para a página de cadastro já com o tipo escolhido (doador ou ong) */
document.getElementById('formulario-conta').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const tipo = new FormData(evento.target).get('tipo');
  ir('criarConta', { tipo });
});
