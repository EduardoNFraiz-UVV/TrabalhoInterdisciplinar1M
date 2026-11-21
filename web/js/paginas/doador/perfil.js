/*
  perfil.js
  Página: paginas/doador/perfil.html (tela extra: Perfil do doador).
  Para que serve: o doador atualiza nome, telefone e cidade (tabela usuario) e troca a senha.
  Depende de: pagina.js, armazenamento.js, componentes de formulário e alertas.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, atualizar } from '../../nucleo/armazenamento.js';
import { $ } from '../../utilitarios/dom.js';
import { lerFormulario, mostrarErros, limparErros, preencherSelect } from '../../componentes/formulario.js';
import { ligarFormularioSenha } from '../../componentes/formulario-senha.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { obrigatorio } from '../../regras/validacoes.js';

function montar(usuario) {
  const formulario = $('#formulario-perfil');
  preencherSelect($('#id_cidade'), tabela('cidade'), { valor: (c) => c.id_cidade, rotulo: (c) => `${c.nome} (${c.uf})`, selecionado: usuario.id_cidade });
  formulario.nome.value = usuario.nome;
  formulario.email.value = usuario.email;
  formulario.telefone.value = usuario.telefone ?? '';

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limparErros(formulario);
    const dados = lerFormulario(formulario);
    if (!obrigatorio(dados.nome)) {
      mostrarErros(formulario, { nome: 'Informe seu nome completo.' });
      return;
    }
    atualizar('usuario', usuario.id_usuario, { nome: dados.nome.trim(), telefone: dados.telefone.trim() || null, id_cidade: Number(dados.id_cidade) });
    mostrarAlerta($('#area-alerta'), 'sucesso', 'Perfil salvo.', 'Seus dados foram atualizados.');
  });

  ligarFormularioSenha($('#formulario-senha'), usuario, $('#area-alerta'));
}

const contexto = iniciarPagina({ perfis: ['doador'] });
if (contexto) montar(contexto.usuario);
