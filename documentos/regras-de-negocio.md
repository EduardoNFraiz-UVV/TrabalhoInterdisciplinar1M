# Regras de negócio

Fonte única das regras do Conecta Doações. O minimundo (`banco-de-dados/modelos/minimundo-e-modelo-conceitual.md`) descreve os dados, a especificação das telas (`uiux/especificacao-das-telas.md`) descreve o comportamento de cada tela, e este arquivo junta o que vale para o sistema todo.

A coluna **Onde** diz quem garante a regra: **Banco** (restrição, chave ou `CHECK` do `ddl.sql`), **Site** (validação ou fluxo em JavaScript) ou **Derivado** (calculado a partir de outros dados).

## 1. Perfis e acesso

| Nº | Regra | Onde |
|---|---|---|
| RN-01 | Existem 3 perfis: doador, ong e admin, guardados em `usuario.perfil`. | Banco |
| RN-02 | O login é feito em JavaScript, no campo "E-mail ou usuário" e senha. Credenciais: `doador / doa#2026`, `entidade / ent!2026` e `admin / adm@2026`. O perfil define o menu e as telas; página protegida sem login volta para a tela de entrada. | Site |
| RN-03 | O visitante (sem login) vê a apresentação, a lista de ONGs, o perfil de cada ONG e as campanhas ativas, mas não registra doação. | Site |
| RN-04 | O administrador pode bloquear e desbloquear qualquer usuário que não seja administrador. Usuário bloqueado (`ativo = FALSE`) não entra nem registra doações. | Banco e Site |
| RN-05 | Todo usuário mora em uma cidade da lista de cidades e tem e-mail único. | Banco |

## 2. ONGs

| Nº | Regra | Onde |
|---|---|---|
| RN-06 | Toda ONG tem exatamente um representante, que é um usuário de perfil ong. Um usuário representa no máximo uma ONG. | Banco (chave única) e Site (perfil) |
| RN-07 | Toda ONG fica em uma cidade, tem CNPJ único e informa se aceita retirada das doações no endereço do doador. | Banco |
| RN-08 | A ONG nasce não verificada. O administrador aprova e ela recebe o selo "ONG verificada" (`verificada`). | Banco e Site |
| RN-09 | ONG ainda não verificada não cadastra necessidades nem solicita campanhas. | Site |

## 3. Necessidades

| Nº | Regra | Onde |
|---|---|---|
| RN-10 | Toda necessidade pertence a uma ONG e a uma categoria. | Banco |
| RN-11 | As categorias são uma lista fixa de 8 (Alimentos, Roupas, Calçados, Higiene, Cobertores, Material escolar, Móveis e Água), carregada pelo banco. Ninguém cria categoria pela plataforma. | Banco |
| RN-12 | A quantidade é maior que zero e a unidade é um texto curto escolhido de uma lista (un., pct., L, latas, kg...). A unidade diz o que a quantidade mede. | Banco e Site |
| RN-13 | A prioridade é normal ou urgente. Itens urgentes aparecem no topo das buscas e na tela inicial dos doadores. | Banco e Site |
| RN-14 | A situação é ativa ou concluída. "Concluir" marca a necessidade como concluída direto na linha. Necessidade concluída não recebe doação nova. | Banco e Site |
| RN-15 | Ao excluir uma necessidade com doações prometidas (oferecidas ou aceitas), os doadores são avisados e o sistema oferece "Marcar concluída" como alternativa. | Site |
| RN-16 | "Prometido" é a soma das quantidades das doações oferecidas, aceitas e recebidas da necessidade. "Faltam" é a quantidade menos o prometido. | Derivado |

## 4. Campanhas

| Nº | Regra | Onde |
|---|---|---|
| RN-17 | O tipo da campanha é enchente, deslizamento, seca, incêndio ou outro. O status é pendente, ativa ou encerrada. A data de fim não pode ser anterior à de início. | Banco |
| RN-18 | Quem cria: a ONG solicita pelo painel dela e a campanha nasce **pendente**, com a ONG solicitante registrada. O administrador também cria e a campanha já nasce **ativa**, sem ONG solicitante. | Banco (`id_ong` opcional) e Site |
| RN-19 | O administrador aprova (pendente vira ativa) ou recusa as campanhas solicitadas, e pode encerrar e reabrir qualquer campanha. | Site |
| RN-20 | Só campanhas ativas aparecem para doadores e visitantes e recebem vínculos e doações. | Site |
| RN-21 | Toda campanha atinge pelo menos uma cidade e pode atingir várias. | Banco (tabela de ligação) e Site (mínimo de uma) |
| RN-22 | Toda campanha tem um endereço de recebimento (e horário opcional), informado por quem a cria. A ONG usa o endereço dela ou informa outro. O administrador digita o endereço que lhe foi passado. | Banco (obrigatório) e Site |
| RN-23 | Ao ser criada, a campanha precisa ter pelo menos uma meta geral ou uma necessidade vinculada. | Site |
| RN-24 | Ao encerrar, a campanha deixa de aparecer para os doadores. As doações já registradas continuam valendo. | Site |

## 5. Metas e progresso

| Nº | Regra | Onde |
|---|---|---|
| RN-25 | Uma meta geral é um par de quantidade e item em texto, com uma categoria. Pertence à campanha e não tem ONG dona. | Banco |
| RN-26 | **Meta total** = soma das metas gerais + soma das quantidades das necessidades vinculadas **aceitas** com "aumenta a meta" marcado. | Derivado |
| RN-27 | **Progresso** = quantidade recebida ÷ meta total, em que a quantidade recebida soma as doações recebidas para as metas gerais da campanha e para as necessidades vinculadas aceitas. Aparece limitado a 100%. Sem meta total, o progresso é 0%. | Derivado |
| RN-28 | As somas tratam as quantidades como "itens", sem converter unidades (litro, pacote, unidade). | Site |

## 6. Vínculos entre necessidades e campanhas

| Nº | Regra | Onde |
|---|---|---|
| RN-29 | Uma necessidade pode participar de várias campanhas, e uma campanha reúne várias necessidades. Cada vínculo guarda status (pendente, aceito, recusado), se aumenta a meta e a data do pedido. | Banco |
| RN-30 | O pedido de vínculo só pode ser enviado se a campanha estiver ativa e a categoria da necessidade for **igual** à de alguma meta da campanha. Campanha sem metas gerais aceita qualquer categoria. | Site |
| RN-31 | A ONG pede o vínculo das próprias necessidades, e o pedido espera o aceite de quem criou a campanha. Quem cria a campanha (ONG ou administrador) e o administrador também podem incluir necessidades de qualquer ONG, buscando por ONG, categoria e outros filtros. Esses vínculos entram aceitos, e a ONG dona vê a marca na tela Gerenciar necessidades e pode desvincular. | Site |
| RN-32 | O vínculo criado por quem criou a campanha ou pelo administrador nasce **aceito**. O pedido de outra ONG nasce **pendente**. | Banco (status) e Site |
| RN-33 | Quem criou a campanha decide, ao aceitar um pedido ou ao incluir necessidades, se a necessidade **aumenta a meta** (sim) ou só ajuda a cumprir a meta já declarada (não). A escolha pode ser geral (todas as selecionadas, ou nenhuma) ou individual, uma a uma. Nas campanhas do administrador, é o administrador quem decide. | Banco (`aumenta_meta`) e Site |
| RN-34 | O administrador modera: pode recusar ou remover qualquer vínculo. A ONG pode desvincular as próprias necessidades. Vínculo recusado ou removido não conta na meta nem no progresso. | Site |

## 7. Doações

| Nº | Regra | Onde |
|---|---|---|
| RN-35 | Toda doação tem exatamente um destino: uma **necessidade** de ONG ou uma **meta geral** de campanha. Doar vários itens gera várias doações. | Banco (`CHECK`) |
| RN-36 | Só o doador registra doação. | Banco (chave) e Site (perfil) |
| RN-37 | Doação para necessidade: entrega no endereço da ONG dona. A forma é "levar" ou "retirada"; retirada só se a ONG aceita retirada e exige o endereço do doador. | Banco (`CHECK`) e Site |
| RN-38 | Doação para meta de campanha: só "levar" ao endereço de recebimento da campanha. Quem criou a campanha (a ONG solicitante ou o administrador) aceita, recusa e confirma o recebimento. | Banco (`CHECK`) e Site |
| RN-39 | A quantidade é maior que zero e não passa do que falta na necessidade. | Banco (> 0) e Site |
| RN-40 | O status segue oferecida → aceita → recebida, ou termina em recusada (por quem recebe) ou cancelada (pelo doador, só enquanto oferecida). | Banco (valores) e Site (fluxo) |
| RN-41 | A data de recebimento existe se, e somente se, a doação está recebida. | Banco (`CHECK`) |
| RN-42 | Quem recebe pode deixar uma mensagem ao doador ao aceitar ou recusar. Campanha pendente ou encerrada não recebe doação nova. | Site |

## 8. Administração e relatórios

| Nº | Regra | Onde |
|---|---|---|
| RN-43 | O administrador aprova ONGs e campanhas, modera vínculos, cria e encerra campanhas e bloqueia usuários. | Site |
| RN-44 | O painel mostra 3 relatórios, iguais às consultas do banco: doações recebidas por mês e categoria; demanda por categoria e prioridade (solicitado x recebido); média mensal por categoria. Só contam doações **recebidas**. A doação para meta entra na categoria da meta. | Banco (consultas) e Site |

## 9. Contas e decisões do site

| Nº | Regra | Onde |
|---|---|---|
| RN-45 | Conta nova: o e-mail é único (RN-05) e, para ONG, o CNPJ também (RN-07); a senha tem pelo menos 6 caracteres e é guardada como hash. O doador entra ativo na hora; a ONG nasce não verificada (RN-08) e não cadastra necessidades nem solicita campanhas até ser aprovada (RN-09). | Banco (únicos) e Site |
| RN-46 | Trocar a senha exige a senha atual. | Site |
| RN-47 | Recusar uma ONG remove o cadastro dela e o usuário que a representa; recusar um pedido de campanha remove o pedido, com suas cidades, metas e vínculos. | Site |
| RN-48 | Uma meta que já recebeu doações não pode ser removida da campanha, porque as doações apontam para ela. | Banco (chave) e Site |
| RN-49 | Excluir uma necessidade que já tem doações recebidas a marca como concluída, para preservar o histórico (refina a RN-15); sem doações recebidas, ela é excluída de verdade, com seus vínculos. | Site |

## Regras assumidas, a confirmar

- "Categoria igual ou parecida" foi tratada como **mesma categoria** (RN-30).
- A ONG não verificada fica impedida de cadastrar necessidades e solicitar campanhas (RN-09).
- A doação para meta só admite entrega no endereço da campanha, sem retirada (RN-38).
- A categoria "Outros" não existe (RN-11).
- Recusar uma ONG ou uma campanha remove o registro, em vez de guardar uma situação "recusada" (RN-47).
- Excluir necessidade com doação já recebida a conclui em vez de apagar (RN-49).

## O que o banco não garante

Estas regras ficam no site: perfil coerente com o papel (representante de ONG com perfil ong, doador com perfil doador), campanha com pelo menos uma cidade e uma meta ou necessidade ao ser criada, categoria compatível no pedido de vínculo, quantidade da doação dentro do que falta e o fluxo completo de status.
