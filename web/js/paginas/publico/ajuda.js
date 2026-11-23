/*
  ajuda.js
  Página: paginas/publico/ajuda.html (tela extra: Ajuda).
  Para que serve: só monta o cabeçalho e o rodapé; o conteúdo da ajuda é HTML estático.
  Depende de: pagina.js.
*/

/* Traz a função que prepara a página (cabeçalho, rodapé e proteção por perfil) */
import { iniciarPagina } from '../../nucleo/pagina.js';

/* perfis: null = página pública, qualquer pessoa pode abrir */
iniciarPagina({ perfis: null });
