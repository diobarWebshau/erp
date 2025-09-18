SHOW DATABASES;

USE u482698715_shau_erp;

/* SELECT BASICO */
/* LOS ALIAS NO SON VALIDOS EN WHERE, EN ORDER BY si */

-- Seleccionar todas las columnas de una tabla (ALL)
SELECT * FROM clients; -- Contras de usar *, más datos de los necesarios

-- Seleccionar ciertas columnas especificas de una tabla (DISTINCT)
SELECT id, address FROM clients;

-- Seleccionar columnas apartir de un alias de la tabla
SELECT clts.* FROM clients AS clts;
SELECT clts.id, clts.address FROM Clients AS clts;

-- Renombrar columnas en el resultado de una consulta
SELECT id AS ID, address AS ADDRESS FROM clients;

-- Introducir valores constantes como columna a las rows de la consulta
SELECT 
	id, 
    id*5 AS id5,
    now() AS date,
    company_name,
    'Hola' AS saludo
FROM clients;


/* LITERALES  */


-- literales
-- string
SELECT 'hola', "HOLA";
-- numerico
SELECT 1,0;
-- booleano
SELECT TRUE, FALSE;
-- literal de NULL(Representa ausencia de valor)
SELECT NULL = NULL;
SELECT NULL <=> NULL; -- Comparacion valida sobre null



/* CONVERSION EXPLICITA */

-- de String a Date
-- si el formato no es valido, retorna null
SELECT DATE('2025-12-01');
SELECT DATE('2025-13-01');

-- conversion de numerico a booleano
SELECT IF(0, TRUE, FALSE);
SELECT 
	id,
    company_name,
    IF (id = 1, 
		'Primero',
        IF ( id = 2,
			'Segundo',
            'Tercero'
        )
    ) AS orden
FROM clients;

-- SWITCH CASE en mysql
SELECT
	id,
    company_name,
	CASE 
		WHEN id = 1 THEN "Primero"
        WHEN id = 2 THEN 'Segundo'
        WHEN id = 3 THEN 'Tercero'
    END AS orden
FROM clients;

-- JSON

SELECT * FROM inventory_movements;

-- Function que practicamente permite ver como manipular la creacion de un JSON
DROP FUNCTION IF EXISTS func_create_json;
DELIMITER //
CREATE FUNCTION func_create_json()
RETURNS JSON
NOT DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE v_json JSON DEFAULT JSON_OBJECT();
    DECLARE v_json_array JSON DEFAULT JSON_ARRAY();
    DECLARE v_location_name VARCHAR(100) DEFAULT '';
    DECLARE v_item_name VARCHAR(100) DEFAULT '';
    DECLARE v_item_id INT DEFAULT NULL;
    DECLARE v_reference_id INT DEFAULT NULL;
    DECLARE v_id INT DEFAULT 0;
    
    SELECT im.id, im.location_name, im.item_name, im.item_id, v_reference_id
    INTO v_id, v_location_name, v_item_name, v_item_id, v_reference_id
    FROM inventory_movements AS im WHERE im.id = 1
    LIMIT 1;
    
    -- Inserta el valor solo si no existe el key o path
    SET v_json = JSON_INSERT(v_json, '$.id', v_id);
    SET v_json = JSON_INSERT(v_json, '$.location_name', 'Texto de prueba');
    SET v_json = JSON_INSERT(v_json, '$.item_name', v_item_name);
    SET v_json = JSON_INSERT(v_json, '$.item_id', v_item_id);
    SET v_json = JSON_INSERT(v_json, '$.reference_id', v_reference_id);
    
    -- Modifica el valor solo si la key o path existe
    SET v_json = JSON_REPLACE(v_json, '$.location_name', 'Texto de prueba modificado');
    
    -- Agrega el valor si la key o path no existe, si existe lo remplaza
    SET v_json = JSON_SET(v_json, '$.location_name', v_location_name);
    
    -- Elimina el path solamente si existe
    SET v_json = JSON_REMOVE(v_json, '$.item_id');
    
    -- Agregar un valor en una posicion
    SET v_json_array = JSON_ARRAY_INSERT(v_json_array, '$[0]', 'Hola ');
    SET v_json_array = JSON_ARRAY_INSERT(v_json_array, '$[1]', 'Diobar');
    
    -- Agregar al final del array
    SET v_json_array = JSON_ARRAY_APPEND(v_json_array, '$', ', ¿como estas?');
    
    -- Eliminar una posicion 
    SET v_json_array = JSON_REMOVE(v_json_array, '$[2]');
    
    -- Eliminar el ultimo elemento de un array
    SET v_json_array = JSON_REMOVE(v_json_array, CONCAT('$[', JSON_LENGTH(v_json_array)-1, ']'));
    
    -- Agrgar nuevamente un valor al final del array
    SET v_json_array = JSON_ARRAY_APPEND(v_json_array, '$', 'Diobar');
    
    -- Obtener la cantidad de path o elementos dentro del JSON
    RETURN JSON_OBJECT(
		'json', v_json,
        'is_valid', JSON_VALID(v_json),
        'is_json', JSON_VALID(v_json),
        'type', JSON_TYPE(v_json), 
        'keys', JSON_KEYS(v_json), 
        'depth', JSON_DEPTH(v_json),
        'length_keys', JSON_LENGTH(JSON_KEYS(v_json)),
        'hasId', JSON_CONTAINS_PATH(v_json,'one','$.id'),
        'array_json', v_json_array
    );
END //
DELIMITER ;

-- Function que retorna una Array de json, empleando SWITCH, IF dentro de select, validacion segura de NULL, funcion IFNULL y COALESCE
DROP FUNCTION IF EXISTS prueba_test;
DELIMITER //
CREATE FUNCTION prueba_test()
RETURNS JSON
NOT DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE v_json JSON DEFAULT JSON_ARRAY();
	SELECT
		JSON_ARRAYAGG(
			JSON_OBJECT(
				'id', im.id, 
                'location_id', im.location_id, 
                'location_name', im.location_name, 
                'item_id', im.item_id, 
                'item_name', im.item_name, 
                'qty', im.qty, 
                'movement_type', CASE
					WHEN im.movement_type IS NULL THEN 'Nulo'
					WHEN LOWER(im.movement_type) = 'in' THEN 'Entrada'
                    WHEN LOWER(im.movement_type) = 'out' THEN 'Salida'
                    ELSE 'Comprometido'
                END,
                'reference_id', COALESCE(CAST(im.reference_id AS CHAR), 'No referencia asignada'), 
                'reference_type', im.reference_type,
                'production_id', IFNULL(im.production_id, 'No produccion asignada'),
                'description', IF (im.description <=> NULL, 'No descripcion asignada', im.description),
                'is_locked', IF(im.is_locked = 1, 'Movimiento bloqueado', 'Movimiento efectuado'),
                'created_at', im.created_at
            )
        )
	INTO v_json
    FROM inventory_movements AS im;
    IF v_json IS NULL THEN
		RETURN JSON_ARRAY();
    ELSE
		RETURN v_json;
    END IF;
END //
DELIMITER ;

SELECT prueba_test();
SELECT func_create_json();

SELECT VERSION();



-- COALESCE: primer NO-NULL (N argumentos)
SELECT COALESCE(NULL, NULL, 5, 9);        -- 5
SELECT COALESCE(NULL, 'abc');             -- 'abc'
SELECT COALESCE(NULL, NULL);              -- NULL

-- IFNULL: como COALESCE pero solo 2 args
SELECT IFNULL(NULL, 'X');             -- 'X'
SELECT IFNULL(10, 0);                     -- 10

-- GREATEST: máximo (si hay NULL, devuelve NULL)
SELECT GREATEST(3, 8, 5);                -- 8
SELECT GREATEST(10, NULL, 2);             -- NULL
SELECT GREATEST(COALESCE(10,0)-COALESCE(12,0), 0);  -- 0  (evitar negativos)

-- LEAST: mínimo
SELECT LEAST(3, 8, 5);       -- 3
SELECT LEAST(GREATEST(120, 0), 100);      -- 100  (clamp a [0,100])

-- NULLIF: devuelve NULL si a = b, si no devuelve a
SELECT NULLIF(5, 5);                      -- NULL
SELECT NULLIF(5, 0);                      -- 5

-- ISNULL (MySQL): 1 si es NULL, 0 si no
SELECT ISNULL(NULL);                      -- 1
SELECT ISNULL('hi');                      -- 0

-- IF: condicional ternario
SELECT IF(10 > 5, 'ok', 'no');            -- 'ok'
SELECT IF(NULL IS NULL, 'yes', 'no');     -- 'yes'

-- CASE: condiciones múltiples
SELECT CASE WHEN 90 >= 90 THEN 'A'
     WHEN 90 >= 80 THEN 'B'
     ELSE 'C'
END;                               -- 'A'

-- LEAD / LAG (ventana): siguiente / anterior valor
-- Si qty = [20,10,5] por stage ASC:
-- LEAD(qty,1,0)  OVER (ORDER BY stage)   -- [10, 5, 0]
-- LAG(qty,1,0)   OVER (ORDER BY stage)   -- [0, 20, 10]
