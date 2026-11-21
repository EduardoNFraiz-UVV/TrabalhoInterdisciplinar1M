/*
  dialogo-vinculo.js
  Para que serve: o diálogo "Aceitar necessidade na campanha?", em que quem criou a campanha
  decide se a quantidade da necessidade AUMENTA A META (RN-33) ou só ajuda a cumprir a meta já
  declarada. Usado no painel da ONG e na tela de aprovações do administrador.
  Depende de: dom.js, dialogo.js, campanhas.js e formatacao.js.
*/

import { el } from '../utilitarios/dom.js';
import { abrirDialogo } from './dialogo.js';
import { metaTotal } from '../regras/campanhas.js';
import { formatarNumero, formatarQuantidade } from '../utilitarios/formatacao.js';

/*
  Abre o diálogo. Devolve { aumenta: true/false } se a pessoa confirmou, ou null se cancelou.
  necessidade, ong (dona da necessidade) e campanha são registros das tabelas do banco.
*/
export async function perguntarAumentaMeta({ necessidade, ong, campanha }) {
  const total = metaTotal(campanha.id_campanha);
  const novoTotal = total + necessidade.quantidade;

  /* Duas opções de radio: dentro do <fieldset> para leitores de tela entenderem que são do mesmo grupo */
  const corpo = el('fieldset', { class: 'pilha pilha-pequena' },
    el('legend', { class: 'so-leitor' }, 'A quantidade aumenta a meta?'),
    el('div', { class: 'opcao' },
      el('input', { type: 'radio', id: 'aumenta-sim', name: 'aumenta', value: 'sim' }),
      el('label', { for: 'aumenta-sim' }, `Sim, aumenta a meta em ${formatarNumero(necessidade.quantidade)} itens (de ${formatarNumero(total)} para ${formatarNumero(novoTotal)})`)),
    el('div', { class: 'opcao' },
      el('input', { type: 'radio', id: 'aumenta-nao', name: 'aumenta', value: 'nao', checked: true }),
      el('label', { for: 'aumenta-nao' }, 'Não, ajuda a cumprir a meta já declarada')));

  const resposta = await abrirDialogo({
    titulo: 'Aceitar necessidade na campanha?',
    texto: `'${necessidade.item}' (${formatarQuantidade(necessidade.quantidade, necessidade.unidade)}), da ${ong.nome}, entra na campanha '${campanha.titulo}'. Decida se a quantidade aumenta a meta.`,
    corpo,
    botoes: [
      { rotulo: 'Cancelar', tipo: 'discreto', valor: null },
      { rotulo: 'Aceitar necessidade', tipo: 'primario', valor: true }
    ],
    /* Lê qual radio está marcado antes de fechar */
    ler: (dialogo) => dialogo.querySelector('input[name="aumenta"]:checked').value === 'sim'
  });

  return resposta ? { aumenta: resposta.dados } : null;
}
