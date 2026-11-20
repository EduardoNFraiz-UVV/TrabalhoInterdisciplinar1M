# Minimundo e especificação do modelo conceitual

## Minimundo

A plataforma **Conecta Doações** aproxima pessoas que querem doar de ONGs e campanhas que precisam de doações.

Qualquer pessoa que usa a plataforma é um **usuário**, com nome, e-mail, senha, telefone, cidade e data de cadastro. O administrador pode bloquear o acesso de um usuário, que fica marcado como inativo. Cada usuário tem um **perfil**: doador, representante de ONG ou administrador. As cidades são cadastradas com nome e UF.

Cada **ONG** é cadastrada por um usuário de perfil ONG, que é o seu representante. A ONG tem nome, CNPJ, descrição, endereço, cidade, horário de atendimento, telefone e e-mail de contato. Ela informa se aceita retirada das doações no endereço do doador. O administrador confirma a ONG, que passa a ter o selo "ONG verificada".

A ONG cadastra suas **necessidades**: itens de que precisa em certa quantidade e unidade (por exemplo, 50 cobertores de casal). Cada necessidade pertence a uma **categoria** (alimentos, roupas, calçados, higiene, cobertores, material escolar, móveis e água) e tem prioridade normal ou urgente, uma data limite e uma situação (ativa ou concluída).

As **campanhas emergenciais**, relacionadas a enchentes, deslizamentos, secas, incêndios e outros desastres, podem ser solicitadas por uma ONG ou criadas diretamente pelo administrador. A campanha solicitada por uma ONG nasce pendente e só aparece para os doadores depois de aprovada pelo administrador. A campanha tem título, descrição, tipo, cidade afetada, período e status (pendente, ativa ou encerrada). Os itens que a campanha pede são as necessidades vinculadas a ela, de uma ou de várias ONGs, e o andamento da campanha é quanto já foi recebido dessas necessidades.

O doador pesquisa as necessidades e registra uma **doação** para uma necessidade, informando a quantidade, uma observação, a forma de entrega (levar até a ONG ou solicitar retirada, informando o endereço) e a data prevista. A ONG aceita ou recusa a doação e, quando o item chega, confirma o recebimento. O doador pode cancelar enquanto ela está oferecida. O status da doação segue Oferecida, Aceita e Recebida, e também pode ser Recusada ou Cancelada.

## Entidades e atributos

| Entidade | Atributos (chave em negrito) |
|---|---|
| Cidade | **id_cidade**, nome, uf |
| Categoria | **id_categoria**, nome |
| Usuário | **id_usuario**, nome, email, senha_hash, telefone, perfil, data_cadastro, ativo |
| ONG | **id_ong**, nome, cnpj, descricao, endereco, horario_atendimento, telefone, email_contato, aceita_retirada, verificada, data_cadastro |
| Campanha | **id_campanha**, titulo, descricao, tipo, data_inicio, data_fim, status |
| Necessidade | **id_necessidade**, item, descricao, quantidade, unidade, prioridade, precisa_ate, situacao, data_cadastro, data_atualizacao |
| Doação | **id_doacao**, quantidade, observacao, forma_entrega, endereco_retirada, data_prevista, data_registro, data_recebimento, status, mensagem_ong |

## Relacionamentos e cardinalidades

| Relacionamento | Entidades | Cardinalidade | Regra |
|---|---|---|---|
| mora em | Usuário — Cidade | N:1 | Todo usuário tem uma cidade. Uma cidade tem vários usuários. |
| representa | Usuário — ONG | 1:1 | Cada ONG tem um representante e cada representante tem uma ONG. |
| fica em | ONG — Cidade | N:1 | Toda ONG fica em uma cidade. |
| atinge | Campanha — Cidade | N:1 | Toda campanha atinge uma cidade. |
| cadastra | ONG — Necessidade | 1:N | Uma ONG cadastra várias necessidades. Cada necessidade é de uma ONG. |
| classifica | Categoria — Necessidade | 1:N | Toda necessidade tem uma categoria. |
| solicita | ONG — Campanha | 1:N (opcional) | Uma ONG pode solicitar várias campanhas. Campanha criada pelo administrador não tem ONG solicitante. |
| mobiliza | Campanha — Necessidade | 1:N (opcional) | Uma necessidade pode ou não estar em uma campanha. |
| realiza | Usuário (doador) — Doação | 1:N | Um doador faz várias doações. |
| atende | Necessidade — Doação | 1:N | Uma necessidade recebe várias doações. |

A ONG de uma doação é obtida pela necessidade escolhida. Por isso não existe ligação direta entre Doação e ONG.

## Passos no brModelo (modelo conceitual)

1. Criar as 7 entidades da tabela acima, com seus atributos. Marcar o identificador de cada uma como chave.
2. Criar os 10 relacionamentos e informar as cardinalidades mínimas e máximas:
   - Usuário (1,1) mora em Cidade (0,N).
   - Usuário (0,1) representa ONG (1,1).
   - ONG (1,1) fica em Cidade (0,N).
   - Campanha (1,1) atinge Cidade (0,N).
   - ONG (1,1) cadastra Necessidade (0,N).
   - Categoria (1,1) classifica Necessidade (0,N).
   - ONG (0,N) solicita Campanha (0,1).
   - Campanha (0,1) mobiliza Necessidade (0,N).
   - Usuário (1,1) realiza Doação (0,N).
   - Necessidade (1,1) atende Doação (0,N).
3. Exportar o modelo como imagem e salvar em `banco-de-dados/modelos/modelo-conceitual.png`.

## Passos no DrawSQL (modelo lógico)

1. Criar um diagrama novo para PostgreSQL.
2. Usar a função de importar de SQL e colar o conteúdo de `banco-de-dados/sql/ddl.sql`.
3. Ajustar a disposição das tabelas e exportar como imagem em `banco-de-dados/modelos/modelo-logico.png`.
