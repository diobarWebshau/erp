DROP PROCEDURE IF EXISTS asigne_location_to_pop;
DELIMITER //
CREATE PROCEDURE asigne_location_to_pop(
    IN pop_id INT,
    OUT json_info JSON
)
BEGIN
    -- Variables
    DECLARE pop_product_id INT DEFAULT 0;
    DECLARE pop_product_name VARCHAR(100);
    DECLARE pop_qty DECIMAL(10,4) DEFAULT 0;
    DECLARE location_id_final INT DEFAULT NULL;
    DECLARE differencial DECIMAL(10,4) DEFAULT 0;
    DECLARE qty_committed DECIMAL(10,4) DEFAULT 0;

    DECLARE v_available DECIMAL(10,4);
    DECLARE v_location_id INT;
    DECLARE v_location_name VARCHAR(100);

    DECLARE done INT DEFAULT FALSE;

    -- Cursor para recorrer locations si no hay stock suficiente
    DECLARE cur_locations CURSOR FOR
        SELECT location_id, location_name, available
        FROM temp_locations
        ORDER BY available DESC;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- 1. Obtener datos del producto
    SELECT pop.product_id, pop.qty, p.name
    INTO pop_product_id, pop_qty, pop_product_name
    FROM purchased_orders_products pop
    JOIN products p ON p.id = pop.product_id
    WHERE pop.id = pop_id;


    -- 2. Crear tabla temporal de ubicaciones

	DROP TEMPORARY TABLE IF EXISTS temp_locations;
	CREATE TEMPORARY TABLE temp_locations AS
	SELECT
		l.id AS location_id,
		l.name AS location_name,
		IFNULL(lpd.stock, 0) AS stock,
		IFNULL(lpd.committed, 0) AS committed,
		(IFNULL(lpd.stock, 0) - IFNULL(lpd.committed, 0)) AS available
	FROM locations l
	JOIN locations_location_types llt 
		ON llt.location_id = l.id
	JOIN location_types lt 
		ON lt.id = llt.location_type_id
	JOIN (
		SELECT
			ili.item_type,
			ili.item_id,
			ili.location_id,
			i.stock,
			IFNULL(SUM(im.qty), 0) AS committed
		FROM inventories_locations_items ili
		JOIN inventories i 
			ON i.id = ili.inventory_id
		LEFT JOIN inventory_movements im 
			ON im.item_id = ili.item_id
		   AND im.location_id = ili.location_id
		   AND im.item_type = 'product'
		   AND im.movement_type = 'allocate'
		   AND im.reference_type NOT IN ('Transfer', 'Scrap')
		   AND im.is_locked = 1
		WHERE ili.item_type = 'product'
		  AND ili.item_id = pop_product_id
		GROUP BY ili.item_type, ili.item_id, ili.location_id, i.stock
	) lpd 
		ON l.id = lpd.location_id
	WHERE lt.name = 'Store';



    INSERT into debug_log(message) VALUES (CONCAT('Antes de morir2'));

    -- 3. Verificar si existe ubicación con stock suficiente
    SELECT location_id, location_name, available
    INTO v_location_id, v_location_name, v_available
    FROM temp_locations
    WHERE available >= pop_qty
    ORDER BY available DESC
    LIMIT 1;

    INSERT into debug_log(message) VALUES (CONCAT('Despues de morir2'));

    IF v_location_id IS NOT NULL THEN
        -- Stock suficiente directamente
        SET location_id_final = v_location_id;
        SET qty_committed = pop_qty;
        SET differencial = 0;
    ELSE
        -- No hay stock suficiente directo
        SET done = FALSE;
        OPEN cur_locations;

        location_loop: LOOP
            FETCH cur_locations INTO v_location_id, v_location_name, v_available;

            IF done THEN
                LEAVE location_loop;
            END IF;

            -- Stock parcial disponible
            SET qty_committed = v_available;
            SET differencial = pop_qty - v_available;

            -- 4. Crear tabla temporal de insumos en esa ubicación
            DROP TEMPORARY TABLE IF EXISTS temp_inputs;
            CREATE TEMPORARY TABLE temp_inputs AS
            SELECT 
                i.id AS input_id,
                i.name AS input_name,
                pi.equivalence,
                ili.location_id,
                inv.stock,
                (inv.stock - IFNULL((
                    SELECT SUM(im.qty)
                    FROM inventory_movements im
                    WHERE im.item_type = 'input'
                      AND im.movement_type = 'allocate'
                      AND im.is_locked = 1
                      AND im.location_id = ili.location_id
                      AND im.item_id = i.id
                ), 0)) AS available_input
            FROM products_inputs pi
            JOIN inputs i ON i.id = pi.input_id
            JOIN inventories_locations_items ili ON ili.item_id = i.id AND ili.item_type = 'input'
            JOIN inventories inv ON inv.id = ili.inventory_id
            WHERE pi.product_id = pop_product_id
              AND ili.location_id = v_location_id;

            -- 5. Verificar si TODOS los insumos cumplen
            IF NOT EXISTS (
                SELECT 1
                FROM temp_inputs
                WHERE (differencial * equivalence) > available_input
            ) THEN
                -- TODOS los insumos cumplen
                SET location_id_final = v_location_id;
                LEAVE location_loop;
            END IF;

        END LOOP location_loop;

        CLOSE cur_locations;
    END IF;

    -- 6. Generar salida JSON
    IF location_id_final IS NOT NULL THEN
        SET json_info = JSON_OBJECT(
            'location_id', location_id_final,
            'location_name', v_location_name,
            'qty', pop_qty,
            'commited', qty_committed,
            'production', differencial,
            'product_id', pop_product_id,
            'product_name', pop_product_name
        );
    ELSE
        SET json_info = NULL;
    END IF;
END //
DELIMITER ;
