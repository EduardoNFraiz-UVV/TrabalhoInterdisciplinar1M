# Especificação das telas

Base para o Figma e para o site. Cada tela segue o wireframe indicado, o guia de estilo (`tokens-do-guia-de-estilo.md`) e os dados de exemplo dos wireframes. Desktop em 1440 px, com versão em celular para as telas 02, 05 e 07. Tema claro. As regras do sistema estão em `documentos/regras-de-negocio.md`. No Figma, cada quadro tem uma etiqueta acima dele, fora da tela: "Baseada no wireframe original NN" (telas 01 a 10 e versões em celular) ou "Tela nova" (telas 00 e 11 a 25).

Cabeçalho de todas as telas: à esquerda a marca "♡ Conecta Doações" e o menu do perfil; no canto direito, alinhados à borda do conteúdo, o link "Ajuda" e a saudação com "Sair" (logado) ou o botão "Entrar" (visitante). O link "Ajuda" leva à tela 22.

Rodapé de todas as telas: nome do projeto e perfis de teste à esquerda e, à direita, o link de texto pequeno e discreto "Restaurar dados de exemplo" (volta os dados do navegador ao início, com confirmação; a Ajuda explica o que ele faz).

## Telas públicas

### 00. Apresentação (`index.html`)
Tela nova, exigida por Web. Sem login. Sem cartões nos blocos explicativos: cartões só onde há uma ação (campanha em destaque e ONGs).
- Cabeçalho com marca, links "Como funciona", "Campanhas", "ONGs", "Projetos sociais" e, no canto direito, "Ajuda" e o botão primário "Entrar".
- Hero: display "Conectando quem quer doar a quem precisa", uma frase concreta ("Veja o que cada ONG precisa agora, registre o que você pode doar e acompanhe até a ONG confirmar que recebeu."), uma linha de números reais em texto corrido (ex.: "12 ONGs verificadas e 6 campanhas ativas hoje. A campanha 'Enchente em Vila Velha' já recebeu 1.942 de 3.000 itens.") e os botões "Entrar" (primário) e "Ver ONGs sem entrar" (secundário).
- Como funciona, em 3 passos numa linha aberta: fio no topo de cada passo, número grande na fonte de títulos, título e uma frase. Encontre uma ONG, registre sua doação, acompanhe até ser recebida.
- Campanha emergencial em destaque: card em accent-soft com "Enchente em Vila Velha", cidades, prazo, barra de 65% da meta e botão "Ver campanha" (abre a tela 15). Link "Ver todas as campanhas ativas" (tela 25).
- ONGs em destaque: 3 cards (Lar Esperança, Casa da Criança, Abrigo Sol).
- Projetos sociais de coleta de resíduos, conteúdo estático, em 3 linhas separadas por filetes: ilustração de 96 px à esquerda e texto à direita (coleta de óleo de cozinha, reciclagem de papel e plástico, reaproveitamento de roupas).
- Rodapé com nome do projeto, perfis de teste e o link discreto de restaurar dados.

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
- Esta tela registra doação para uma necessidade de ONG. Para doar direto a uma meta de campanha, ver a tela 18.
- Coluna lateral "Resumo da sua doação" (ONG, Item, Entrega, Endereço, texto "Após confirmar, a ONG será avisada. Acompanhe em Minhas doações.") e link "Dúvidas sobre como doar".

### 06. Minhas doações, wireframe 06
- Título "Minhas doações" e alerta de sucesso "Doação registrada com sucesso! A ONG Lar Esperança foi avisada."
- Filtros por status com contador: Todas (6), Oferecidas (2), Aceitas (1), Recebidas (3) e busca "Buscar por ONG, campanha ou item".
- Tabela: Data, ONG ou campanha, Item, Quantidade, Status (selo) e Ação ("Ver detalhes", "Cancelar" apenas quando Oferecida). Linhas: 05/10/2026 Lar Esperança, Cobertores de casal, 5 un., Oferecida; 01/10/2026 Casa da Criança, Leite em pó, 4 latas, Aceita; 30/09/2026 Campanha: Enchente em Vila Velha, Água potável (meta), 6 pct., Recebida; 20/09/2026 Abrigo Sol, Fraldas G, 3 pct., Recebida; 10/09/2026 Instituto Saber, Cadernos, 10 un., Recebida; 02/09/2026 Lar Esperança, Sabonete, 12 un., Oferecida. Na doação para campanha, o detalhe mostra o endereço de recebimento da campanha e "Quem recebe".
- Detalhes da doação (aparecem ao clicar em "Ver detalhes"): acompanhamento em 3 passos (Oferecida, Aceita pela ONG, Recebida) e duas colunas de informações.
  - Sua doação: ONG (Lar Esperança), Item (Cobertores de casal), Quantidade (5 un.), Observação (“cobertores novos, ainda na embalagem”) e Registrada em (05/10/2026).
  - Entrega e contato: Forma de entrega (Vou levar até a ONG), Data prevista (15/10/2026), Endereço (Rua das Flores, 120 - Centro, Vila Velha), Horário (Seg a sex, 8h às 17h) e Contato ((27) 3333-0000 · contato@laresperanca.org).
  - Rodapé: "Aguardando a ONG aceitar a doação (geralmente em até 2 dias)" e botão "Falar com a ONG".

### 15. Campanha (detalhe), nova
- Aberta pelo botão "Ver campanha" das telas 00 e 02. Cabeçalho do doador; para visitante, o cabeçalho público.
- Breadcrumb "Início > Campanha". Card de destaque em accent-soft com selo EMERGÊNCIA, título "Enchente em Vila Velha", a descrição, as cidades e o tipo (ícone pin, "Vila Velha e Cariacica · Enchente"), "Arrecadação até 30/10/2026" (ícone clock) e a barra "Meta da campanha, 65% atingida".
- Coluna lateral com dois cards. "Resumo da campanha": Meta total (3.000 itens), Já atendido (65%), Necessidades (18 de 12 ONGs), Prazo (30/10/2026) e Criada por (Lar Esperança). "Onde entregar": endereço e horário de recebimento (Rua das Flores, 120 - Centro, Vila Velha; seg a sex, 8h às 17h) e a nota de que vale para doações às metas, e de que doações para necessidades de ONGs vão para o endereço de cada ONG.
- "O que a campanha quer arrecadar": as metas gerais, cada uma com barra de progresso e botão secundário "Doar para esta meta" (leva à tela 18). Linhas: 1.500 · água potável, 1.170 de 1.500; 800 · alimentos não perecíveis, 496 de 800; 700 · itens de higiene, 280 de 700.
- "Necessidades de ONGs vinculadas" ("Cada item é uma necessidade de uma ONG participante. Doe direto para a ONG que precisa. Mostrando 6 de 18."): tabela com Item, ONG, Pedido, Recebido, Prioridade (selo) e Ação "Quero doar" (leva à tela 05). Só entram necessidades com vínculo aceito. Linhas: Água potável, Lar Esperança, 200 L, 120 L, Urgente; Leite em pó, Casa da Criança, 20 latas, 0 latas, Urgente; Cestas básicas, Casa da Criança, 80 un., 52 un., Normal; Fraldas G, Abrigo Sol, 40 pct., 15 pct., Normal; Água mineral 1,5 L, Abrigo Sol, 60 pct., 30 pct., Normal; Sabonete, Lar Esperança, 100 un., 45 un., Normal.
- Meta total = metas gerais + necessidades vinculadas marcadas como "aumenta a meta". O andamento é o que já foi recebido (nas metas e nas necessidades vinculadas) dividido pela meta total.

### 18. Registrar doação para a campanha, nova
- Aberta por "Doar para esta meta", na tela 15. Cabeçalho do doador.
- Breadcrumb "Início > Campanha > Doar para a campanha", título "Registrar intenção de doação" e "Doação para a campanha · Passo 1 de 2: dados da doação → Passo 2: confirmação".
- Formulário: Campanha selecionada (bloqueado, "Enchente em Vila Velha (Vila Velha e Cariacica)"), Meta* (lista, "Água potável"), Quantidade* com "Faltam 330", Descrição / observação, Forma de entrega* (somente "Vou levar até o endereço da campanha", com a nota "Doações para campanhas só aceitam entrega no endereço de recebimento."), Data prevista de entrega* com apoio "Horário de recebimento: seg a sex, 8h às 17h" e "* Campos obrigatórios".
- Botões "Cancelar" e "Confirmar doação". Coluna lateral "Resumo da sua doação" (Campanha, Meta, Entrega, Endereço, Quem recebe) e a nota "Após confirmar, quem criou a campanha será avisado. Acompanhe em Minhas doações."

## ONG (menu: Painel, Necessidades, Doações recebidas, Perfil da ONG)

### 07. Painel da ONG, wireframe 07
- "Olá, Mariana! Painel do Lar Esperança" e "Perfil 80% completo · Complete para aumentar a confiança dos doadores".
- 3 cards de resumo: 6 Necessidades cadastradas (Gerenciar), 3 Doações pendentes (Ver pendentes), 14 Recebidas no mês (Ver histórico).
- Ações rápidas: "+ Cadastrar necessidade", "Gerenciar necessidades", "Ver doações recebidas", "Solicitar campanha" (leva à tela 16) e "Editar perfil da ONG".
- Tabela de últimas doações (Data, Doador, Item, Qtd., Status): 05/10 Lucas S. Cobertores de casal 5 un. Oferecida; 04/10 Ana P. Fraldas G 6 pct. Oferecida; 03/10 João M. Leite integral 12 L Aceita; 01/10 Carla R. Sabonete 20 un. Recebida.
- Card com 3 barras de progresso: Cobertores de casal 20 de 50, Fraldas geriátricas G 10 de 40, Leite integral 0 de 60 L.
- Card "Campanhas solicitadas" na coluna lateral, com o nome e o selo de situação: Seca em Linhares (Pendente) e Enchente em Vila Velha (Ativa).
- "Pedidos de vínculo às suas campanhas": outras ONGs querem incluir necessidades nas campanhas que a ONG criou. Tabela com Necessidade, ONG, Categoria, Quantidade, Pedido em e Ações ("Aceitar", "Recusar"). Linhas: Fraldas infantis M, Casa da Criança, Higiene, 60 pct., 04/10; Água mineral 1,5 L, Abrigo Sol, Água, 60 pct., 03/10.
- Diálogo "Aceitar necessidade na campanha?", exibido ao clicar em "Aceitar": "'Fraldas infantis M' (60 pct.), da Casa da Criança, entra na campanha 'Enchente em Vila Velha'. Decida se a quantidade aumenta a meta." Radios "Sim, aumenta a meta em 60 itens (de 3.000 para 3.060)" e "Não, ajuda a cumprir a meta já declarada". Botões Cancelar e "Aceitar necessidade".

### 08. Gerenciar necessidades (CRUD), wireframe 08
- Breadcrumb "Painel > Necessidades", título "Gerenciar necessidades" e botão primário "+ Nova necessidade".
- Busca "Buscar item", seletores "Categoria: Todas", "Prioridade: Todas", "Situação: Ativas".
- Tabela: Item, Categoria, Quantidade, Prometido, Prioridade, Campanhas, Atualizado em e Ações (Editar, Concluir, Excluir). A coluna Campanhas mostra o nome da campanha vinculada, "(aguardando)" quando o pedido ainda não foi aceito, ou "—". As ações são links de texto sem ícone, cada um com sua cor: "Editar" em primary, "Concluir" em success-action (verde mais vivo, #2E7D32) e "Excluir" em danger. "Concluir" marca a necessidade como concluída direto na linha, sem passar pelo diálogo. Linhas: Cobertores de casal 50/20 URGENTE, sem campanha; Fraldas geriátricas G 40/10 URGENTE, Enchente em Vila Velha; Leite integral 60/0 URGENTE, Enchente em Vila Velha (aguardando); Sabonete 100/45 Normal, Enchente em Vila Velha; Agasalhos tam. M/G 30/5 Normal, sem campanha; Arroz 5 kg 20/18 Normal, sem campanha. A ONG vê aqui as necessidades que o administrador ou o criador de uma campanha vincularam e pode desvincular editando.
- Diálogo de confirmação "Excluir necessidade?": "'Arroz 5 kg' tem 18 pacotes prometidos por doadores. Eles serão avisados. Você pode marcar como concluída em vez de excluir." Botões: Cancelar, Marcar concluída, Excluir (perigo). O diálogo é um caminho alternativo ao "Concluir" da linha, oferecido quando a ONG tenta excluir um item com doações prometidas.

### 09. Doações recebidas, wireframe 09
- Breadcrumb "Painel > Doações recebidas", título "Doações oferecidas à ONG".
- Abas: Pendentes (3), Aceitas (1), Recebidas (14), Recusadas (0), seletor "Origem: Todas" (Minhas necessidades ou campanhas criadas pela ONG) e busca "Buscar doador ou item".
- Tabela: Data, Doador, Item, Qtd., Entrega, Data prevista, Origem, Status e Ações. Linhas: 05/10 Lucas S. Cobertores de casal 5 un. Leva até a ONG 15/10 Minhas necessidades Oferecida (Aceitar, Recusar); 04/10 Ana P. Fraldas G 6 pct. Retirada 12/10 Minhas necessidades Oferecida (Aceitar, Recusar); 02/10 Paulo L. Água potável (meta) 10 un. Leva até a campanha 09/10 Campanha: Enchente em Vila Velha Oferecida (Aceitar, Recusar); 03/10 João M. Leite integral 12 L Leva até a ONG 08/10 Minhas necessidades Aceita (Confirmar recebimento). A ONG confirma aqui as doações às metas das campanhas que criou.
- Detalhe da doação selecionada: "Quantidade: 5 un. · Entrega na ONG em 15/10/2026", observação do doador, contato, campo "Mensagem ao doador (opcional)" e botões "Recusar" e "Aceitar doação".
- Card "Como funciona" com 3 passos e "Ao confirmar, o doador recebe uma notificação."

### 10. Cadastrar necessidade (CRUD), wireframe 10
- Breadcrumb "Painel > Necessidades > Nova necessidade", título "Cadastrar necessidade". A mesma tela serve para editar, com o título "Editar necessidade".
- Formulário: Nome do item* ("Ex.: Cobertor de casal"), Categoria* (lista fixa: Alimentos, Roupas, Calçados, Higiene, Cobertores, Material escolar, Móveis e Água), Quantidade* e unidade (lista: un., pct., L, latas, kg...; a unidade diz o que a quantidade mede), Prioridade* (radios "Normal" e "Urgente (destacada para os doadores)"), "Pedir vínculo a campanhas" (opcional), Descrição / especificações, Precisa até (data) e "* Campos obrigatórios".
- Botões: "Cancelar" e "Salvar necessidade".
- "Pedir vínculo a campanhas": lista com caixas de seleção das campanhas ativas que pedem a categoria do item (mesma categoria de alguma meta). Exemplo: "Deslizamento em Cariacica · pede cobertores · até 08/01/2027". Texto de apoio: "Só aparecem campanhas ativas que pedem a categoria deste item. Quem criou a campanha decide se aceita o pedido e se a necessidade aumenta a meta." Rodapé "1 pedido será enviado ao salvar". O pedido fica pendente até o criador aceitar.
- Coluna lateral: pré-visualização "Cobertor de casal · Cobertores · 50 unidades · URGENTE · Campanha: Deslizamento em Cariacica (aguardando aceite)" com botão "Quero doar", e a dica "Itens urgentes aparecem no topo da busca e na tela inicial dos doadores."

### 16. Solicitar campanha, nova
- Aberta por "Solicitar campanha", na tela 07. Cabeçalho da ONG. Breadcrumb "Painel > Solicitar campanha", título "Solicitar campanha emergencial" e "O administrador analisa o pedido antes de a campanha aparecer para os doadores."
- Página de formulário, dividida em seções:
  - Dados da campanha: Título*, Tipo* e Cidades afetadas* (seleção múltipla, "Escolha uma ou mais cidades"), Data de início* e Data de fim*, Descrição*.
  - Metas da campanha: "Informe o que a campanha quer arrecadar. Cada meta tem quantidade, categoria e o item em texto. A meta não pertence a uma ONG e recebe doações diretas." Lista das metas já adicionadas (1.500 · Água · água potável; 800 · Alimentos · alimentos não perecíveis; 700 · Higiene · itens de higiene), cada uma com "Remover", e a linha de nova meta com Quantidade, Categoria, Item e "+ Adicionar meta".
  - Onde receber as doações: radios "Usar o endereço da ONG" e "Informar outro endereço", campos Endereço de recebimento* e Horário de recebimento.
  - Necessidades da campanha: seção "Necessidades vinculadas", igual para ONG e administrador. É um buscador geral: busca "Buscar necessidade ou ONG", filtros ONG, Categoria, Prioridade e Cidade, e a lista de necessidades de qualquer ONG, só das categorias que a campanha pede, cada uma com caixa de seleção e a opção "Aumenta a meta". Acima da lista, "Aumentar a meta com as selecionadas": radios "Todas", "Nenhuma" e "Escolher uma a uma" (a opção geral vale para todas e a individual deixa marcar linha a linha). Rodapé com o resumo e, na tela da ONG, "+ Cadastrar nova necessidade". Quem cria a campanha vincula direto e o vínculo entra aceito; a ONG dona da necessidade vê a marca na tela 08 e pode desvincular.
- Botões "Cancelar" e "Enviar para aprovação". A campanha nasce com situação "Pendente".
- Coluna lateral: card "Meta da campanha" (Metas gerais 1.500 + 800 + 700 = 3.000, Necessidades que aumentam a meta + 20, Meta total 3.020 itens, e a fórmula) e alerta "Aguardando aprovação".

## Administrador (menu: Painel, Aprovações, Campanhas, Usuários)

As telas 11 a 14, 17 e 19 são novas e seguem os mesmos componentes das demais. Os 3 relatórios do painel (tela 11) são os mesmos indicadores do relatório de Banco de Dados.

### 11. Painel e relatórios
- "Olá, Administrador! Painel da plataforma" e subtítulo "Resumo e relatórios dos últimos 6 meses".
- 4 cards de resumo: 300 ONGs cadastradas (Ver usuários), 5 ONGs aguardando aprovação (Ver aprovações), 2 campanhas pendentes (Analisar), 48 doações recebidas no mês.
- Relatório "Doações recebidas por mês": gráfico de barras de junho a novembro de 2026 (31, 36, 29, 41, 44, 48), com o valor sobre cada barra.
- Tabela "Aguardando análise" com 4 itens recentes (ONG ou campanha, data, ação "Analisar").
- Relatório "Demanda por categoria e prioridade": tabela com itens recebidos de itens solicitados, em Urgente e Normal, e o percentual atendido por categoria.
- Relatório "Média mensal por categoria": barras de progresso por categoria (Alimentos 14,0; Roupas 8,7; Higiene 6,3...) e "Média geral: 38,2 doações por mês".

### 12. Aprovação de ONGs e campanhas
- Breadcrumb "Painel > Aprovações", título "Aprovação de ONGs e campanhas".
- Abas: ONGs pendentes (5), Campanhas pendentes (2) e Vínculos pendentes (3). As campanhas pendentes são as solicitadas por ONGs; "Aprovar" torna a campanha ativa.
- Tabela de ONGs: Nome, CNPJ, Cidade, Cadastrada em, Ações ("Aprovar", "Recusar"). Exemplos: Projeto Recomeço, Associação Mãos Amigas, Casa Girassol.
- Detalhe da ONG selecionada (descrição, endereço, contato, representante) e botões "Recusar" e "Aprovar ONG".
- Alerta de sucesso ao aprovar: "ONG aprovada! Ela já aparece com o selo 'ONG verificada'."
- Aba Vínculos pendentes: pedidos de vínculo às campanhas criadas pela administração. Tabela com Necessidade, ONG, Campanha, Categoria, Quantidade, Pedido em e Ações ("Aceitar", "Recusar"). A administração aceita e decide se a necessidade aumenta a meta (mesmo diálogo da tela 07). Também pode recusar ou remover qualquer vínculo (moderação).

### 13. Campanhas emergenciais
- Quem cria: a ONG solicita pelo painel dela (tela 16) e a campanha nasce pendente; o administrador também pode criar direto (tela 17), e ela já nasce ativa. Só campanhas ativas aparecem para os doadores.
- Breadcrumb "Painel > Campanhas", título "Campanhas emergenciais" e botão primário "+ Nova campanha" (leva à tela 17).
- Abas com contador: Todas (24), Ativas (6), Pendentes (2), Encerradas (16). Busca "Buscar campanha ou cidade" e seletor "Tipo: Todos".
- Tabela: Campanha, Criada por (nome da ONG ou "Administração"), Tipo, Cidades (ex.: "Vila Velha, Cariacica"), Progresso (ex.: "65% · meta 3.000"), Período, Situação (selo Ativa, Pendente ou Encerrada) e Ações ("Editar", que leva à tela 17, e "Encerrar" nas ativas; "Editar" e "Analisar" nas pendentes; "Reabrir" nas encerradas; "Ver doações", que leva à tela 19, nas campanhas criadas pela administração). "Analisar" leva à tela 12.
- Diálogo "Encerrar campanha?": "A campanha deixa de aparecer para os doadores. As doações já registradas continuam valendo." Botões Cancelar e Encerrar campanha (perigo).

### 14. Usuários
- Breadcrumb "Painel > Usuários", título "Usuários da plataforma" e subtítulo "Doadores, ONGs e administradores cadastrados. Bloqueie quem descumprir as regras de uso."
- Abas com contador: Todos (5.000), Doadores (4.697), ONGs (300), Administradores (3). Busca "Buscar por nome ou e-mail" e seletor "Situação: Todas".
- Tabela: Nome, E-mail, Perfil, Cidade, Cadastro, Situação (selo Ativo ou Bloqueado) e Ação ("Bloquear" ou "Desbloquear"; administradores não têm ação).
- Diálogo "Bloquear usuário?": "O usuário não poderá entrar nem registrar doações. Você pode desbloquear o acesso depois." Botões Cancelar e Bloquear usuário (perigo).

### 17. Nova campanha, nova
- Aberta por "+ Nova campanha" ou "Editar", na tela 13. Cabeçalho do administrador. Breadcrumb "Painel > Campanhas > Nova campanha", título "Nova campanha" e "A campanha criada aqui já fica ativa para os doadores. A mesma tela serve para editar."
- Mesmas seções da tela 16, com uma diferença: o endereço de recebimento é digitado ("Informe o endereço que foi passado à administração"). O buscador de necessidades é o mesmo; na tela do administrador não há "+ Cadastrar nova necessidade".
- Botões "Cancelar" e "Criar campanha". Coluna lateral com o card "Meta da campanha" e o alerta "Campanha ativa na hora".

### 19. Doações das campanhas, nova
- Aberta por "Ver doações", na tela 13. Cabeçalho do administrador. Breadcrumb "Painel > Campanhas > Doações", título "Doações das campanhas" e "Doações para as metas das campanhas criadas pela administração. A entrega é no endereço de recebimento informado na criação."
- Abas: Pendentes (2), Aceitas (1), Recebidas (38), Recusadas (1); busca "Buscar doador ou item" e seletor "Campanha: Todas".
- Tabela: Data, Campanha, Doador, Meta, Qtd., Data prevista, Status e Ações ("Aceitar", "Recusar", "Confirmar recebimento").
- Detalhe da doação selecionada (Meta, Quantidade, Endereço, Contato), campo "Mensagem ao doador (opcional)" e botões "Recusar" e "Aceitar doação". Card "Como funciona" com 3 passos e a nota de que as doações das campanhas criadas por uma ONG ficam na tela 09 dela.

## Telas extras (20 a 25)

Existem no site e não têm wireframe original. Usam os mesmos componentes e tokens das demais e são "Tela nova" no Figma.

### 20. Criar conta (`criar-conta.html`)
- Cabeçalho do visitante. Card central de 620 px, título "Criar conta" e "Cadastre-se para doar ou para divulgar as necessidades da sua ONG."
- Radios "Sou Doador" e "Represento uma ONG" (o login abre a tela já com o tipo escolhido).
- Seção "Seus dados" (para a ONG, "Dados do representante"): Nome completo*, E-mail*, Telefone, Cidade*, Senha* (apoio "Use pelo menos 6 caracteres.") e Confirmar senha*.
- Seção "Dados da ONG", só para "Represento uma ONG": Nome da ONG*, CNPJ*, Descrição*, Endereço*, Horário de atendimento, Telefone da ONG, E-mail de contato da ONG e a caixa "Aceita retirada das doações no endereço do doador". Apoio: "Depois do cadastro, o administrador verifica a ONG. Até lá, ela ainda não cadastra necessidades."
- Botões "Já tenho conta" (discreto, volta ao login) e "Criar conta" (primário). Erros embaixo de cada campo (e-mail ou CNPJ já cadastrado, confirmação de senha diferente).
- Doador entra na hora na tela 02; ONG entra na tela 07 com o aviso "Sua ONG ainda não foi verificada".

### 21. Esqueci minha senha (`esqueci-senha.html`)
- Card central de 460 px: título, "Informe o e-mail da sua conta para receber as instruções de recuperação.", campo E-mail* e botão primário "Enviar instruções".
- Depois de enviar, alerta de informação "Pedido recebido." com a nota de que o site é uma demonstração e nenhum e-mail é enviado. A resposta é a mesma exista ou não a conta. Link "Voltar para a entrada".

### 22. Ajuda (`ajuda.html`)
- Aberta pelo link "Ajuda" do cabeçalho. Título "Ajuda" e "Respostas rápidas para as dúvidas mais comuns sobre o Conecta Doações."
- Grupos de perguntas que abrem e fecham (cartão pequeno com chevron): "Para quem quer doar" (como registrar, campanhas, status, retirada), "Para ONGs" (selo de verificada, cadastrar necessidade, solicitar campanha, meta da campanha) e "Sobre esta demonstração" ("O que é 'Restaurar dados de exemplo'?" e "O que eu faço aparece para outras pessoas?").
- Card final "Contas de teste deste site" com os três perfis de teste.

### 23. Perfil do doador (`perfil.html`, menu "Perfil")
- Breadcrumb "Início > Perfil", título "Meu perfil".
- Card "Meus dados": Nome completo*, E-mail de acesso (bloqueado), Telefone, Cidade*, botão primário "Salvar perfil". Coluna lateral: card "Alterar senha" (Senha atual, Nova senha, Confirmar nova senha e botão secundário "Alterar senha").

### 24. Perfil da ONG (`perfil.html`, menu "Perfil da ONG")
- Breadcrumb "Painel > Perfil da ONG", título "Perfil da ONG" e o selo "ONG verificada" (ou "Aguardando verificação").
- Card "Dados da ONG": Nome e CNPJ (bloqueados, "só mudam com a ajuda da administração"), Descrição*, Cidade*, Endereço*, Horário de atendimento, Telefone, E-mail de contato, caixa "Aceita retirada..." e botão "Salvar perfil".
- Coluna lateral: card "Representante" (Nome*, E-mail de acesso bloqueado, botão secundário "Salvar representante") e card "Alterar senha". É o destino do "Editar perfil da ONG" da tela 07.

### 25. Campanhas ativas (`campanhas-ativas.html`, menu "Campanhas" do visitante)
- Breadcrumb "Início > Campanhas", título "Campanhas emergenciais" e "Campanhas ativas para enchentes, deslizamentos, secas e incêndios. Cada uma tem metas e necessidades de ONGs participantes."
- Cards de campanha em accent-soft, dois por linha: selo EMERGÊNCIA, título, descrição, cidades e tipo, prazo, barra de progresso e botão "Ver campanha" (tela 15).

## Padrões comuns

- **Estados vazios ensinam o próximo passo.** Minhas doações sem nenhuma doação: "Você ainda não registrou doações." com o link "Ver ONGs que precisam de ajuda". Gerenciar necessidades sem nenhuma: "Você ainda não cadastrou necessidades." com o link "Cadastrar a primeira necessidade". Doações recebidas, aba Pendentes: explica que a doação aparece ali quando um doador registrar. Busca sem resultado diz como limpar os filtros.
- **Cartões só onde há função**: formulários, colunas laterais, resumos, campanha em destaque e cards de ONG. Tabelas, listas e relatórios ficam planos, com título e filete. Tabela dentro de cartão não tem borda própria.
- **A página aparece completa**: cabeçalho, conteúdo e rodapé surgem juntos depois de montados, sem "pulo" de layout.

## Fluxos que o protótipo deve ligar

- Doador: 01 Entrar → 02 Início → (15 Campanha, pelo botão "Ver campanha" → 18 Registrar doação para a campanha) → 03 ONGs → 04 Perfil da ONG → 05 Registrar doação → 06 Minhas doações. A tela 15 também leva à 05, por "Quero doar".
- ONG: 01 Entrar → 07 Painel → 08 Gerenciar necessidades → 10 Cadastrar necessidade → 08. De 07 também para 09 Doações recebidas e para 16 Solicitar campanha, cujo pedido chega ao administrador (12 e 13). Na 07 a ONG aceita ou recusa os pedidos de vínculo às campanhas que criou.
- Administrador: 01 Entrar → 11 Painel → 12 Aprovações → 13 Campanhas (→ 17 Nova campanha, 19 Doações das campanhas) → 14 Usuários. O menu liga as telas 11 a 14.
- Público: 00 Apresentação → 01 Entrar ou 03 ONGs como visitante. De 01 também para 20 Criar conta e 21 Esqueci minha senha; o menu "Campanhas" leva à 25, que leva à 15; o link "Ajuda" do cabeçalho de qualquer tela leva à 22.
- Perfis: menu "Perfil" do doador → 23; menu "Perfil da ONG" e o "Editar perfil da ONG" da tela 07 → 24.
