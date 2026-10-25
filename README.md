# 🎪 Sistema Integral de Ferias Dominicales — La Paz, Bolivia

Sistema web completo para la **consulta ciudadana** y la **administración integral** de las Ferias Dominicales de La Paz, desarrollado para la materia de **Base de Datos 2 (UMSA)**.

---

## 📑 Tabla de Contenidos

1. [Visión General](#-visión-general)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Modelo Relacional y Extensiones](#-modelo-relacional-y-extensiones)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Tutorial: Levantar el Sistema Completo](#-tutorial-levantar-el-sistema-completo-paso-a-paso)
6. [Usuarios por Defecto](#-usuarios-por-defecto)
7. [Catálogo de Endpoints REST](#-catálogo-de-endpoints-rest)
8. [Funcionalidades del Frontend](#-funcionalidades-del-frontend)
9. [Variables de Entorno](#-variables-de-entorno)

---

## 🌟 Visión General

El sistema permite gestionar de manera unificada:

- **Ferias**: Fechas, horarios, recintos y estados (Planificada, En curso, Concluido).
- **Stands y Ubicaciones**: Espacios físicos internos de cada feria con medidas y disponibilidad.
- **Expositores y Participación**: Artesanos, productores y gestores culturales asignados a stands (`CONFORMAN`).
- **Productos y Stock**: Artículos ofrecidos en cada stand con precio en BOB y disponibilidad (`OFRECE`).
- **Exposiciones**: Charlas, demostraciones en vivo y muestras artísticas vinculadas a stands.
- **Instituciones**: Organizadores (`ORGANIZA`) y patrocinadores con aporte económico o logístico (`PATROCINA`).
- **Área Privada para Expositores**: Consulta histórica y activa de todas sus participaciones feriales.
- **Panel Administrativo (RBAC)**: Gestión integral de datos, usuarios y vinculación de cuentas.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Detalles |
|---|---|---|
| **Base de Datos** | MySQL 8.0 | Contenedor Docker con volumen persistente y datos precargados |
| **Backend** | NestJS 12 + TypeScript | TypeORM 1.x, Swagger OpenAPI, JWT, Bcrypt, ValidationPipe global |
| **Frontend** | React 19 + Vite + TypeScript | CSS Vanilla (Obsidian Glassmorphism), React Router 7, Axios |
| **Contenedor** | Docker + Docker Compose | Solo la BD. Backend y frontend se ejecutan manualmente |

---

## 🗄️ Modelo Relacional y Extensiones

### Tablas del modelo original

| Tabla | Descripción |
|---|---|
| `FERIA` | Evento ferial con fechas, horario y estado |
| `UBICACION` | Recinto físico donde se realiza la feria |
| `STAND` | Espacio asignado dentro de una feria |
| `EXPOSITOR` | Persona natural que participa en ferias |
| `PRODUCTO` | Artículo ofrecido a la venta |
| `EXPOSICION` | Charla o demostración realizada en un stand |
| `INSTITUCION` | Organismo público o privado |
| `CONFORMAN` | Relación N:M Expositor-Stand (con `CARGO`) |
| `OFRECE` | Relación N:M Stand-Producto (con `STOCK` y `UNIDAD_MEDIDA`) |
| `ORGANIZA` | Relación N:M Institucion-Feria (con `ROL`) |
| `PATROCINA` | Relación N:M Institucion-Feria (con `TIPO_APOYO` y `CANTIDAD`) |

### Tabla extendida: `USUARIO`

Para soportar autenticación sin romper el modelo original, se añadió la tabla `USUARIO`:

```sql
CREATE TABLE USUARIO (
    IDUSUARIO          INT AUTO_INCREMENT PRIMARY KEY,
    CORREO             VARCHAR(150) NOT NULL UNIQUE,
    PASSWORDHASH       VARCHAR(255) NOT NULL,
    ROL                ENUM('ADMIN', 'USUARIO') DEFAULT 'USUARIO',
    ESTADO             ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    CIEXPOSITOR        VARCHAR(20) NULL,  -- FK opcional hacia EXPOSITOR
    FECHACREACION      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FECHAACTUALIZACION DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CIEXPOSITOR) REFERENCES EXPOSITOR(CIEXPOSITOR)
);
```

**Por qué este diseño:** La FK `CIEXPOSITOR` permite vincular opcionalmente una cuenta de usuario con un registro de expositor existente. Esto habilita el área privada "Mis Participaciones" sin modificar el modelo relacional original de las ferias.

### Relación entre entidades

```
UBICACION (1) ──── (*) FERIA (*)  ─── (*) INSTITUCION
                                           [ORGANIZA / PATROCINA]
                          │
                         (*) STAND (*) ─── (*) PRODUCTO [OFRECE]
                                │
                               (*) EXPOSITOR [CONFORMAN]
                                │
                              (0..1) USUARIO  ← cuenta web del expositor
```

---

## 📂 Estructura del Proyecto

```
FeriasDominicales/
├── docker-compose.yml           # Contenedor MySQL con volumen persistente
├── README.md                    # Este archivo
│
├── database/
│   ├── Dockerfile               # Imagen MySQL personalizada
│   ├── init.sql                 # Schema completo + INSERT usuarios por defecto
│   └── insercion_mysql.sql      # Datos: 100 ferias, 25 ubicaciones, expositores, productos
│
├── backend/                     # NestJS API REST
│   ├── src/
│   │   ├── main.ts              # Bootstrap: Swagger, CORS, ValidationPipe
│   │   ├── app.module.ts        # Módulo raíz + TypeORM
│   │   ├── auth/                # Login, Register, JWT Strategy
│   │   ├── users/               # CRUD usuarios + seed automático
│   │   ├── ferias/              # CRUD ferias (paginación + filtros)
│   │   ├── ubicaciones/         # CRUD ubicaciones
│   │   ├── stands/              # CRUD stands por feria
│   │   ├── expositores/         # CRUD expositores
│   │   ├── productos/           # CRUD productos con categorías
│   │   ├── exposiciones/        # CRUD exposiciones
│   │   ├── instituciones/       # CRUD instituciones
│   │   ├── participantes/       # Relación CONFORMAN
│   │   ├── organizadores/       # Relación ORGANIZA
│   │   ├── patrocinadores/      # Relación PATROCINA
│   │   ├── ofertas/             # Relación OFRECE
│   │   ├── dashboard/           # Estadísticas globales
│   │   └── common/              # Filtros, guards, decoradores, DTOs
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                    # React 19 + Vite SPA
    ├── src/
    │   ├── pages/               # Todas las páginas
    │   ├── contexts/            # AuthContext con JWT global
    │   ├── services/            # api.ts (Axios + interceptor JWT)
    │   ├── index.css            # Sistema de diseño Obsidian Glassmorphism
    │   └── App.tsx              # Router con rutas protegidas
    └── package.json
```

---

## 🚀 Tutorial: Levantar el Sistema Completo (Paso a Paso)

### Requisitos previos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| **Node.js** | 18.x o superior | `node --version` |
| **npm** | 9.x o superior | `npm --version` |
| **Docker Desktop** | 24.x o superior | `docker --version` |
| **Docker Compose** | v2 | `docker compose version` |

---

### PASO 1 — Obtener el proyecto

Si el proyecto está en un ZIP, descomprímelo. Si está en Git:

```bash
git clone <url-del-repo>
cd FeriasDominicales
```

---

### PASO 2 — Levantar la Base de Datos con Docker

**Desde la raíz del proyecto** (donde está `docker-compose.yml`):

```bash
docker compose up -d
```

Esto hace automáticamente:
- Descarga la imagen `mysql:8.0`
- Crea el contenedor `bdferias_mysql` en el puerto `3306`
- Ejecuta `database/init.sql`: crea las 12 tablas + inserta 8 usuarios por defecto
- Ejecuta `database/insercion_mysql.sql`: carga 100 ferias, 25 ubicaciones, expositores, productos, stands, etc.
- Crea el volumen persistente `mysql_data`

**Verificar que está corriendo:**

```bash
docker ps
# Verás: bdferias_mysql   Up X seconds (healthy)
```

> Espera **20-30 segundos** para que MySQL termine la inicialización antes del siguiente paso.

**Para ver los logs del contenedor:**
```bash
docker logs bdferias_mysql
```

---

### PASO 3 — Backend (NestJS)

**Abre una terminal nueva** y ve al directorio del backend:

```bash
cd backend
```

#### 3a. Instalar dependencias

```bash
npm install
```

> **Problema frecuente en Windows — `ERR_MODULE_NOT_FOUND`:**
> Si al ejecutar el backend aparece un error de módulo no encontrado (ej: `es-toolkit`, `typeorm`, `class-validator`), es por una extracción incompleta de npm en Windows. Solución:
>
> ```powershell
> # Reemplaza NOMBRE_PAQUETE@VERSION con el módulo que falla, por ejemplo:
> npm pack es-toolkit@1.52.0
> tar -xzf es-toolkit-1.52.0.tgz --strip-components=1 -C node_modules/es-toolkit
> del es-toolkit-1.52.0.tgz
> ```

#### 3b. Variables de entorno (opcional)

El backend funciona sin `.env` usando valores por defecto que ya coinciden con Docker Compose.
Si quieres personalizar, crea `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=bdferias
DB_USERNAME=feriauser
DB_PASSWORD=feriapass
JWT_SECRET=super_secret_ferias_key_2024
JWT_EXPIRES_IN=24h
API_PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### 3c. Iniciar el backend

```bash
npm run start:dev
```

**Salida esperada:**

```
[Nest] LOG [NestApplication] Nest application successfully started
🚀 API corriendo en: http://localhost:3000/api
📚 Swagger docs en:  http://localhost:3000/api/docs
```

Al iniciar, el backend también verifica y crea los 8 usuarios por defecto si no existen.

---

### PASO 4 — Frontend (React + Vite)

**Abre otra terminal nueva** y ve al directorio del frontend:

```bash
cd frontend
```

#### Instalar dependencias

```bash
npm install
```

#### Iniciar el servidor de desarrollo

```bash
npm run dev
```

**Salida esperada:**

```
VITE v6.x  ready in ~800ms
  Local:   http://localhost:5173/
```

---

### PASO 5 — Acceder al Sistema

Con los 3 procesos corriendo (Docker + Backend + Frontend):

| Servicio | URL |
|---|---|
| **Aplicación web** | http://localhost:5173 |
| **API REST** | http://localhost:3000/api |
| **Documentación Swagger** | http://localhost:3000/api/docs |

---

### Resumen — 3 terminales, 3 comandos

```bash
# Terminal 1 — Base de datos
docker compose up -d

# Terminal 2 — Backend
cd backend && npm install && npm run start:dev

# Terminal 3 — Frontend
cd frontend && npm install && npm run dev
```

---

## 👥 Usuarios por Defecto

Al iniciar el backend, se crean automáticamente estos usuarios si no existen en la BD.

### 🔴 Administradores (`ROL: ADMIN`)

Tienen acceso completo al panel de administración en `/admin`.

| Correo | Contraseña | Descripción |
|---|---|---|
| `admin@ferias.gob.bo` | `Admin1234!` | Administrador principal |
| `superadmin@ferias.gob.bo` | `Admin1234!` | Superadministrador de respaldo |
| `alcaldia.admin@lapaz.bo` | `Admin1234!` | Administrador municipal La Paz |

### 🟡 Expositores vinculados (`ROL: USUARIO`)

Tienen acceso al área "Mis Participaciones" con historial real de ferias de la BD.

| Correo | Contraseña | Expositor vinculado | CI |
|---|---|---|---|
| `oscar.chavez@ferias.bo` | `Expositor1234!` | Óscar Chavez Espejo | 1018225L |
| `tomas.apaza@ferias.bo` | `Expositor1234!` | Tomás Apaza Gomez | 1020136P |
| `katia.escobar@ferias.bo` | `Expositor1234!` | Katia Escobar Quisbert | 1135267P |

### 🟢 Visitantes (`ROL: USUARIO`)

Ciudadanos comunes con acceso solo a consulta pública.

| Correo | Contraseña | Descripción |
|---|---|---|
| `ciudadano@ferias.bo` | `Usuario1234!` | Ciudadano de La Paz |
| `visitante@gmail.com` | `Usuario1234!` | Visitante registrado |

> **Nota:** El seed verifica individualmente cada usuario al iniciar. Si alguien elimina un usuario desde el panel, al reiniciar el backend ese usuario se vuelve a crear automáticamente.

---

## 📡 Catálogo de Endpoints REST

**Base URL:** `http://localhost:3000/api`  
**Swagger UI:** http://localhost:3000/api/docs

### Auth

| Método | Ruta | Auth |
|---|---|---|
| POST | `/auth/login` | No |
| POST | `/auth/register` | No |

**Body login:** `{ "correo": "admin@ferias.gob.bo", "password": "Admin1234!" }`

### Ferias

| Método | Ruta | Auth |
|---|---|---|
| GET | `/ferias` | No |
| GET | `/ferias/:id` | No |
| POST | `/ferias` | ADMIN |
| PATCH | `/ferias/:id` | ADMIN |
| DELETE | `/ferias/:id` | ADMIN |

### Stands

| Método | Ruta | Auth |
|---|---|---|
| GET | `/ferias/:feriaId/stands` | No |
| POST | `/ferias/:feriaId/stands` | ADMIN |
| PATCH | `/ferias/:feriaId/stands/:nroStand` | ADMIN |
| DELETE | `/ferias/:feriaId/stands/:nroStand` | ADMIN |

### Ubicaciones

| Método | Ruta | Auth |
|---|---|---|
| GET | `/ubicaciones` | No |
| GET | `/ubicaciones/:id` | No |
| POST | `/ubicaciones` | ADMIN |
| PATCH | `/ubicaciones/:id` | ADMIN |
| DELETE | `/ubicaciones/:id` | ADMIN |

### Expositores

| Método | Ruta | Auth |
|---|---|---|
| GET | `/expositores` | No |
| GET | `/expositores/:ci` | No |
| POST | `/expositores` | ADMIN |
| PATCH | `/expositores/:ci` | ADMIN |
| DELETE | `/expositores/:ci` | ADMIN |

### Participantes (CONFORMAN)

| Método | Ruta | Auth |
|---|---|---|
| GET | `/ferias/:feriaId/participantes` | No |
| POST | `/ferias/:feriaId/participantes` | ADMIN |
| PATCH | `/ferias/:feriaId/participantes/:ciExpositor` | ADMIN |
| DELETE | `/ferias/:feriaId/participantes/:ciExpositor` | ADMIN |

### Productos

| Método | Ruta | Auth |
|---|---|---|
| GET | `/productos` | No |
| POST | `/productos` | ADMIN |
| PATCH | `/productos/:id` | ADMIN |
| DELETE | `/productos/:id` | ADMIN |

### Ofertas — OFRECE (Productos en Stand)

| Método | Ruta | Auth |
|---|---|---|
| GET | `/ferias/:feriaId/stands/:nroStand/productos` | No |
| POST | `/ferias/:feriaId/stands/:nroStand/productos` | ADMIN |
| PATCH | `/ferias/:feriaId/stands/:nroStand/productos/:productoId` | ADMIN |
| DELETE | `/ferias/:feriaId/stands/:nroStand/productos/:productoId` | ADMIN |

### Exposiciones

| Método | Ruta | Auth |
|---|---|---|
| GET | `/exposiciones` | No |
| POST | `/exposiciones` | ADMIN |
| PATCH | `/exposiciones/:id` | ADMIN |
| DELETE | `/exposiciones/:id` | ADMIN |

### Instituciones

| Método | Ruta | Auth |
|---|---|---|
| GET | `/instituciones` | No |
| POST | `/instituciones` | ADMIN |
| PATCH | `/instituciones/:nit` | ADMIN |
| DELETE | `/instituciones/:nit` | ADMIN |

### Organizadores (ORGANIZA)

| Método | Ruta | Auth |
|---|---|---|
| GET | `/ferias/:feriaId/organizadores` | No |
| POST | `/ferias/:feriaId/organizadores` | ADMIN |
| DELETE | `/ferias/:feriaId/organizadores/:nit` | ADMIN |

### Patrocinadores (PATROCINA)

| Método | Ruta | Auth |
|---|---|---|
| GET | `/ferias/:feriaId/patrocinadores` | No |
| POST | `/ferias/:feriaId/patrocinadores` | ADMIN |
| DELETE | `/ferias/:feriaId/patrocinadores/:nit` | ADMIN |

### Perfil (requiere JWT)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/me` | Datos del usuario autenticado |
| GET | `/me/participaciones` | Historial de ferias (solo si es expositor vinculado) |

### Usuarios (solo ADMIN)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/usuarios` | Listar todos los usuarios |
| POST | `/usuarios` | Crear usuario |
| PATCH | `/usuarios/:id` | Actualizar datos |
| PATCH | `/usuarios/:id/link-expositor` | Vincular/desvincular con expositor |
| DELETE | `/usuarios/:id` | Eliminar usuario |

### Dashboard (solo ADMIN)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/dashboard/stats` | Estadísticas globales del sistema |

---

## 🖥️ Funcionalidades del Frontend

### Páginas públicas (sin login)

| Página | Ruta | Descripción |
|---|---|---|
| Inicio | `/` | Bienvenida con ferias destacadas y accesos rápidos |
| Ferias | `/ferias` | Listado completo con filtros por estado y tipo |
| Detalle de Feria | `/ferias/:id` | Stands, expositores, productos y exposiciones |
| Ubicaciones | `/ubicaciones` | Recintos feriales de La Paz |
| Productos | `/productos` | Catálogo general por categoría |
| Estadísticas | `/estadisticas` | Gráficos y métricas del sistema |
| Login | `/login` | Inicio de sesión |
| Registro | `/register` | Registro de nuevo usuario |

### Área privada (requiere login)

| Página | Ruta | Descripción | Rol |
|---|---|---|---|
| Mis Participaciones | `/perfil` | Historial de ferias del expositor vinculado | USUARIO con expositor |
| Dashboard Admin | `/admin` | Estadísticas y resumen del sistema | ADMIN |
| Gestión Ferias | `/admin/ferias` | CRUD completo de ferias | ADMIN |
| Gestión Usuarios | `/admin/usuarios` | Crear, editar, vincular con expositor | ADMIN |
| Gestión Expositores | `/admin/expositores` | CRUD expositores | ADMIN |
| Gestión Productos | `/admin/productos` | CRUD productos | ADMIN |
| Gestión Instituciones | `/admin/instituciones` | CRUD instituciones | ADMIN |

---

## ⚙️ Variables de Entorno

### Backend — `backend/.env`

```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=bdferias
DB_USERNAME=feriauser
DB_PASSWORD=feriapass
JWT_SECRET=super_secret_ferias_key_2024
JWT_EXPIRES_IN=24h
API_PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Docker Compose — credenciales

Los valores por defecto ya coinciden con el backend:

```
MYSQL_DATABASE:      bdferias
MYSQL_USER:          feriauser
MYSQL_PASSWORD:      feriapass
MYSQL_ROOT_PASSWORD: rootpassword
```

> Si cambias credenciales en `docker-compose.yml`, actualiza también `backend/.env`.

---

## 🗑️ Reiniciar la Base de Datos desde Cero

```bash
# 1. Detener contenedor Y BORRAR el volumen
docker compose down -v

# 2. Volver a crear con datos frescos
docker compose up -d
```

> **Advertencia:** `-v` elimina permanentemente el volumen `mysql_data`. Se perderán TODOS los datos.

---

## 📄 Licencia

Proyecto académico — UMSA, Carrera de Informática, Materia: Base de Datos 2.

