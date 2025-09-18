USE u482698715_shau_erp;

DROP PROCEDURE IF EXISTS sp_apply_process_input_consumption;
DELIMITER //
CREATE PROCEDURE sp_apply_process_input_consumption(
    in_production_id INT,
    in_production_order_id INT,
    in_product_id INT,
    in_process_id INT,
    in_qty DECIMAL(14,4)
)
BEGIN
    -- Variables para generar el movimiento de consumo
    DECLARE v_location_id INT DEFAULT 0;
    DECLARE v_location_name VARCHAR(100) DEFAULT '';
    DECLARE v_is_last TINYINT DEFAULT 0;

    -- Variables de los insumos
    DECLARE v_input_id INT DEFAULT 0;
    DECLARE v_input_name VARCHAR(100) DEFAULT '';
    DECLARE v_equivalence DECIMAL(14,4) DEFAULT 0;
    
    -- Variables de proceso
    DECLARE v_process_name VARCHAR(100) DEFAULT '';
    DECLARE v_process_id INT DEFAULT 0;

    -- Variables de producto
    DECLARE v_product_name VARCHAR(100) DEFAULT '';
    DECLARE v_product_id INT DEFAULT 0;

    -- Variables de la logica
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_consumable_qty DECIMAL(14,4) DEFAULT 0;
    DECLARE v_consumable_input_qty DECIMAL(14,4) DEFAULT 0;
    DECLARE v_order_type VARCHAR(100) DEFAULT '';
    DECLARE v_order_id INT DEFAULT 0;

    -- Creamos un cursor para iterar sobre los consumibles del proceso
    DECLARE v_cursor_products_inputs_processes CURSOR FOR 
    SELECT
        p.id AS product_id,
        p.name AS product_name,
        i.id AS input_id,
        i.name AS input_name,
        pi.equivalence,
        pr.id AS process_id,
        pr.name AS process_name,
        pip.qty as consumable_qty
    FROM products_inputs_processes AS pip
    JOIN products AS p
        ON p.id = pip.product_id
    JOIN products_inputs AS pi
        ON pi.id = pip.product_input_id
    JOIN inputs AS i
        ON i.id = pi.input_id
    JOIN products_processes AS pp
        ON pp.id = pip.product_process_id
    JOIN processes AS pr
        ON pr.id = pp.process_id
    WHERE p.id = in_product_id
        AND pr.id = in_process_id;

    -- Manejador de cursor para cuando no encuentra mas registros
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    -- OBTENERMOS LA ORDEN DE PRODUCCION
    SELECT 
        po.order_type,
        po.order_id
    INTO v_order_type, v_order_id
    FROM production_orders AS po
    WHERE po.id = in_production_order_id
    LIMIT 1;

    -- OBTENEMOS LA REFERENCIA DE LA ORDEN DE PRODUCCION PARA OBTENER LA LOCACION DONDE SE HARA EL MOVIMIENTO DE CONSUMO
    if v_order_type = 'internal' THEN

        SELECT l.id, l.name
            INTO v_location_id, v_location_name
        FROM internal_production_orders_lines_products AS ippolp
        JOIN locations_production_lines AS lpl 
            ON lpl.production_line_id = ippolp.production_line_id
        JOIN locations AS l
            ON l.id  = lpl.location_id
        WHERE ippolp.internal_product_production_order_id = v_order_id
        LIMIT 1;
    
    ELSE

        SELECT l.id, l.name
            INTO v_location_id, v_location_name
        FROM purchased_orders_products_locations_production_lines AS poplpl
        JOIN locations_production_lines AS lpl 
            ON lpl.production_line_id = poplpl.production_line_id
        JOIN locations AS l
            ON l.id  = lpl.location_id
        WHERE poplpl.purchase_order_product_id = v_order_id
        LIMIT 1;

    END IF;

    -- VALIDAMOS QUE EL PROCESO SEA EL ULTIMO EN LA CADENA DE PROCESOS
    SELECT 
        (
            SELECT pp.process_id
            FROM products_processes pp
            WHERE pp.product_id = in_product_id
            AND pp.sort_order = (
                SELECT MAX(sort_order)
                FROM products_processes
                WHERE product_id = in_product_id
            )
            LIMIT 1
        ) = in_process_id
    INTO v_is_last;

    -- Abrimos el cursor
    OPEN v_cursor_products_inputs_processes;

    -- Inicializamos el flag
    SET v_done = 0;

    read_loop: LOOP

        -- Obtenemos los datos del input del producto en esta iteracion
        FETCH v_cursor_products_inputs_processes INTO 
            v_product_id,
            v_product_name,
            v_input_id,
            v_input_name,
            v_equivalence,
            v_process_id,
            v_process_name,
            v_consumable_qty;

        -- Flag que determina si se recorrieron todos los inputs
        IF v_done THEN
            LEAVE read_loop;
        END IF;

        -- Calculamos la cantidad de insumo consumible
        SET v_consumable_input_qty = (v_consumable_qty * in_qty);

        -- Efectuamos el movimiento de consumo del input
        INSERT INTO inventory_movements (
            location_name, location_id, item_type,
            item_id, item_name, movement_type, 
            description, qty, reference_type, 
            reference_id, production_id, is_locked
        ) VALUES (
            v_location_name, v_location_id, 'input',
            v_input_id, v_input_name, 'out',
            CASE 
                WHEN v_order_type = 'internal' THEN 'Internal Production Consumption'
                ELSE 'Production Consumption'
            END, 
            v_consumable_input_qty,
            CASE 
                WHEN v_order_type = 'internal' THEN 'Internal Production Order'
                ELSE 'Production Order'
            END, 
            in_production_order_id, 
            in_production_id, 
            0
        );

        -- Efectuamos el movimiento que descompromete el insumo de la orden de produccion
        INSERT INTO inventory_movements (
            location_name, location_id, item_type,
            item_id, item_name, movement_type, 
            description, qty, reference_type, 
            reference_id, production_id, is_locked
        ) VALUES (
            v_location_name, v_location_id, 'input',
            v_input_id, v_input_name, 'allocate',
            CASE 
                WHEN v_order_type = 'internal' THEN 'Adjust Internal Production Allocation'
                ELSE 'Adjust Production Allocation'
            END, 
            -(v_consumable_input_qty),
            CASE 
                WHEN v_order_type = 'internal' THEN 'Internal Production Order'
                ELSE 'Production Order'
            END, 
            in_production_order_id, 
            in_production_id, 
            1
        );
        
    END LOOP;

    -- Cerramos el cursor
    CLOSE v_cursor_products_inputs_processes;

    -- Si fue el ultimo proceso, efectuamos el movimiento de consumo del producto
    IF v_is_last THEN
        
        -- Efectuamos el movimiento de consumo del producto
        INSERT INTO inventory_movements (
            location_name, location_id, item_type,
            item_id, item_name, movement_type, 
            description, qty, reference_type, 
            reference_id, production_id, is_locked
        ) VALUES (
            v_location_name, v_location_id, 'product',
            v_product_id, v_product_name, 'in',
            CASE 
                WHEN v_order_type = 'internal' THEN 'Internal Production Output'
                ELSE 'Production Output'
            END, 
            in_qty,
            CASE 
                WHEN v_order_type = 'internal' THEN 'Internal Production Order'
                ELSE 'Production Order'
            END, 
            in_production_order_id, 
            in_production_id, 
            0
        );
        
    END IF;
    
END //
DELIMITER ;




