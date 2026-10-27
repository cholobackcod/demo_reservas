-- ============================================================
-- SCRIPT DE CREACION Y POBLADO DE BASE DE DATOS RELACIONAL
-- Proyecto: Sistema de Gestion de Espacios y Reservas
-- Escuela Experimental con enfasis en T.I.C. Sede Capital Norte
-- Compatible con MySQL 8.0+ / MariaDB
-- ============================================================

-- 1. CREACION Y SELECCION DE BASE DE DATOS
CREATE DATABASE IF NOT EXISTS sistema_gestion_espacios;
USE sistema_gestion_espacios;

-- ============================================================
-- ESTRUCTURA DDL DE TABLAS RELACIONALES
-- ============================================================

-- TABLA: usuarios_usuario (Administradores y Docentes)
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

-- TABLA: salas_sala (Los dos laboratorios oficiales)
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

-- TABLA: docentes_configuracioninstitucional (Equivalencias de modulos y ciclo lectivo)
CREATE TABLE IF NOT EXISTS docentes_configuracioninstitucional (
    id INT AUTO_INCREMENT PRIMARY KEY,
    duracion_modulo_minutos INT UNSIGNED NOT NULL DEFAULT 40,
    ciclo_lectivo_actual VARCHAR(10) NOT NULL DEFAULT '2026',
    nombre_institucion VARCHAR(150) NOT NULL DEFAULT 'Escuela Experimental con enfasis en T.I.C. Sede Capital Norte'
);

-- TABLA: docentes_curso (1 a 6 anio)
CREATE TABLE IF NOT EXISTS docentes_curso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anio SMALLINT UNSIGNED NOT NULL,
    division VARCHAR(20) NOT NULL DEFAULT 'A',
    nombre VARCHAR(60) NOT NULL UNIQUE
);

-- TABLA: docentes_materia (Catalogo oficial de espacios curriculares)
CREATE TABLE IF NOT EXISTS docentes_materia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    codigo VARCHAR(50) NOT NULL DEFAULT '',
    tipo_predeterminado VARCHAR(20) NOT NULL DEFAULT 'materia',
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: docentes_asignaciondocente (Asignacion horaria y curricular de docentes)
CREATE TABLE IF NOT EXISTS docentes_asignaciondocente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL,
    materia_id INT NOT NULL,
    curso_id INT NOT NULL,
    dia_semana VARCHAR(15) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo_actividad VARCHAR(20) NOT NULL DEFAULT 'materia',
    ciclo_lectivo VARCHAR(10) NOT NULL DEFAULT '2026',
    observaciones VARCHAR(255) NOT NULL DEFAULT '',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asignacion_docente FOREIGN KEY (docente_id) REFERENCES usuarios_usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_asignacion_materia FOREIGN KEY (materia_id) REFERENCES docentes_materia(id) ON DELETE CASCADE,
    CONSTRAINT fk_asignacion_curso FOREIGN KEY (curso_id) REFERENCES docentes_curso(id) ON DELETE CASCADE,
    CONSTRAINT chk_asignacion_horas CHECK (hora_fin > hora_inicio)
);

-- TABLA: reservas_reserva (Reservas de laboratorios y equipamiento)
CREATE TABLE IF NOT EXISTS reservas_reserva (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    sala_id INT NOT NULL,
    inicio DATETIME NOT NULL,
    fin DATETIME NOT NULL,
    curso VARCHAR(50) NOT NULL DEFAULT '',
    materia VARCHAR(100) NOT NULL DEFAULT '',
    netbooks INT UNSIGNED NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'confirmada',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios_usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_reserva_sala FOREIGN KEY (sala_id) REFERENCES salas_sala(id) ON DELETE CASCADE,
    CONSTRAINT chk_reserva_fechas CHECK (fin > inicio),
    CONSTRAINT chk_reserva_estado CHECK (estado IN ('confirmada', 'finalizada', 'cancelada'))
);

-- ============================================================
-- INDICES PARA OPTIMIZACION DE CONSULTAS
-- ============================================================
CREATE INDEX idx_usuarios_email ON usuarios_usuario(email);
CREATE INDEX idx_reservas_usuario ON reservas_reserva(usuario_id);
CREATE INDEX idx_reservas_sala ON reservas_reserva(sala_id);
CREATE INDEX idx_reservas_fechas ON reservas_reserva(inicio, fin);
CREATE INDEX idx_reservas_materia ON reservas_reserva(materia);
CREATE INDEX idx_asignaciones_docente ON docentes_asignaciondocente(docente_id);
CREATE INDEX idx_asignaciones_curso ON docentes_asignaciondocente(curso_id);
CREATE INDEX idx_asignaciones_dia ON docentes_asignaciondocente(dia_semana);
CREATE INDEX idx_asignaciones_ciclo ON docentes_asignaciondocente(ciclo_lectivo);

-- ============================================================
-- DATOS INICIALES (DML)
-- ============================================================

-- 1. CONFIGURACION INSTITUCIONAL (MODULO: 40 MIN, CICLO: 2026)
INSERT INTO docentes_configuracioninstitucional (id, duracion_modulo_minutos, ciclo_lectivo_actual, nombre_institucion) VALUES
(1, 40, '2026', 'Escuela Experimental con énfasis en T.I.C. Sede Capital Norte')
ON DUPLICATE KEY UPDATE duracion_modulo_minutos=VALUES(duracion_modulo_minutos);

-- 2. USUARIOS (ADMINISTRADOR Y DOCENTES OFICIALES PROA)
INSERT INTO usuarios_usuario (id, nombre, apellido, email, password, rol, activo) VALUES
(1, 'Admin', 'Sistema', 'admin@demo.com', 'admin123', 'admin', 1),
(2, 'Federico', 'Udovich', 'fede@demo.com', '1234', 'docente', 1),
(3, 'Giselda', 'Mondadori', 'giselda@demo.com', '1234', 'docente', 1),
(4, 'Andres', 'Bianchi', 'andres@demo.com', '1234', 'docente', 1),
(5, 'Cristian Ariel', 'Conci', 'cristian.conci@demo.com', '1234', 'docente', 1),
(6, 'Virginia', 'Riquel', 'virginia.riquel@demo.com', '1234', 'docente', 1),
(7, 'Santiago', 'Ferreyra Lazcano', 'santiago.ferreyra@demo.com', '1234', 'docente', 1),
(8, 'Sofía', 'Fernandez Cebollada', 'sofia.fernandez@demo.com', '1234', 'docente', 1),
(9, 'Delfina', 'Vernet', 'delfina.vernet@demo.com', '1234', 'docente', 1),
(10, 'Facundo', 'Mingorance', 'facundo.mingorance@demo.com', '1234', 'docente', 1),
(11, 'Evangelina', 'Espeche', 'evangelina.espeche@demo.com', '1234', 'docente', 1)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 3. SALAS DE LABORATORIO (LOS DOS LABORATORIOS OFICIALES)
INSERT INTO salas_sala (id, nombre, ciclo, descripcion, capacidad, activa) VALUES
(1, 'Laboratorio', 'Ciclo Básico', 'Laboratorio equipado con 35 PCs para prácticas de programación.', 35, 1),
(2, 'Sala de informatica', 'Ciclo Orientado', 'Espacio equipado para ensamblado de redes y mantenimiento.', 25, 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 4. CURSOS OFICIALES (1 A 6 ANIO)
INSERT INTO docentes_curso (id, anio, division, nombre) VALUES
(1, 1, 'Única', '1° Año'),
(2, 2, 'Única', '2° Año'),
(3, 3, 'Única', '3° Año'),
(4, 4, 'Informática', '4° Año Informática'),
(5, 5, 'Informática', '5° Año Informática'),
(6, 6, 'Informática', '6° Año Informática')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 5. MATERIAS Y ESPACIOS CURRICULARES (PLAN PROA TIC)
INSERT INTO docentes_materia (id, nombre, codigo, tipo_predeterminado, activa) VALUES
(1, 'Programación II', '', 'materia', 1),
(2, 'Diseño de Interfaces y Usabilidad I', '', 'materia', 1),
(3, 'Diseño de Interfaces y Usabilidad', '', 'materia', 1),
(4, 'Programación III', '', 'materia', 1),
(5, 'Ética y Legislación', '', 'materia', 1),
(6, 'Estructura y Almacenam. de Datos', '', 'materia', 1),
(7, 'Algoritmos y Programación', '', 'materia', 1),
(8, 'Entornos Digitales', '', 'materia', 1),
(9, 'Sistemas Op. y Software de Aplicación', '', 'materia', 1),
(10, 'Taller de Inglés Aplicado', '', 'taller', 1),
(11, 'Robótica', '', 'materia', 1),
(12, 'Testing', '', 'materia', 1),
(13, 'Desarrollo de Aplicaciones Móviles', '', 'materia', 1),
(14, 'Matemática', '', 'materia', 1),
(15, 'Tutoría Matemática', '', 'tutoria', 1),
(16, 'Lengua y Literatura', '', 'materia', 1),
(17, 'Tutoría Lengua y Literatura', '', 'tutoria', 1),
(18, 'Ciencias Naturales Física', '', 'materia', 1),
(19, 'Física', '', 'materia', 1),
(20, 'Tutoría de Física', '', 'tutoria', 1),
(21, 'Ciencias Naturales Biología', '', 'materia', 1),
(22, 'Biología', '', 'materia', 1),
(23, 'Tutoría Biología', '', 'tutoria', 1),
(24, 'Ciencias Naturales Química', '', 'materia', 1),
(25, 'Química', '', 'materia', 1),
(26, 'Tutoría Química', '', 'tutoria', 1),
(27, 'Ciencias Sociales Historia', '', 'materia', 1),
(28, 'Historia', '', 'materia', 1),
(29, 'Tutoría Historia', '', 'tutoria', 1),
(30, 'Ciencias Sociales Geografía', '', 'materia', 1),
(31, 'Geografía', '', 'materia', 1),
(32, 'Tutoría de Geografía', '', 'tutoria', 1),
(33, 'Ciudadanía y Participación', '', 'materia', 1),
(34, 'Ciudadanía y Política', '', 'materia', 1),
(35, 'Inglés', '', 'materia', 1),
(36, 'Tutoría Inglés', '', 'tutoria', 1),
(37, 'Educación Física', '', 'materia', 1),
(38, 'Educación Tecnológica', '', 'materia', 1),
(39, 'Artes Visuales', '', 'materia', 1),
(40, 'Educación Artística: Plástica', '', 'materia', 1),
(41, 'Educación Artística: Música', '', 'materia', 1),
(42, 'Educación Artística Teatro', '', 'materia', 1),
(43, 'Formación para la Vida y el Trabajo', '', 'materia', 1),
(44, 'Club de Ciencias', '', 'club', 1),
(45, 'Club de Arte', '', 'club', 1),
(46, 'Club de Deportes', '', 'club', 1),
(47, 'Filosofía', '', 'materia', 1),
(48, 'Psicología', '', 'materia', 1),
(49, 'Programación IV', '', 'materia', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 6. ASIGNACIONES DOCENTES (HORARIOS Y ESPACIOS CURRICULARES)
INSERT INTO docentes_asignaciondocente (id, docente_id, materia_id, curso_id, dia_semana, hora_inicio, hora_fin, tipo_actividad, ciclo_lectivo, observaciones) VALUES
(1, 4, 1, 4, 'lunes', '10:20:00', '12:00:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(2, 4, 2, 4, 'lunes', '12:10:00', '12:50:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(3, 4, 1, 4, 'martes', '12:45:00', '13:45:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(4, 4, 5, 5, 'miercoles', '09:30:00', '10:10:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(5, 4, 3, 4, 'jueves', '11:30:00', '12:50:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(6, 4, 6, 4, 'viernes', '12:40:00', '13:40:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(7, 4, 6, 4, 'viernes', '13:50:00', '14:50:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(8, 5, 8, 1, 'lunes', '09:40:00', '11:00:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(9, 5, 7, 2, 'lunes', '11:00:00', '12:20:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(10, 5, 6, 2, 'lunes', '12:40:00', '14:00:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(11, 5, 9, 1, 'martes', '10:40:00', '12:00:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(12, 5, 44, 3, 'miercoles', '10:30:00', '11:50:00', 'club', '2026', 'Horario asignado oficial ProA Capital Norte'),
(13, 6, 14, 3, 'lunes', '10:10:00', '11:50:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(14, 6, 14, 5, 'lunes', '08:50:00', '10:10:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(15, 6, 14, 3, 'martes', '08:40:00', '10:20:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(16, 6, 14, 6, 'martes', '10:40:00', '12:00:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(17, 7, 49, 6, 'lunes', '08:50:00', '10:10:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(18, 7, 11, 5, 'miercoles', '11:50:00', '12:50:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(19, 7, 12, 6, 'miercoles', '10:20:00', '11:40:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte'),
(20, 7, 4, 5, 'jueves', '08:50:00', '10:10:00', 'materia', '2026', 'Horario asignado oficial ProA Capital Norte')
ON DUPLICATE KEY UPDATE dia_semana=VALUES(dia_semana);

-- 7. RESERVAS DE LABORATORIO
INSERT INTO reservas_reserva (id, usuario_id, sala_id, inicio, fin, curso, materia, netbooks, estado) VALUES
(1, 2, 1, '2026-10-15 09:00:00', '2026-10-15 11:00:00', '4° Año Informática', 'Programación II', 25, 'confirmada'),
(2, 3, 2, '2026-10-16 14:00:00', '2026-10-16 17:00:00', '5° Año Informática', 'Redes y Telecomunicaciones', 20, 'confirmada')
ON DUPLICATE KEY UPDATE estado=VALUES(estado);
