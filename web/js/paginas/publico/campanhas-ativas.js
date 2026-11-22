import { iniciarPagina } from '../../nucleo/pagina.js';
import { $, el, preencher } from '../../utilitarios/dom.js';
import { campanhasAtivas } from '../../regras/campanhas.js';
import { cartaoCampanha } from '../../componentes/cartoes.js';

if (iniciarPagina({ perfis: null, pagina: (usuario) => (usuario ? 'inicio' : 'campanhas-ativas') })) {
  const ativas = campanhasAtivas().sort((a, b) => b.data_inicio.localeCompare(a.data_inicio));
  preencher($('#lista'), ativas.length === 0
    ? el('p', { class: 'texto-apoio' }, 'Não há campanhas ativas no momento.')
    : ativas.map((campanha) => cartaoCampanha(campanha, 'h3')));
}
