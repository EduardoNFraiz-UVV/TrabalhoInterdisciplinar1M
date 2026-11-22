/*
  esqueci-senha.js
  Página: paginas/publico/esqueci-senha.html (tela extra).
  Para que serve: valida o e-mail digitado e mostra um aviso informativo. Nenhum e-mail é enviado de
  verdade (o site é uma demonstração) e a resposta é igual para e-mails cadastrados ou não.
  Depende de: pagina.js, componentes de formulário e alertas.
*/

/* Funções de outros arquivos que usamos aqui */
import { iniciarPagina } from '../../nucleo/pagina.js';
import { $ } from '../../utilitarios/dom.js';
import { lerFormulario, mostrarErros, limparErros } from '../../componentes/formulario.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { emailValido } from '../../regras/validacoes.js';

/* Liga o formulário da página */
function montar() {
  /* Acha o formulário pelo id */
  const formulario = $('#formulario-recuperar');
  /* Quando o formulário for enviado */
  formulario.addEventListener('submit', (evento) => {
    /* Impede o navegador de recarregar a página */
    evento.preventDefault();
    /* Apaga erros anteriores */
    limparErros(formulario);
    /* Lê o campo email do formulário ({ email } separa o campo do objeto) */
    const { email } = lerFormulario(formulario);
    /* E-mail com formato inválido: mostra o erro e para */
    if (!emailValido(email)) {
      mostrarErros(formulario, { email: 'Digite um e-mail válido, como nome@exemplo.com.' });
      return;
    }
    /* E-mail válido: mostra um aviso (a resposta é a mesma exista ou não a conta) */
    mostrarAlerta($('#area-alerta'), 'info', 'Pedido recebido.',
      'Se o e-mail estiver cadastrado, enviaríamos as instruções para redefinir a senha. Neste site de demonstração nenhum e-mail é enviado de verdade.');
    /* Limpa o campo */
    formulario.reset();
  });
}

/* Só monta a página se iniciarPagina não estiver redirecionando (a página é pública, então sempre monta) */
if (iniciarPagina({ perfis: null })) montar();
