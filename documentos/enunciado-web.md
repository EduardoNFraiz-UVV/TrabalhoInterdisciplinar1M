Projeto: Plataforma Web de Doações e Solidariedade



Especificação do Projeto 2026 – Desafio Interdisciplinar: Desenvolvimento de Software para Web

Este projeto envolve o processo de Desenvolvimento de Software para Web conduzido por estudantes do primeiro período, com o objetivo de oferecer uma solução para um desafio real de organizações e da sociedade, empregando técnicas de projeto de interface e conhecimentos de HTML, CSS e JavaScript. Parte I trata da concepção (requisitos e interface) e a Parte II trata do desenvolvimento do site.


 

1. Contextualização
Organizações sem fins lucrativos, orfanatos, instituições de apoio social e grupos que atuam em situações emergenciais frequentemente enfrentam dificuldades para divulgar suas necessidades e encontrar pessoas dispostas a ajudar.

Ao mesmo tempo, existem muitos cidadãos interessados em realizar doações, mas que não sabem quem precisa de ajuda, o que está sendo solicitado, onde realizar a entrega ou como ter confiança de que sua contribuição chegará ao destino correto.

Diante desse cenário, propõe-se o desenvolvimento de um sistema web de doações, cujo objetivo é aproximar pessoas que desejam doar de entidades e campanhas que necessitam de recursos.

A plataforma deverá permitir, por exemplo, que uma instituição cadastre uma necessidade de alimentos, roupas, calçados, produtos de higiene, cobertores, materiais escolares, entre outros itens. Também deverá possibilitar a divulgação de campanhas específicas relacionadas a enchentes, deslizamentos, secas, incêndios, entre outros desastres ambientais.

O cidadão poderá acessar a plataforma, pesquisar necessidades, conhecer as entidades e campanhas disponíveis e registrar sua intenção de realizar uma doação.



2. Objetivo do projeto
Desenvolver a concepção de uma aplicação web responsiva que facilite a conexão entre:

•       Pessoas que desejam realizar doações;

•       Entidades que necessitam de doações;

•       Campanhas emergenciais destinadas a situações de calamidade ou desastres ambientais.

O projeto deverá priorizar simplicidade, acessibilidade, transparência, facilidade de navegação e boa experiência do usuário.

·       A Parte I tem foco na engenharia de requisitos e no projeto da interface.

·        A Parte II dá continuidade ao trabalho, transformando o projeto de interface em um site funcional (front-end) desenvolvido com HTML, CSS e JavaScript.



3. Problema a ser solucionado
Considere a seguinte situação:

Uma pessoa possui roupas, alimentos ou cobertores que gostaria de doar. Entretanto, ela não conhece nenhuma instituição próxima que esteja precisando desses itens. Em outro cenário, ocorre uma enchente em determinada região e várias entidades começam a solicitar água, alimentos, roupas e produtos de higiene. O cidadão deseja ajudar, mas não sabe onde encontrar informações confiáveis sobre as necessidades existentes.

O sistema proposto deverá responder à seguinte questão:

Como podemos criar uma plataforma simples e confiável que permita ao cidadão encontrar rapidamente entidades ou campanhas que precisam de doações e, ao mesmo tempo, possibilite que essas organizações divulguem suas necessidades?



4. Identificação dos usuários
O site deverá atender no mínimo 3 perfis de usuário, cada um com um conjunto próprio de telas e opções de menu. Os grupos podem propor perfis adicionais, desde que justificados pelas personas. Para efeito de teste e avaliação, o login será validado em JavaScript com as credenciais abaixo:

Perfil

Usuário

Senha

Exemplos de telas

Doador (cidadão)

doador

doa#2026

Busca de necessidades e campanhas; registro de intenção de doação; acompanhamento das doações

Entidade

entidade

ent!2026

Cadastro de necessidades; divulgação de campanhas; confirmação de recebimento

Defesa Civil

defesacivil

dc$-2026

Abertura de campanhas emergenciais; painel de situação por região

Administrador

admin

adm@2026

Aprovação de entidades e campanhas; moderação; relatórios

 

 

5.Distribuição da Pontuação
 

Valor

Requisitos mínimos

Tela principal de apresentação

Incluída no item de login

Tela com conteúdo de apresentação da plataforma: objetivo, como funciona, entidades e campanhas em destaque.

Apresentação e login

0,6

Tela principal de apresentação um conteúdo sobre a empresa e o proposto do sistema, apresentar os projetos sociais de coleta de resíduos (parte estática)

A tela de login deve ser apresentada ou direto na principal ou como link. Usar as tags semânticas, e estrutura HTML e CSS coesa.

Telas do protótipo UX (mínimo de 9 telas – 3 por perfil)

0,1 por tela

Tela para lançamento de informações do cliente de acordo com o estabelecido no Figma e no modelo de dados. Utilizar o CSS para configurar no site todas as características do projeto Figma (paleta de cores, fontes, botões, ícones, flexbox, formulários etc.). O site deve refletir o padrão visual do protótipo e ser responsivo.

Apresentação

3,5

O projeto deverá ser apresentado pelo grupo: conceito do site, usabilidade e código. Informar quais tags, boxes e componentes HTML foram usados, explicar o JavaScript, explicar o CSS e suas classes e quais conceitos de semântica foram utilizados. Todos do grupo devem apresentar.

JavaScript

1,0

Tela funcional em JavaScript com CRUD (criar, listar, editar e excluir registros, por exemplo necessidades de uma entidade).



6.Regras de desenvolvimento
•      Tecnologias: HTML, CSS e JavaScript puros. Bibliotecas e frameworks só podem ser usados se autorizados previamente pelo professor.

•      Responsividade: o site deve funcionar em computador, tablet e celular.

•      Semântica e acessibilidade: uso adequado de tags semânticas, texto alternativo em imagens e rótulos em formulários.

•      Padrão visual: o CSS deve reproduzir fielmente o protótipo do Figma.

•      Sem comentários no código: nenhum arquivo HTML, CSS ou JavaScript poderá conter comentários. Isso inclui comentários gerados por ferramentas de IA, que devem ser removidos antes da entrega. O código deve ser compreendido e explicado pelo grupo na apresentação, sem apoio de anotações no código.

•      Uso de inteligência artificial: o grupo poderá utilizar ferramentas de IA para a construção do projeto. Entretanto, na apresentação, todos os integrantes devem ter entendido o código e ser capazes de explicá-lo, e o professor poderá pedir a explicação de qualquer trecho. O código que o grupo não consegue explicar será desconsiderado na avaliação.

•      Publicação: o site deve estar publicado (GitHub Pages ou outro servidor de hospedagem) e a apresentação será feita sobre a página publicada.

 

 

 

7.Requisitos do Trabalho
•      O trabalho deve ser entregue pelo portal, dentro do prazo estabelecido.

•      Deve ser entregue APENAS 1 (um) arquivo no formato PDF, no padrão ABNT, contendo:

–     o link do GitHub para o código;

–     o link do GitHub (ou outro servidor) para o site publicado;

–     o link para o projeto (protótipo) no Figma;

–     o Modelo de Entidade e Relacionamento (MER) do banco de dados, em anexo;

•      O nome completo dos integrantes deve estar na CAPA do arquivo PDF, em ordem alfabética.

•      Apenas o líder do projeto precisará fazer o upload dos links do GitHub, tanto do código quanto da publicação.

 

8. Apresentação do trabalho
•      A apresentação deverá ter de 7 a 15 minutos.

•      Todos os componentes do grupo devem apresentar uma parte.

•      Todos devem estar habilitados a responder às perguntas do professor.

•      A apresentação deve ser feita sobre a página publicada no GitHub ou em qualquer outro servidor de hospedagem.

 

9.Datas
Etapa

Data

Entrega dos links do trabalho no portal

23/11

Apresentação do projeto

24/11 e 08/12

 

Observação: após entregar os links, o grupo ainda pode atualizar o GitHub.

 