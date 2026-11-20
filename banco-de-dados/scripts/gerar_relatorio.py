import csv
import math
import os
from collections import defaultdict
from html import escape

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRIMARIA = "#0D6B65"
TRILHA = "#E6EFED"
GRADE = "#CCDAD7"
LINHA_FORTE = "#71857F"
TINTA = "#13201E"
TINTA_SUAVE = "#4A5C59"
MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
INTEGRANTES = ["Bernardo Teixeira Angeli", "Eduardo Neuman", "Filippi Kruger", "Heitor Vieira Holander", "Julio Lyra"]


def ler(nome):
    with open(os.path.join(RAIZ, "resultados", nome), encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def inteiro(n):
    return f"{int(round(n)):,}".replace(",", ".")


def decimal(x, casas=1):
    s = f"{x:,.{casas}f}"
    return s.replace(",", "§").replace(".", ",").replace("§", ".")


def rotulo_mes(ym, curto=True):
    ano, mes = ym.split("-")
    return f"{MESES_ABREV[int(mes) - 1]}/{ano[2:] if curto else ano}"


def painel_linha(valores, meses, ymax, mostrar_eixo):
    w, h = 163, 158
    ml, mr, mt, mb = 30, 8, 18, 20
    pw, ph = w - ml - mr, h - mt - mb
    n = len(valores)
    xs = [ml + i * pw / (n - 1) for i in range(n)]
    ys = [mt + ph * (1 - v / ymax) for v in valores]
    partes = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="Doações por mês">']
    for frac in (0, 0.5, 1):
        y = mt + ph * (1 - frac)
        cor = LINHA_FORTE if frac == 0 else GRADE
        partes.append(f'<line x1="{ml}" x2="{w - mr}" y1="{y:.1f}" y2="{y:.1f}" stroke="{cor}" stroke-width="1"/>')
        if mostrar_eixo:
            partes.append(f'<text x="{ml - 4}" y="{y + 3:.1f}" text-anchor="end" font-size="8.5" fill="{TINTA_SUAVE}">{inteiro(ymax * frac)}</text>')
    pontos = " ".join(f"{x:.1f},{y:.1f}" for x, y in zip(xs, ys))
    partes.append(f'<polyline points="{pontos}" fill="none" stroke="{PRIMARIA}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>')
    pico = max(range(n), key=lambda i: valores[i])
    ancora = "start" if pico < 3 else ("end" if pico > n - 4 else "middle")
    partes.append(f'<circle cx="{xs[pico]:.1f}" cy="{ys[pico]:.1f}" r="3.5" fill="{PRIMARIA}" stroke="#fff" stroke-width="2"/>')
    partes.append(f'<text x="{xs[pico]:.1f}" y="{ys[pico] - 7:.1f}" text-anchor="{ancora}" font-size="9.5" font-weight="700" fill="{TINTA}">{inteiro(valores[pico])}</text>')
    partes.append(f'<text x="{ml}" y="{h - 4}" font-size="8.5" fill="{TINTA_SUAVE}">{rotulo_mes(meses[0])}</text>')
    partes.append(f'<text x="{w - mr}" y="{h - 4}" text-anchor="end" font-size="8.5" fill="{TINTA_SUAVE}">{rotulo_mes(meses[-1])}</text>')
    partes.append("</svg>")
    return "".join(partes)


def barras_percentual(linhas):
    w = 336
    rotulo_w, trilha_x, trilha_w = 0, 104, 180
    alt = 24
    h = alt * len(linhas) + 20
    partes = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="Percentual atendido por categoria">']
    for i, (nome, pct) in enumerate(linhas):
        y = i * alt + 5
        partes.append(f'<text x="0" y="{y + 11}" font-size="11" fill="{TINTA}">{escape(nome)}</text>')
        partes.append(f'<rect x="{trilha_x}" y="{y}" width="{trilha_w}" height="14" rx="4" fill="{TRILHA}"/>')
        partes.append(f'<rect x="{trilha_x}" y="{y}" width="{max(pct, 0.5) / 100 * trilha_w:.1f}" height="14" rx="4" fill="{PRIMARIA}"/>')
        partes.append(f'<text x="{trilha_x + trilha_w + 8}" y="{y + 11}" font-size="11" font-weight="700" fill="{TINTA}">{decimal(pct)}%</text>')
    base = alt * len(linhas) + 14
    partes.append(f'<text x="{trilha_x}" y="{base}" font-size="8.5" fill="{TINTA_SUAVE}">0%</text>')
    partes.append(f'<text x="{trilha_x + trilha_w}" y="{base}" text-anchor="end" font-size="8.5" fill="{TINTA_SUAVE}">100% da demanda</text>')
    partes.append("</svg>")
    return "".join(partes)


def barras_media(linhas, maximo):
    w = 688
    trilha_x, trilha_w = 140, 450
    alt = 30
    h = alt * len(linhas) + 6
    partes = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="Média mensal por categoria">']
    for i, (nome, valor) in enumerate(linhas):
        y = i * alt + 4
        partes.append(f'<text x="0" y="{y + 14}" font-size="12.5" fill="{TINTA}">{escape(nome)}</text>')
        partes.append(f'<rect x="{trilha_x}" y="{y}" width="{trilha_w}" height="18" rx="4" fill="{TRILHA}"/>')
        partes.append(f'<rect x="{trilha_x}" y="{y}" width="{valor / maximo * trilha_w:.1f}" height="18" rx="4" fill="{PRIMARIA}"/>')
        partes.append(f'<text x="{trilha_x + trilha_w + 10}" y="{y + 14}" font-size="12.5" font-weight="700" fill="{TINTA}">{decimal(valor)}</text>')
    partes.append("</svg>")
    return "".join(partes)


def tabela(cabecalho, linhas, alinhar_direita_a_partir=1):
    th = "".join(f'<th class="{"num" if i >= alinhar_direita_a_partir else ""}">{escape(c)}</th>' for i, c in enumerate(cabecalho))
    trs = []
    for linha in linhas:
        tds = "".join(f'<td class="{"num" if i >= alinhar_direita_a_partir else ""}">{escape(str(c))}</td>' for i, c in enumerate(linha))
        trs.append(f"<tr>{tds}</tr>")
    return f"<table><thead><tr>{th}</tr></thead><tbody>{''.join(trs)}</tbody></table>"


def montar():
    c1 = ler("consulta1-doacoes-por-mes-e-categoria.csv")
    c2 = ler("consulta2-demanda-por-categoria-e-prioridade.csv")
    c3 = ler("consulta3-media-mensal.csv")
    ind = ler("indicadores.csv")[0]

    meses = sorted({r["mes"] for r in c1})
    por_cat = defaultdict(lambda: defaultdict(int))
    for r in c1:
        por_cat[r["categoria"]][r["mes"]] = int(r["total_doacoes"])
    categorias = sorted(por_cat)
    series = {c: [por_cat[c].get(m, 0) for m in meses] for c in categorias}
    ymax = math.ceil(max(max(v) for v in series.values()) / 200) * 200
    total_mes = [sum(series[c][i] for c in categorias) for i in range(len(meses))]
    pico_total = max(range(len(meses)), key=lambda i: total_mes[i])

    destaques = []
    for c in categorias:
        media = sum(series[c]) / len(meses)
        i = max(range(len(meses)), key=lambda k: series[c][k])
        destaques.append((series[c][i] / media, c, i, series[c][i], media))
    destaques.sort(reverse=True)
    linhas_destaque = "".join(
        f"<li><strong>{escape(c)}</strong>: pico em {rotulo_mes(meses[i], False)} com {inteiro(v)} doações, "
        f"{decimal(razao)} vezes a média mensal da categoria ({decimal(media)}).</li>"
        for razao, c, i, v, media in destaques[:3]
    )

    paineis = "".join(
        f'<figure class="mini"><figcaption>{escape(c)}</figcaption>{painel_linha(series[c], meses, ymax, idx % 4 == 0)}</figure>'
        for idx, c in enumerate(categorias)
    )

    sol = defaultdict(float)
    rec = defaultdict(float)
    pct = {"normal": {}, "urgente": {}}
    for r in c2:
        sol[r["prioridade"]] += float(r["qtd_solicitada"])
        rec[r["prioridade"]] += float(r["qtd_recebida"])
        pct[r["prioridade"]][r["categoria"]] = float(r["pct_atendido"])
    pct_geral = {p: 100 * rec[p] / sol[p] for p in sol}
    maior_pendencia = max(c2, key=lambda r: int(r["qtd_pendente"]))
    menor_atendimento = min(c2, key=lambda r: float(r["pct_atendido"]))
    ordem_cat = sorted(pct["normal"])
    painel_normal = barras_percentual([(c, pct["normal"][c]) for c in ordem_cat])
    painel_urgente = barras_percentual([(c, pct["urgente"][c]) for c in ordem_cat])
    tabela2 = tabela(
        ["Categoria", "Prioridade", "Necessidades", "Solicitada", "Recebida", "Pendente", "% atendido"],
        [[r["categoria"], r["prioridade"].capitalize(), inteiro(int(r["necessidades"])), inteiro(int(r["qtd_solicitada"])),
          inteiro(int(r["qtd_recebida"])), inteiro(int(r["qtd_pendente"])), decimal(float(r["pct_atendido"])) + "%"] for r in c2],
        alinhar_direita_a_partir=2,
    )

    geral = next(r for r in c3 if r["categoria"] == "TOTAL GERAL")
    media_geral = float(geral["media_mensal"])
    barras3 = sorted(((r["categoria"], float(r["media_mensal"])) for r in c3 if r["categoria"] != "TOTAL GERAL"),
                     key=lambda x: -x[1])
    grafico3 = barras_media(barras3, 800)
    lider, lider_valor = barras3[0]
    tabela3 = tabela(["Categoria", "Média mensal", "% do total"],
                     [[c, decimal(v), decimal(100 * v / media_geral) + "%"] for c, v in barras3]
                     + [["Total geral", decimal(media_geral), "100,0%"]])

    contagens = [("Cidade", 30), ("Categoria", 8), ("Usuário", 5000), ("ONG", 300), ("Campanha", 24),
                 ("Campanha e cidade", 57), ("Meta da campanha", 48), ("Necessidade", 3000),
                 ("Campanha e necessidade", 94), ("Doação", 101380)]
    total_registros = sum(n for _, n in contagens)
    tabela_base = tabela(["Tabela", "Registros"], [[t, inteiro(n)] for t, n in contagens] + [["Total", inteiro(total_registros)]])

    kpis = [
        (inteiro(int(ind["doacoes_recebidas"])), "doações recebidas"),
        (inteiro(int(ind["itens_recebidos"])), "itens recebidos"),
        (inteiro(int(ind["doadores_ativos"])), "doadores com doação recebida"),
        (inteiro(int(ind["ongs_atendidas"])), "ONGs atendidas"),
    ]
    kpi_html = "".join(f'<div class="kpi"><div class="kpi-n">{n}</div><div class="kpi-t">{t}</div></div>' for n, t in kpis)

    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Relatório de doações - Conecta Doações</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap" rel="stylesheet">
<style>
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
body {{ margin: 0; background: #fff; color: {TINTA}; font-family: "Atkinson Hyperlegible", sans-serif; font-size: 11.5px; line-height: 1.5; }}
h1, h2, h3, .kpi-n, .hero {{ font-family: "Bricolage Grotesque", sans-serif; }}
.pagina {{ width: 210mm; height: 297mm; padding: 14mm 14mm 16mm; position: relative; page-break-after: always; overflow: hidden; background: #fff; }}
.pagina:last-child {{ page-break-after: auto; }}
.capa {{ background: {PRIMARIA}; color: #fff; border-radius: 16px; padding: 22px 26px; margin-bottom: 18px; }}
.capa .sobre {{ font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .85; }}
.capa h1 {{ font-size: 40px; line-height: 44px; font-weight: 800; margin: 6px 0 6px; }}
.capa p {{ margin: 0; font-size: 13px; opacity: .92; }}
.capa .grupo {{ margin-top: 14px; font-size: 10.5px; opacity: .85; }}
.kpis {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }}
.kpi {{ border: 1px solid {GRADE}; border-radius: 10px; padding: 10px 12px; }}
.kpi-n {{ font-size: 25px; line-height: 30px; font-weight: 800; color: {PRIMARIA}; }}
.kpi-t {{ font-size: 10.5px; color: {TINTA_SUAVE}; }}
.secao-topo {{ display: flex; align-items: baseline; gap: 10px; margin-bottom: 2px; }}
.num-secao {{ font-family: "Bricolage Grotesque", sans-serif; font-weight: 800; font-size: 22px; color: {PRIMARIA}; }}
h2 {{ font-size: 21px; line-height: 26px; font-weight: 700; margin: 0; }}
.pergunta {{ margin: 0 0 12px; color: {TINTA_SUAVE}; font-size: 12px; }}
.grade-mini {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px 12px; }}
.mini {{ margin: 0; }}
.mini figcaption {{ font-weight: 700; font-size: 11.5px; }}
.nota {{ font-size: 10px; color: {TINTA_SUAVE}; margin: 6px 0 0; }}
.leitura {{ background: #F5F8F7; border: 1px solid {GRADE}; border-radius: 10px; padding: 10px 14px; margin-top: 14px; }}
.leitura h3 {{ font-size: 13px; margin: 0 0 4px; color: {PRIMARIA}; }}
.leitura ul {{ margin: 0; padding-left: 16px; }}
.leitura li {{ margin: 2px 0; }}
.dois {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }}
.dois h3 {{ font-size: 13px; margin: 0 0 4px; }}
table {{ width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 8px; }}
th {{ text-align: left; font-weight: 700; color: {TINTA_SUAVE}; border-bottom: 1.5px solid {LINHA_FORTE}; padding: 4px 6px; }}
td {{ padding: 3.5px 6px; border-bottom: 1px solid {GRADE}; }}
.num {{ text-align: right; font-variant-numeric: tabular-nums; }}
.hero-bloco {{ display: flex; align-items: baseline; gap: 12px; margin: 4px 0 12px; }}
.hero {{ font-size: 56px; line-height: 60px; font-weight: 800; color: {PRIMARIA}; }}
.hero-t {{ font-size: 13px; color: {TINTA_SUAVE}; }}
.rodape {{ position: absolute; left: 14mm; right: 14mm; bottom: 8mm; display: flex; justify-content: space-between; font-size: 9.5px; color: {TINTA_SUAVE}; border-top: 1px solid {GRADE}; padding-top: 5px; }}
.base-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; margin-top: 12px; }}
.base-grid h3 {{ font-size: 13px; margin: 0; }}
.base-grid p {{ margin: 4px 0; }}
.base-grid table {{ font-size: 9.5px; margin-top: 0; }}
.base-grid th {{ padding: 2px 6px; }}
.base-grid td {{ padding: 1.5px 6px; }}
</style>
</head>
<body>

<section class="pagina">
  <div class="capa">
    <div class="sobre">Banco de Dados · Projeto interdisciplinar</div>
    <h1>Relatório de doações</h1>
    <p>Conecta Doações · de {rotulo_mes(meses[0], False)} a {rotulo_mes(meses[-1], False)} · {inteiro(int(ind["doacoes_registradas"]))} doações registradas</p>
    <div class="grupo">Grupo: {", ".join(INTEGRANTES)}</div>
  </div>
  <div class="kpis">{kpi_html}</div>

  <div class="secao-topo"><span class="num-secao">01</span><h2>Doações recebidas por mês e por categoria</h2></div>
  <p class="pergunta">Em quais meses cada categoria mais recebe doações?</p>
  <div class="grade-mini">{paineis}</div>
  <p class="nota">Todos os painéis usam a mesma escala (0 a {inteiro(ymax)} doações por mês). O ponto marca o mês de pico de cada categoria.</p>
  <div class="leitura">
    <h3>O que os dados mostram</h3>
    <ul>
      {linhas_destaque}
      <li>O volume total cresce ao longo do período: de {inteiro(total_mes[0])} doações em {rotulo_mes(meses[0], False)} para {inteiro(total_mes[-1])} em {rotulo_mes(meses[-1], False)}. O mês de maior volume foi {rotulo_mes(meses[pico_total], False)}, com {inteiro(total_mes[pico_total])}.</li>
    </ul>
  </div>
  <div class="rodape"><span>Conecta Doações · Relatório de Banco de Dados</span><span>1 de 3</span></div>
</section>

<section class="pagina">
  <div class="secao-topo"><span class="num-secao">02</span><h2>Demanda por categoria e prioridade</h2></div>
  <p class="pergunta">Quanto do que as ONGs pediram foi efetivamente recebido, e isso muda para itens urgentes?</p>
  <div class="dois">
    <div><h3>Necessidades normais</h3>{painel_normal}</div>
    <div><h3>Necessidades urgentes</h3>{painel_urgente}</div>
  </div>
  <p class="nota">Percentual da quantidade solicitada que já foi recebida (doações com status recebida). A faixa clara representa 100% da demanda.</p>
  <div class="leitura">
    <h3>O que os dados mostram</h3>
    <ul>
      <li>Itens urgentes estão {decimal(pct_geral["urgente"])}% atendidos e os normais {decimal(pct_geral["normal"])}%: a urgência quase não muda quem recebe primeiro.</li>
      <li>A maior pendência em quantidade está em {escape(maior_pendencia["categoria"])} ({escape(maior_pendencia["prioridade"])}), com {inteiro(int(maior_pendencia["qtd_pendente"]))} itens ainda por receber.</li>
      <li>O menor atendimento é de {escape(menor_atendimento["categoria"])} ({escape(menor_atendimento["prioridade"])}): {decimal(float(menor_atendimento["pct_atendido"]))}% da demanda.</li>
    </ul>
  </div>
  {tabela2}
  <div class="rodape"><span>Conecta Doações · Relatório de Banco de Dados</span><span>2 de 3</span></div>
</section>

<section class="pagina">
  <div class="secao-topo"><span class="num-secao">03</span><h2>Média mensal de doações recebidas</h2></div>
  <p class="pergunta">Quantas doações a plataforma recebe em um mês típico, e de quais categorias?</p>
  <div class="hero-bloco"><span class="hero">{decimal(media_geral)}</span><span class="hero-t">doações recebidas por mês, em média,<br>em {len(meses)} meses ({rotulo_mes(meses[0], False)} a {rotulo_mes(meses[-1], False)})</span></div>
  {grafico3}
  <p class="nota">Média de doações recebidas por mês em cada categoria. Meses sem doação entram na média como zero.</p>
  <div class="leitura">
    <h3>O que os dados mostram</h3>
    <ul>
      <li>{escape(lider)} responde por {decimal(100 * lider_valor / media_geral)}% do volume mensal ({decimal(lider_valor)} de {decimal(media_geral)} doações).</li>
      <li>As quatro maiores categorias somam {decimal(100 * sum(v for _, v in barras3[:4]) / media_geral)}% das doações, o que ajuda a priorizar campanhas de captação.</li>
    </ul>
  </div>
  {tabela3}

  <div class="base-grid">
    <div>
      <h3>Sobre a base de dados</h3>
      <p>Banco PostgreSQL com 10 tabelas e {inteiro(total_registros)} registros. Os dados são fictícios e foram gerados por script, com datas, sazonalidade e status coerentes com as regras do sistema.</p>
      <p>Período analisado: {rotulo_mes(meses[0], False)} a {rotulo_mes(meses[-1], False)}. Consultas completas em dql.sql.</p>
    </div>
    <div>{tabela_base}</div>
  </div>
  <div class="rodape"><span>Conecta Doações · Relatório de Banco de Dados</span><span>3 de 3</span></div>
</section>

</body>
</html>
"""


def main():
    destino = os.path.join(RAIZ, "relatorio")
    os.makedirs(destino, exist_ok=True)
    with open(os.path.join(destino, "relatorio.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(montar())
    print("relatorio.html gerado")


main()
