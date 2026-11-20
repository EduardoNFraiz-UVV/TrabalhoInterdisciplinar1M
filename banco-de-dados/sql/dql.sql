-- Consulta 1: relação de doações recebidas por mês e por categoria
-- A categoria vem da necessidade ou, quando a doação é para uma meta da campanha, da própria meta.
SELECT to_char(d.data_recebimento, 'YYYY-MM') AS mes,
       c.nome                                 AS categoria,
       COUNT(*)                               AS total_doacoes,
       SUM(d.quantidade)                      AS itens_doados
FROM doacao d
LEFT JOIN necessidade n   ON n.id_necessidade = d.id_necessidade
LEFT JOIN campanha_meta m ON m.id_meta        = d.id_meta
JOIN categoria c          ON c.id_categoria   = COALESCE(n.id_categoria, m.id_categoria)
WHERE d.status = 'recebida'
  AND d.data_recebimento < DATE '2026-11-01'
GROUP BY to_char(d.data_recebimento, 'YYYY-MM'), c.nome
ORDER BY mes, categoria;

-- Consulta 2: demanda por categoria e prioridade (solicitado x recebido)
SELECT c.nome                                          AS categoria,
       n.prioridade                                    AS prioridade,
       COUNT(*)                                        AS necessidades,
       SUM(n.quantidade)                               AS qtd_solicitada,
       COALESCE(SUM(r.qtd_recebida), 0)                AS qtd_recebida,
       SUM(n.quantidade) - COALESCE(SUM(r.qtd_recebida), 0) AS qtd_pendente,
       ROUND(100.0 * COALESCE(SUM(r.qtd_recebida), 0) / SUM(n.quantidade), 1) AS pct_atendido
FROM necessidade n
JOIN categoria c ON c.id_categoria = n.id_categoria
LEFT JOIN (SELECT id_necessidade, SUM(quantidade) AS qtd_recebida
           FROM doacao
           WHERE status = 'recebida'
           GROUP BY id_necessidade) r ON r.id_necessidade = n.id_necessidade
GROUP BY c.nome, n.prioridade
ORDER BY c.nome, n.prioridade;

-- Consulta 3: média mensal de doações recebidas por categoria e no total
WITH meses AS (
    SELECT generate_series(DATE '2024-11-01', DATE '2026-10-01', INTERVAL '1 month')::date AS mes
),
mensal AS (
    SELECT date_trunc('month', d.data_recebimento)::date AS mes,
           COALESCE(n.id_categoria, m.id_categoria) AS id_categoria,
           COUNT(*) AS total
    FROM doacao d
    LEFT JOIN necessidade n   ON n.id_necessidade = d.id_necessidade
    LEFT JOIN campanha_meta m ON m.id_meta        = d.id_meta
    WHERE d.status = 'recebida'
    GROUP BY date_trunc('month', d.data_recebimento), COALESCE(n.id_categoria, m.id_categoria)
)
SELECT categoria, media_mensal
FROM (
    SELECT c.nome AS categoria,
           ROUND(AVG(COALESCE(m.total, 0)), 1) AS media_mensal,
           0 AS ordem
    FROM categoria c
    CROSS JOIN meses ms
    LEFT JOIN mensal m ON m.mes = ms.mes AND m.id_categoria = c.id_categoria
    GROUP BY c.nome
    UNION ALL
    SELECT 'TOTAL GERAL' AS categoria,
           ROUND(AVG(t.total), 1) AS media_mensal,
           1 AS ordem
    FROM (SELECT ms.mes, COALESCE(SUM(m.total), 0) AS total
          FROM meses ms
          LEFT JOIN mensal m ON m.mes = ms.mes
          GROUP BY ms.mes) t
) resultado
ORDER BY ordem, categoria;
