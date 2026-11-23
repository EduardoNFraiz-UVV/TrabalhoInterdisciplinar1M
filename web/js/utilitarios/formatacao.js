export const ROTULO_STATUS_DOACAO = {
  oferecida: 'Oferecida',
  aceita: 'Aceita',
  recebida: 'Recebida',
  recusada: 'Recusada',
  cancelada: 'Cancelada'
};

export const ROTULO_TIPO_CAMPANHA = {
  enchente: 'Enchente',
  deslizamento: 'Deslizamento',
  seca: 'Seca',
  incendio: 'Incêndio',
  outro: 'Outro'
};

export const ROTULO_SITUACAO_CAMPANHA = {
  pendente: 'Pendente',
  ativa: 'Ativa',
  encerrada: 'Encerrada'
};

export const ROTULO_ENTREGA = {
  levar: 'Leva até a ONG',
  retirada: 'Retirada'
};

export const UNIDADES = ['un.', 'pct.', 'L', 'latas', 'kg', 'cx.'];

const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const doisDigitos = (numero) => String(numero).padStart(2, '0');

export function hojeISO() {
  const agora = new Date();
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

export function formatarData(iso) {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarDiaMes(iso) {
  if (!iso) return '—';
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

export function somarDias(iso, dias) {
  const data = new Date(`${iso}T12:00:00`);
  data.setDate(data.getDate() + dias);
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

export function chaveMes(iso) {
  return iso.slice(0, 7);
}

export function ultimosMeses(quantidade) {
  const agora = new Date();
  const meses = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    meses.push(`${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}`);
  }
  return meses;
}

export function nomeMes(chave) {
  return MESES_CURTOS[Number(chave.slice(5, 7)) - 1];
}

export function formatarNumero(numero) {
  return Number(numero).toLocaleString('pt-BR');
}

export function formatarDecimal(numero) {
  return Number(numero).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatarQuantidade(quantidade, unidade) {
  return `${formatarNumero(quantidade)} ${unidade}`.trim();
}

export function inicial(nome) {
  return nome.trim().charAt(0).toUpperCase();
}

export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function slug(texto) {
  return normalizar(texto).replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
}

export function primeiroNome(nome) {
  return nome.trim().split(' ')[0];
}

export function nomeAbreviado(nome) {
  const partes = nome.trim().split(' ');
  return partes.length > 1 ? `${partes[0]} ${partes[1].charAt(0)}.` : partes[0];
}

export function percentual(parte, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((parte / total) * 100));
}
