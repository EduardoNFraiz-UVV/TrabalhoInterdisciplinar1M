/*
  criar-conta.js
  Página: paginas/publico/criar-conta.html (tela extra: Criar conta).
  Para que serve: valida o cadastro e cria a conta. Doador: entra na hora. ONG: cria o usuário e a ONG
  NÃO VERIFICADA (RN-08), que o administrador aprova depois; até lá a ONG não cadastra necessidades (RN-09).
  Regras de dados: e-mail único e CNPJ único (RN-05 e RN-07).
  Depende de: pagina.js, sessao.js, regras de contas e validações, componentes de formulário.
*/

import { iniciarPagina } from '../../nucleo/pagina.js';
import { tabela } from '../../nucleo/armazenamento.js';
import { entrar } from '../../nucleo/sessao.js';
import { ir, parametro, rotaInicialDoPerfil } from '../../nucleo/caminhos.js';
import { $ } from '../../utilitarios/dom.js';
import { criarContaDoador, criarContaOng, emailJaExiste, cnpjJaExiste } from '../../regras/contas.js';
import { obrigatorio, emailValido, cnpjValido, senhaValida } from '../../regras/validacoes.js';
import { lerFormulario, mostrarErros, limparErros, preencherSelect } from '../../componentes/formulario.js';
import { guardarAviso, mostrarAlerta } from '../../componentes/alertas.js';

function montar() {
  const formulario = $('#formulario-conta');
  preencherSelect($('#id_cidade'), tabela('cidade'), { valor: (c) => c.id_cidade, rotulo: (c) => `${c.nome} (${c.uf})`, primeira: 'Selecione a cidade' });

  /* O tipo pode vir do login (?tipo=ong). O bloco da ONG só aparece para esse tipo */
  if (parametro('tipo') === 'ong') formulario.tipo.value = 'ong';
  function aplicarTipo() {
    const ehOng = formulario.tipo.value === 'ong';
    $('#bloco-ong').hidden = !ehOng;
    $('#titulo-pessoa').textContent = ehOng ? 'Dados do representante' : 'Seus dados';
  }
  formulario.tipo.forEach((radio) => radio.addEventListener('change', aplicarTipo));
  aplicarTipo();

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limparErros(formulario);
    const dados = lerFormulario(formulario);
    const ehOng = dados.tipo === 'ong';
    const erros = {};

    if (!obrigatorio(dados.nome)) erros.nome = 'Informe seu nome completo.';
    if (!emailValido(dados.email)) erros.email = 'Digite um e-mail válido, como nome@exemplo.com.';
    else if (emailJaExiste(dados.email)) erros.email = 'Já existe uma conta com este e-mail. Use outro ou entre na sua conta.';
    if (!dados.idCidade) erros.idCidade = 'Escolha a cidade onde você mora.';
    if (!senhaValida(dados.senha)) erros.senha = 'A senha precisa ter pelo menos 6 caracteres.';
    if (dados.senha !== dados.confirmar) erros.confirmar = 'A confirmação não é igual à senha.';

    if (ehOng) {
      if (!obrigatorio(dados.nomeOng)) erros.nomeOng = 'Informe o nome da ONG.';
      if (!cnpjValido(dados.cnpj)) erros.cnpj = 'Digite o CNPJ no formato 00.000.000/0000-00.';
      else if (cnpjJaExiste(dados.cnpj)) erros.cnpj = 'Este CNPJ já está cadastrado.';
      if (!obrigatorio(dados.descricao)) erros.descricao = 'Descreva a ONG para os doadores conhecerem.';
      if (!obrigatorio(dados.endereco)) erros.endereco = 'Informe o endereço da ONG.';
      if (dados.emailOng && !emailValido(dados.emailOng)) erros.emailOng = 'Digite um e-mail de contato válido.';
    }
    if (mostrarErros(formulario, erros)) return;

    try {
      if (ehOng) {
        await criarContaOng({ ...dados, aceitaRetirada: formulario.aceitaRetirada.checked });
      } else {
        await criarContaDoador(dados);
      }
      /* Entra com a conta nova e leva a pessoa para a tela inicial do perfil */
      const resultado = await entrar(dados.email, dados.senha, false);
      if (ehOng) guardarAviso('info', 'Cadastro enviado!', 'O administrador vai verificar sua ONG. Até lá, você ainda não pode cadastrar necessidades.');
      else guardarAviso('sucesso', 'Conta criada!', 'Bem-vindo ao Conecta Doações. Escolha uma necessidade e ajude.');
      ir(rotaInicialDoPerfil(resultado.usuario.perfil));
    } catch (erro) {
      mostrarAlerta($('#area-alerta'), 'erro', 'Não foi possível criar a conta.', 'Abra o site pelo endereço publicado (https) ou por um servidor local.');
    }
  });
}

if (iniciarPagina({ perfis: null })) montar();
