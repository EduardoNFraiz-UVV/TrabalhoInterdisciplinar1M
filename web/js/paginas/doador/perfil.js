/*
  perfil.js
  Página: paginas/doador/perfil.html (tela extra: Perfil do doador).
  Para que serve: o doador atualiza nome, telefone e cidade (tabela usuario) e troca a senha.
  Depende de: pagina.js, armazenamento.js, componentes de formulário e alertas.
*/

/* Funções de outros arquivos que usamos aqui */
import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, atualizar } from '../../nucleo/armazenamento.js';
import { $ } from '../../utilitarios/dom.js';
import { lerFormulario, mostrarErros, limparErros, preencherSelect } from '../../componentes/formulario.js';
import { ligarFormularioSenha } from '../../componentes/formulario-senha.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { obrigatorio } from '../../regras/validacoes.js';

/* usuario: o doador logado */
function montar(usuario) {
  /* O formulário de dados do perfil */
  const formulario = $('#formulario-perfil');
  /* Lista de cidades, com a cidade atual do usuário já escolhida */
  preencherSelect($('#id_cidade'), tabela('cidade'), { valor: (c) => c.id_cidade, rotulo: (c) => `${c.nome} (${c.uf})`, selecionado: usuario.id_cidade });
  /* Preenche os campos com os dados atuais (formulario.nome acha o campo pelo atributo name) */
  formulario.nome.value = usuario.nome;
  formulario.email.value = usuario.email;
  formulario.telefone.value = usuario.telefone ?? '';

  /* Ao salvar o perfil */
  formulario.addEventListener('submit', (evento) => {
    /* Impede o navegador de recarregar a página */
    evento.preventDefault();
    limparErros(formulario);
    const dados = lerFormulario(formulario);
    /* O nome é obrigatório */
    if (!obrigatorio(dados.nome)) {
      mostrarErros(formulario, { nome: 'Informe seu nome completo.' });
      return;
    }
    /* Grava as mudanças na tabela usuario (telefone vazio vira null) e avisa */
    atualizar('usuario', usuario.id_usuario, { nome: dados.nome.trim(), telefone: dados.telefone.trim() || null, id_cidade: Number(dados.id_cidade) });
    mostrarAlerta($('#area-alerta'), 'sucesso', 'Perfil salvo.', 'Seus dados foram atualizados.');
  });

  /* Liga o formulário de troca de senha (que mora em outro arquivo, pois a ONG usa o mesmo) */
  ligarFormularioSenha($('#formulario-senha'), usuario, $('#area-alerta'));
}

/* Confere o login (só doador) e monta cabeçalho e rodapé; depois monta a página */
const contexto = iniciarPagina({ perfis: ['doador'] });
if (contexto) montar(contexto.usuario);
