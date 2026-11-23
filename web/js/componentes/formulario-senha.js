/*
  formulario-senha.js
  Para que serve: liga o formulário "Alterar senha" (campos senha_atual, senha_nova, senha_confirmar),
  que existe nas páginas de perfil do doador e da ONG. Valida e troca a senha do usuário logado.
  Quem usa: js/paginas/doador/perfil.js e js/paginas/ong/perfil.js.
  Depende de: sessao.js, formulario.js, alertas.js e validacoes.js.
*/

/* Funções de outros arquivos que usamos aqui */
import { trocarSenha } from '../nucleo/sessao.js';
import { lerFormulario, mostrarErros, limparErros } from './formulario.js';
import { mostrarAlerta } from './alertas.js';
import { senhaValida } from '../regras/validacoes.js';

/*
  formulario: o <form> da troca de senha. usuario: registro do usuário logado.
  areaAlerta: onde mostrar o resultado.
*/
export function ligarFormularioSenha(formulario, usuario, areaAlerta) {
  /* Quando o formulário for enviado (botão "Alterar senha"). "async" porque vamos usar "await" */
  formulario.addEventListener('submit', async (evento) => {
    /* Impede o navegador de recarregar a página ao enviar o formulário */
    evento.preventDefault();
    /* Apaga os erros da tentativa anterior */
    limparErros(formulario);
    /* Lê os campos digitados: { senha_atual, senha_nova, senha_confirmar } */
    const dados = lerFormulario(formulario);
    /* Objeto onde vamos juntando as mensagens de erro, campo por campo */
    const erros = {};

    /* Validações: cada erro entra no objeto, com o nome do campo como chave */
    if (!dados.senha_atual) erros.senha_atual = 'Informe a senha atual.';
    if (!senhaValida(dados.senha_nova)) erros.senha_nova = 'A nova senha precisa ter pelo menos 6 caracteres.';
    if (dados.senha_nova !== dados.senha_confirmar) erros.senha_confirmar = 'A confirmação não é igual à nova senha.';
    /* Se houve algum erro, mostra e para por aqui (mostrarErros devolve true quando há erros) */
    if (mostrarErros(formulario, erros)) return;

    /* Tenta trocar a senha (espera o cálculo do SHA-256). Devolve false se a senha atual estiver errada */
    const trocou = await trocarSenha(usuario, dados.senha_atual, dados.senha_nova);
    if (!trocou) {
      mostrarErros(formulario, { senha_atual: 'A senha atual está incorreta. Confira e tente de novo.' });
      return;
    }
    /* Deu certo: limpa os campos e avisa */
    formulario.reset();
    mostrarAlerta(areaAlerta, 'sucesso', 'Senha alterada.', 'Use a nova senha no próximo acesso.');
  });
}
