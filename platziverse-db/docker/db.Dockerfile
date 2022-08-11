FROM postgres:12.4-alpine
COPY init.sql /docker-entrypoint-initdb.d/