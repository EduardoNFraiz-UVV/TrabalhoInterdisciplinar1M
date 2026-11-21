/*
  campanha-form.js (perfil administrador)
  Página: paginas/admin/campanha-form.html (tela 17: Nova campanha).
  Para que serve: protege a página (só administrador) e liga o formulário no modo "admin".
  Toda a lógica fica em js/paginas/compartilhado/campanha-form.js, usada também pela tela 16 da ONG.
  Depende de: pagina.js e compartilhado/campanha-form.js.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { iniciarFormularioCampanha } from '../compartilhado/campanha-form.js';

const contexto = iniciarPagina({ perfis: ['admin'] });
if (contexto) iniciarFormularioCampanha({ modo: 'admin', ong: null });
