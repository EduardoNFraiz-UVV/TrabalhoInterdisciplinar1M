DROP TABLE IF EXISTS doacao CASCADE;
DROP TABLE IF EXISTS campanha_necessidade CASCADE;
DROP TABLE IF EXISTS necessidade CASCADE;
DROP TABLE IF EXISTS campanha_meta CASCADE;
DROP TABLE IF EXISTS campanha_cidade CASCADE;
DROP TABLE IF EXISTS campanha CASCADE;
DROP TABLE IF EXISTS ong CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS cidade CASCADE;

CREATE TABLE cidade (
    id_cidade   SERIAL       PRIMARY KEY,
    nome        VARCHAR(80)  NOT NULL,
    uf          CHAR(2)      NOT NULL,
    CONSTRAINT uq_cidade UNIQUE (nome, uf)
);

CREATE TABLE categoria (
    id_categoria SERIAL      PRIMARY KEY,
    nome         VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE usuario (
    id_usuario     SERIAL       PRIMARY KEY,
    nome           VARCHAR(100) NOT NULL,
    email          VARCHAR(120) NOT NULL UNIQUE,
    senha_hash     CHAR(64)     NOT NULL,
    telefone       VARCHAR(20),
    perfil         VARCHAR(10)  NOT NULL,
    id_cidade      INTEGER      NOT NULL REFERENCES cidade (id_cidade),
    data_cadastro  DATE         NOT NULL DEFAULT CURRENT_DATE,
    ativo          BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_usuario_perfil CHECK (perfil IN ('doador', 'ong', 'admin'))
);

CREATE TABLE ong (
    id_ong              SERIAL       PRIMARY KEY,
    id_usuario          INTEGER      NOT NULL UNIQUE REFERENCES usuario (id_usuario),
    id_cidade           INTEGER      NOT NULL REFERENCES cidade (id_cidade),
    nome                VARCHAR(100) NOT NULL,
    cnpj                CHAR(18)     NOT NULL UNIQUE,
    descricao           TEXT         NOT NULL,
    endereco            VARCHAR(150) NOT NULL,
    horario_atendimento VARCHAR(80),
    telefone            VARCHAR(20),
    email_contato       VARCHAR(120),
    aceita_retirada     BOOLEAN      NOT NULL DEFAULT FALSE,
    verificada          BOOLEAN      NOT NULL DEFAULT FALSE,
    data_cadastro       DATE         NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE campanha (
    id_campanha          SERIAL       PRIMARY KEY,
    id_ong               INTEGER      REFERENCES ong (id_ong),
    titulo               VARCHAR(100) NOT NULL,
    descricao            TEXT         NOT NULL,
    tipo                 VARCHAR(20)  NOT NULL,
    data_inicio          DATE         NOT NULL,
    data_fim             DATE         NOT NULL,
    status               VARCHAR(10)  NOT NULL DEFAULT 'pendente',
    endereco_recebimento VARCHAR(150) NOT NULL,
    horario_recebimento  VARCHAR(80),
    CONSTRAINT ck_campanha_tipo   CHECK (tipo IN ('enchente', 'deslizamento', 'seca', 'incendio', 'outro')),
    CONSTRAINT ck_campanha_status CHECK (status IN ('pendente', 'ativa', 'encerrada')),
    CONSTRAINT ck_campanha_datas  CHECK (data_fim >= data_inicio)
);

CREATE TABLE campanha_cidade (
    id_campanha  INTEGER NOT NULL REFERENCES campanha (id_campanha),
    id_cidade    INTEGER NOT NULL REFERENCES cidade (id_cidade),
    PRIMARY KEY (id_campanha, id_cidade)
);

CREATE TABLE campanha_meta (
    id_meta       SERIAL       PRIMARY KEY,
    id_campanha   INTEGER      NOT NULL REFERENCES campanha (id_campanha),
    id_categoria  INTEGER      NOT NULL REFERENCES categoria (id_categoria),
    item          VARCHAR(100) NOT NULL,
    quantidade    INTEGER      NOT NULL,
    unidade       VARCHAR(10)  NOT NULL,
    CONSTRAINT ck_meta_qtd CHECK (quantidade > 0)
);

CREATE TABLE necessidade (
    id_necessidade  SERIAL       PRIMARY KEY,
    id_ong          INTEGER      NOT NULL REFERENCES ong (id_ong),
    id_categoria    INTEGER      NOT NULL REFERENCES categoria (id_categoria),
    item            VARCHAR(100) NOT NULL,
    descricao       TEXT,
    quantidade      INTEGER      NOT NULL,
    unidade         VARCHAR(10)  NOT NULL,
    prioridade      VARCHAR(10)  NOT NULL DEFAULT 'normal',
    precisa_ate     DATE,
    situacao        VARCHAR(10)  NOT NULL DEFAULT 'ativa',
    data_cadastro   DATE         NOT NULL DEFAULT CURRENT_DATE,
    data_atualizacao DATE        NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT ck_necessidade_qtd        CHECK (quantidade > 0),
    CONSTRAINT ck_necessidade_prioridade CHECK (prioridade IN ('normal', 'urgente')),
    CONSTRAINT ck_necessidade_situacao   CHECK (situacao IN ('ativa', 'concluida'))
);

CREATE TABLE campanha_necessidade (
    id_campanha     INTEGER     NOT NULL REFERENCES campanha (id_campanha),
    id_necessidade  INTEGER     NOT NULL REFERENCES necessidade (id_necessidade),
    status          VARCHAR(10) NOT NULL DEFAULT 'pendente',
    aumenta_meta    BOOLEAN     NOT NULL DEFAULT FALSE,
    data_pedido     DATE        NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_campanha, id_necessidade),
    CONSTRAINT ck_vinculo_status CHECK (status IN ('pendente', 'aceito', 'recusado'))
);

CREATE TABLE doacao (
    id_doacao         SERIAL       PRIMARY KEY,
    id_doador         INTEGER      NOT NULL REFERENCES usuario (id_usuario),
    id_necessidade    INTEGER      REFERENCES necessidade (id_necessidade),
    id_meta           INTEGER      REFERENCES campanha_meta (id_meta),
    quantidade        INTEGER      NOT NULL,
    observacao        VARCHAR(200),
    forma_entrega     VARCHAR(10)  NOT NULL,
    endereco_retirada VARCHAR(150),
    data_prevista     DATE         NOT NULL,
    data_registro     DATE         NOT NULL,
    data_recebimento  DATE,
    status            VARCHAR(10)  NOT NULL DEFAULT 'oferecida',
    mensagem_ong      VARCHAR(200),
    CONSTRAINT ck_doacao_qtd     CHECK (quantidade > 0),
    CONSTRAINT ck_doacao_entrega CHECK (forma_entrega IN ('levar', 'retirada')),
    CONSTRAINT ck_doacao_status  CHECK (status IN ('oferecida', 'aceita', 'recebida', 'recusada', 'cancelada')),
    CONSTRAINT ck_doacao_retirada CHECK (forma_entrega = 'levar' OR endereco_retirada IS NOT NULL),
    CONSTRAINT ck_doacao_recebida CHECK ((status = 'recebida') = (data_recebimento IS NOT NULL)),
    CONSTRAINT ck_doacao_destino  CHECK ((id_necessidade IS NULL) <> (id_meta IS NULL)),
    CONSTRAINT ck_doacao_meta_entrega CHECK (id_meta IS NULL OR forma_entrega = 'levar')
);

CREATE INDEX idx_usuario_cidade     ON usuario (id_cidade);
CREATE INDEX idx_ong_cidade         ON ong (id_cidade);
CREATE INDEX idx_campanha_cidade    ON campanha_cidade (id_cidade);
CREATE INDEX idx_meta_campanha      ON campanha_meta (id_campanha);
CREATE INDEX idx_necessidade_ong    ON necessidade (id_ong);
CREATE INDEX idx_necessidade_categ  ON necessidade (id_categoria);
CREATE INDEX idx_vinculo_necessidade ON campanha_necessidade (id_necessidade);
CREATE INDEX idx_doacao_doador      ON doacao (id_doador);
CREATE INDEX idx_doacao_necessidade ON doacao (id_necessidade);
CREATE INDEX idx_doacao_meta        ON doacao (id_meta);
CREATE INDEX idx_doacao_registro    ON doacao (data_registro);
CREATE INDEX idx_doacao_status      ON doacao (status);
