DO
$do$
BEGIN
   IF EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'platzi') THEN

      RAISE NOTICE 'Role "platzi" already exists. Skipping.';
   ELSE
      CREATE USER platzi WITH ENCRYPTED PASSWORD 'platzi';
   END IF;

  CREATE DATABASE platziverse;
  GRANT ALL PRIVILEGES ON DATABASE platziverse TO platzi;
END
$do$;