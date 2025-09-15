USE u482698715_shau_erp;

DROP PROCEDURE IF EXISTS sp_assign_production_order_to_queue;
DELIMITER //
CREATE PROCEDURE sp_assign_production_order_to_queue (
    IN in_production_order_id INT UNSIGNED,
    IN in_order_id INT UNSIGNED,
    IN in_order_type VARCHAR(50)
)
BEGIN
    DECLARE v_production_line_id INT UNSIGNED DEFAULT 0;
    DECLARE v_last_position DECIMAL(10,4) DEFAULT 0;
    DECLARE v_new_position DECIMAL(10,4) DEFAULT 0;
    DECLARE v_existing_order_id INT UNSIGNED DEFAULT NULL;

    -- Determinar línea de producción
    IF in_order_type = 'client' THEN
        SELECT IFNULL(poplpl.production_line_id, 0)
        INTO v_production_line_id
        FROM purchased_orders_products_locations_production_lines AS poplpl
        WHERE poplpl.purchase_order_product_id = in_order_id
        LIMIT 1;
    ELSE
        SELECT IFNULL(ipolp.production_line_id, 0)
        INTO v_production_line_id
        FROM internal_production_orders_lines_products AS ipolp
        WHERE ipolp.internal_product_production_order_id = in_order_id
        LIMIT 1;
    END IF;

    -- SET @msg = CONCAT('production_line_id: ', v_production_line_id);
    -- INSERT INTO debug_log (message) VALUES (@msg);

    -- Insertar en la cola
    IF v_production_line_id > 0 THEN
    
        -- Bloquear posiciones de esa línea
        SELECT IFNULL(MAX(position), 0)
        INTO v_last_position
        FROM production_line_queue
        WHERE production_line_id = v_production_line_id
        FOR UPDATE;

        SET v_new_position = v_last_position + 10;

        -- Verificar si ya existe una fila en esa posición en la misma linea de produccion
        SELECT production_order_id
        INTO v_existing_order_id
        FROM production_line_queue
        WHERE production_line_id = v_production_line_id
        AND position = v_new_position
        LIMIT 1;

        IF v_existing_order_id IS NOT NULL AND v_existing_order_id <> in_production_order_id THEN
            -- Si ya existe otra orden, incrementamos la posición para no sobrescribir
            SET v_new_position = v_last_position + 20;
        END IF;

        -- Insertar (o actualizar si es la misma orden)
        INSERT INTO production_line_queue (
            production_line_id,
            production_order_id,
            position
        )
        VALUES (
            v_production_line_id,
            in_production_order_id,
            v_new_position
        )
        ON DUPLICATE KEY UPDATE 
            position = VALUES(position); -- solo actualiza si es misma orden
    END IF;
END //
DELIMITER ;
