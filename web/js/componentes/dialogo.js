/*
  dialogo.js
  Para que serve: janela de confirmação (Excluir necessidade?, Encerrar campanha?...).
  Usa a tag nativa <dialog>: o navegador já bloqueia o resto da página e prende o foco do teclado.
  Quem usa: telas com ações que precisam de confirmação.
  Depende de: dom.js. O visual está em css/componentes/dialogo.css.
*/

/* Traz a função que cria elementos HTML */
import { el } from '../utilitarios/dom.js';

/*
  Abre um diálogo e devolve uma Promise (uma "promessa" de resposta futura) com o valor do botão clicado.
  opcoes:
    titulo: título do diálogo (h2);
    texto: parágrafo de explicação (opcional);
    corpo: elemento extra para colocar no meio (opcional, ex.: opções de radio);
    botoes: lista de { rotulo, tipo, valor }. tipo é 'discreto', 'secundario', 'primario' ou 'perigo'.
            O primeiro botão com valor null funciona como "Cancelar".
    ler: função opcional que lê o corpo antes de fechar; seu resultado vira { valor, dados }.
  Quem usa escreve: const resposta = await abrirDialogo({...}).
  Se o usuário apertar Esc, a resposta é null.
*/
export function abrirDialogo({ titulo, texto = null, corpo = null, botoes, ler = null }) {
  /* Uma Promise recebe uma função com "resolver": chamar resolver(x) entrega x para quem está esperando (await) */
  return new Promise((resolver) => {
    /* A tag <dialog>, ligada ao título pelo aria-labelledby (leitores de tela leem o título ao abrir) */
    const dialogo = el('dialog', { class: 'dialogo', 'aria-labelledby': 'dialogo-titulo' });
    /* Resposta que será entregue; fica null se o usuário apertar Esc */
    let resposta = null;

    /* Cada botão guarda sua resposta e fecha o diálogo */
    const botoesHtml = botoes.map((botao) => el('button', {
      type: 'button',
      class: `botao botao-${botao.tipo ?? 'secundario'}`,   /* a cor vem do tipo (secundário se não informado) */
      onclick: () => {
        /* Se há função "ler" e o botão não é o de cancelar, a resposta traz também os dados lidos */
        resposta = ler && botao.valor !== null ? { valor: botao.valor, dados: ler(dialogo) } : botao.valor;
        /* Fecha o diálogo (isso dispara o evento "close" lá embaixo) */
        dialogo.close();
      }
    }, botao.rotulo));

    /* Monta o conteúdo: título, texto (se houver), corpo extra (se houver) e a linha de botões */
    dialogo.append(
      el('h2', { id: 'dialogo-titulo' }, titulo),
      texto ? el('p', {}, texto) : '',
      corpo ?? '',
      el('div', { class: 'dialogo-botoes' }, botoesHtml));

    /* Quando fecha (por botão ou Esc), remove o diálogo da página e entrega a resposta */
    dialogo.addEventListener('close', () => {
      /* Tira o diálogo do HTML */
      dialogo.remove();
      /* Entrega a resposta para quem usou "await abrirDialogo(...)" */
      resolver(resposta);
    });

    /* Coloca o diálogo na página */
    document.body.append(dialogo);
    dialogo.showModal();                          /* abre como janela modal */
    dialogo.querySelector('.botao')?.focus();      /* foco no primeiro botão */
  });
}

/* Diálogo simples de confirmação com Cancelar e uma ação. Devolve true se confirmou */
export async function confirmar({ titulo, texto, rotuloConfirmar, tipo = 'perigo' }) {
  /* Abre o diálogo com dois botões e espera o clique */
  const resposta = await abrirDialogo({
    titulo,
    texto,
    botoes: [
      { rotulo: 'Cancelar', tipo: 'discreto', valor: null },
      { rotulo: rotuloConfirmar, tipo, valor: true }
    ]
  });
  /* Só é "sim" se o usuário clicou no botão de confirmar (valor true) */
  return resposta === true;
}
