import { iniciarPagina } from '../../nucleo/pagina.js';
import { iniciarFormularioCampanha } from '../compartilhado/campanha-form.js';

const contexto = iniciarPagina({ perfis: ['admin'] });
if (contexto) iniciarFormularioCampanha({ modo: 'admin', ong: null });
