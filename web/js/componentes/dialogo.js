import { el } from '../utilitarios/dom.js';

export function abrirDialogo({ titulo, texto = null, corpo = null, botoes, ler = null }) {
  return new Promise((resolver) => {
    const dialogo = el('dialog', { class: 'dialogo', 'aria-labelledby': 'dialogo-titulo' });
    let resposta = null;

    const botoesHtml = botoes.map((botao) => el('button', {
      type: 'button',
      class: `botao botao-${botao.tipo ?? 'secundario'}`,
      onclick: () => {
        resposta = ler && botao.valor !== null ? { valor: botao.valor, dados: ler(dialogo) } : botao.valor;
        dialogo.close();
      }
    }, botao.rotulo));

    dialogo.append(
      el('h2', { id: 'dialogo-titulo' }, titulo),
      texto ? el('p', {}, texto) : '',
      corpo ?? '',
      el('div', { class: 'dialogo-botoes' }, botoesHtml));

    dialogo.addEventListener('close', () => {
      dialogo.remove();
      resolver(resposta);
    });

    document.body.append(dialogo);
    dialogo.showModal();
    dialogo.querySelector('.botao')?.focus();
  });
}

export async function confirmar({ titulo, texto, rotuloConfirmar, tipo = 'perigo' }) {
  const resposta = await abrirDialogo({
    titulo,
    texto,
    botoes: [
      { rotulo: 'Cancelar', tipo: 'discreto', valor: null },
      { rotulo: rotuloConfirmar, tipo, valor: true }
    ]
  });
  return resposta === true;
}
