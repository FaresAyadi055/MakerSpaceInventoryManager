-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema makerspace
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema makerspace
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `makerspace` DEFAULT CHARACTER SET utf8mb3 ;
USE `makerspace` ;

-- -----------------------------------------------------
-- Table `makerspace`.`admins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `makerspace`.`admins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(255) NOT NULL DEFAULT "admin123",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `makerspace`.`inventory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `makerspace`.`inventory` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `model` VARCHAR(60) NOT NULL,
  `description` VARCHAR(60) NOT NULL,
  `quantity` INT NOT NULL,
  `location` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 141
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `makerspace`.`logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `makerspace`.`logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `model_id` INT NOT NULL,
  `student_email` VARCHAR(60) NOT NULL,
  `class` VARCHAR(45) NOT NULL,
  `quantity` INT NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_logs_inventory1_idx` (`model_id` ASC) VISIBLE,
  CONSTRAINT `fk_logs_inventory1`
    FOREIGN KEY (`model_id`)
    REFERENCES `makerspace`.`inventory` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `makerspace`.`missing`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `makerspace`.`missing` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `student` VARCHAR(45) NOT NULL,
  `class` VARCHAR(45) NOT NULL,
  `model` VARCHAR(60) NOT NULL,
  `description` VARCHAR(60) NOT NULL,
  `quantity` INT NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `makerspace`.`requests`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `makerspace`.`requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `model_id` INT NOT NULL,
  `student_email` VARCHAR(60) NOT NULL,
  `class` VARCHAR(45) NOT NULL,
  `quantity` INT NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_requests_inventory_idx` (`model_id` ASC) VISIBLE,
  CONSTRAINT `fk_requests_inventory`
    FOREIGN KEY (`model_id`)
    REFERENCES `makerspace`.`inventory` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
