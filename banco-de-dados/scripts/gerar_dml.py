import bisect
import calendar
import hashlib
import random
import sys
import unicodedata
from datetime import date, timedelta

random.seed(2026)

HOJE = date(2026, 11, 19)
INICIO = date(2024, 11, 1)
MESES = [(2024 + (10 + i) // 12, (10 + i) % 12 + 1) for i in range(24)]
TOTAL_DOACOES = 100000
TOTAL_DOADORES = 4697
TOTAL_ONGS = 300
TOTAL_NECESSIDADES = 3000
TAMANHO_LOTE = 500

CIDADES = [
    ("Vila Velha", "ES"), ("Vitória", "ES"), ("Serra", "ES"), ("Cariacica", "ES"),
    ("Viana", "ES"), ("Guarapari", "ES"), ("Linhares", "ES"), ("Colatina", "ES"),
    ("Cachoeiro de Itapemirim", "ES"), ("São Mateus", "ES"), ("Aracruz", "ES"),
    ("Nova Venécia", "ES"), ("Venda Nova do Imigrante", "ES"), ("Domingos Martins", "ES"),
    ("Marataízes", "ES"), ("Anchieta", "ES"), ("Piúma", "ES"), ("Fundão", "ES"),
    ("Santa Teresa", "ES"), ("Alegre", "ES"), ("Castelo", "ES"), ("Itapemirim", "ES"),
    ("Barra de São Francisco", "ES"), ("Ecoporanga", "ES"), ("Afonso Cláudio", "ES"),
    ("Campos dos Goytacazes", "RJ"), ("Rio de Janeiro", "RJ"), ("Belo Horizonte", "MG"),
    ("Teófilo Otoni", "MG"), ("Governador Valadares", "MG"),
]
DDD = {"ES": "27", "RJ": "21", "MG": "31"}
PESO_CIDADE = [14, 14, 12, 10, 5, 5, 4, 4, 4, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1]

CATEGORIAS = [
    ("Alimentos", 25, [("Arroz 5 kg", "pct."), ("Feijão 1 kg", "pct."), ("Leite integral", "L"),
                       ("Leite em pó", "latas"), ("Óleo de soja", "un."), ("Macarrão", "pct."),
                       ("Açúcar", "kg"), ("Farinha de trigo", "kg"), ("Café", "pct."), ("Cesta básica", "un.")]),
    ("Roupas", 14, [("Agasalhos tam. M/G", "un."), ("Camisetas infantis", "un."), ("Calças jeans", "un."),
                    ("Roupas de cama", "un."), ("Meias", "pct."), ("Roupas íntimas", "pct."), ("Jaquetas", "un.")]),
    ("Calçados", 8, [("Tênis infantil", "un."), ("Chinelos", "un."), ("Sapatos sociais", "un."), ("Botas", "un.")]),
    ("Higiene", 15, [("Sabonete", "un."), ("Fraldas geriátricas G", "pct."), ("Fraldas infantis M", "pct."),
                     ("Papel higiênico", "pct."), ("Shampoo", "un."), ("Escova de dente", "un."), ("Absorventes", "pct.")]),
    ("Cobertores", 8, [("Cobertores de casal", "un."), ("Cobertores de solteiro", "un."), ("Mantas", "un."),
                       ("Edredons", "un.")]),
    ("Material escolar", 9, [("Cadernos", "un."), ("Lápis de cor", "un."), ("Mochilas", "un."),
                             ("Canetas", "un."), ("Livros didáticos", "un.")]),
    ("Móveis", 6, [("Camas de solteiro", "un."), ("Colchões", "un."), ("Mesas", "un."), ("Fogões", "un."),
                   ("Geladeiras", "un."), ("Armários", "un.")]),
    ("Água", 8, [("Água mineral 1,5 L", "pct."), ("Garrafões de 20 L", "un."), ("Galões de água", "un.")]),
]

NOMES = ["Ana", "Bruno", "Carla", "Daniel", "Eduarda", "Felipe", "Gabriela", "Henrique", "Isabela", "João",
         "Karina", "Lucas", "Mariana", "Nicolas", "Olivia", "Pedro", "Quésia", "Rafael", "Sabrina", "Thiago",
         "Ursula", "Vinícius", "Wesley", "Ximena", "Yasmin", "Zeca", "Alice", "Bernardo", "Camila", "Diego",
         "Elisa", "Fábio", "Giovana", "Heitor", "Ingrid", "Júlio", "Larissa", "Marcos", "Natália", "Otávio",
         "Patrícia", "Renato", "Sofia", "Tatiane", "Valentina", "William", "Beatriz", "Caio", "Débora", "Enzo"]
SOBRENOMES = ["Silva", "Souza", "Costa", "Santos", "Oliveira", "Pereira", "Rodrigues", "Almeida", "Nascimento",
              "Lima", "Araújo", "Fernandes", "Carvalho", "Gomes", "Martins", "Rocha", "Ribeiro", "Alves",
              "Monteiro", "Mendes", "Barros", "Freitas", "Barbosa", "Pinto", "Moreira", "Cavalcanti", "Dias",
              "Castro", "Campos", "Cardoso", "Teixeira", "Correia", "Moura", "Nunes", "Ramos", "Vieira",
              "Lopes", "Machado", "Azevedo", "Melo"]

PREFIXOS_ONG = ["Lar", "Casa", "Abrigo", "Instituto", "Projeto", "Associação", "Centro", "Fundação", "Grupo",
                "Movimento", "Núcleo", "Obra"]
SUFIXOS_ONG = ["Esperança", "da Criança", "Sol", "Saber", "Agasalho", "Amor", "Vida", "Solidária", "Luz",
               "Semear", "Recomeço", "Girassol", "Boa Vontade", "Nova Vida", "Fraternidade", "Acolher",
               "Renascer", "Bom Samaritano", "Mãos Amigas", "Futuro", "Raízes", "Caminho"]
ONGS_FIXAS = [
    ("Lar Esperança", "Vila Velha", "Há 15 anos acolhemos 35 idosos em situação de vulnerabilidade. Toda doação recebida é registrada e confirmada na plataforma."),
    ("Casa da Criança", "Vila Velha", "Orfanato que atende 40 crianças. Precisa de leite e roupas."),
    ("Abrigo Sol", "Vila Velha", "Abrigo temporário para famílias atingidas pela enchente."),
    ("Instituto Saber", "Vitória", "Reforço escolar gratuito. Precisa de material escolar."),
    ("Banco de Alimentos ES", "Vitória", "Distribui cestas básicas a 200 famílias."),
    ("Projeto Agasalho", "Serra", "Campanha permanente de roupas e calçados."),
]
DESCRICOES_ONG = [
    "Acolhimento de idosos. Recebe cobertores, fraldas e alimentos.",
    "Atendimento a famílias em situação de vulnerabilidade social com cestas básicas e roupas.",
    "Reforço escolar e atividades culturais para crianças da comunidade.",
    "Abrigo para pessoas em situação de rua, com refeições e kits de higiene.",
    "Apoio a mães atípicas e seus filhos com alimentos, fraldas e material de higiene.",
    "Distribuição de agasalhos, cobertores e calçados no período de frio.",
    "Casa de passagem para famílias atingidas por desastres ambientais.",
    "Creche comunitária que atende crianças de 0 a 6 anos.",
]
HORARIOS = ["Seg a sex, 8h às 17h", "Seg a sex, 8h às 17h · Sáb, 8h às 12h", "Seg a sáb, 9h às 16h",
            "Ter a dom, 10h às 18h", "Seg a sex, 9h às 15h"]
RUAS = ["Rua das Flores", "Avenida Brasil", "Rua da Paz", "Rua Sete de Setembro", "Avenida Central",
        "Rua das Palmeiras", "Rua São José", "Avenida Beira Mar", "Rua do Comércio", "Rua XV de Novembro",
        "Rua Santa Luzia", "Avenida Getúlio Vargas"]
BAIRROS = ["Centro", "Jardim Camburi", "Praia da Costa", "Itapuã", "Glória", "Jardim América", "Santa Rita",
           "São Torquato", "Bela Vista", "Novo Horizonte", "Vila Nova", "Industrial"]
OBSERVACOES = ["Itens novos, ainda na embalagem", "Em bom estado de uso", "Doação em nome da família",
               "Posso entregar no fim de semana", "Material limpo e separado", "Doação de colegas de trabalho",
               "Prefiro entregar pela manhã"]
MSG_ACEITA = ["Obrigado! Pode entregar na recepção.", "Doação aceita. Aguardamos o item.",
              "Agradecemos a ajuda, estamos esperando."]
MSG_RECEBIDA = ["Recebemos com carinho. Muito obrigado!", "Item recebido e conferido. Gratidão!",
                "Doação recebida, ajudará muitas famílias."]
MSG_RECUSADA = ["No momento não precisamos deste item.", "A necessidade já foi atendida.",
                "Não conseguimos receber nesta data."]
TIPOS_CAMPANHA = [("enchente", "Enchente em {c}", "Famílias desabrigadas precisam de água potável, alimentos, roupas e produtos de higiene."),
                  ("deslizamento", "Deslizamento em {c}", "Moradores de áreas de risco perderam suas casas e precisam de abrigo, colchões e alimentos."),
                  ("seca", "Estiagem em {c}", "A falta de chuvas afeta a produção e o abastecimento. Precisamos de água e alimentos."),
                  ("incendio", "Incêndio em {c}", "Famílias perderam seus bens e precisam de roupas, móveis e itens de higiene.")]

CATEGORIA_ID = {nome: i + 1 for i, (nome, _, _) in enumerate(CATEGORIAS)}
METAS_POR_TIPO = {
    "enchente": [("Água", "água potável"), ("Alimentos", "alimentos não perecíveis"), ("Higiene", "itens de higiene")],
    "deslizamento": [("Móveis", "colchões e camas"), ("Alimentos", "alimentos não perecíveis"), ("Cobertores", "cobertores")],
    "seca": [("Água", "água potável"), ("Alimentos", "alimentos não perecíveis")],
    "incendio": [("Roupas", "roupas e agasalhos"), ("Móveis", "móveis básicos"), ("Higiene", "itens de higiene")],
}
CIDADES_EXTRAS = {"enchente": 2, "seca": 3, "deslizamento": 1, "incendio": 0}
LOCAL_ADMIN = ("Avenida Jerônimo Monteiro, 1000 - Centro, Vitória", "Seg a sex, 8h às 17h")


def sem_acento(texto):
    return unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")


def slug(texto):
    s = sem_acento(texto).lower()
    return "".join(ch if ch.isalnum() else "-" for ch in s).strip("-")


def q(valor):
    if valor is None:
        return "NULL"
    if isinstance(valor, bool):
        return "TRUE" if valor else "FALSE"
    if isinstance(valor, date):
        return "'" + valor.isoformat() + "'"
    if isinstance(valor, (int, float)):
        return str(valor)
    return "'" + str(valor).replace("'", "''") + "'"


def inserir(saida, tabela, colunas, linhas):
    for i in range(0, len(linhas), TAMANHO_LOTE):
        lote = linhas[i:i + TAMANHO_LOTE]
        saida.write("INSERT INTO " + tabela + " (" + ", ".join(colunas) + ") VALUES\n")
        saida.write(",\n".join("(" + ", ".join(q(v) for v in linha) + ")" for linha in lote))
        saida.write(";\n")
    saida.write("\n")


def data_aleatoria(a, b):
    return a + timedelta(days=random.randint(0, (b - a).days))


def telefone(uf, fixo=False):
    ddd = DDD[uf]
    if fixo:
        return "(%s) 3%03d-%04d" % (ddd, random.randint(0, 999), random.randint(0, 9999))
    return "(%s) 9%04d-%04d" % (ddd, random.randint(0, 9999), random.randint(0, 9999))


def endereco():
    return "%s, %d - %s" % (random.choice(RUAS), random.randint(10, 999), random.choice(BAIRROS))


def sazonalidade(categoria, mes):
    if categoria == "Cobertores":
        return 3.0 if mes in (5, 6, 7, 8) else 0.5
    if categoria == "Roupas":
        return 1.8 if mes in (5, 6, 7, 8) else 0.8
    if categoria == "Material escolar":
        return 3.5 if mes in (1, 2) else 0.7
    if categoria == "Alimentos":
        return 1.6 if mes in (11, 12) else 1.0
    return 1.0


def gerar_cidades():
    return [(i + 1, nome, uf) for i, (nome, uf) in enumerate(CIDADES)]


def gerar_categorias():
    return [(i + 1, nome) for i, (nome, _, _) in enumerate(CATEGORIAS)]


def hash_senha(id_usuario):
    return hashlib.sha256(("senha" + str(id_usuario)).encode()).hexdigest()


def gerar_usuarios():
    ids_cidades = list(range(1, len(CIDADES) + 1))
    usuarios = []
    nomes_admin = ["Administrador Conecta", "Moderador Conecta", "Suporte Conecta"]
    for i, nome in enumerate(nomes_admin, start=1):
        usuarios.append([i, nome, "admin%d@conectadoacoes.org" % i, hash_senha(i), telefone("ES"),
                         "admin", 2, date(2024, 1, 10)])
    n = len(usuarios)
    cidades_ongs = []
    for i in range(TOTAL_ONGS):
        n += 1
        if i < len(ONGS_FIXAS):
            cid = next(k + 1 for k, c in enumerate(CIDADES) if c[0] == ONGS_FIXAS[i][1])
        else:
            cid = random.choices(ids_cidades, weights=PESO_CIDADE)[0]
        cidades_ongs.append(cid)
        nome = "%s %s" % (random.choice(NOMES), random.choice(SOBRENOMES))
        uf = CIDADES[cid - 1][1]
        usuarios.append([n, nome, "%s.%d@exemplo.com" % (slug(nome), n), hash_senha(n), telefone(uf),
                         "ong", cid, data_aleatoria(date(2024, 1, 10), date(2024, 10, 20))])
    datas = sorted([data_aleatoria(date(2024, 1, 10), date(2024, 10, 31)) for _ in range(400)] +
                   [data_aleatoria(INICIO, date(2026, 10, 31)) for _ in range(TOTAL_DOADORES - 400)])
    inicio_doadores = n
    for d in datas:
        n += 1
        cid = random.choices(ids_cidades, weights=PESO_CIDADE)[0]
        nome = "%s %s %s" % (random.choice(NOMES), random.choice(SOBRENOMES), random.choice(SOBRENOMES))
        usuarios.append([n, nome, "%s.%d@exemplo.com" % (slug(nome), n), hash_senha(n),
                         telefone(CIDADES[cid - 1][1]), "doador", cid, d])
    return usuarios, cidades_ongs, inicio_doadores


def gerar_ongs(usuarios, cidades_ongs):
    ongs = []
    cnpjs = set()
    usados = set()
    reps = [u for u in usuarios if u[5] == "ong"]
    for i, rep in enumerate(reps):
        if i < len(ONGS_FIXAS):
            nome, _, descricao = ONGS_FIXAS[i]
        else:
            while True:
                nome = "%s %s" % (random.choice(PREFIXOS_ONG), random.choice(SUFIXOS_ONG))
                if (nome, cidades_ongs[i]) not in usados:
                    break
            descricao = random.choice(DESCRICOES_ONG)
        usados.add((nome, cidades_ongs[i]))
        while True:
            cnpj = "%02d.%03d.%03d/0001-%02d" % (random.randint(10, 99), random.randint(0, 999),
                                                 random.randint(0, 999), random.randint(0, 99))
            if cnpj not in cnpjs:
                cnpjs.add(cnpj)
                break
        uf = CIDADES[cidades_ongs[i] - 1][1]
        verificada = True if i < len(ONGS_FIXAS) else random.random() < 0.9
        ongs.append([i + 1, rep[0], cidades_ongs[i], nome, cnpj, descricao, endereco(),
                     random.choice(HORARIOS), telefone(uf, fixo=True),
                     "contato@%s.org.br" % slug(nome).replace("-", ""), random.random() < 0.45,
                     verificada, rep[7]])
    return ongs


def metas_da_campanha(tipo, n, base):
    modelos = METAS_POR_TIPO[tipo]
    quantidades = [base, [300, 600, 900, 1200][n % 4], [200, 400, 700, 1000][n % 4]]
    total = min(1 + n % 3, len(modelos))
    return [(CATEGORIA_ID[modelos[k][0]], modelos[k][1], quantidades[k]) for k in range(total)]


def cidades_da_campanha(cid, tipo):
    cidades = [cid]
    for k in range(1, CIDADES_EXTRAS[tipo] + 1):
        c = (cid + 3 * k) % 25 + 1
        if c not in cidades:
            cidades.append(c)
    return cidades


def gerar_campanhas(ongs):
    ong_por_id = {o[0]: o for o in ongs}
    campanhas = []
    ligacoes_cidade = []
    metas = []

    def registrar(linha, cidades, itens_meta):
        campanhas.append(linha)
        ligacoes_cidade.extend([linha[0], c] for c in cidades)
        for categoria, item, quantidade in itens_meta:
            metas.append([len(metas) + 1, linha[0], categoria, item, quantidade])

    def local(id_ong):
        if id_ong is None:
            return LOCAL_ADMIN
        return ong_por_id[id_ong][6], ong_por_id[id_ong][7]

    n = 0
    nomes_cidades = [c[0] for c in CIDADES]
    periodos = sorted(data_aleatoria(INICIO, date(2026, 8, 31)) for _ in range(22))
    for inicio in periodos:
        n += 1
        tipo, titulo, descricao = random.choice(TIPOS_CAMPANHA)
        cid = random.choices(range(1, 26), weights=PESO_CIDADE[:25])[0]
        fim = inicio + timedelta(days=random.randint(20, 60))
        status = "encerrada" if fim < HOJE else "ativa"
        id_ong = (n * 37) % TOTAL_ONGS + 1 if n % 2 else None
        base = random.choice([500, 800, 1000, 1500, 2000, 3000, 5000])
        registrar([n, cid, id_ong, titulo.format(c=nomes_cidades[cid - 1]), descricao, tipo, inicio, fim, status, *local(id_ong)],
                  cidades_da_campanha(cid, tipo), metas_da_campanha(tipo, n, base))
    registrar([n + 1, 1, None, "Enchente em Vila Velha", "12 entidades precisam de água potável, alimentos, roupas e produtos de higiene.",
               "enchente", date(2026, 10, 10), date(2026, 11, 30), "ativa", *local(None)],
              [1, 4], [(CATEGORIA_ID["Água"], "água potável", 1500), (CATEGORIA_ID["Alimentos"], "alimentos não perecíveis", 800),
                       (CATEGORIA_ID["Higiene"], "itens de higiene", 700)])
    registrar([n + 2, 3, 17, "Deslizamento em Serra", "Moradores de áreas de risco precisam de abrigo, colchões e alimentos.",
               "deslizamento", date(2026, 12, 1), date(2027, 1, 15), "pendente", *local(17)],
              [3], [(CATEGORIA_ID["Móveis"], "colchões e camas", 300), (CATEGORIA_ID["Alimentos"], "alimentos não perecíveis", 600)])
    return campanhas, ligacoes_cidade, metas


def montar_vinculo(id_campanha, id_necessidade, data_pedido, status_campanha):
    if status_campanha == "encerrada":
        status = "aceito"
    elif id_necessidade % 11 == 0:
        status = "pendente"
    elif id_necessidade % 17 == 0:
        status = "recusado"
    else:
        status = "aceito"
    return [id_campanha, id_necessidade, status, id_necessidade % 3 == 0, data_pedido]


def gerar_necessidades(ongs, campanhas, categorias_campanha):
    verificadas = [o for o in ongs if o[11]]
    pesos_cat = [c[1] for c in CATEGORIAS]
    brutas = []
    for _ in range(TOTAL_NECESSIDADES):
        ong = random.choice(verificadas)
        idx = random.choices(range(len(CATEGORIAS)), weights=pesos_cat)[0]
        item, unidade = random.choice(CATEGORIAS[idx][2])
        d = data_aleatoria(INICIO, date(2026, 10, 15))
        brutas.append({"ong": ong[0], "cat": idx, "item": item, "unidade": unidade, "data": d})
    for idx in range(len(CATEGORIAS)):
        da_categoria = sorted([b for b in brutas if b["cat"] == idx], key=lambda b: b["data"])
        for b in da_categoria[:3]:
            b["data"] = INICIO + timedelta(days=random.randint(0, 10))
    brutas.sort(key=lambda b: b["data"])
    necessidades = []
    vinculos = []
    status_campanha = {c[0]: c[8] for c in campanhas}
    for i, b in enumerate(brutas, start=1):
        d = b["data"]
        prioridade = "urgente" if random.random() < 0.25 else "normal"
        quantidade = random.choice([20, 30, 40, 50, 60, 80, 100, 150, 200, 300])
        precisa_ate = None if random.random() < 0.1 else d + timedelta(days=random.randint(15, 90))
        concluida_prob = 0.7 if d < date(2026, 6, 1) else 0.15
        situacao = "concluida" if random.random() < concluida_prob else "ativa"
        atualizacao = min(d + timedelta(days=random.randint(0, 30)), HOJE)
        vigentes = [c[0] for c in campanhas if c[6] <= d <= c[7] and c[8] != "pendente"]
        id_campanha = random.choice(vigentes) if vigentes and random.random() < 0.15 else None
        if id_campanha and b["cat"] + 1 not in categorias_campanha[id_campanha]:
            id_campanha = None
        if id_campanha:
            vinculos.append(montar_vinculo(id_campanha, i, d, status_campanha[id_campanha]))
            if i % 10 == 0:
                outras = [c for c in vigentes if c != id_campanha and b["cat"] + 1 in categorias_campanha[c]]
                if outras:
                    vinculos.append(montar_vinculo(outras[0], i, d, status_campanha[outras[0]]))
        descricao = None if random.random() < 0.4 else "Preferência por itens novos ou em bom estado."
        necessidades.append([i, b["ong"], b["cat"] + 1, id_campanha, b["item"], descricao, quantidade,
                             b["unidade"], prioridade, precisa_ate, situacao, d, atualizacao])
    ja_ligadas = {(v[0], v[1]) for v in vinculos}
    situacoes = ["aceito", "aceito", "aceito", "pendente", "pendente", "recusado"]
    for c in campanhas:
        if c[8] != "ativa":
            continue
        elegiveis = [n for n in necessidades if c[6] <= n[11] <= c[7] and n[2] in categorias_campanha[c[0]]
                     and (c[0], n[0]) not in ja_ligadas]
        for k, n in enumerate(elegiveis[:len(situacoes)]):
            vinculos.append([c[0], n[0], situacoes[k], k % 2 == 0, n[11]])
    return necessidades, vinculos


def gerar_doacoes(usuarios, inicio_doadores, ongs, necessidades):
    doadores = usuarios[inicio_doadores:]
    datas_doadores = [u[7].toordinal() for u in doadores]
    aceita_retirada = {o[0]: o[10] for o in ongs}
    por_categoria = {}
    for n in necessidades:
        por_categoria.setdefault(n[2], []).append(n)
    datas_categoria = {c: [n[11].toordinal() for n in lista] for c, lista in por_categoria.items()}
    pesos_mes = [1 + 0.04 * i for i in range(len(MESES))]
    doacoes = []
    for _ in range(TOTAL_DOACOES):
        ano, mes = random.choices(MESES, weights=pesos_mes)[0]
        dia = random.randint(1, calendar.monthrange(ano, mes)[1])
        data_reg = date(ano, mes, dia)
        pesos = [c[1] * sazonalidade(c[0], mes) for c in CATEGORIAS]
        cat = random.choices(range(1, len(CATEGORIAS) + 1), weights=pesos)[0]
        lista = por_categoria[cat]
        k = bisect.bisect_right(datas_categoria[cat], data_reg.toordinal())
        if k == 0:
            k = 1
            data_reg = lista[0][11]
        nec = lista[k - 1 - int(min(k, 60) * random.random() ** 2)]
        kd = bisect.bisect_right(datas_doadores, data_reg.toordinal())
        doador = doadores[min(int(kd * random.random() ** 1.6), kd - 1)]
        quantidade = min(random.choice([1, 1, 1, 2, 2, 3, 3, 4, 5, 6]), nec[6])
        retirada = aceita_retirada[nec[1]] and random.random() < 0.4
        data_prev = data_reg + timedelta(days=random.randint(3, 14))
        idade = (HOJE - data_reg).days
        if idade > 20:
            status = random.choices(["recebida", "recusada", "cancelada"], weights=[68, 8, 24])[0]
        else:
            status = random.choices(["oferecida", "aceita", "recebida", "cancelada", "recusada"],
                                    weights=[40, 25, 15, 12, 8])[0]
        data_rec = None
        if status == "recebida":
            data_rec = min(max(data_prev + timedelta(days=random.randint(-1, 5)), data_reg), HOJE)
        mensagem = None
        if status == "aceita":
            mensagem = random.choice(MSG_ACEITA)
        elif status == "recebida":
            mensagem = random.choice(MSG_RECEBIDA)
        elif status == "recusada":
            mensagem = random.choice(MSG_RECUSADA)
        doacoes.append([doador[0], nec[0], quantidade,
                        random.choice(OBSERVACOES) if random.random() < 0.5 else None,
                        "retirada" if retirada else "levar", endereco() if retirada else None,
                        data_prev, data_reg, data_rec, status, mensagem])
    doacoes.sort(key=lambda d: d[7])
    return [[i] + d for i, d in enumerate(doacoes, start=1)]


def gerar_doacoes_meta(usuarios, inicio_doadores, campanhas, metas, primeiro_id):
    rng = random.Random(2027)
    doadores = usuarios[inicio_doadores:]
    datas_doadores = [u[7].toordinal() for u in doadores]
    metas_da_camp = {}
    for m in metas:
        metas_da_camp.setdefault(m[1], []).append(m)
    doacoes = []
    for c in campanhas:
        if c[8] == "pendente":
            continue
        dias = (min(c[7], HOJE) - c[6]).days
        for _ in range(60):
            data_reg = c[6] + timedelta(days=rng.randint(0, dias))
            meta = rng.choice(metas_da_camp[c[0]])
            kd = max(bisect.bisect_right(datas_doadores, data_reg.toordinal()), 1)
            doador = doadores[min(int(kd * rng.random() ** 1.6), kd - 1)]
            quantidade = rng.choice([1, 1, 2, 2, 3, 5, 10])
            data_prev = data_reg + timedelta(days=rng.randint(3, 10))
            if (HOJE - data_reg).days > 20:
                status = rng.choices(["recebida", "recusada", "cancelada"], weights=[70, 8, 22])[0]
            else:
                status = rng.choices(["oferecida", "aceita", "recebida", "cancelada", "recusada"],
                                     weights=[40, 25, 15, 12, 8])[0]
            data_rec = None
            mensagem = None
            if status == "recebida":
                data_rec = min(max(data_prev + timedelta(days=rng.randint(-1, 5)), data_reg), HOJE)
                mensagem = rng.choice(MSG_RECEBIDA)
            elif status == "aceita":
                mensagem = rng.choice(MSG_ACEITA)
            elif status == "recusada":
                mensagem = rng.choice(MSG_RECUSADA)
            doacoes.append([doador[0], None, meta[0], quantidade,
                            rng.choice(OBSERVACOES) if rng.random() < 0.4 else None,
                            "levar", None, data_prev, data_reg, data_rec, status, mensagem])
    doacoes.sort(key=lambda d: d[8])
    return [[primeiro_id + i] + d for i, d in enumerate(doacoes)]


def main():
    destino = sys.argv[1] if len(sys.argv) > 1 else "dml.sql"
    cidades = gerar_cidades()
    categorias = gerar_categorias()
    usuarios, cidades_ongs, inicio_doadores = gerar_usuarios()
    ongs = gerar_ongs(usuarios, cidades_ongs)
    campanhas, ligacoes_cidade, metas = gerar_campanhas(ongs)
    categorias_campanha = {}
    for m in metas:
        categorias_campanha.setdefault(m[1], set()).add(m[2])
    necessidades, vinculos = gerar_necessidades(ongs, campanhas, categorias_campanha)
    doacoes = gerar_doacoes(usuarios, inicio_doadores, ongs, necessidades)
    doacoes_meta = gerar_doacoes_meta(usuarios, inicio_doadores, campanhas, metas, len(doacoes) + 1)
    doacoes_todas = [d[:3] + [None] + d[3:] for d in doacoes] + doacoes_meta
    with open(destino, "w", encoding="utf-8", newline="\n") as saida:
        saida.write("BEGIN;\n\n")
        inserir(saida, "cidade", ["id_cidade", "nome", "uf"], cidades)
        inserir(saida, "categoria", ["id_categoria", "nome"], categorias)
        inserir(saida, "usuario", ["id_usuario", "nome", "email", "senha_hash", "telefone", "perfil",
                                   "id_cidade", "data_cadastro"], usuarios)
        inserir(saida, "ong", ["id_ong", "id_usuario", "id_cidade", "nome", "cnpj", "descricao", "endereco",
                               "horario_atendimento", "telefone", "email_contato", "aceita_retirada",
                               "verificada", "data_cadastro"], ongs)
        inserir(saida, "campanha", ["id_campanha", "id_ong", "titulo", "descricao", "tipo", "data_inicio", "data_fim",
                                    "status", "endereco_recebimento", "horario_recebimento"],
                [[c[0]] + c[2:] for c in campanhas])
        inserir(saida, "campanha_cidade", ["id_campanha", "id_cidade"], ligacoes_cidade)
        inserir(saida, "campanha_meta", ["id_meta", "id_campanha", "id_categoria", "item", "quantidade"], metas)
        inserir(saida, "necessidade", ["id_necessidade", "id_ong", "id_categoria", "item",
                                       "descricao", "quantidade", "unidade", "prioridade", "precisa_ate",
                                       "situacao", "data_cadastro", "data_atualizacao"],
                [n[:3] + n[4:] for n in necessidades])
        inserir(saida, "campanha_necessidade", ["id_campanha", "id_necessidade", "status", "aumenta_meta", "data_pedido"], vinculos)
        inserir(saida, "doacao", ["id_doacao", "id_doador", "id_necessidade", "id_meta", "quantidade", "observacao",
                                  "forma_entrega", "endereco_retirada", "data_prevista", "data_registro",
                                  "data_recebimento", "status", "mensagem_ong"], doacoes_todas)
        for tabela, coluna in [("cidade", "id_cidade"), ("categoria", "id_categoria"), ("usuario", "id_usuario"),
                               ("ong", "id_ong"), ("campanha", "id_campanha"), ("campanha_meta", "id_meta"),
                               ("necessidade", "id_necessidade"), ("doacao", "id_doacao")]:
            saida.write("SELECT setval(pg_get_serial_sequence('%s', '%s'), (SELECT MAX(%s) FROM %s));\n"
                        % (tabela, coluna, coluna, tabela))
        saida.write("\nCOMMIT;\n")
    tabelas = (cidades, categorias, usuarios, ongs, campanhas, ligacoes_cidade, metas, necessidades, vinculos, doacoes_todas)
    total = sum(len(t) for t in tabelas)
    print("cidade", len(cidades), "categoria", len(categorias), "usuario", len(usuarios), "ong", len(ongs),
          "campanha", len(campanhas), "campanha_cidade", len(ligacoes_cidade), "campanha_meta", len(metas),
          "necessidade", len(necessidades), "campanha_necessidade", len(vinculos), "doacao", len(doacoes_todas),
          "(a meta:", len(doacoes_meta), ")")
    print("total de registros:", total)


main()
