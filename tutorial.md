## 2. Tutorial: Cómo clonar y levantar el proyecto completo

---

### 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:

- **Git**
- **Node.js** (v18 o v20 LTS recomendado) y **npm**
- **Docker Desktop**

> [!IMPORTANT]
> **Asegúrate de abrir Docker Desktop y verificar que esté en ejecución**

---

### 🚀 Paso a Paso

#### Paso 1: Clonar el repositorio

Abre una terminal (PowerShell, Git Bash o CMD) en la carpeta donde deseas guardar el proyecto:

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd FeriasDominicales
```

---

#### Paso 2: Iniciar la Base de Datos con Docker

> [!CAUTION]
> **Verifica nuevamente que Docker Desktop esté abierto y corriendo.**

Desde la raíz del proyecto (`FeriasDominicales`), ejecuta:

```bash
docker compose up -d
```

**¿Qué hace este comando automáticamente?**

1. Descarga la imagen oficial de MySQL 8.0.
2. Crea el contenedor `bdferias_mysql` en el puerto `3306`.
3. Ejecuta los scripts de `database/`:
   - Crea todas las tablas del sistema (`init.sql`).
   - Carga datos de prueba: ferias, ubicaciones, expositores, stands, etc. (`insercion_mysql.sql`).
   - Carga los usuarios y credenciales iniciales (`insert_usuario.sql`).

Para comprobar que el contenedor está sano y corriendo:

```bash
docker ps
```

---

#### Paso 3: Configurar y correr el Backend (NestJS)

Abre una terminal y dirígete a la carpeta `backend`:

```bash
cd backend
```

**Crear el archivo de variables de entorno:** Copia el archivo de ejemplo:

- En Windows (PowerShell):
  ```powershell
  Copy-Item .env.example .env
  ```
- En CMD o Git Bash / Linux / Mac:
  ```bash
  cp .env.example .env
  ```

_(Los valores por defecto en `.env.example` ya coinciden con la configuración de Docker: usuario `feriauser`, contraseña `feriapass` y base de datos `bdferias`)._

**Instalar dependencias:**

```bash
npm install
```

**Iniciar el servidor en modo desarrollo:**

```bash
npm run dev
```

El backend quedará escuchando en:

- **API:** http://localhost:3000/api
- **Documentación Swagger:** http://localhost:3000/api/docs _(si está habilitada)_

---

#### Paso 4: Configurar y correr el Frontend (React + Vite)

Abre otra ventana de terminal (mantén la del backend abierta) y ve a la carpeta `frontend`:

```bash
cd frontend
```

**Crear archivo de entorno (opcional):**

- En Windows (PowerShell):
  ```powershell
  Copy-Item .env.example .env
  ```

_(Por defecto apunta a `http://localhost:3000/api`)._

**Instalar dependencias:**

```bash
npm install
```

**Iniciar el servidor frontend:**

```bash
npm run dev
```

Abre tu navegador en: 👉 **http://localhost:5173**

---

### 🛑 Para detener los servicios cuando termines de trabajar

- **Para detener frontend y backend:** presiona `Ctrl + C` en cada una de sus terminales.
- **Para apagar el contenedor de la base de datos:**
  ```bash
  docker compose down
  ```
  _(Tus datos no se perderán porque están almacenados en un volumen persistente de Docker)._

---

## 3. Comandos para hacer tu primer commit y conectar a GitHub

Cuando crees tu repositorio remoto en GitHub/GitLab, ejecuta estos comandos desde la raíz del proyecto (`FeriasDominicales`):

```bash
# 1. Agregar los archivos al stage (con node_modules ignorados)
git add .

# 2. Crear tu primer commit
git commit -m "feat: commit inicial del proyecto Ferias Dominicales"

# 3. Asignar la rama principal
git branch -M main

# 4. Vincular tu repositorio remoto (reemplaza con tu enlace de GitHub)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 5. Subir tus cambios
git push -u origin main
```
