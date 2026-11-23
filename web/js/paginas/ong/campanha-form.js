import { iniciarPagina } from '../../nucleo/pagina.js';
import { iniciarFormularioCampanha } from '../compartilhado/campanha-form.js';

const contexto = iniciarPagina({ perfis: ['ong'] });
if (contexto) iniciarFormularioCampanha({ modo: 'ong', ong: contexto.ong });
