/*
  campanhas.js
  Para que serve: regras das campanhas: metas, cidades, quem criou, meta total e progresso
  (RN-26 e RN-27), além de criar, editar, aprovar, encerrar e reabrir campanhas.
  Quem usa: páginas de campanha, painéis e telas de aprovação.
  Depende de: armazenamento.js, necessidades.js, formatacao.js e listas.js.
*/

/* Funções de outros arquivos que usamos aqui */
import { tabela, buscar, inserir, atualizar, removerOnde } from '../nucleo/armazenamento.js';
import { percentual } from '../utilitarios/formatacao.js';
import { somarQuantidades, semRepetidos } from '../utilitarios/listas.js';
import { recebido } from './necessidades.js';

/* Metas gerais de uma campanha (campanha_meta) */
export function metasDaCampanha(idCampanha) {
  return tabela('campanha_meta').filter((m) => m.id_campanha === idCampanha);
}

/* Cidades atingidas pela campanha (campanha_cidade), já como registros da tabela cidade */
export function cidadesDaCampanha(idCampanha) {
  return tabela('campanha_cidade')
    /* Só as ligações desta campanha */
    .filter((cc) => cc.id_campanha === idCampanha)
    /* Troca cada ligação pelo registro da cidade */
    .map((cc) => buscar('cidade', cc.id_cidade))
    /* filter(Boolean) joga fora o que não foi encontrado (undefined) */
    .filter(Boolean);
}

/* Texto com as cidades: "Vila Velha e Cariacica" ou "Vila Velha, Cariacica e Viana" */
export function textoCidades(idCampanha) {
  /* Só os nomes das cidades */
  const nomes = cidadesDaCampanha(idCampanha).map((c) => c.nome);
  /* Zero ou uma cidade: não precisa de "e" (join('') junta sem separador) */
  if (nomes.length <= 1) return nomes.join('');
  /* Várias: todas menos a última separadas por vírgula, e a última depois do "e" */
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

/* ONG que criou a campanha, ou null se foi o administrador (id_ong vazio) */
export function ongCriadora(campanha) {
  return campanha.id_ong ? buscar('ong', campanha.id_ong) : null;
}

/* Nome de quem criou: nome da ONG ou "Administração" */
export function nomeCriador(campanha) {
  /* ?.nome só lê o nome se a ONG existir; ?? 'Administração' é o valor usado quando não existe */
  return ongCriadora(campanha)?.nome ?? 'Administração';
}

/* Campanhas ativas (RN-20: só elas aparecem para doadores e visitantes) */
export function campanhasAtivas() {
  return tabela('campanha').filter((c) => c.status === 'ativa');
}

/* Categorias que a campanha pede (as categorias das suas metas) */
export function categoriasDaCampanha(idCampanha) {
  /* Pega a categoria de cada meta e tira as repetidas */
  return semRepetidos(metasDaCampanha(idCampanha).map((m) => m.id_categoria));
}

/* Vínculos aceitos da campanha: [{ vinculo, necessidade, ong }] */
export function vinculosAceitos(idCampanha) {
  return tabela('campanha_necessidade')
    /* Só os vínculos desta campanha que foram aceitos */
    .filter((v) => v.id_campanha === idCampanha && v.status === 'aceito')
    /* Para cada vínculo, junta a necessidade e a ONG dona dela */
    .map((vinculo) => {
      const necessidade = buscar('necessidade', vinculo.id_necessidade);
      return { vinculo, necessidade, ong: necessidade ? buscar('ong', necessidade.id_ong) : null };
    })
    /* Joga fora os vínculos cuja necessidade não existe mais */
    .filter((item) => item.necessidade);
}

/* RN-26: Meta total = soma das metas gerais + soma das necessidades aceitas com "aumenta a meta" */
export function metaTotal(idCampanha) {
  /* Soma das metas gerais */
  const gerais = somarQuantidades(metasDaCampanha(idCampanha));
  /* Necessidades aceitas que marcaram "aumenta a meta" */
  const necessidadesQueAumentam = vinculosAceitos(idCampanha)
    .filter((item) => item.vinculo.aumenta_meta)
    .map((item) => item.necessidade);
  /* Meta total = metas gerais + quantidade dessas necessidades */
  return gerais + somarQuantidades(necessidadesQueAumentam);
}

/* Quantidade recebida por uma meta geral (doações recebidas com id_meta igual) */
export function recebidoDaMeta(idMeta) {
  const recebidas = tabela('doacao').filter((d) => d.id_meta === idMeta && d.status === 'recebida');
  return somarQuantidades(recebidas);
}

/* Quanto falta para uma meta geral, contando também o que já foi oferecido e aceito */
export function faltamDaMeta(meta) {
  /* Doações desta meta que já estão prometidas (oferecida, aceita ou recebida) */
  const doacoesDaMeta = tabela('doacao')
    .filter((d) => d.id_meta === meta.id_meta && ['oferecida', 'aceita', 'recebida'].includes(d.status));
  /* Falta = meta - prometido (nunca negativo) */
  return Math.max(0, meta.quantidade - somarQuantidades(doacoesDaMeta));
}

/* RN-27: quantidade recebida = metas gerais + necessidades vinculadas aceitas */
export function recebidoDaCampanha(idCampanha) {
  /* Soma o que cada meta geral já recebeu */
  let nasMetas = 0;
  for (const meta of metasDaCampanha(idCampanha)) {
    nasMetas += recebidoDaMeta(meta.id_meta);
  }
  /* Soma o que cada necessidade vinculada (aceita) já recebeu */
  let nasNecessidades = 0;
  for (const item of vinculosAceitos(idCampanha)) {
    nasNecessidades += recebido(item.necessidade.id_necessidade);
  }
  return nasMetas + nasNecessidades;
}

/* RN-27: progresso = recebido ÷ meta total, de 0 a 100 (sem meta total, 0%) */
export function progressoDaCampanha(idCampanha) {
  return percentual(recebidoDaCampanha(idCampanha), metaTotal(idCampanha));
}

/* Quantidade de ONGs diferentes que têm necessidades aceitas na campanha */
export function quantidadeDeOngs(idCampanha) {
  /* Pega o id da ONG de cada vínculo, tira os repetidos e conta quantos sobraram */
  return semRepetidos(vinculosAceitos(idCampanha).map((item) => item.ong?.id_ong)).length;
}

/*
  Cria ou atualiza uma campanha com cidades e metas.
  dados: { id_campanha (opcional, para editar), id_ong, titulo, descricao, tipo, data_inicio, data_fim,
           status, endereco_recebimento, horario_recebimento, cidades: [ids], metas: [{id_categoria, item, quantidade}] }
  Devolve o registro da campanha.
*/
export function salvarCampanha(dados) {
  /* Separa "cidades" e "metas" dos demais campos (o "...campos" junta todo o resto num objeto) */
  const { cidades, metas, ...campos } = dados;
  let campanha;
  if (dados.id_campanha) {
    /* Edição: atualiza a campanha e apaga as cidades antigas (as novas entram logo abaixo) */
    campanha = atualizar('campanha', dados.id_campanha, campos);
    removerOnde('campanha_cidade', (cc) => cc.id_campanha === campanha.id_campanha);
  } else {
    /* Criação: insere uma campanha nova (o id é gerado no inserir) */
    campanha = inserir('campanha', campos);
  }
  /* Liga a campanha a cada cidade escolhida */
  cidades.forEach((idCidade) => inserir('campanha_cidade', { id_campanha: campanha.id_campanha, id_cidade: idCidade }));

  /* Metas: as que já existem (têm id_meta) são atualizadas; as novas são inseridas; as removidas na tela saem */
  /* Ids das metas que continuam na tela */
  const idsMantidos = metas.filter((m) => m.id_meta).map((m) => m.id_meta);
  /* Apaga as metas da campanha que saíram da tela, mas só se nenhuma doação usa a meta */
  removerOnde('campanha_meta', (m) => m.id_campanha === campanha.id_campanha
    && !idsMantidos.includes(m.id_meta)
    && !tabela('doacao').some((d) => d.id_meta === m.id_meta));
  /* Para cada meta da tela: atualiza se já existia, insere se é nova */
  metas.forEach((meta) => {
    if (meta.id_meta) {
      atualizar('campanha_meta', meta.id_meta, { id_categoria: meta.id_categoria, item: meta.item, quantidade: meta.quantidade });
    } else {
      inserir('campanha_meta', { id_campanha: campanha.id_campanha, id_categoria: meta.id_categoria, item: meta.item, quantidade: meta.quantidade });
    }
  });
  return campanha;
}

/* RN-19: o administrador aprova (pendente vira ativa), encerra e reabre campanhas */
export function aprovarCampanha(idCampanha) {
  atualizar('campanha', idCampanha, { status: 'ativa' });
}

/* Encerra a campanha: ela deixa de receber doações */
export function encerrarCampanha(idCampanha) {
  atualizar('campanha', idCampanha, { status: 'encerrada' });
}

/* Reabre uma campanha encerrada (volta a ficar ativa) */
export function reabrirCampanha(idCampanha) {
  atualizar('campanha', idCampanha, { status: 'ativa' });
}

/* Recusar um pedido de campanha: ela é removida, junto com cidades, metas e vínculos */
export function recusarCampanha(idCampanha) {
  /* Apaga primeiro as tabelas que dependem da campanha e, por último, a campanha */
  removerOnde('campanha_cidade', (cc) => cc.id_campanha === idCampanha);
  removerOnde('campanha_necessidade', (v) => v.id_campanha === idCampanha);
  removerOnde('campanha_meta', (m) => m.id_campanha === idCampanha);
  removerOnde('campanha', (c) => c.id_campanha === idCampanha);
}
