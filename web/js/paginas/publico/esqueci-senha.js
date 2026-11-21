/*
  esqueci-senha.js
  Página: paginas/publico/esqueci-senha.html (tela extra).
  Para que serve: valida o e-mail digitado e mostra um aviso informativo. Nenhum e-mail é enviado de
  verdade (o site é uma demonstração) e a resposta é igual para e-mails cadastrados ou não.
  Depende de: pagina.js, componentes de formulário e alertas.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { $ } from '../../utilitarios/dom.js';
import { lerFormulario, mostrarErros, limparErros } from '../../componentes/formulario.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { emailValido } from '../../regras/validacoes.js';

function montar() {
  const formulario = $('#formulario-recuperar');
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limparErros(formulario);
    const { email } = lerFormulario(formulario);
    if (!emailValido(email)) {
      mostrarErros(formulario, { email: 'Digite um e-mail válido, como nome@exemplo.com.' });
      return;
    }
    mostrarAlerta($('#area-alerta'), 'info', 'Pedido recebido.',
      'Se o e-mail estiver cadastrado, enviaríamos as instruções para redefinir a senha. Neste site de demonstração nenhum e-mail é enviado de verdade.');
    formulario.reset();
  });
}

if (iniciarPagina({ perfis: null })) montar();
