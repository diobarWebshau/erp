

-- MODULOS CORES

-- LOCATIONS

-- Mostrar indices de una tabla
SHOW INDEX FROM locations;

-- Crear un indice en una tabla

CREATE INDEX Idx_locations_name ON locations(name);

-- Eliminar un indice de una tabla

DROP INDEX idx_locations_name ON locations;

-- Actualizar un indice de una tabla
-- no se puede actualizar un indice, se debe eliminar y crear de nuevo

DELETE INDEX idx_locations_name ON locations;
CREATE INDEX idx_locations_name ON locations(name);


-- INDICES COMPUSTOS O MULTICOLUMNA

CREATE INDEX idx_locations_name_description ON locations(name, description);


-- Indices unicos 

CREATE UNIQUE INDEX idx_users_email ON users(email);














--  uSA EXPLAIN para ver el plan de ejecucion de una consulta 

EXPLAIN SELECT * FROM users WHERE email = 'x@x.com';

-- Ver el plan de ejecucion de una consulta con el tiempo de ejecucion

EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'x@x.com';


-- Forzar el uso de un indice

SELECT * FROM users FORCE INDEX (idx_email) WHERE email = 'x@x.com';

-- Ignorar el uso de un indice

SELECT * FROM users IGNORE INDEX (idx_email) WHERE email = 'x@x.com';
