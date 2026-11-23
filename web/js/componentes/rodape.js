/*
  rodape.js
  Para que serve: monta o rodapé de todas as páginas, com o nome do projeto, os perfis de teste
  e o botão "Restaurar dados de exemplo" (apaga o que foi cadastrado e volta aos dados iniciais).
  Quem usa: pagina.js.
  Depende de: dom.js, armazenamento.js, dialogo.js.
*/

/* Funções de outros arquivos que usamos aqui */
import { el } from '../utilitarios/dom.js';
import { restaurar } from '../nucleo/armazenamento.js';
import { confirmar } from './dialogo.js';

/* Monta o rodapé dentro de <footer id="rodape"> */
export function montarRodape() {
  /* Acha o <footer id="rodape">; se a página não tem, não faz nada */
  const destino = document.getElementById('rodape');
  if (!destino) return;
  /* Classe "rodape" para o CSS estilizar */
  destino.classList.add('rodape');

  /* Botão com aparência de link pequeno (discreto): volta tudo ao estado inicial, depois de pedir confirmação.
     O que ele faz está explicado na página Ajuda, na seção "Sobre esta demonstração". */
  const botaoRestaurar = el('button', {
    type: 'button',
    class: 'link-discreto',
    title: 'Volta os dados deste navegador ao início',   /* texto que aparece ao parar o mouse em cima */
    /* "async" porque dentro usamos "await" para esperar a resposta do diálogo */
    onclick: async () => {
      /* Abre a janela de confirmação e espera o usuário escolher */
      const confirmado = await confirmar({
        titulo: 'Restaurar dados de exemplo?',
        texto: 'Tudo o que foi cadastrado neste navegador (doações, necessidades, campanhas e contas criadas) será apagado e os dados voltam ao início.',
        rotuloConfirmar: 'Restaurar dados',
        tipo: 'primario'
      });
      /* Se confirmou: volta aos dados de exemplo e recarrega a página para mostrar tudo de novo */
      if (confirmado) {
        restaurar();
        window.location.reload();
      }
    }
  }, 'Restaurar dados de exemplo');

  /* Coloca o texto do projeto e o botão dentro do <footer> */
  destino.replaceChildren(
    el('div', { class: 'rodape-interno' },
      el('p', {}, el('strong', {}, 'Conecta Doações'), ' · Projeto interdisciplinar do 1º período · Perfis de teste: doador, entidade e admin'),
      botaoRestaurar));
}
