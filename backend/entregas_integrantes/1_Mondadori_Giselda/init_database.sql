reservas_reserva-- ============================================================
-- SCRIPT DE CREACIÓN Y POBLADO DE BASE DE DATOS RELACIONAL
-- Proyecto: Sistema de Gestión de Espacios (Syntax Error)
-- Compatible con MySQL / MariaDB
-- ============================================================

-- 1. CREACIÓN Y SELECCIÓN DE BASE DE DATOS
CREATE DATABASE IF NOT EXISTS sistema_gestion_espacios;
USE sistema_gestion_espacios;

-- TABLA: usuarios_usuario
CREATE TABLE IF NOT EXISTS usuarios_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'docente',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_usuario_email CHECK (email LIKE '%@%'),
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('admin', 'docente'))
);

-- TABLA: salas_sala
CREATE TABLE IF NOT EXISTS salas_sala (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    ciclo VARCHAR(100) NOT NULL DEFAULT 'Ciclo Básico',
    descripcion TEXT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0),
    imagen VARCHAR(255) NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: reservas_reserva
CREATE TABLE IF NOT EXISTS reservas_reserva (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    sala_id INT NOT NULL,
    inicio DATETIME NOT NULL,
    fin DATETIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'confirmada',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios_usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_reserva_sala FOREIGN KEY (sala_id) REFERENCES salas_sala(id) ON DELETE CASCADE,
    CONSTRAINT chk_reserva_fechas CHECK (fin > inicio),
    CONSTRAINT chk_reserva_estado CHECK (estado IN ('confirmada', 'finalizada', 'cancelada'))
);

-- INDICES PARA OPTIMIZACIÓN DE CONSULTAS
CREATE INDEX idx_usuarios_email ON usuarios_usuario(email);
CREATE INDEX idx_reservas_usuario ON reservas_reserva(usuario_id);
CREATE INDEX idx_reservas_sala ON reservas_reserva(sala_id);
CREATE INDEX idx_reservas_fechas ON reservas_reserva(inicio, fin);

-- ============================================================
-- DATOS INICIALES (DML)
-- ============================================================

INSERT INTO usuarios_usuario (id, nombre, apellido, email, password, rol, activo) VALUES
(1, 'Admin', 'Sistema', 'admin@demo.com', 'admin123', 'admin', TRUE),
(2, 'Federico', 'Udovich', 'fede@demo.com', '1234', 'docente', TRUE),
(3, 'Giselda', 'Mondadori', 'giselda@demo.com', '1234', 'docente', TRUE),
(4, 'Andres', 'Bianchi', 'andres@demo.com', '1234', 'docente', TRUE)
ON DUPLICATE KEY UPDATE email=VALUES(email);

INSERT INTO salas_sala (id, nombre, ciclo, descripcion, capacidad, activa) VALUES
(1, 'Laboratorio Informática A', 'Ciclo Básico', 'Laboratorio equipado con 35 PCs para prácticas de programación.', 35, TRUE),
(2, 'Laboratorio Redes y Hardware B', 'Ciclo Superior', 'Espacio equipado para ensamblado de redes y mantenimiento.', 25, TRUE),
(3, 'Laboratorio Desarrollo Software C', 'Ciclo Superior', 'Laboratorio avanzado para desarrollo web y sistemas distribuidos.', 30, TRUE)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO reservas_reserva (id, usuario_id, sala_id, inicio, fin, estado) VALUES
(1, 2, 1, '2026-10-15 09:00:00', '2026-10-15 11:00:00', 'confirmada'),
(2, 3, 2, '2026-10-16 14:00:00', '2026-10-16 17:00:00', 'confirmada')
ON DUPLICATE KEY UPDATE estado=VALUES(estado);
