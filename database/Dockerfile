FROM mysql:8.0

LABEL maintainer="FeriasDominicales"
LABEL description="Contenedor de Base de Datos MySQL con esquema y datos precargados para Ferias Dominicales"

ENV MYSQL_DATABASE=bdferias \
    MYSQL_USER=feriauser \
    MYSQL_PASSWORD=feriapass \
    MYSQL_ROOT_PASSWORD=rootpassword

# Copiar scripts de inicialización que se ejecutan automáticamente en el primer arranque
COPY init.sql /docker-entrypoint-initdb.d/01_schema.sql
COPY insercion_mysql.sql /docker-entrypoint-initdb.d/02_data.sql
COPY insert_usuario.sql /docker-entrypoint-initdb.d/03_usuarios.sql

EXPOSE 3306

CMD ["--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci", "--default-authentication-plugin=mysql_native_password"]
