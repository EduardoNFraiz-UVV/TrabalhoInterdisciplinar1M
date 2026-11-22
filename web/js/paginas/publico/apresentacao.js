import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela } from '../../nucleo/armazenamento.js';
import { url, rotaInicialDoPerfil } from '../../nucleo/caminhos.js';
import { $, el, preencher } from '../../utilitarios/dom.js';
import { formatarNumero } from '../../utilitarios/formatacao.js';
import { campanhasAtivas, quantidadeDeOngs, recebidoDaCampanha, metaTotal } from '../../regras/campanhas.js';
import { cartaoCampanha, cartaoOng } from '../../componentes/cartoes.js';

const contexto = iniciarPagina({ perfis: null, pagina: () => null });

if (contexto) {
  const ativas = campanhasAtivas();
  const destaque = [...ativas].sort((a, b) => quantidadeDeOngs(b.id_campanha) - quantidadeDeOngs(a.id_campanha))[0];
  preencher($('#campanha-destaque'), destaque ? cartaoCampanha(destaque, 'h3') : el('p', { class: 'texto-apoio' }, 'Não há campanhas ativas no momento.'));

  const verificadas = tabela('ong').filter((o) => o.verificada).length;
  const frase = [
    `${verificadas} ${verificadas === 1 ? 'ONG verificada' : 'ONGs verificadas'} e ${ativas.length} ${ativas.length === 1 ? 'campanha ativa' : 'campanhas ativas'} hoje.`
  ];
  if (destaque) {
    frase.push(`A campanha "${destaque.titulo}" já recebeu ${formatarNumero(recebidoDaCampanha(destaque.id_campanha))} de ${formatarNumero(metaTotal(destaque.id_campanha))} itens.`);
  }
  $('#hero-numeros').textContent = frase.join(' ');

  preencher($('#ongs-destaque'), tabela('ong').filter((o) => o.verificada).slice(0, 3).map((ong) => cartaoOng(ong, 'h3')));

  if (contexto.usuario) {
    const botao = $('#botao-entrar');
    botao.href = url(rotaInicialDoPerfil(contexto.usuario.perfil));
    botao.textContent = 'Ir para minha área';
  }
}
