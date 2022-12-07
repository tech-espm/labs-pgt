CREATE DATABASE IF NOT EXISTS pgt DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE pgt;

-- DROP TABLE IF EXISTS perfil;
CREATE TABLE perfil (
  id int NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY perfil_nome_UN (nome)
);

-- Manter sincronizado com enums/perfil.ts e models/perfil.ts
INSERT INTO perfil (id, nome) VALUES (1, 'Administrador'), (2, 'Professor');

-- DROP TABLE IF EXISTS usuario;
CREATE TABLE usuario (
  id int NOT NULL AUTO_INCREMENT,
  email varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  idperfil int NOT NULL,
  token char(32) DEFAULT NULL,
  exclusao datetime NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY usuario_email_UN (email),
  KEY usuario_nome_IX (nome),
  KEY usuario_exclusao_nome_IX (exclusao, nome),
  KEY usuario_idperfil_FK_IX (idperfil),
  CONSTRAINT usuario_idperfil_FK FOREIGN KEY (idperfil) REFERENCES perfil (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO usuario (email, nome, idperfil, token, criacao) VALUES ('admin@espm.br', 'Administrador', 1, NULL, NOW());

-- DROP TABLE IF EXISTS fase;
CREATE TABLE fase (
  id tinyint NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY fase_nome_UN (nome)
);

-- Manter sincronizado com enums/fase.ts e models/fase.ts
INSERT INTO fase (id, nome) VALUES (1, 'PGT 1'), (2, 'PGT 2'), (3, 'Concluído'); 

CREATE TABLE tipo (
  id tinyint NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY fase_nome_UN (nome)
);

-- Manter sincronizado com enums/tipo.ts e models/tipo.ts
INSERT INTO tipo (id, nome) VALUES (1, 'Projeto Empreendor'), (2, 'Projeto Acadêmico'), (3, 'Estudo de Caso');

-- DROP TABLE IF EXISTS pgt;
CREATE TABLE pgt (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL, 
  idfase tinyint NOT NULL, 
  idtipo tinyint NOT NULL, 
  idusuario int NOT NULL,
  exclusao datetime NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  KEY pgt_fase_exclusao_FK_IX (idfase, exclusao),
  KEY pgt_tipo_FK_IX (idtipo),
  KEY pgt_usuario_FK_IX (idusuario),
  CONSTRAINT pgt_fase_exclusao_FK FOREIGN KEY (idfase) REFERENCES fase (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT pgt_tipo_FK FOREIGN KEY (idtipo) REFERENCES tipo (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT pgt_usuario_FK FOREIGN KEY (idusuario) REFERENCES usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE aluno (
  id int NOT NULL AUTO_INCREMENT,
  ra int NOT NULL,
  email varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  telefone varchar(32) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY aluno_ra_UN (ra)
);

CREATE TABLE pgt_aluno (
  id int NOT NULL AUTO_INCREMENT,
  idpgt int NOT NULL,
  idaluno int NOT NULL,
  PRIMARY KEY (id),
  KEY pgt_aluno_idpgt_FK_IX (idpgt),
  KEY pgt_aluno_idaluno_FK_IX (idaluno),
  CONSTRAINT pgt_aluno_idpgt_FK FOREIGN KEY (idpgt) REFERENCES pgt (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT pgt_aluno_idaluno_FK FOREIGN KEY (idaluno) REFERENCES aluno (id) ON DELETE CASCADE ON UPDATE CASCADE
);
