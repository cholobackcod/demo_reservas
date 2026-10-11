# 🚀 Guía de Comandos Git para el Backend (Entrega por Integrante)

Esta guía detalla los comandos Git paso a paso para realizar los **6 commits de valor cronológicos** en el repositorio.

---

## 📌 Resumen Cronológico de los 6 Commits

| Orden | Integrante | Rol / Módulo | Mensaje de Commit |
| :---: | :--- | :--- | :--- |
| **1** | **Mondadori, Giselda** | Infraestructura Base & SQL | `feat(core): inicializar proyecto django con drf, cors y esquema relacional sql` |
| **2** | **Pierrestegui, Federico** | Usuarios & Autenticación | `feat(usuarios): implementar modelo usuario, serializadores y endpoints de login y registro` |
| **3** | **Osess, Gastón** | Espacios y Laboratorios | `feat(salas): implementar modelo sala, serializadores y abm de laboratorios` |
| **4** | **Monje, Sofía** | Reservas & Antisolapamiento | `feat(reservas): implementar reservas y algoritmo de prevencion de solapamientos horarios` |
| **5** | **Bianchi, Víctor** | Reportes & Seed Data | `feat(reportes): agregar modulo de reportes estadisticos y script de datos iniciales seed_data` |
| **6** | **Udovich, Federico** | Integración Fullstack & Docs | `docs(integracion): conectar frontend angular con backend django y documentacion completa` |

---

## 🛠️ Comandos Paso a Paso

Ejecuta estos bloques secuencialmente desde la **raíz del proyecto** (`d:\Programacion_2_syntax_error demo gaston`):

### 1️⃣ Mondadori, Giselda Soledad (DNI: 29255135)
```bash
git add backend/requirements.txt backend/manage.py backend/config/ backend/init_database.sql .gitignore
git commit -m "feat(core): inicializar proyecto django con drf, cors y esquema relacional sql"
```

---

### 2️⃣ Pierrestegui, Federico Martin (DNI: 35257982)
```bash
git add backend/usuarios/
git commit -m "feat(usuarios): implementar modelo usuario, serializadores y endpoints de autenticacion login y registro"
```

---

### 3️⃣ Osess, Gastón Faustino Alejandro (DNI: 35588172)
```bash
git add backend/salas/
git commit -m "feat(salas): implementar modelo sala, serializadores y abm de laboratorios"
```

---

### 4️⃣ Monje, Sofía Florencia (DNI: 39420278)
```bash
git add backend/reservas/
git commit -m "feat(reservas): implementar reservas y algoritmo de prevencion de solapamientos horarios"
```

---

### 5️⃣ Bianchi Nuñez, Víctor Andrés (DNI: 42258135)
```bash
git add backend/reportes/ backend/seed_data.py
git commit -m "feat(reportes): agregar modulo de reportes estadisticos y script de datos iniciales seed_data"
```

---

### 6️⃣ Udovich, Federico David (DNI: 42383964)
```bash
git add backend/README.md backend/README_COMMITS.md backend/GUIA_COMANDOS_GIT.md backend/entregas_integrantes/ backend/zips_entregas/ backend/*.zip frontend/ docs/ instructivos/
git commit -m "docs(integracion): conectar frontend angular con backend django y documentacion integral"
```

---

## 🌐 Subida al Repositorio Remoto (GitHub / GitLab)
```bash
git push origin main
```
