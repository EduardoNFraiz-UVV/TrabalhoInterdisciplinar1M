/*
  campanha-form.js (perfil ONG)
  Página: paginas/ong/campanha-form.html (tela 16: Solicitar campanha).
  Para que serve: protege a página (só ONG) e liga o formulário no modo "ong". Toda a lógica
  fica em js/paginas/compartilhado/campanha-form.js, porque a tela 17 do administrador é parecida.
  Depende de: pagina.js e compartilhado/campanha-form.js.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { iniciarFormularioCampanha } from '../compartilhado/campanha-form.js';

const contexto = iniciarPagina({ perfis: ['ong'] });
if (contexto) iniciarFormularioCampanha({ modo: 'ong', ong: contexto.ong });
