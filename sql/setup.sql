-- MySQL Script generated by MySQL Workbench
-- Fri May 12 15:50:21 2023
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema labs_pgt
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `labs_pgt` ;

-- -----------------------------------------------------
-- Schema labs_pgt
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `labs_pgt` DEFAULT CHARACTER SET utf8 ;
USE `labs_pgt` ;

-- -----------------------------------------------------
-- Table `labs_pgt`.`perfil`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`perfil` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`perfil` (
  `id` INT NOT NULL,
  `nome` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`conta`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`conta` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`conta` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(45) NOT NULL,
  `nome` VARCHAR(90) NOT NULL,
  `perfil_id` INT NOT NULL,
  `token` CHAR(32) NULL,
  `exclusao` DATETIME NULL,
  `telefone` VARCHAR(45) NULL,
  `registro` VARCHAR(45) NULL,
  `criacao` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `conta_perfil_idx` (`perfil_id` ASC),
  CONSTRAINT `conta_perfil`
    FOREIGN KEY (`perfil_id`)
    REFERENCES `labs_pgt`.`perfil` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`tipo_pgt`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`tipo_pgt` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`tipo_pgt` (
  `id` INT NOT NULL,
  `nome` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`fase`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`fase` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`fase` (
  `id` INT NOT NULL,
  `nome` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`semestre_pgt`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`semestre_pgt` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`semestre_pgt` (
  `id` INT NOT NULL,
  `nome` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`pgt`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`pgt` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`pgt` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(90) NOT NULL,
  `fase_id` INT NOT NULL,
  `criacao` DATETIME NOT NULL,
  `tipo_id` INT NOT NULL,
  `nota_qual` DECIMAL NULL,
  `nota_def` DECIMAL NULL,
  `semestre_id` INT NOT NULL,
  `exclusao` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `pgt_tipo_status_idx` (`fase_id` ASC),
  INDEX `pgt_tipo_pgt_idx` (`tipo_id` ASC),
  INDEX `pgt_semestre_idx` (`semestre_id` ASC),
  CONSTRAINT `pgt_tipo_pgt`
    FOREIGN KEY (`tipo_id`)
    REFERENCES `labs_pgt`.`tipo_pgt` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `pgt_fase`
    FOREIGN KEY (`fase_id`)
    REFERENCES `labs_pgt`.`fase` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `pgt_semestre`
    FOREIGN KEY (`semestre_id`)
    REFERENCES `labs_pgt`.`semestre_pgt` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`funcao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`funcao` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`funcao` (
  `id` INT NOT NULL,
  `nome` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`conta_pgt`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`conta_pgt` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`conta_pgt` (
  `conta_pgt_id` INT NOT NULL AUTO_INCREMENT,
  `pgt_id` INT NOT NULL,
  `conta_id` INT NOT NULL,
  `funcao_id` INT NOT NULL,
  PRIMARY KEY (`conta_pgt_id`),
  INDEX `conta_pgt_conta_idx` (`conta_id` ASC),
  INDEX `conta_pgt_pgt_idx` (`pgt_id` ASC),
  INDEX `conta_pgt_funcao_idx` (`funcao_id` ASC),
  CONSTRAINT `conta_pgt_conta`
    FOREIGN KEY (`conta_id`)
    REFERENCES `labs_pgt`.`conta` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `conta_pgt_pgt`
    FOREIGN KEY (`pgt_id`)
    REFERENCES `labs_pgt`.`pgt` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `conta_pgt_funcao`
    FOREIGN KEY (`funcao_id`)
    REFERENCES `labs_pgt`.`funcao` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`etapa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`etapa` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`etapa` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descricao` MEDIUMTEXT NOT NULL,
  `feedback` MEDIUMTEXT NULL,
  `data_criacao` DATETIME NOT NULL,
  `pgt_id` INT NOT NULL,
  `exclusao` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `etapa_pgt_idx` (`pgt_id` ASC),
  CONSTRAINT `etapa_pgt`
    FOREIGN KEY (`pgt_id`)
    REFERENCES `labs_pgt`.`pgt` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`cronograma`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`cronograma` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`cronograma` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `data` DATETIME NOT NULL,
  `titulo` VARCHAR(45) NOT NULL,
  `descr` MEDIUMTEXT NULL,
  `tipo` VARCHAR(12) NOT NULL,
  `pgt_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `cronograma_pgt_idx` (`pgt_id` ASC),
  CONSTRAINT `cronograma_pgt`
    FOREIGN KEY (`pgt_id`)
    REFERENCES `labs_pgt`.`pgt` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`tipo_formulario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`tipo_formulario` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`tipo_formulario` (
  `id` INT NOT NULL,
  `nome` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `labs_pgt`.`formulario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `labs_pgt`.`formulario` ;

CREATE TABLE IF NOT EXISTS `labs_pgt`.`formulario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `formulario_tipo_id` INT NOT NULL,
  `nota_1` DECIMAL NULL,
  `nota_2` DECIMAL NULL,
  `nota_3` DECIMAL NULL,
  `nota_4` DECIMAL NULL,
  `nota_5` DECIMAL NULL,
  `nota_6` DECIMAL NULL,
  `comentario_1` MEDIUMTEXT NULL,
  `comentario_2` MEDIUMTEXT NULL,
  `comentario_3` MEDIUMTEXT NULL,
  `comentario_4` MEDIUMTEXT NULL,
  `comentario_5` MEDIUMTEXT NULL,
  `comentario_6` MEDIUMTEXT NULL,
  `pgt_id` INT NOT NULL,
  `conta_autor_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `formulario_pgt_idx` (`pgt_id` ASC),
  INDEX `formulario_conta_autor_idx` (`conta_autor_id` ASC),
  INDEX `formulario_tipo_formulario_idx` (`formulario_tipo_id` ASC),
  CONSTRAINT `formulario_pgt`
    FOREIGN KEY (`pgt_id`)
    REFERENCES `labs_pgt`.`pgt` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `formulario_conta_autor`
    FOREIGN KEY (`conta_autor_id`)
    REFERENCES `labs_pgt`.`conta` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `formulario_tipo_formulario`
    FOREIGN KEY (`formulario_tipo_id`)
    REFERENCES `labs_pgt`.`tipo_formulario` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


-- Dados dos Enums
insert into perfil (id, nome) values (1, 'Administrador'), (2, 'Professor'), (3, 'Aluno');
insert into funcao (id, nome) values (1, 'Qualificador'), (2, 'Defesa1'), (3, 'Defesa2'), (4, 'Orientador'), (5, 'Aluno');
insert into tipo_pgt (id, nome) values (1, 'Pesquisa'), (2, 'Caso'), (3, 'Empreendimento');
insert into semestre_pgt (id, nome) values (1, '7º Semestre'), (2, '8º Semestre');
insert into fase (id, nome) values (1, 'PGT1'), (2, 'PGT2'), (3, 'Concluido');
insert into tipo_formulario (id, nome) values (1, 'Qualificacao'), (2, 'Defesa');

-- Dados da conta admin

insert into 
  conta (email, nome, perfil_id, criacao) 
  values ('admina@espm.br', 'Admin A', 1, now());

insert into
  conta (email, nome, perfil_id, criacao) 
  values ('adminb@espm.br', 'Admin B', 1, now());

insert into
  conta (email, nome, perfil_id, criacao) 
  values ('adminc@espm.br', 'Admin C', 1, now());

insert into
  conta (email, nome, perfil_id, criacao) 
  values ('admind@espm.br', 'Admin D', 1, now());

-- Alunos exemplo

insert into 
  conta (email, nome, perfil_id, registro, criacao) 
  values ('aluno@acad.espm.br', 'Aluno', 3, '123123', now());

-- Professores exemplo

insert into 
  conta (email, nome, perfil_id, criacao) 
  values ('profa@espm.br', 'Professor A', 2, now());

insert into 
  conta (email, nome, perfil_id, criacao) 
  values ('profb@espm.br', 'Professor B', 2, now());

insert into 
  conta (email, nome, perfil_id, criacao) 
  values ('profc@espm.br', 'Professor C', 2, now());

insert into 
  conta (email, nome, perfil_id, criacao) 
  values ('profd@espm.br', 'Professor D', 2, now());
