# Especificação das telas

Base para o Figma e para o site. Cada tela segue o wireframe indicado, o guia de estilo (`tokens-do-guia-de-estilo.md`) e os dados de exemplo dos wireframes. Desktop em 1440 px, com versão em celular para as telas 02, 05 e 07. Tema claro.

Cabeçalho de todas as telas logadas: "♡ Conecta Doações", menu do perfil, link "Ajuda" e saudação com "Sair".

## Telas públicas

### 00. Apresentação (`index.html`)
Tela nova, exigida por Web. Sem login.
- Cabeçalho com marca, links "Como funciona", "Campanhas", "ONGs", "Projetos sociais" e botão primário "Entrar".
- Hero: display "Conectando quem quer doar a quem precisa", texto curto sobre o objetivo da plataforma e botões "Entrar" (primário) e "Ver ONGs sem entrar" (secundário).
- Como funciona, em 3 passos: encontre uma ONG, registre sua doação, acompanhe até ser recebida.
- Campanha emergencial em destaque: "Enchente em Vila Velha", barra de 65% da meta, botão "Ver campanha".
- ONGs em destaque: 3 cards (Lar Esperança, Casa da Criança, Abrigo Sol).
- Projetos sociais de coleta de resíduos, conteúdo estático: 3 cards (coleta de óleo de cozinha, reciclagem de papel e plástico, reaproveitamento de roupas).
- Rodapé com nome do projeto e perfis.

### 01. Entrar (`login.html`), wireframe 01
- Logo, "♡ Conecta Doações" e "Conectando quem quer doar a quem precisa".
- Campos "E-mail ou usuário" e "Senha", link "Esqueci minha senha", checkbox "Lembrar-me" e botão primário "Entrar".
- Estado de erro: borda `danger`, ícone alert e "E-mail ou senha incorretos. Tente novamente." Detalhe: "Confira os dados ou use 'Esqueci minha senha'."
- Separador, "Ainda não tem conta? Crie como:", radios "Sou Doador" e "Represento uma ONG" e botão secundário "Criar conta" (demonstrativo, exibe aviso informativo).
- Link "Ver ONGs sem entrar (visitante)".

## Doador (menu: Início, ONGs, Minhas doações, Perfil)

### 02. Início, wireframe 02
- Título display "Como você quer ajudar hoje?" e busca "Pesquise por item, ONG ou cidade (ex.: cobertores)" com botão "Buscar".
- Categorias como abas: Alimentos, Roupas, Calçados, Higiene, Cobertores, Material escolar, Móveis, Água.
- Campanha emergencial: "Enchente em Vila Velha", "12 entidades precisam de água potável, alimentos, roupas e produtos de higiene", "Arrecadação até 30/10", "65% da meta atingida" e botão "Ver campanha".
- Tabela "Necessidades urgentes": Item, Categoria, ONG, Faltam, Prioridade e Ação ("Quero doar"). Linhas: Cobertores / Lar Esperança / 30 un. / URGENTE; Leite em pó / Casa da Criança / 20 latas / URGENTE; Fraldas G / Abrigo Sol / 15 pct. / Normal; Cadernos / Instituto Saber / 50 un. / Normal.
- Coluna lateral com 2 cards de ONG (Lar Esperança, Casa da Criança) e link "Ver todas as necessidades".

### 03. ONGs cadastradas, wireframe 03
- Breadcrumb "Início > ONGs", título "ONGs cadastradas".
- Busca "Pesquisar ONG pelo nome", seletores "Categoria: Todas" e "Cidade: Vila Velha", checkbox "Só com itens urgentes".
- Linha "8 ONGs encontradas · Filtros ativos: Vila Velha" com link "Limpar filtros".
- Grade de 6 cards de ONG: Lar Esperança, Casa da Criança, Abrigo Sol, Instituto Saber, Banco de Alimentos ES, Projeto Agasalho. Cada um com inicial, nome, selo verificada, cidade, itens urgentes e "Ver necessidades".
- Paginação 1, 2.

### 04. Perfil da ONG, wireframe 04
- Breadcrumb "Início > ONGs > Lar Esperança".
- Cabeçalho: logo, "Lar Esperança", selo verificada e CNPJ, descrição ("Há 15 anos acolhemos 35 idosos em situação de vulnerabilidade. Toda doação recebida é registrada e confirmada na plataforma.").
- Card de contato com ícones: pin "Rua das Flores, 120 - Centro, Vila Velha", clock "Seg a sex, 8h às 17h · Sáb, 8h às 12h", phone "(27) 3333-0000 · contato@laresperanca.org", truck "Aceita entrega no local ou retirada".
- Abas: Necessidades (6), Sobre a ONG, Doações recebidas.
- Aba Necessidades: filtros "Categoria: Todas" e "Ordenar: Mais urgentes", tabela com Item, Categoria, Quantidade necessária, Já prometido, Prioridade e Ação. Linhas: Cobertores de casal 50/20 URGENTE; Fraldas geriátricas G 40/10 URGENTE; Leite integral 60 L/0 URGENTE; Sabonete 100/45 Normal; Agasalhos tam. M/G 30/5 Normal; Arroz 5 kg 20/18 Normal.
- Legenda "URGENTE = necessário nos próximos 7 dias · Atualizado há 2 dias" e botão "Quero doar".

### 05. Registrar doação, wireframe 05
- Breadcrumb "Início > ONGs > Lar Esperança > Registrar doação", título "Registrar intenção de doação" e "Passo 1 de 2: dados da doação → Passo 2: confirmação".
- Formulário: ONG selecionada (bloqueado), Item* (lista), Quantidade* com "(faltam 30)", Descrição / observação, Forma de entrega* (radios "Vou levar até a ONG" e "Solicitar retirada no meu endereço"), Data prevista de entrega* com apoio "Horário de recebimento: seg a sex, 8h às 17h" e "* Campos obrigatórios".
- Botões: "Cancelar" (discreto, à esquerda) e "Confirmar doação" (primário, à direita).
- Coluna lateral "Resumo da sua doação" (ONG, Item, Entrega, Endereço, texto "Após confirmar, a ONG será avisada. Acompanhe em Minhas doações.") e link "Dúvidas sobre como doar".

### 06. Minhas doações, wireframe 06
- Título "Minhas doações" e alerta de sucesso "Doação registrada com sucesso! A ONG Lar Esperança foi avisada."
- Filtros por status com contador: Todas (5), Oferecidas (2), Aceitas (1), Recebidas (2) e busca "Buscar por ONG ou item".
- Tabela: Data, ONG, Item, Quantidade, Status (selo) e Ação ("Ver detalhes", "Cancelar" apenas quando Oferecida). Linhas: 05/10/2026 Lar Esperança, Cobertores de casal, 5 un., Oferecida; 01/10/2026 Casa da Criança, Leite em pó, 4 latas, Aceita; 20/09/2026 Abrigo Sol, Fraldas G, 3 pct., Recebida; 10/09/2026 Instituto Saber, Cadernos, 10 un., Recebida; 02/09/2026 Lar Esperança, Sabonete, 12 un., Oferecida.
- Detalhes da doação (aparecem ao clicar em "Ver detalhes"): acompanhamento em 3 passos (Oferecida, Aceita pela ONG, Recebida) e duas colunas de informações.
  - Sua doação: ONG (Lar Esperança), Item (Cobertores de casal), Quantidade (5 un.), Observação (“cobertores novos, ainda na embalagem”) e Registrada em (05/10/2026).
  - Entrega e contato: Forma de entrega (Vou levar até a ONG), Data prevista (15/10/2026), Endereço (Rua das Flores, 120 - Centro, Vila Velha), Horário (Seg a sex, 8h às 17h) e Contato ((27) 3333-0000 · contato@laresperanca.org).
  - Rodapé: "Aguardando a ONG aceitar a doação (geralmente em até 2 dias)" e botão "Falar com a ONG".

## ONG (menu: Painel, Necessidades, Doações recebidas, Perfil da ONG)

### 07. Painel da ONG, wireframe 07
- "Olá, Mariana! Painel do Lar Esperança" e "Perfil 80% completo · Complete para aumentar a confiança dos doadores".
- 3 cards de resumo: 6 Necessidades cadastradas (Gerenciar), 3 Doações pendentes (Ver pendentes), 14 Recebidas no mês (Ver histórico).
- Ações rápidas: "+ Cadastrar necessidade", "Gerenciar necessidades", "Ver doações recebidas", "Editar perfil da ONG".
- Tabela de últimas doações (Data, Doador, Item, Qtd., Status): 05/10 Lucas S. Cobertores de casal 5 un. Oferecida; 04/10 Ana P. Fraldas G 6 pct. Oferecida; 03/10 João M. Leite integral 12 L Aceita; 01/10 Carla R. Sabonete 20 un. Recebida.
- Card com 3 barras de progresso: Cobertores de casal 20 de 50, Fraldas geriátricas G 10 de 40, Leite integral 0 de 60 L.

### 08. Gerenciar necessidades (CRUD), wireframe 08
- Breadcrumb "Painel > Necessidades", título "Gerenciar necessidades" e botão primário "+ Nova necessidade".
- Busca "Buscar item", seletores "Categoria: Todas", "Prioridade: Todas", "Situação: Ativas".
- Tabela: Item, Categoria, Quantidade, Prometido, Prioridade, Atualizado em e Ações (Editar, Concluir, Excluir). Cada ação tem ícone e cor própria: "Editar" com lápis em primary, "Concluir" com check em success e "Excluir" com lixeira em danger. "Concluir" marca a necessidade como concluída direto na linha, sem passar pelo diálogo. Linhas: Cobertores de casal 50/20 URGENTE 03/10/2026; Fraldas geriátricas G 40/10 URGENTE 03/10/2026; Leite integral 60/0 URGENTE 28/09/2026; Sabonete 100/45 Normal 20/09/2026; Agasalhos tam. M/G 30/5 Normal 15/09/2026; Arroz 5 kg 20/18 Normal 10/09/2026.
- Diálogo de confirmação "Excluir necessidade?": "'Arroz 5 kg' tem 18 pacotes prometidos por doadores. Eles serão avisados. Você pode marcar como concluída em vez de excluir." Botões: Cancelar, Marcar concluída, Excluir (perigo). O diálogo é um caminho alternativo ao "Concluir" da linha, oferecido quando a ONG tenta excluir um item com doações prometidas.

### 09. Doações recebidas, wireframe 09
- Breadcrumb "Painel > Doações recebidas", título "Doações oferecidas à ONG".
- Abas: Pendentes (2), Aceitas (1), Recebidas (14), Recusadas (0) e busca "Buscar doador ou item".
- Tabela: Data, Doador, Item, Qtd., Entrega, Data prevista, Status e Ações. Linhas: 05/10 Lucas S. Cobertores de casal 5 un. Leva até a ONG 15/10 Oferecida (Aceitar, Recusar); 04/10 Ana P. Fraldas G 6 pct. Retirada 12/10 Oferecida (Aceitar, Recusar); 03/10 João M. Leite integral 12 L Leva até a ONG 08/10 Aceita (Confirmar recebimento).
- Detalhe da doação selecionada: "Quantidade: 5 un. · Entrega na ONG em 15/10/2026", observação do doador, contato, campo "Mensagem ao doador (opcional)" e botões "Recusar" e "Aceitar doação".
- Card "Como funciona" com 3 passos e "Ao confirmar, o doador recebe uma notificação."

### 10. Cadastrar necessidade (CRUD), wireframe 10
- Breadcrumb "Painel > Necessidades > Nova necessidade", título "Cadastrar necessidade". A mesma tela serve para editar, com o título "Editar necessidade".
- Formulário: Nome do item* ("Ex.: Cobertor de casal"), Categoria* (lista), Quantidade* e unidade (lista, "unidades"), Prioridade* (radios "Normal" e "Urgente (destacada para os doadores)"), Vincular a uma campanha (opcional), Descrição / especificações, Precisa até (data) e "* Campos obrigatórios".
- Botões: "Cancelar" e "Salvar necessidade".
- Coluna lateral: pré-visualização "Cobertor de casal · Cobertores · 50 unidades · URGENTE · Campanha: Enchente em Vila Velha" com botão "Quero doar", e a dica "Itens urgentes aparecem no topo da busca e na tela inicial dos doadores."

## Administrador (menu: Painel, Aprovações, Campanhas, Usuários)

As telas 11 a 14 são novas, por exigência de Web (3 telas por perfil, aqui 4). Seguem os mesmos componentes das demais. Os 3 relatórios do painel são os mesmos indicadores do relatório de Banco de Dados.

### 11. Painel e relatórios
- "Olá, Administrador! Painel da plataforma" e subtítulo "Resumo e relatórios dos últimos 6 meses".
- 4 cards de resumo: 300 ONGs cadastradas (Ver usuários), 5 ONGs aguardando aprovação (Ver aprovações), 2 campanhas pendentes (Analisar), 48 doações recebidas no mês.
- Relatório "Doações recebidas por mês": gráfico de barras de junho a novembro de 2026 (31, 36, 29, 41, 44, 48), com o valor sobre cada barra.
- Tabela "Aguardando análise" com 4 itens recentes (ONG ou campanha, data, ação "Analisar").
- Relatório "Demanda por categoria e prioridade": tabela com itens recebidos de itens solicitados, em Urgente e Normal, e o percentual atendido por categoria.
- Relatório "Média mensal por categoria": barras de progresso por categoria (Alimentos 14,0; Roupas 8,7; Higiene 6,3...) e "Média geral: 38,2 doações por mês".

### 12. Aprovação de ONGs e campanhas
- Breadcrumb "Painel > Aprovações", título "Aprovação de ONGs e campanhas".
- Abas: ONGs pendentes (5), Campanhas pendentes (2).
- Tabela de ONGs: Nome, CNPJ, Cidade, Cadastrada em, Ações ("Aprovar", "Recusar"). Exemplos: Projeto Recomeço, Associação Mãos Amigas, Casa Girassol.
- Detalhe da ONG selecionada (descrição, endereço, contato, representante) e botões "Recusar" e "Aprovar ONG".
- Alerta de sucesso ao aprovar: "ONG aprovada! Ela já aparece com o selo 'ONG verificada'."

### 13. Campanhas emergenciais
- Breadcrumb "Painel > Campanhas", título "Campanhas emergenciais" e botão primário "+ Nova campanha".
- Abas com contador: Todas (24), Ativas (6), Pendentes (2), Encerradas (16). Busca "Buscar campanha ou cidade" e seletor "Tipo: Todos".
- Tabela: Campanha, Tipo, Cidade, Itens recebidos (ex.: "1.300 de 2.000"), Período, Situação (selo Ativa, Pendente ou Encerrada) e Ações ("Editar" e "Encerrar" nas ativas, "Editar" e "Analisar" nas pendentes, "Reabrir" nas encerradas). "Analisar" leva à tela 12.
- Diálogo "Encerrar campanha?": "A campanha deixa de aparecer para os doadores. As doações já registradas continuam valendo." Botões Cancelar e Encerrar campanha (perigo).

### 14. Usuários
- Breadcrumb "Painel > Usuários", título "Usuários da plataforma" e subtítulo "Doadores, ONGs e administradores cadastrados. Bloqueie quem descumprir as regras de uso."
- Abas com contador: Todos (5.000), Doadores (4.697), ONGs (300), Administradores (3). Busca "Buscar por nome ou e-mail" e seletor "Situação: Todas".
- Tabela: Nome, E-mail, Perfil, Cidade, Cadastro, Situação (selo Ativo ou Bloqueado) e Ação ("Bloquear" ou "Desbloquear"; administradores não têm ação).
- Diálogo "Bloquear usuário?": "O usuário não poderá entrar nem registrar doações. Você pode desbloquear o acesso depois." Botões Cancelar e Bloquear usuário (perigo).

## Fluxos que o protótipo deve ligar

- Doador: 01 Entrar → 02 Início → 03 ONGs → 04 Perfil da ONG → 05 Registrar doação → 06 Minhas doações.
- ONG: 01 Entrar → 07 Painel → 08 Gerenciar necessidades → 10 Cadastrar necessidade → 08. De 07 também para 09 Doações recebidas.
- Administrador: 01 Entrar → 11 Painel → 12 Aprovações → 13 Campanhas → 14 Usuários. O menu liga as 4 telas entre si.
- Público: 00 Apresentação → 01 Entrar ou 03 ONGs como visitante.
