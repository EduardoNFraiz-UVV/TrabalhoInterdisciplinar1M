import { el } from '../utilitarios/dom.js';
import { restaurar } from '../nucleo/armazenamento.js';
import { confirmar } from './dialogo.js';

export function montarRodape() {
  const destino = document.getElementById('rodape');
  if (!destino) return;
  destino.classList.add('rodape');

  const botaoRestaurar = el('button', {
    type: 'button',
    class: 'link-discreto',
    title: 'Volta os dados deste navegador ao início',
    onclick: async () => {
      const confirmado = await confirmar({
        titulo: 'Restaurar dados de exemplo?',
        texto: 'Tudo o que foi cadastrado neste navegador (doações, necessidades, campanhas e contas criadas) será apagado e os dados voltam ao início.',
        rotuloConfirmar: 'Restaurar dados',
        tipo: 'primario'
      });
      if (confirmado) {
        restaurar();
        window.location.reload();
      }
    }
  }, 'Restaurar dados de exemplo');

  destino.replaceChildren(
    el('div', { class: 'rodape-interno' },
      el('p', {}, el('strong', {}, 'Conecta Doações'), ' · Projeto interdisciplinar do 1º período · Perfis de teste: doador, entidade e admin'),
      botaoRestaurar));
}
