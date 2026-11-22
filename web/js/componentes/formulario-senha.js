import { trocarSenha } from '../nucleo/sessao.js';
import { lerFormulario, mostrarErros, limparErros } from './formulario.js';
import { mostrarAlerta } from './alertas.js';
import { senhaValida } from '../regras/validacoes.js';

export function ligarFormularioSenha(formulario, usuario, areaAlerta) {
  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limparErros(formulario);
    const dados = lerFormulario(formulario);
    const erros = {};

    if (!dados.senha_atual) erros.senha_atual = 'Informe a senha atual.';
    if (!senhaValida(dados.senha_nova)) erros.senha_nova = 'A nova senha precisa ter pelo menos 6 caracteres.';
    if (dados.senha_nova !== dados.senha_confirmar) erros.senha_confirmar = 'A confirmação não é igual à nova senha.';
    if (mostrarErros(formulario, erros)) return;

    const trocou = await trocarSenha(usuario, dados.senha_atual, dados.senha_nova);
    if (!trocou) {
      mostrarErros(formulario, { senha_atual: 'A senha atual está incorreta. Confira e tente de novo.' });
      return;
    }
    formulario.reset();
    mostrarAlerta(areaAlerta, 'sucesso', 'Senha alterada.', 'Use a nova senha no próximo acesso.');
  });
}
