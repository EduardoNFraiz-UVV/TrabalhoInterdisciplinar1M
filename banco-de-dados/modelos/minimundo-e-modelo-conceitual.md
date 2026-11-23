# Minimundo e especificação do modelo conceitual

As regras de negócio completas estão em `documentos/regras-de-negocio.md`. Este arquivo descreve os dados e serve de base para desenhar os modelos.

## Minimundo

A plataforma **Conecta Doações** aproxima pessoas que querem doar de ONGs e campanhas que precisam de doações.

Qualquer pessoa que usa a plataforma é um **usuário**, com nome, e-mail, senha, telefone, cidade e data de cadastro. O administrador pode bloquear o acesso de um usuário, que fica marcado como inativo. Cada usuário tem um **perfil**: doador, representante de ONG ou administrador. As cidades são cadastradas com nome e UF, em uma lista fixa carregada no banco.

Cada **ONG** é cadastrada por um usuário de perfil ONG, que é o seu representante. A ONG tem nome, CNPJ, descrição, endereço, cidade, horário de atendimento, telefone e e-mail de contato. Ela informa se aceita retirada das doações no endereço do doador. O administrador confirma a ONG, que passa a ter o selo "ONG verificada".

A ONG cadastra suas **necessidades**: itens de que precisa em certa quantidade e unidade (por exemplo, 50 unidades de cobertor de casal). Cada necessidade pertence a uma **categoria** (alimentos, roupas, calçados, higiene, cobertores, material escolar, móveis e água, uma lista fixa carregada no banco) e tem prioridade normal ou urgente, uma data limite e uma situação (ativa ou concluída).

As **campanhas emergenciais**, relacionadas a enchentes, deslizamentos, secas, incêndios e outros desastres, podem ser solicitadas por uma ONG ou criadas diretamente pelo administrador. A campanha solicitada por uma ONG nasce pendente e só aparece para os doadores depois de aprovada pelo administrador. A campanha tem título, descrição, tipo, período, status (pendente, ativa ou encerrada) e um endereço de recebimento, com horário, informado por quem a criou. Ela pode atingir **uma ou mais cidades**.

Cada campanha define **metas gerais**, que seguem o padrão de uma necessidade, mas sem ONG dona: cada meta tem categoria, item em texto, quantidade e unidade (por exemplo, 1.500 un. de itens de higiene). Além das metas, a campanha reúne **necessidades** de ONGs. Uma necessidade pode participar de várias campanhas, e uma campanha reúne várias necessidades. A ONG pede o vínculo de uma necessidade dela e só pode fazê-lo se a categoria for a mesma de alguma meta da campanha. Quem criou a campanha aceita ou recusa o pedido e decide se a necessidade **aumenta a meta**. O administrador modera os vínculos. A meta total é a soma das metas gerais mais as necessidades vinculadas que aumentam a meta, e o andamento é quanto já foi recebido.

O doador pesquisa as necessidades e registra uma **doação**. A doação tem um único destino: uma necessidade de ONG, com entrega no endereço da ONG, ou uma meta geral de campanha, com entrega no endereço de recebimento da campanha. O doador informa a quantidade, uma observação, a forma de entrega (levar ou, nas necessidades de ONGs que aceitam, solicitar retirada informando o endereço) e a data prevista. Quem recebe (a ONG, ou quem criou a campanha) aceita ou recusa a doação e, quando o item chega, confirma o recebimento. O doador pode cancelar enquanto ela está oferecida. O status da doação segue Oferecida, Aceita e Recebida, e também pode ser Recusada ou Cancelada.

## Entidades e atributos

| Entidade | Atributos (chave em negrito) |
|---|---|
| Cidade | **id_cidade**, nome, uf |
| Categoria | **id_categoria**, nome |
| Usuário | **id_usuario**, nome, email, senha_hash, telefone, perfil, data_cadastro, ativo |
| ONG | **id_ong**, nome, cnpj, descricao, endereco, horario_atendimento, telefone, email_contato, aceita_retirada, verificada, data_cadastro |
| Campanha | **id_campanha**, titulo, descricao, tipo, data_inicio, data_fim, status, endereco_recebimento, horario_recebimento |
| Meta | **id_meta**, item, quantidade, unidade |
| Necessidade | **id_necessidade**, item, descricao, quantidade, unidade, prioridade, precisa_ate, situacao, data_cadastro, data_atualizacao |
| Doação | **id_doacao**, quantidade, observacao, forma_entrega, endereco_retirada, data_prevista, data_registro, data_recebimento, status, mensagem_ong |

O relacionamento **reúne** (Campanha e Necessidade) tem atributos próprios: status do vínculo (pendente, aceito ou recusado), aumenta_meta e data_pedido.

## Relacionamentos e cardinalidades

Leitura: **A (mín,máx) verbo B (mín,máx)** quer dizer que cada A se liga a no mínimo "mín" e no máximo "máx" B, e vice-versa.

| Nº | Relacionamento | Entidades | Cardinalidade | Regra |
|---|---|---|---|---|
| 1 | mora em | Usuário — Cidade | N:1 | Todo usuário mora em exatamente uma cidade. Uma cidade tem zero ou vários usuários. |
| 2 | representa | Usuário — ONG | 1:1 | Cada ONG tem exatamente um representante. Um usuário representa no máximo uma ONG. |
| 3 | fica em | ONG — Cidade | N:1 | Toda ONG fica em exatamente uma cidade. Uma cidade tem zero ou várias ONGs. |
| 4 | atinge | Campanha — Cidade | N:N | Toda campanha atinge pelo menos uma cidade. Uma cidade pode ter zero ou várias campanhas. |
| 5 | solicita | ONG — Campanha | 1:N (opcional) | Uma campanha tem no máximo uma ONG solicitante (nenhuma se foi criada pelo administrador). Uma ONG solicita zero ou várias campanhas. |
| 6 | define | Campanha — Meta | 1:N | Toda meta pertence a exatamente uma campanha. Uma campanha tem zero ou várias metas. |
| 7 | enquadra | Categoria — Meta | 1:N | Toda meta tem exatamente uma categoria. Uma categoria tem zero ou várias metas. |
| 8 | cadastra | ONG — Necessidade | 1:N | Toda necessidade é de exatamente uma ONG. Uma ONG cadastra zero ou várias necessidades. |
| 9 | classifica | Categoria — Necessidade | 1:N | Toda necessidade tem exatamente uma categoria. Uma categoria tem zero ou várias necessidades. |
| 10 | reúne | Campanha — Necessidade | N:N | Uma campanha reúne zero ou várias necessidades. Uma necessidade participa de zero ou várias campanhas. |
| 11 | realiza | Usuário (doador) — Doação | 1:N | Toda doação é feita por exatamente um doador. Um doador faz zero ou várias doações. |
| 12 | atende | Necessidade — Doação | 1:N (opcional) | Uma doação atende no máximo uma necessidade. Uma necessidade recebe zero ou várias doações. |
| 13 | recebe | Meta — Doação | 1:N (opcional) | Uma doação é destinada a no máximo uma meta. Uma meta recebe zero ou várias doações. |

Os relacionamentos 12 e 13 são **exclusivos**: toda doação tem exatamente um dos dois destinos (necessidade ou meta). A ONG de uma doação para necessidade é obtida pela necessidade escolhida, e por isso não existe ligação direta entre Doação e ONG.

## Passos no brModelo (modelo conceitual)

1. Criar as 8 entidades da tabela acima, com seus atributos. Marcar o identificador de cada uma como chave.
2. Criar os 13 relacionamentos e informar as cardinalidades mínimas e máximas:
   - Usuário (1,1) mora em Cidade (0,N).
   - Usuário (0,1) representa ONG (1,1).
   - ONG (1,1) fica em Cidade (0,N).
   - Campanha (1,N) atinge Cidade (0,N).
   - ONG (0,N) solicita Campanha (0,1).
   - Campanha (0,N) define Meta (1,1).
   - Categoria (0,N) enquadra Meta (1,1).
   - ONG (1,1) cadastra Necessidade (0,N).
   - Categoria (1,1) classifica Necessidade (0,N).
   - Campanha (0,N) reúne Necessidade (0,N), com os atributos status, aumenta_meta e data_pedido no relacionamento.
   - Usuário (1,1) realiza Doação (0,N).
   - Necessidade (0,N) atende Doação (0,1).
   - Meta (0,N) recebe Doação (0,1).
3. Anotar no diagrama que "atende" e "recebe" são exclusivos (toda doação tem exatamente um deles).
4. Exportar o modelo como imagem e salvar em `banco-de-dados/modelos/modelo-conceitual.png`.

## Do conceitual para o lógico

Os dois relacionamentos N:N viram tabelas: `campanha_cidade` (atinge) e `campanha_necessidade` (reúne, com status, aumenta_meta e data_pedido). As outras entidades viram uma tabela cada, e as ligações 1:N viram chave estrangeira do lado N. A regra de destino exclusivo da doação vira o `CHECK ck_doacao_destino`. No total são 10 tabelas.

## Passos no DrawSQL (modelo lógico)

1. Criar um diagrama novo para PostgreSQL.
2. Usar a função de importar de SQL e colar o conteúdo de `banco-de-dados/sql/ddl.sql`.
3. Ajustar a disposição das tabelas e exportar como imagem em `banco-de-dados/modelos/modelo-logico.png`.

## Imagens atuais

Os arquivos `modelo-conceitual.png` e `modelo-logico.png`, nesta pasta, já mostram o estado atual do banco, inclusive o atributo `unidade` na Meta (tabela `campanha_meta`). Foram desenhados a partir do `ddl.sql` e das tabelas deste documento. Se o grupo preferir usar as imagens exportadas do brModelo e do DrawSQL, basta salvá-las com os mesmos nomes.
