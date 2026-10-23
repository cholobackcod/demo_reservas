-- ============================================================
-- SCRIPT DDL: MÓDULO DE GESTIÓN DE DOCENTES Y ASIGNACIONES
-- Extensión: Escuela Experimental con énfasis en T.I.C. Sede Capital Norte
-- ============================================================

USE sistema_gestion_espacios;

-- TABLA: docentes_configuracioninstitucional
CREATE TABLE IF NOT EXISTS docentes_configuracioninstitucional (
    id INT AUTO_INCREMENT PRIMARY KEY,
    duracion_modulo_minutos INT UNSIGNED NOT NULL DEFAULT 40,
    ciclo_lectivo_actual VARCHAR(10) NOT NULL DEFAULT '2026',
    nombre_institucion VARCHAR(150) NOT NULL DEFAULT 'Escuela Experimental con énfasis en T.I.C. Sede Capital Norte'
);

-- TABLA: docentes_curso
CREATE TABLE IF NOT EXISTS docentes_curso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anio SMALLINT UNSIGNED NOT NULL,
    division VARCHAR(20) NOT NULL DEFAULT 'A',
    nombre VARCHAR(60) NOT NULL UNIQUE
);

-- TABLA: docentes_materia
CREATE TABLE IF NOT EXISTS docentes_materia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    codigo VARCHAR(50) NOT NULL DEFAULT '',
    tipo_predeterminado VARCHAR(20) NOT NULL DEFAULT 'materia',
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: docentes_asignaciondocente
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

CREATE INDEX idx_asignaciones_docente ON docentes_asignaciondocente(docente_id);
CREATE INDEX idx_asignaciones_curso ON docentes_asignaciondocente(curso_id);
CREATE INDEX idx_asignaciones_dia ON docentes_asignaciondocente(dia_semana);
CREATE INDEX idx_asignaciones_ciclo ON docentes_asignaciondocente(ciclo_lectivo);
