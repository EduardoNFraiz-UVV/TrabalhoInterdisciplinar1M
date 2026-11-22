/*
  formatacao.js
  Para que serve: funções pequenas que transformam dados em texto para a tela
  (datas, números, nomes de status) e funções de texto (tirar acentos, criar "slug").
  Quem usa: quase todos os outros arquivos JS.
  Depende de: nada.

  Formato de data usado no banco: 'AAAA-MM-DD' (ISO), por exemplo '2026-06-30'.
*/

/* Rótulos amigáveis para os valores guardados no banco (por exemplo, 'oferecida' vira 'Oferecida') */
export const ROTULO_STATUS_DOACAO = {
  oferecida: 'Oferecida',
  aceita: 'Aceita',
  recebida: 'Recebida',
  recusada: 'Recusada',
  cancelada: 'Cancelada'
};

/* Rótulos dos tipos de campanha */
export const ROTULO_TIPO_CAMPANHA = {
  enchente: 'Enchente',
  deslizamento: 'Deslizamento',
  seca: 'Seca',
  incendio: 'Incêndio',
  outro: 'Outro'
};

/* Rótulos das situações de uma campanha */
export const ROTULO_SITUACAO_CAMPANHA = {
  pendente: 'Pendente',
  ativa: 'Ativa',
  encerrada: 'Encerrada'
};

/* Rótulos das formas de entrega de uma doação */
export const ROTULO_ENTREGA = {
  levar: 'Leva até a ONG',
  retirada: 'Retirada'
};

/* Lista de unidades que a ONG pode escolher ao cadastrar uma necessidade (campo "unidade" do banco) */
export const UNIDADES = ['un.', 'pct.', 'L', 'latas', 'kg', 'cx.'];

/* Nomes curtos dos meses, na ordem (índice 0 = janeiro) */
const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/* Completa um número com zero à esquerda: 5 -> '05' */
/* (A seta => é uma função curta: recebe "numero" e devolve o resultado da expressão à direita) */
const doisDigitos = (numero) => String(numero).padStart(2, '0');

/* Devolve a data de hoje no formato do banco: 'AAAA-MM-DD' */
export function hojeISO() {
  /* new Date() é o momento atual */
  const agora = new Date();
  /* Monta o texto ano-mês-dia. getMonth() conta de 0 a 11, por isso somamos 1 */
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

/* Transforma 'AAAA-MM-DD' em 'DD/MM/AAAA'. Valor vazio vira um travessão */
export function formatarData(iso) {
  /* Sem data: mostra um travessão */
  if (!iso) return '—';
  /* split('-') corta o texto nos hífens: '2026-06-30' vira ['2026', '06', '30'] */
  const [ano, mes, dia] = iso.split('-');
  /* Junta na ordem brasileira */
  return `${dia}/${mes}/${ano}`;
}

/* Transforma 'AAAA-MM-DD' em 'DD/MM' (usado nas tabelas curtas do painel) */
export function formatarDiaMes(iso) {
  if (!iso) return '—';
  /* O espaço vazio antes do mes (", mes") ignora o ano, que não precisamos aqui */
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

/* Soma (ou subtrai) dias a uma data 'AAAA-MM-DD' e devolve no mesmo formato */
export function somarDias(iso, dias) {
  const data = new Date(`${iso}T12:00:00`);   /* meio-dia evita problemas de fuso horário */
  /* setDate ajusta o dia do mês; o próprio JavaScript acerta o mês e o ano se passar do fim */
  data.setDate(data.getDate() + dias);
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

/* Devolve só 'AAAA-MM' (ano e mês) de uma data, usado para agrupar por mês */
export function chaveMes(iso) {
  /* slice(0, 7) pega os 7 primeiros caracteres: '2026-06-30' vira '2026-06' */
  return iso.slice(0, 7);
}

/* Lista as últimas N chaves 'AAAA-MM' terminando no mês de hoje (ex.: 6 meses para o gráfico) */
export function ultimosMeses(quantidade) {
  /* Momento atual e lista (vazia) onde vamos guardar os meses */
  const agora = new Date();
  const meses = [];
  /* Vai do mês mais antigo (i = quantidade - 1 meses atrás) até o mês atual (i = 0) */
  for (let i = quantidade - 1; i >= 0; i--) {
    /* Dia 1 do mês "i meses atrás"; o JavaScript acerta sozinho a virada de ano */
    const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    /* Guarda no formato 'AAAA-MM' */
    meses.push(`${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}`);
  }
  return meses;
}

/* Transforma 'AAAA-MM' em nome curto do mês ('2026-06' vira 'Jun') */
export function nomeMes(chave) {
  /* Pega os caracteres 5 e 6 (o mês), vira número e usa como posição na lista (começa em 0, por isso -1) */
  return MESES_CURTOS[Number(chave.slice(5, 7)) - 1];
}

/* Formata números no padrão brasileiro: 1500 vira '1.500' */
export function formatarNumero(numero) {
  return Number(numero).toLocaleString('pt-BR');
}

/* Formata média com uma casa decimal: 14 vira '14,0' */
export function formatarDecimal(numero) {
  return Number(numero).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/* Quantidade com a unidade: (5, 'un.') vira '5 un.' */
export function formatarQuantidade(quantidade, unidade) {
  /* trim() tira o espaço que sobraria se a unidade fosse vazia */
  return `${formatarNumero(quantidade)} ${unidade}`.trim();
}

/* Primeira letra em maiúscula, usada no quadradinho com a inicial da ONG */
export function inicial(nome) {
  return nome.trim().charAt(0).toUpperCase();
}

/* Remove acentos e deixa tudo em minúsculas, para a busca ignorar acentuação e maiúsculas */
export function normalizar(texto) {
  /* ?? '' evita erro quando o texto é null ou undefined */
  return String(texto ?? '')
    .normalize('NFD')                       /* separa a letra do acento */
    .replace(/[̀-ͯ]/g, '')        /* apaga os acentos */
    .toLowerCase();
}

/* Cria um texto simples para e-mails e endereços: 'João Mendes' vira 'joao.mendes' */
export function slug(texto) {
  /* Troca tudo que não é letra ou número por ponto e tira ponto sobrando no começo e no fim */
  return normalizar(texto).replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
}

/* Primeiro nome de uma pessoa: 'Mariana Costa' vira 'Mariana' */
export function primeiroNome(nome) {
  /* Corta o nome nos espaços e fica com a primeira parte */
  return nome.trim().split(' ')[0];
}

/* Nome abreviado para tabelas: 'Lucas Souza' vira 'Lucas S.' */
export function nomeAbreviado(nome) {
  const partes = nome.trim().split(' ');
  /* Com mais de uma palavra: primeiro nome + inicial do segundo; com uma só: o próprio nome */
  return partes.length > 1 ? `${partes[0]} ${partes[1].charAt(0)}.` : partes[0];
}

/* Calcula percentual inteiro entre 0 e 100 (nunca passa de 100) */
export function percentual(parte, total) {
  /* Total zero (ou vazio): evita dividir por zero e devolve 0% */
  if (!total) return 0;
  /* Regra de três, arredondada; Math.min garante que não passa de 100 */
  return Math.min(100, Math.round((parte / total) * 100));
}
