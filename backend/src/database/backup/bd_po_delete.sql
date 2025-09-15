DROP PROCEDURE IF EXISTS sp_delete_production_order;
DELIMITER //
CREATE PROCEDURE sp_delete_production_order(
    IN in_po_id INT,
    IN in_order_id INT,
    IN in_order_type VARCHAR(100),
    IN in_product_id INT,
    IN in_product_name VARCHAR(100)
)
BEGIN
    -- VARIABLES NECESARIAS PARA GENERAR EL MOVIMIENTO
    DECLARE v_location_id INT DEFAULT 0;
    DECLARE v_location_name VARCHAR(100) DEFAULT '';
    DECLARE v_input_id INT DEFAULT 0;
    DECLARE v_input_name VARCHAR(100) DEFAULT '';

    -- VARIABLES DE INPUT DEL PRODUCTO
    DECLARE v_equivalence DECIMAL(14,4) DEFAULT 0.00;

    -- VARIABLES DE INVENTARIO Y PRODUCCION
    DECLARE v_production_allocation DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_production_qty DECIMAL(14,4) DEFAULT 0.00;

    -- VARIABLES DE LA LOGICA
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_allocate_input DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_ajuste_input DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_ajuste_prod DECIMAL(14,4) DEFAULT 0.00;

    -- Creamos un cursor para iterar sobre los insumos del producto
    DECLARE cur_inputs_product CURSOR FOR
        SELECT 
            i.id,
            i.name,
            pi.equivalence
        FROM products_inputs AS pi
        JOIN inputs AS i
            ON i.id = pi.input_id
        WHERE pi.product_id = in_product_id;

    -- Manejador de cursor para cuando no encuentra mas registros
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    IF in_order_type = 'internal' THEN
        
        -- Creamos una tabla temporal para obtener los movimientos de inventario de la pop
        DROP TEMPORARY TABLE IF EXISTS temp_inventory_movements_pop;
        CREATE TEMPORARY TABLE temp_inventory_movements_pop AS
            SELECT *
            FROM inventory_movements AS im
            WHERE 
                im.reference_type IN (
                    'Internal Production Order'
                )
            AND im.reference_id = in_po_id
            AND im.item_type IN (
                'product', 
                'input'
            )
            AND im.movement_type = 'allocate';

        -- OBTENEMOS LA LOCATION DE LA POP
        SELECT l.id, l.name
            INTO v_location_id, v_location_name
        FROM internal_production_orders_lines_products AS ippolp
        JOIN locations_production_lines AS lpl 
            ON lpl.production_line_id = ippolp.production_line_id
        JOIN locations AS l
            ON l.id  = lpl.location_id
        WHERE ippolp.internal_product_production_order_id = in_order_id
        LIMIT 1;

        -- inventario comprometido de produccion
        SELECT
            IFNULL(SUM(im.qty), 0)
        INTO 
            v_production_allocation
        FROM temp_inventory_movements_pop AS im
        WHERE im.reference_type = 'Internal Production Order'
            AND im.reference_id = in_po_id
            AND im.movement_type = 'allocate'
            AND im.description IN ('Internal Production Allocation', 'Adjust Internal Production Allocation')
            AND im.item_id = in_product_id
            AND im.item_type = 'product'
        LIMIT 1;

    ELSE

        -- Creamos una tabla temporal para obtener los movimientos de inventario de la pop
        DROP TEMPORARY TABLE IF EXISTS temp_inventory_movements_pop;
        CREATE TEMPORARY TABLE temp_inventory_movements_pop AS
            SELECT *
            FROM inventory_movements AS im
            WHERE 
                im.reference_type IN (
                    'Production Order'
                )
            AND im.reference_id = in_po_id
            AND im.item_type IN (
                'product', 
                'input'
            )
            AND im.movement_type = 'allocate';

        -- OBTENEMOS LA LOCATION DE LA POP
        SELECT l.id, l.name
        INTO v_location_id, v_location_name
        FROM purchased_orders_products_locations_production_lines AS poplpl
        JOIN locations_production_lines AS lpl 
            ON lpl.production_line_id = poplpl.production_line_id
        JOIN locations AS l
            ON l.id  = lpl.location_id
        WHERE poplpl.purchase_order_product_id = in_order_id
        LIMIT 1;

        -- inventario comprometido de produccion
        SELECT
            IFNULL(SUM(im.qty), 0)
        INTO 
            v_production_allocation
        FROM temp_inventory_movements_pop AS im
        WHERE im.reference_type = 'Production Order'
            AND im.reference_id = in_po_id
            AND im.movement_type = 'allocate'
            AND im.description IN ('Production Allocation', 'Adjust Production Allocation')
            AND im.item_id = in_product_id
            AND im.item_type = 'product'
        LIMIT 1;

    END IF;

    -- Efectuamos el movimiento para establcer el ajuste de inventario comprometido en stock 
    INSERT INTO inventory_movements (
        location_name, location_id, item_type,
        item_id, item_name, movement_type, 
        description, qty, reference_type, 
        reference_id, is_locked
    ) VALUES (
        v_location_name, v_location_id, 'product', 
        in_product_id, in_product_name, 'allocate', 
        CASE
            WHEN in_order_type = 'client' THEN 'Adjust Production Allocation'
            ELSE 'Adjust Internal Production Allocation'
        END,
        v_production_allocation, 
        CASE
            WHEN in_order_type = 'client' THEN 'Production Order'
            ELSE 'Internal Production Order'
        END,
        in_po_id, 1
    );

    OPEN cur_inputs_product;

    -- Iteramos sobre los inputs del producto
    SET v_done = 0;
    read_loop: LOOP

        -- Obtenemos los datos del input del producto en esta iteracion
        FETCH cur_inputs_product 
        INTO v_input_id, v_input_name, v_equivalence;

        -- Flag que determina si se recorrieron todos los inputs
        IF v_done THEN
            LEAVE read_loop;
        END IF;

        -- Obtenemos el inventario comprometido de este insumo
        SELECT 
            IFNULL(SUM(timp.qty), 0) 
        INTO v_allocate_input
        FROM temp_inventory_movements_pop AS timp
        WHERE timp.reference_type IN (
            CASE 
                WHEN in_order_type = 'client' THEN 'Production Order'
                WHEN in_order_type = 'internal' THEN 'Internal Production Order'
            END,
            CASE 
                WHEN in_order_type = 'client' THEN 'Adjust Production Order'
                WHEN in_order_type = 'internal' THEN 'Adjust Internal Production Order'
            END
        )
        AND timp.movement_type = 'allocate'
        AND timp.item_id = v_input_id
        AND timp.item_type = 'input'
        LIMIT 1;

        -- Si tiene inventario comprometido de insumo
        IF v_allocate_input > 0 THEN
    
            -- El ajuste del insumo es (-insumo comprometido * equivalencia)
            SET v_ajuste_input = v_ajuste_prod * v_equivalence;
    
            INSERT INTO inventory_movements (
                location_name, location_id, 
                item_type, item_id, item_name, 
                movement_type, description, 
                qty, reference_type, reference_id, is_locked
            ) VALUES (
                v_location_name, v_location_id, 
                'input', v_input_id, v_input_name, 
                'allocate', 
                CASE
                    WHEN in_order_type = 'client' THEN 'Adjust Production Allocation'
                    ELSE 'Adjust Internal Production Allocation'
                END,
                CASE WHEN ABS(v_allocate_input) < ABS(v_ajuste_input) 
                    THEN -v_allocate_input 
                    ELSE v_ajuste_input 
                END,       
                CASE
                    WHEN in_order_type = 'client' THEN 'Production Order'
                    ELSE 'Internal Production Order'
                END,
                in_po_id,
                1
            );

        END IF;

    END LOOP;

    -- Cerramos el cursor
    CLOSE cur_inputs_product;

    -- Eliminamos la tabla temporal
    DROP TEMPORARY TABLE IF EXISTS temp_inventory_movements_pop;
    
END //
DELIMITER 