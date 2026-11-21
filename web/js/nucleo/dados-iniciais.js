/*
  dados-iniciais.js
  Para que serve: cria os "dados de exemplo" do site, ou seja, o conteúdo inicial de cada
  tabela do banco (cidade, categoria, usuario, ong, campanha, campanha_cidade, campanha_meta,
  necessidade, campanha_necessidade e doacao), com os MESMOS nomes de tabelas e colunas do
  banco de dados PostgreSQL. Assim o site "conversa" com o modelo de dados do projeto.
  Quem usa: armazenamento.js, quando o navegador ainda não tem dados salvos (ou quando alguém
  clica em "Restaurar dados de exemplo").
  Depende de: formatacao.js (função slug).

  Os registros que aparecem nos wireframes (Lar Esperança, Casa da Criança, "Enchente em Vila
  Velha"...) são escritos à mão. O restante (outros doadores, outras necessidades e as doações
  que alimentam o gráfico do painel) é gerado por regras fixas, sem sorteio verdadeiro: o
  gerador de números abaixo sempre produz a mesma sequência, então os dados são sempre iguais.
*/

import { slug } from '../utilitarios/formatacao.js';

/* Número da versão da carga inicial. Se mudarmos os dados no código, aumentamos este número
   e o navegador de quem já abriu o site descarta os dados antigos e carrega os novos. */
export const VERSAO_DADOS = 1;

/* Senhas guardadas como SHA-256 (hash), como a coluna senha_hash do banco. Nunca guardamos a senha pura.
   doador = doa#2026, entidade = ent!2026, admin = adm@2026; "padrao" é a senha dos demais usuários de exemplo */
const SENHAS = {
  doador: '13479ab6051d7d9af96701224e0e48d1a45bd82c335e2815d2bd6745e5964b52',
  entidade: '38327555793eacb9a7d82cc54649fdd0efa15d67ffa5e420c6175105efe61a89',
  admin: 'bcc82b561f5f03a096feaf6f85dccd7b780f61da8d8b760e81d82db0afedbd91',
  padrao: '24d68a7eb5a4a2dd890639d794c137bdad0eb88aab8cd2669ddb608c288cf71b'
};

/* As 30 cidades do banco (mesma ordem do gerador de dados do banco: o número é o id_cidade) */
const CIDADES = [
  ['Vila Velha', 'ES'], ['Vitória', 'ES'], ['Serra', 'ES'], ['Cariacica', 'ES'], ['Viana', 'ES'],
  ['Guarapari', 'ES'], ['Linhares', 'ES'], ['Colatina', 'ES'], ['Cachoeiro de Itapemirim', 'ES'],
  ['São Mateus', 'ES'], ['Aracruz', 'ES'], ['Nova Venécia', 'ES'], ['Venda Nova do Imigrante', 'ES'],
  ['Domingos Martins', 'ES'], ['Marataízes', 'ES'], ['Anchieta', 'ES'], ['Piúma', 'ES'],
  ['Fundão', 'ES'], ['Santa Teresa', 'ES'], ['Alegre', 'ES'], ['Castelo', 'ES'],
  ['Itapemirim', 'ES'], ['Barra de São Francisco', 'ES'], ['Ecoporanga', 'ES'],
  ['Afonso Cláudio', 'ES'], ['Campos dos Goytacazes', 'RJ'], ['Rio de Janeiro', 'RJ'],
  ['Belo Horizonte', 'MG'], ['Teófilo Otoni', 'MG'], ['Governador Valadares', 'MG']
];

/* As 8 categorias fixas (a posição + 1 é o id_categoria) */
const CATEGORIAS = ['Alimentos', 'Roupas', 'Calçados', 'Higiene', 'Cobertores', 'Material escolar', 'Móveis', 'Água'];

/* Nomes dos ids para o código ficar legível: CAT.agua em vez de 8 */
const CAT = { alimentos: 1, roupas: 2, calcados: 3, higiene: 4, cobertores: 5, escolar: 6, moveis: 7, agua: 8 };

/* Cidades que usamos nos exemplos (id_cidade) */
const CID = { vilaVelha: 1, vitoria: 2, serra: 3, cariacica: 4, viana: 5, guarapari: 6, linhares: 7, colatina: 8, cachoeiro: 9, saoMateus: 10, aracruz: 11, novaVenecia: 12, marataizes: 15 };

/* Itens de exemplo por categoria, usados para gerar necessidades de outras ONGs: [item, unidade] */
const CATALOGO = {
  1: [['Arroz 5 kg', 'pct.'], ['Feijão 1 kg', 'pct.'], ['Macarrão', 'pct.'], ['Óleo de soja', 'un.'], ['Açúcar', 'kg'], ['Farinha de trigo', 'kg'], ['Café', 'pct.']],
  2: [['Camisetas infantis', 'un.'], ['Calças jeans', 'un.'], ['Roupas de cama', 'un.'], ['Meias', 'pct.'], ['Jaquetas', 'un.']],
  3: [['Tênis infantil', 'un.'], ['Chinelos', 'un.'], ['Botas', 'un.']],
  4: [['Papel higiênico', 'pct.'], ['Shampoo', 'un.'], ['Escova de dente', 'un.'], ['Absorventes', 'pct.'], ['Sabonete', 'un.']],
  5: [['Cobertores de solteiro', 'un.'], ['Mantas', 'un.'], ['Edredons', 'un.']],
  6: [['Lápis de cor', 'un.'], ['Mochilas', 'un.'], ['Canetas', 'un.'], ['Livros didáticos', 'un.']],
  7: [['Colchões', 'un.'], ['Camas de solteiro', 'un.'], ['Mesas', 'un.'], ['Cadeiras', 'un.']],
  8: [['Água mineral 1,5 L', 'pct.'], ['Galões de água 20 L', 'un.'], ['Água potável', 'L']]
};

/* Nomes para gerar doadores e representantes de ONG */
const NOMES = ['Rafael', 'Beatriz', 'Marcos', 'Juliana', 'Fernando', 'Camila', 'Diego', 'Patrícia', 'Gustavo', 'Larissa', 'Thiago', 'Renata', 'Bruno', 'Aline', 'Felipe', 'Vanessa', 'Rodrigo', 'Letícia', 'André', 'Priscila', 'Leandro', 'Mônica', 'Vinícius', 'Tatiane', 'Henrique', 'Débora', 'Caio', 'Simone', 'Otávio', 'Elaine'];
const SOBRENOMES = ['Alves', 'Barbosa', 'Cardoso', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Lopes', 'Martins', 'Nunes', 'Oliveira', 'Rocha', 'Santos', 'Teixeira', 'Vieira'];

/* Doações recebidas por mês que o gráfico do painel do administrador deve mostrar (Jun a Nov de 2026) */
const DOACOES_RECEBIDAS_POR_MES = { '2026-06': 31, '2026-07': 36, '2026-08': 29, '2026-09': 41, '2026-10': 44, '2026-11': 48 };

/*
  Gerador de números "aleatórios" que sempre repete a mesma sequência (algoritmo mulberry32).
  Recebe uma semente (um número) e devolve uma função que, a cada chamada, dá um número entre 0 e 1.
  Usamos isso para os dados de exemplo serem sempre idênticos.
*/
function criarGerador(semente) {
  let estado = semente;
  return function proximo() {
    estado = (estado + 0x6D2B79F5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Monta uma data 'AAAA-MM-DD' a partir do mês e do dia de 2026 */
function dt(mes, dia) {
  return `2026-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/* Função principal: devolve um objeto com todas as tabelas preenchidas */
export function gerarDadosIniciais() {
  const proximo = criarGerador(2026);
  /* entre(1, 6): número inteiro entre 1 e 6, incluindo os dois */
  const entre = (min, max) => min + Math.floor(proximo() * (max - min + 1));
  /* escolher(lista): um item da lista, sempre o mesmo para a mesma ordem de chamadas */
  const escolher = (lista) => lista[Math.floor(proximo() * lista.length)];

  /* ---------- Tabelas de referência: cidade e categoria ---------- */
  const cidade = CIDADES.map(([nome, uf], i) => ({ id_cidade: i + 1, nome, uf }));
  const categoria = CATEGORIAS.map((nome, i) => ({ id_categoria: i + 1, nome }));

  /* ---------- Usuários ---------- */
  const usuario = [];

  /* Cria um usuário, guarda na tabela e devolve o id gerado */
  const novoUsuario = (nome, email, perfil, idCidade, senhaHash, cadastro) => {
    const id = usuario.length + 1;
    usuario.push({
      id_usuario: id,
      nome,
      email,
      senha_hash: senhaHash,
      telefone: `(27) 9${String(8000 + id * 37).padStart(4, '0')}-${String(1000 + id * 91).padStart(4, '0')}`,
      perfil,
      id_cidade: idCidade,
      data_cadastro: cadastro,
      ativo: true
    });
    return id;
  };

  /* As três contas de teste do enunciado. O "usuário" de login é a parte do e-mail antes do @ */
  novoUsuario('Administrador', 'admin@exemplo.com', 'admin', CID.vitoria, SENHAS.admin, dt(1, 5));
  const MARIANA = novoUsuario('Mariana Costa', 'entidade@exemplo.com', 'ong', CID.vilaVelha, SENHAS.entidade, dt(2, 10));
  const LUCAS = novoUsuario('Lucas Souza', 'doador@exemplo.com', 'doador', CID.vilaVelha, SENHAS.doador, dt(3, 2));

  /* Doadores que aparecem nos wireframes */
  const ANA = novoUsuario('Ana Pereira', 'ana.pereira@exemplo.com', 'doador', CID.vitoria, SENHAS.padrao, dt(3, 15));
  const JOAO = novoUsuario('João Mendes', 'joao.mendes@exemplo.com', 'doador', CID.serra, SENHAS.padrao, dt(4, 1));
  const CARLA = novoUsuario('Carla Ribeiro', 'carla.ribeiro@exemplo.com', 'doador', CID.vilaVelha, SENHAS.padrao, dt(4, 20));
  const PAULO = novoUsuario('Paulo Lima', 'paulo.lima@exemplo.com', 'doador', CID.cariacica, SENHAS.padrao, dt(5, 8));

  /* Outros 30 doadores gerados a partir das listas de nomes */
  const doadores = [];
  const cidadesDoadores = [CID.vilaVelha, CID.vitoria, CID.serra, CID.cariacica, CID.guarapari, CID.linhares, CID.colatina, CID.cachoeiro];
  for (let i = 0; i < NOMES.length; i++) {
    const nome = `${NOMES[i]} ${SOBRENOMES[(i * 7) % SOBRENOMES.length]}`;
    doadores.push(novoUsuario(nome, `${slug(nome)}@exemplo.com`, 'doador', cidadesDoadores[i % cidadesDoadores.length], SENHAS.padrao, dt(1 + (i % 9), 3 + (i % 20))));
  }

  /* Cada doação gerada usa um doador diferente, em rodízio */
  let contadorDoador = 0;
  const proximoDoador = () => doadores[contadorDoador++ % doadores.length];

  /* ---------- ONGs ---------- */
  const ong = [];

  /* Cria uma ONG e o usuário que a representa. Devolve o id da ONG */
  const novaOng = (dados, idUsuarioExistente = null) => {
    const id = ong.length + 1;
    const idUsuario = idUsuarioExistente ?? novoUsuario(
      dados.representante,
      `${slug(dados.nome)}@exemplo.com`,
      'ong',
      dados.cidade,
      SENHAS.padrao,
      dt(2, 1 + id)
    );
    ong.push({
      id_ong: id,
      id_usuario: idUsuario,
      id_cidade: dados.cidade,
      nome: dados.nome,
      cnpj: `${String(11 + id * 3).padStart(2, '0')}.${String(100 + id * 37).padStart(3, '0')}.${String(200 + id * 53).padStart(3, '0')}/0001-${String(10 + id * 5).padStart(2, '0')}`,
      descricao: dados.descricao,
      endereco: dados.endereco,
      horario_atendimento: dados.horario,
      telefone: dados.telefone,
      email_contato: dados.email,
      aceita_retirada: dados.retirada,
      verificada: dados.verificada,
      data_cadastro: dt(2, 1 + id)
    });
    return id;
  };

  /* Nome do contato de cada ONG (usuário que a representa), exceto a primeira, que é a Mariana */
  const REPRESENTANTES = ['Carlos Andrade', 'Sônia Batista', 'Roberto Câmara', 'Helena Duarte', 'Marcelo Freitas', 'Paula Guedes', 'Ricardo Horta', 'Cláudia Ivo', 'Sérgio Jardim', 'Tânia Klein', 'Eduardo Leal', 'Fátima Moura', 'Jorge Neves', 'Luciana Prado', 'Márcio Quintela', 'Vera Ramos'];

  /* ONGs verificadas (as seis primeiras são as dos wireframes) */
  const OL = novaOng({
    nome: 'Lar Esperança', cidade: CID.vilaVelha, verificada: true, retirada: true,
    endereco: 'Rua das Flores, 120 - Centro, Vila Velha', horario: 'Seg a sex, 8h às 17h · Sáb, 8h às 12h',
    telefone: '(27) 3333-0000', email: 'contato@laresperanca.org',
    descricao: 'Há 15 anos acolhemos 35 idosos em situação de vulnerabilidade. Toda doação recebida é registrada e confirmada na plataforma.'
  }, MARIANA);
  const OC = novaOng({
    nome: 'Casa da Criança', cidade: CID.vilaVelha, verificada: true, retirada: true, representante: REPRESENTANTES[0],
    endereco: 'Avenida Carlos Lindenberg, 450 - Jardim Colorado, Vila Velha', horario: 'Seg a sex, 9h às 16h',
    telefone: '(27) 3333-1100', email: 'contato@casadacrianca.org',
    descricao: 'Acolhimento e reforço escolar para 60 crianças de 4 a 12 anos. Recebemos alimentos, leite e fraldas.'
  });
  const OA = novaOng({
    nome: 'Abrigo Sol', cidade: CID.cariacica, verificada: true, retirada: false, representante: REPRESENTANTES[1],
    endereco: 'Rua do Porto, 88 - Campo Grande, Cariacica', horario: 'Seg a sáb, 8h às 18h',
    telefone: '(27) 3333-2200', email: 'contato@abrigosol.org',
    descricao: 'Abrigo para famílias desabrigadas por chuvas e outras emergências na Grande Vitória.'
  });
  const OI = novaOng({
    nome: 'Instituto Saber', cidade: CID.vitoria, verificada: true, retirada: true, representante: REPRESENTANTES[2],
    endereco: 'Rua Sete de Setembro, 310 - Centro, Vitória', horario: 'Seg a sex, 8h às 17h',
    telefone: '(27) 3333-3300', email: 'contato@institutosaber.org',
    descricao: 'Reforço escolar gratuito. Precisa de material escolar para 120 estudantes.'
  });
  const OB = novaOng({
    nome: 'Banco de Alimentos ES', cidade: CID.serra, verificada: true, retirada: true, representante: REPRESENTANTES[3],
    endereco: 'Avenida Eurico Salles, 1500 - Jardim Limoeiro, Serra', horario: 'Seg a sex, 7h30 às 16h',
    telefone: '(27) 3333-4400', email: 'contato@bancodealimentoses.org',
    descricao: 'Recebemos alimentos e distribuímos para mais de 40 instituições do estado.'
  });
  const OP = novaOng({
    nome: 'Projeto Agasalho', cidade: CID.vilaVelha, verificada: true, retirada: true, representante: REPRESENTANTES[4],
    endereco: 'Rua Humberto Martins, 75 - Praia da Costa, Vila Velha', horario: 'Ter a sáb, 9h às 15h',
    telefone: '(27) 3333-5500', email: 'contato@projetoagasalho.org',
    descricao: 'Campanha permanente de roupas e cobertores para o inverno capixaba.'
  });
  const O7 = novaOng({
    nome: 'Fundação Semear', cidade: CID.guarapari, verificada: true, retirada: false, representante: REPRESENTANTES[5],
    endereco: 'Rua Pedro Meneghelli, 200 - Muquiçaba, Guarapari', horario: 'Seg a sex, 8h às 16h',
    telefone: '(27) 3333-6600', email: 'contato@fundacaosemear.org',
    descricao: 'Apoio a famílias do litoral sul com alimentos, roupas e atividades para crianças.'
  });
  const O8 = novaOng({
    nome: 'Obra da Fraternidade', cidade: CID.linhares, verificada: true, retirada: true, representante: REPRESENTANTES[6],
    endereco: 'Avenida Rio Doce, 640 - Centro, Linhares', horario: 'Seg a sex, 8h às 17h',
    telefone: '(27) 3333-7700', email: 'contato@obrafraternidade.org',
    descricao: 'Distribuição de cestas básicas e atendimento a pessoas em situação de rua.'
  });
  const O9 = novaOng({
    nome: 'Lar Santa Clara', cidade: CID.colatina, verificada: true, retirada: false, representante: REPRESENTANTES[7],
    endereco: 'Rua Pedro Nolasco, 52 - Esplanada, Colatina', horario: 'Todos os dias, 8h às 18h',
    telefone: '(27) 3333-8800', email: 'contato@larsantaclara.org',
    descricao: 'Casa de acolhimento para idosos. Precisa de fraldas, higiene e alimentos.'
  });
  const O10 = novaOng({
    nome: 'Cantinho do Idoso', cidade: CID.vitoria, verificada: true, retirada: true, representante: REPRESENTANTES[8],
    endereco: 'Rua Chafic Murad, 14 - Bento Ferreira, Vitória', horario: 'Seg a sex, 9h às 17h',
    telefone: '(27) 3333-9900', email: 'contato@cantinhodoidoso.org',
    descricao: 'Centro de convivência para idosos, com refeições diárias e atividades.'
  });
  const O11 = novaOng({
    nome: 'Associação Vida Nova', cidade: CID.serra, verificada: true, retirada: true, representante: REPRESENTANTES[9],
    endereco: 'Rua das Palmeiras, 33 - Laranjeiras, Serra', horario: 'Seg a sex, 8h às 16h',
    telefone: '(27) 3334-1010', email: 'contato@vidanova.org',
    descricao: 'Apoio a mães solo com cestas básicas, fraldas e cursos de capacitação.'
  });
  const O12 = novaOng({
    nome: 'Grupo Girassol', cidade: CID.cachoeiro, verificada: true, retirada: false, representante: REPRESENTANTES[10],
    endereco: 'Rua Capitão Deslandes, 410 - Centro, Cachoeiro de Itapemirim', horario: 'Seg a sex, 8h às 17h',
    telefone: '(28) 3334-2020', email: 'contato@grupogirassol.org',
    descricao: 'Ações sociais no sul do estado, com foco em emergências e reforço escolar.'
  });

  /* ONGs ainda não verificadas (aparecem em "ONGs pendentes" do administrador) */
  novaOng({
    nome: 'Projeto Recomeço', cidade: CID.viana, verificada: false, retirada: true, representante: REPRESENTANTES[11],
    endereco: 'Rua Dois, 30 - Marcílio de Noronha, Viana', horario: 'Seg a sex, 8h às 16h',
    telefone: '(27) 3334-3030', email: 'contato@projetorecomeco.org',
    descricao: 'Apoio a famílias em recomeço de vida, com doação de móveis e alimentos.'
  });
  novaOng({
    nome: 'Associação Mãos Amigas', cidade: CID.vilaVelha, verificada: false, retirada: true, representante: REPRESENTANTES[12],
    endereco: 'Rua Souza Pinto, 99 - Glória, Vila Velha', horario: 'Seg a sex, 9h às 17h',
    telefone: '(27) 3334-4040', email: 'contato@maosamigas.org',
    descricao: 'Voluntários que distribuem refeições e roupas para pessoas em situação de rua.'
  });
  novaOng({
    nome: 'Casa Girassol', cidade: CID.serra, verificada: false, retirada: false, representante: REPRESENTANTES[13],
    endereco: 'Avenida Mestre Álvaro, 700 - Jardim Limoeiro, Serra', horario: 'Seg a sex, 8h às 17h',
    telefone: '(27) 3334-5050', email: 'contato@casagirassol.org',
    descricao: 'Casa de apoio a crianças em tratamento de saúde e suas famílias.'
  });
  novaOng({
    nome: 'Instituto Esperança Viva', cidade: CID.aracruz, verificada: false, retirada: true, representante: REPRESENTANTES[14],
    endereco: 'Rua Padre Anchieta, 12 - Centro, Aracruz', horario: 'Seg a sex, 8h às 16h',
    telefone: '(27) 3334-6060', email: 'contato@esperancaviva.org',
    descricao: 'Programa de apoio a famílias ribeirinhas com alimentos e material escolar.'
  });
  novaOng({
    nome: 'Lar Bom Pastor', cidade: CID.saoMateus, verificada: false, retirada: false, representante: REPRESENTANTES[15],
    endereco: 'Rua do Comércio, 250 - Centro, São Mateus', horario: 'Todos os dias, 8h às 18h',
    telefone: '(27) 3334-7070', email: 'contato@larbompastor.org',
    descricao: 'Abrigo para idosos e pessoas com deficiência no norte do estado.'
  });

  /* Dois administradores a mais, só para a lista de usuários ficar realista */
  novoUsuario('Equipe Conecta 1', 'equipe1@exemplo.com', 'admin', CID.vitoria, SENHAS.padrao, dt(1, 6));
  novoUsuario('Equipe Conecta 2', 'equipe2@exemplo.com', 'admin', CID.vitoria, SENHAS.padrao, dt(1, 7));

  /* ---------- Campanhas, cidades atingidas e metas gerais ---------- */
  const campanha = [];
  const campanha_cidade = [];
  const campanha_meta = [];

  /* Cria uma campanha com suas cidades e metas. Devolve o id da campanha e os ids das metas */
  const novaCampanha = (dados) => {
    const id = campanha.length + 1;
    campanha.push({
      id_campanha: id,
      id_ong: dados.ong,
      titulo: dados.titulo,
      descricao: dados.descricao,
      tipo: dados.tipo,
      data_inicio: dados.inicio,
      data_fim: dados.fim,
      status: dados.status,
      endereco_recebimento: dados.endereco,
      horario_recebimento: dados.horario
    });
    dados.cidades.forEach((idCidade) => campanha_cidade.push({ id_campanha: id, id_cidade: idCidade }));
    const metas = dados.metas.map(([idCategoria, item, quantidade]) => {
      const idMeta = campanha_meta.length + 1;
      campanha_meta.push({ id_meta: idMeta, id_campanha: id, id_categoria: idCategoria, item, quantidade });
      return idMeta;
    });
    return { id, metas };
  };

  /* Endereço que o administrador recebeu para as campanhas criadas por ele */
  const ENDERECO_ADMIN = 'Avenida Jerônimo Monteiro, 1000 - Centro, Vitória';
  const HORARIO_ADMIN = 'Seg a sex, 8h às 17h';

  /* Campanha 1: a campanha em destaque dos wireframes, criada pelo Lar Esperança */
  const C1 = novaCampanha({
    ong: OL, titulo: 'Enchente em Vila Velha', tipo: 'enchente', status: 'ativa',
    descricao: '12 entidades precisam de água potável, alimentos, roupas e produtos de higiene.',
    inicio: dt(10, 1), fim: '2026-12-15',
    endereco: 'Rua das Flores, 120 - Centro, Vila Velha', horario: 'Seg a sex, 8h às 17h',
    cidades: [CID.vilaVelha, CID.cariacica],
    metas: [[CAT.agua, 'água potável', 1500], [CAT.alimentos, 'alimentos não perecíveis', 800], [CAT.higiene, 'itens de higiene', 700]]
  });
  /* Campanha 2: solicitada pelo Lar Esperança, ainda pendente de aprovação */
  const C2 = novaCampanha({
    ong: OL, titulo: 'Seca em Linhares', tipo: 'seca', status: 'pendente',
    descricao: 'A seca prolongada deixou famílias sem água para consumo. Precisamos de água potável e alimentos.',
    inicio: dt(12, 1), fim: '2027-02-28',
    endereco: 'Rua das Flores, 120 - Centro, Vila Velha', horario: 'Seg a sex, 8h às 17h',
    cidades: [CID.linhares, CID.colatina, CID.novaVenecia],
    metas: [[CAT.agua, 'água potável', 1000], [CAT.alimentos, 'alimentos não perecíveis', 500]]
  });
  /* Campanha 3: criada pelo Abrigo Sol */
  const C3 = novaCampanha({
    ong: OA, titulo: 'Deslizamento em Cariacica', tipo: 'deslizamento', status: 'ativa',
    descricao: 'Famílias do morro perderam a casa e precisam de colchões, alimentos e cobertores.',
    inicio: dt(10, 20), fim: '2027-01-08',
    endereco: 'Rua do Porto, 88 - Campo Grande, Cariacica', horario: 'Seg a sáb, 8h às 18h',
    cidades: [CID.cariacica, CID.viana],
    metas: [[CAT.moveis, 'colchões e camas', 120], [CAT.alimentos, 'alimentos não perecíveis', 400], [CAT.cobertores, 'cobertores', 300]]
  });
  /* Campanha 4: criada pelo administrador (id_ong nulo) e já ativa */
  const C4 = novaCampanha({
    ong: null, titulo: 'Incêndio no Morro da Fonte', tipo: 'incendio', status: 'ativa',
    descricao: 'Um incêndio atingiu casas no Morro da Fonte. As famílias precisam de roupas, móveis e itens de higiene.',
    inicio: dt(11, 5), fim: '2026-12-31',
    endereco: ENDERECO_ADMIN, horario: HORARIO_ADMIN,
    cidades: [CID.vitoria],
    metas: [[CAT.roupas, 'roupas e agasalhos', 300], [CAT.moveis, 'móveis básicos', 80], [CAT.higiene, 'itens de higiene', 250]]
  });
  /* Campanha 5: solicitada pela Fundação Semear, pendente */
  novaCampanha({
    ong: O7, titulo: 'Enchente em Guarapari', tipo: 'enchente', status: 'pendente',
    descricao: 'As chuvas alagaram bairros de Guarapari. Pedimos água, alimentos e itens de higiene.',
    inicio: dt(12, 3), fim: '2027-01-20',
    endereco: 'Rua Pedro Meneghelli, 200 - Muquiçaba, Guarapari', horario: 'Seg a sex, 8h às 16h',
    cidades: [CID.guarapari],
    metas: [[CAT.agua, 'água potável', 600], [CAT.alimentos, 'alimentos não perecíveis', 400], [CAT.higiene, 'itens de higiene', 200]]
  });
  /* Campanha 6: criada pela Obra da Fraternidade, ativa */
  const C6 = novaCampanha({
    ong: O8, titulo: 'Incêndio em Linhares', tipo: 'incendio', status: 'ativa',
    descricao: 'Um incêndio atingiu um conjunto de casas em Linhares. Famílias precisam de roupas e móveis.',
    inicio: dt(11, 10), fim: '2027-01-10',
    endereco: 'Avenida Rio Doce, 640 - Centro, Linhares', horario: 'Seg a sex, 8h às 17h',
    cidades: [CID.linhares],
    metas: [[CAT.roupas, 'roupas e agasalhos', 200], [CAT.moveis, 'móveis básicos', 50], [CAT.higiene, 'itens de higiene', 150]]
  });
  /* Campanha 7: criada pelo administrador, ativa */
  const C7 = novaCampanha({
    ong: null, titulo: 'Seca em São Mateus', tipo: 'seca', status: 'ativa',
    descricao: 'Famílias do interior de São Mateus estão sem água. A campanha recebe água potável e alimentos.',
    inicio: dt(11, 1), fim: '2027-01-31',
    endereco: ENDERECO_ADMIN, horario: HORARIO_ADMIN,
    cidades: [CID.saoMateus, CID.novaVenecia],
    metas: [[CAT.agua, 'água potável', 600], [CAT.alimentos, 'alimentos não perecíveis', 400]]
  });
  /* Campanha 8: criada pela Fundação Semear, ativa */
  const C8 = novaCampanha({
    ong: O7, titulo: 'Enchente em Marataízes', tipo: 'enchente', status: 'ativa',
    descricao: 'Moradores do litoral sul precisam de água, alimentos e itens de higiene.',
    inicio: dt(11, 12), fim: '2026-12-28',
    endereco: 'Rua Pedro Meneghelli, 200 - Muquiçaba, Guarapari', horario: 'Seg a sex, 8h às 16h',
    cidades: [CID.marataizes, CID.guarapari],
    metas: [[CAT.agua, 'água potável', 500], [CAT.alimentos, 'alimentos não perecíveis', 300], [CAT.higiene, 'itens de higiene', 200]]
  });

  /* Campanhas encerradas (o histórico da plataforma) */
  const encerradas = [
    { ong: O12, titulo: 'Enchente em Cachoeiro de Itapemirim', tipo: 'enchente', inicio: dt(1, 10), fim: dt(3, 10), cidades: [CID.cachoeiro], metas: [[CAT.agua, 'água potável', 800], [CAT.alimentos, 'alimentos não perecíveis', 500]] },
    { ong: O9, titulo: 'Seca em Colatina', tipo: 'seca', inicio: dt(2, 1), fim: dt(4, 30), cidades: [CID.colatina, CID.aracruz], metas: [[CAT.agua, 'água potável', 600], [CAT.alimentos, 'alimentos não perecíveis', 400]] },
    { ong: null, titulo: 'Deslizamento em Viana', tipo: 'deslizamento', inicio: dt(3, 5), fim: dt(5, 5), cidades: [CID.viana], metas: [[CAT.moveis, 'colchões e camas', 100], [CAT.cobertores, 'cobertores', 200], [CAT.alimentos, 'alimentos não perecíveis', 300]] },
    { ong: null, titulo: 'Incêndio em Marataízes', tipo: 'incendio', inicio: dt(4, 12), fim: dt(6, 12), cidades: [CID.marataizes], metas: [[CAT.roupas, 'roupas e agasalhos', 300], [CAT.moveis, 'móveis básicos', 60]] },
    { ong: O8, titulo: 'Enchente em Linhares', tipo: 'enchente', inicio: dt(5, 2), fim: dt(7, 2), cidades: [CID.linhares], metas: [[CAT.agua, 'água potável', 700], [CAT.higiene, 'itens de higiene', 300], [CAT.alimentos, 'alimentos não perecíveis', 500]] },
    { ong: O11, titulo: 'Seca em Nova Venécia', tipo: 'seca', inicio: dt(6, 15), fim: dt(9, 15), cidades: [CID.novaVenecia, CID.saoMateus], metas: [[CAT.agua, 'água potável', 500], [CAT.alimentos, 'alimentos não perecíveis', 350]] }
  ].map((dados) => novaCampanha({
    ...dados,
    status: 'encerrada',
    descricao: `Campanha encerrada: ${dados.titulo}. As doações recebidas foram entregues às famílias atendidas.`,
    endereco: dados.ong ? ong[dados.ong - 1].endereco : ENDERECO_ADMIN,
    horario: dados.ong ? ong[dados.ong - 1].horario_atendimento : HORARIO_ADMIN
  }));

  /* ---------- Necessidades ---------- */
  const necessidade = [];

  /* Cria uma necessidade e devolve o id */
  const novaNecessidade = (idOng, idCategoria, item, quantidade, unidade, prioridade, extra = {}) => {
    const id = necessidade.length + 1;
    necessidade.push({
      id_necessidade: id,
      id_ong: idOng,
      id_categoria: idCategoria,
      item,
      descricao: extra.descricao ?? null,
      quantidade,
      unidade,
      prioridade,
      precisa_ate: extra.precisaAte ?? null,
      situacao: 'ativa',
      data_cadastro: extra.cadastro ?? dt(9, 15),
      data_atualizacao: extra.atualizacao ?? dt(11, 19)
    });
    return id;
  };

  /* Necessidades do Lar Esperança (tela 08 do wireframe) */
  const N1 = novaNecessidade(OL, CAT.cobertores, 'Cobertores de casal', 50, 'un.', 'urgente', { descricao: 'Cobertores de casal para o inverno, de preferência novos.' });
  const N2 = novaNecessidade(OL, CAT.higiene, 'Fraldas geriátricas G', 40, 'pct.', 'urgente');
  const N3 = novaNecessidade(OL, CAT.alimentos, 'Leite integral', 60, 'L', 'urgente');
  const N4 = novaNecessidade(OL, CAT.higiene, 'Sabonete', 100, 'un.', 'normal');
  const N5 = novaNecessidade(OL, CAT.roupas, 'Agasalhos tam. M/G', 30, 'un.', 'normal');
  const N6 = novaNecessidade(OL, CAT.alimentos, 'Arroz 5 kg', 20, 'pct.', 'normal');
  /* Casa da Criança */
  const N7 = novaNecessidade(OC, CAT.alimentos, 'Leite em pó', 20, 'latas', 'urgente');
  const N11 = novaNecessidade(OC, CAT.alimentos, 'Cestas básicas', 80, 'un.', 'normal');
  const N12 = novaNecessidade(OC, CAT.higiene, 'Fraldas infantis M', 60, 'pct.', 'normal');
  novaNecessidade(OC, CAT.cobertores, 'Cobertores de solteiro', 25, 'un.', 'normal');
  /* Abrigo Sol */
  const N8 = novaNecessidade(OA, CAT.higiene, 'Fraldas G', 40, 'pct.', 'normal');
  const N9 = novaNecessidade(OA, CAT.agua, 'Água mineral 1,5 L', 60, 'pct.', 'normal');
  const N10 = novaNecessidade(OA, CAT.agua, 'Água potável', 200, 'L', 'urgente');
  const N15 = novaNecessidade(OA, CAT.agua, 'Galões de água 20 L', 30, 'un.', 'normal');
  /* Instituto Saber */
  const N13 = novaNecessidade(OI, CAT.escolar, 'Cadernos', 60, 'un.', 'normal');

  /* Necessidades geradas para as demais ONGs verificadas: "ligadas" entram na campanha 1; "livres" recebem doações aleatórias */
  const livres = [];                 /* ids das necessidades que não estão ligadas à campanha 1 */
  const ligadasC1 = [];              /* ids das necessidades ligadas à campanha 1 */
  const geradasPorOng = { [OI]: 1, [OB]: 2, [OP]: 1, [O7]: 1, [O8]: 2, [O9]: 1, [O10]: 1, [O11]: 1, [O12]: 1 };
  const categoriasLigaveis = [CAT.alimentos, CAT.higiene, CAT.agua];
  let girar = 0;

  /* Para cada ONG verificada de 4 a 12: algumas necessidades compatíveis com a campanha 1 e três livres */
  for (let idOng = OI; idOng <= O12; idOng++) {
    for (let i = 0; i < (geradasPorOng[idOng] ?? 0); i++) {
      const idCat = categoriasLigaveis[girar++ % categoriasLigaveis.length];
      const [item, unidade] = escolher(CATALOGO[idCat]);
      ligadasC1.push(novaNecessidade(idOng, idCat, item, entre(40, 120), unidade, 'normal'));
    }
    for (let i = 0; i < 3; i++) {
      const idCat = escolher([CAT.alimentos, CAT.roupas, CAT.calcados, CAT.higiene, CAT.cobertores, CAT.escolar, CAT.moveis]);
      const [item, unidade] = escolher(CATALOGO[idCat]);
      livres.push(novaNecessidade(idOng, idCat, item, entre(30, 150), unidade, proximo() < 0.25 ? 'urgente' : 'normal'));
    }
  }

  /* ---------- Vínculos entre necessidades e campanhas ---------- */
  const campanha_necessidade = [];

  /* Cria um vínculo (pedido) entre uma necessidade e uma campanha */
  const ligar = (idCampanha, idNecessidade, status, aumentaMeta, dataPedido) => {
    campanha_necessidade.push({
      id_campanha: idCampanha,
      id_necessidade: idNecessidade,
      status,
      aumenta_meta: aumentaMeta,
      data_pedido: dataPedido
    });
  };

  /* Campanha 1: necessidades aceitas (a ONG criadora é o Lar Esperança, então os dela entram direto) */
  [N2, N4, N7, N8, N9, N10, N11].forEach((id) => ligar(C1.id, id, 'aceito', false, dt(10, 2)));
  ligadasC1.forEach((id) => ligar(C1.id, id, 'aceito', false, dt(10, 3)));
  /* Pedidos de outras ONGs esperando o aceite do Lar Esperança (tela 07) */
  ligar(C1.id, N12, 'pendente', false, dt(10, 4));
  ligar(C1.id, N15, 'pendente', false, dt(10, 3));
  /* Leite integral do Lar Esperança aguardando o aceite do Abrigo Sol na campanha 3 (tela 08) */
  ligar(C3.id, N3, 'pendente', false, dt(11, 15));

  /* Campanhas 3, 4, 6, 7 e 8: vínculos usando as necessidades livres de categoria compatível */
  const categoriasDaCampanha = (idCampanha) => campanha_meta.filter((m) => m.id_campanha === idCampanha).map((m) => m.id_categoria);
  const ligarLivres = (idCampanha, statuses, aumentaMeta) => {
    const aceitas = categoriasDaCampanha(idCampanha);
    const candidatas = livres.filter((id) => aceitas.includes(necessidade[id - 1].id_categoria)
      && !campanha_necessidade.some((v) => v.id_campanha === idCampanha && v.id_necessidade === id));
    statuses.forEach((status, i) => {
      if (candidatas[i] !== undefined) ligar(idCampanha, candidatas[i], status, aumentaMeta && i % 2 === 0, dt(11, 8 + i));
    });
  };
  ligarLivres(C3.id, ['aceito', 'aceito', 'aceito', 'aceito'], true);
  ligarLivres(C4.id, ['aceito', 'aceito', 'pendente', 'pendente', 'recusado'], true);
  ligarLivres(C6.id, ['aceito', 'aceito', 'pendente'], false);
  ligarLivres(C7.id, ['aceito', 'pendente'], true);
  ligarLivres(C8.id, ['aceito', 'aceito'], false);

  /* ---------- Doações ---------- */
  const doacao = [];

  /*
    Registra uma doação.
    destino: { necessidade: id } ou { meta: id } (a doação tem sempre UM destino só, como no banco).
    extra: observacao, forma ('levar' ou 'retirada'), retirada (endereço), recebimento, mensagem.
  */
  const doar = (idDoador, destino, quantidade, status, registro, previsto, extra = {}) => {
    doacao.push({
      id_doacao: doacao.length + 1,
      id_doador: idDoador,
      id_necessidade: destino.necessidade ?? null,
      id_meta: destino.meta ?? null,
      quantidade,
      observacao: extra.observacao ?? null,
      forma_entrega: extra.forma ?? 'levar',
      endereco_retirada: extra.retirada ?? null,
      data_prevista: previsto,
      data_registro: registro,
      data_recebimento: status === 'recebida' ? (extra.recebimento ?? previsto) : null,
      status,
      mensagem_ong: extra.mensagem ?? null
    });
  };

  /* Doações recebidas para uma meta de campanha: uma doação para cada quantidade da lista */
  const receberMeta = (idMeta, quantidades, mes, diaInicial) => {
    quantidades.forEach((quantidade, i) => {
      const dia = Math.min(28, diaInicial + i * 2);
      doar(proximoDoador(), { meta: idMeta }, quantidade, 'recebida', dt(mes, Math.max(1, dia - 2)), dt(mes, dia));
    });
  };

  /* --- As 6 doações do Lucas (tela "Minhas doações") --- */
  doar(LUCAS, { necessidade: N1 }, 5, 'oferecida', dt(10, 5), dt(10, 15), { observacao: 'cobertores novos, ainda na embalagem' });
  doar(LUCAS, { necessidade: N7 }, 4, 'aceita', dt(10, 1), dt(10, 10));
  doar(LUCAS, { meta: C1.metas[0] }, 6, 'recebida', dt(9, 28), dt(9, 30));
  doar(LUCAS, { necessidade: N8 }, 3, 'recebida', dt(9, 18), dt(9, 20));
  doar(LUCAS, { necessidade: N13 }, 10, 'recebida', dt(9, 8), dt(9, 10));
  doar(LUCAS, { necessidade: N4 }, 12, 'oferecida', dt(9, 2), dt(9, 10));

  /* --- Doações às necessidades do Lar Esperança (tela "Doações recebidas" da ONG) --- */
  doar(ANA, { necessidade: N2 }, 6, 'oferecida', dt(10, 4), dt(10, 12), { forma: 'retirada', retirada: 'Rua Bela Vista, 45 - Itapuã, Vila Velha' });
  doar(PAULO, { meta: C1.metas[0] }, 10, 'oferecida', dt(10, 2), dt(10, 9));
  doar(JOAO, { necessidade: N3 }, 12, 'aceita', dt(10, 3), dt(10, 8));
  doar(CARLA, { necessidade: N4 }, 20, 'recebida', dt(9, 28), dt(10, 1));
  doar(proximoDoador(), { necessidade: N1 }, 7, 'recebida', dt(10, 12), dt(10, 18));
  doar(proximoDoador(), { necessidade: N1 }, 4, 'recebida', dt(11, 2), dt(11, 5));
  doar(proximoDoador(), { necessidade: N1 }, 4, 'recebida', dt(11, 6), dt(11, 9));
  doar(proximoDoador(), { necessidade: N2 }, 4, 'recebida', dt(11, 3), dt(11, 7));
  [3, 3, 3, 2, 2].forEach((q, i) => doar(proximoDoador(), { necessidade: N4 }, q, 'recebida', dt(11, 2 + i * 2), dt(11, 4 + i * 2)));
  doar(proximoDoador(), { necessidade: N5 }, 5, 'recebida', dt(11, 10), dt(11, 12));
  [4, 4, 4, 3, 3].forEach((q, i) => doar(proximoDoador(), { necessidade: N6 }, q, 'recebida', dt(11, 3 + i * 3), dt(11, 5 + i * 3)));

  /* --- Doações às necessidades de outras ONGs, para fechar os números dos wireframes --- */
  [20, 20, 12].forEach((q, i) => doar(proximoDoador(), { necessidade: N11 }, q, 'recebida', dt(10, 6 + i * 6), dt(10, 8 + i * 6)));
  doar(proximoDoador(), { necessidade: N8 }, 12, 'recebida', dt(10, 8), dt(10, 10));
  doar(proximoDoador(), { necessidade: N8 }, 10, 'aceita', dt(11, 12), dt(11, 22));
  [15, 15].forEach((q, i) => doar(proximoDoador(), { necessidade: N9 }, q, 'recebida', dt(10, 9 + i * 5), dt(10, 11 + i * 5)));
  [40, 40, 40].forEach((q, i) => doar(proximoDoador(), { necessidade: N10 }, q, 'recebida', dt(10, 5 + i * 4), dt(10, 7 + i * 4)));

  /* --- Doações às metas da campanha 1: 1.000 de água, 450 de alimentos e 238 de higiene recebidos --- */
  receberMeta(C1.metas[0], [200, 200, 200, 194, 200], 10, 2);
  receberMeta(C1.metas[1], [100, 100, 100, 100, 50], 10, 3);
  receberMeta(C1.metas[2], [60, 60, 60, 58], 10, 4);

  /* --- Doações às metas das outras campanhas --- */
  receberMeta(C3.metas[0], [20, 20], 11, 3);
  receberMeta(C3.metas[1], [75, 75], 11, 4);
  receberMeta(C3.metas[2], [45, 45], 11, 5);
  doar(proximoDoador(), { meta: C3.metas[2] }, 30, 'oferecida', dt(11, 19), dt(11, 25));

  /* Campanha 4 (administrador): doações para a tela "Doações das campanhas" */
  receberMeta(C4.metas[0], [30, 30, 40, 25, 25, 30], 11, 6);
  receberMeta(C4.metas[1], [10, 10, 15], 11, 7);
  receberMeta(C4.metas[2], [40, 40, 30, 30], 11, 8);
  doar(proximoDoador(), { meta: C4.metas[0] }, 20, 'oferecida', dt(11, 19), dt(11, 24));
  doar(proximoDoador(), { meta: C4.metas[2] }, 15, 'oferecida', dt(11, 20), dt(11, 26));
  doar(proximoDoador(), { meta: C4.metas[1] }, 10, 'aceita', dt(11, 17), dt(11, 23));
  doar(proximoDoador(), { meta: C4.metas[0] }, 5, 'recusada', dt(11, 12), dt(11, 15), { mensagem: 'No momento só recebemos roupas de adulto.' });

  /* Campanha 7 (administrador) e campanhas 6 e 8 */
  receberMeta(C7.metas[0], [60, 60, 50], 11, 4);
  receberMeta(C7.metas[1], [40, 40], 11, 5);
  doar(proximoDoador(), { meta: C7.metas[0] }, 40, 'oferecida', dt(11, 20), dt(11, 27));
  receberMeta(C6.metas[0], [40, 30], 11, 12);
  receberMeta(C8.metas[0], [50, 50], 11, 14);

  /* Campanhas encerradas: algumas doações recebidas dentro do período de cada uma */
  encerradas.forEach((c) => {
    const mes = Number(campanha[c.id - 1].data_inicio.slice(5, 7));
    c.metas.forEach((idMeta, i) => receberMeta(idMeta, [30 + i * 10, 40 + i * 10], mes, 8 + i * 3));
  });

  /* --- Doações geradas para completar o número de doações recebidas por mês (gráfico do painel) --- */
  const contagemPorMes = {};
  doacao.filter((d) => d.status === 'recebida').forEach((d) => {
    const mes = d.data_recebimento.slice(0, 7);
    contagemPorMes[mes] = (contagemPorMes[mes] ?? 0) + 1;
  });
  for (const [mes, alvo] of Object.entries(DOACOES_RECEBIDAS_POR_MES)) {
    const faltam = alvo - (contagemPorMes[mes] ?? 0);
    const ultimoDia = mes === '2026-11' ? 20 : 28;
    for (let i = 0; i < faltam; i++) {
      const dia = entre(2, ultimoDia);
      const idNec = escolher(livres);
      doar(proximoDoador(), { necessidade: idNec }, entre(1, 12), 'recebida', `${mes}-${String(dia - 1).padStart(2, '0')}`, `${mes}-${String(dia).padStart(2, '0')}`);
    }
  }

  /* --- Doações em andamento (oferecidas, aceitas, recusadas e canceladas) nas necessidades livres --- */
  const andamento = ['oferecida', 'oferecida', 'aceita', 'recusada', 'cancelada', 'aceita'];
  for (let i = 0; i < 24; i++) {
    const dia = 2 + (i % 18);
    doar(proximoDoador(), { necessidade: escolher(livres) }, entre(1, 10), andamento[i % andamento.length], dt(11, dia), dt(11, Math.min(28, dia + 8)));
  }

  /* Ajusta a quantidade pedida das necessidades livres para nunca ficar menor que o que já foi prometido */
  const prometidoPorNecessidade = {};
  doacao.forEach((d) => {
    if (d.id_necessidade && ['oferecida', 'aceita', 'recebida'].includes(d.status)) {
      prometidoPorNecessidade[d.id_necessidade] = (prometidoPorNecessidade[d.id_necessidade] ?? 0) + d.quantidade;
    }
  });
  livres.forEach((id) => {
    const n = necessidade[id - 1];
    n.quantidade = Math.max(n.quantidade, (prometidoPorNecessidade[id] ?? 0) + entre(15, 60));
  });

  return { cidade, categoria, usuario, ong, campanha, campanha_cidade, campanha_meta, necessidade, campanha_necessidade, doacao };
}
