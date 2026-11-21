/*
  perfil.js
  Página: paginas/ong/perfil.html (tela extra: Perfil da ONG).
  Para que serve: a ONG atualiza os dados mostrados aos doadores (tabela ong), o nome do representante
  (tabela usuario) e troca a senha.
  Depende de: pagina.js, armazenamento.js, componentes de formulário, selos e alertas.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela, atualizar } from '../../nucleo/armazenamento.js';
import { $, preencher } from '../../utilitarios/dom.js';
import { lerFormulario, mostrarErros, limparErros, preencherSelect } from '../../componentes/formulario.js';
import { ligarFormularioSenha } from '../../componentes/formulario-senha.js';
import { seloVerificada, selo } from '../../componentes/selos.js';
import { mostrarAlerta } from '../../componentes/alertas.js';
import { obrigatorio, emailValido } from '../../regras/validacoes.js';

function montar(usuario, ong) {
  const areaAlerta = $('#area-alerta');
  const formOng = $('#formulario-ong');
  const formRep = $('#formulario-representante');

  /* Selo mostra se a ONG já foi aprovada pelo administrador */
  preencher($('#selo-verificada'), ong.verificada ? seloVerificada() : selo('pendente', 'Aguardando verificação'));

  /* Preenche os formulários com os dados atuais */
  preencherSelect($('#id_cidade'), tabela('cidade'), { valor: (c) => c.id_cidade, rotulo: (c) => `${c.nome} (${c.uf})`, selecionado: ong.id_cidade });
  formOng.nome.value = ong.nome;
  formOng.cnpj.value = ong.cnpj;
  formOng.descricao.value = ong.descricao;
  formOng.endereco.value = ong.endereco;
  formOng.horario_atendimento.value = ong.horario_atendimento ?? '';
  formOng.telefone.value = ong.telefone ?? '';
  formOng.email_contato.value = ong.email_contato ?? '';
  formOng.aceita_retirada.checked = ong.aceita_retirada;
  formRep.nome.value = usuario.nome;
  formRep.email.value = usuario.email;

  /* Salvar os dados da ONG */
  formOng.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limparErros(formOng);
    const dados = lerFormulario(formOng);
    const erros = {};
    if (!obrigatorio(dados.descricao)) erros.descricao = 'Escreva uma descrição para os doadores conhecerem a ONG.';
    if (!obrigatorio(dados.endereco)) erros.endereco = 'Informe o endereço da ONG.';
    if (dados.email_contato && !emailValido(dados.email_contato)) erros.email_contato = 'Digite um e-mail válido, como contato@ong.org.';
    if (mostrarErros(formOng, erros)) return;

    atualizar('ong', ong.id_ong, {
      descricao: dados.descricao.trim(),
      id_cidade: Number(dados.id_cidade),
      endereco: dados.endereco.trim(),
      horario_atendimento: dados.horario_atendimento.trim() || null,
      telefone: dados.telefone.trim() || null,
      email_contato: dados.email_contato.trim() || null,
      aceita_retirada: formOng.aceita_retirada.checked
    });
    mostrarAlerta(areaAlerta, 'sucesso', 'Perfil da ONG salvo.', 'Os doadores já veem as informações novas.');
  });

  /* Salvar o nome do representante */
  formRep.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limparErros(formRep);
    if (!obrigatorio(formRep.nome.value)) {
      mostrarErros(formRep, { nome: 'Informe o nome do representante.' });
      return;
    }
    atualizar('usuario', usuario.id_usuario, { nome: formRep.nome.value.trim() });
    mostrarAlerta(areaAlerta, 'sucesso', 'Representante salvo.');
  });

  ligarFormularioSenha($('#formulario-senha'), usuario, areaAlerta);
}

const contexto = iniciarPagina({ perfis: ['ong'] });
if (contexto) montar(contexto.usuario, contexto.ong);
