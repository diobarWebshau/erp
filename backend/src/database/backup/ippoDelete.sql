USE u482698715_shau_erp;

DROP PROCEDURE IF EXISTS sp_revert_movement_inventory_ippo;
DELIMITER //
CREATE PROCEDURE sp_revert_movement_inventory_ippo(
    IN in_ippo_id INT,
    IN in_product_id INT,
    IN in_product_name VARCHAR(100)
)
BEGIN
    -- VARIABLES NECESARIAS PARA GENERAR EL MOVIMIENTO
    DECLARE v_location_id INT DEFAULT 0;
    DECLARE v_location_name VARCHAR(100) DEFAULT '';
    DECLARE v_input_id INT DEFAULT 0;
    DECLARE v_input_name VARCHAR(100) DEFAULT '';
    DECLARE v_reference_id INT DEFAULT 0;

    -- VARIABLES DE INPUT DEL PRODUCTO
    DECLARE v_equivalence DECIMAL(14,4) DEFAULT 0.00;

    -- VARIABLES DE INVENTARIO Y PRODUCCION
    DECLARE v_production_allocation DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_production_qty DECIMAL(14,4) DEFAULT 0.00;
    

    -- VARIABLES DE LA LOGICA
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_prod_fix_qty DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_prod_fix_input DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_allocate_input DECIMAL(14,4) DEFAULT 0.00;


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

    -- Creamos una tabla temporal para obtener los movimientos de inventario de la pop
    DROP TEMPORARY TABLE IF EXISTS temp_inventory_movements_pop;
    CREATE TEMPORARY TABLE temp_inventory_movements_pop AS
        SELECT *
        FROM inventory_movements AS im
        WHERE 
            im.reference_type IN (
                'Internal Production Order',
                'Adjust Internal Production Order'
            )
        AND (
            im.reference_id = in_ippo_id OR 
            im.reference_id IN (
                SELECT id
                FROM production_orders AS po
                WHERE po.order_type = 'internal'
                AND po.order_id = in_ippo_id
            )
        )
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
    WHERE ippolp.internal_production_order_id = in_ippo_id
    LIMIT 1;

    -- inventario comprometido de produccion
    SELECT
        IFNULL(SUM(im.qty), 0)
    INTO 
        v_production_allocation
    FROM temp_inventory_movements_pop AS im
    WHERE im.reference_type = 'Internal Production Order'
        AND ( 
            im.reference_id = in_ippo_id  OR 
            im.reference_id IN (
                SELECT id
                FROM production_orders AS po
                WHERE po.order_type = 'internal'
                    AND po.status NOT IN ('cancel')
                    AND po.order_id = in_ippo_id
            )
        )
        AND im.movement_type = 'allocate'
        AND im.description IN (
            'Internal Production Allocation', 
            'Adjust Internal Production Allocation'
        )
        AND im.item_id = in_product_id
        AND im.item_type = 'product'
    LIMIT 1;
    
    IF v_production_allocation > 0 THEN

        -- Establecemos la cantidad de producto a descomprometer de produccion
        SET v_prod_fix_qty = -v_production_allocation;

        -- Obtenemos la referencia(production order) del movimiento
        SELECT 
            timp.reference_id
        INTO v_reference_id
        FROM temp_inventory_movements_pop AS timp
        WHERE timp.reference_type = 'Internal Production Order'
            AND timp.movement_type = 'allocate'
            AND timp.item_id = in_product_id
            AND timp.item_type = 'product'
            AND ( 
                timp.reference_id = in_ippo_id 
                OR timp.reference_id IN (
                    SELECT id
                    FROM production_orders AS po
                    WHERE po.order_type = 'internal'
                    AND po.status NOT IN ('cancel')
                    AND po.order_id = in_ippo_id
                )
            )
        LIMIT 1;

        -- Validamos si existe produccion asociada a la orden de produccion
        SELECT
            IFNULL(SUM(p.qty), 0)
        INTO v_production_qty
        FROM production_orders AS po
        LEFT JOIN productions AS p
            ON p.production_order_id = po.id
        WHERE po.id = v_reference_id
        LIMIT 1;


        -- Efectuamos el movimiento para descomprometer el inventario del producto en produccion
        INSERT INTO inventory_movements (
            location_name, location_id, item_type,
            item_id, item_name, movement_type, 
            description, qty, reference_type, 
            reference_id, is_locked
        ) VALUES (
            v_location_name, v_location_id, 'product',
            in_product_id, in_product_name, 'allocate', 
            'Adjust Internal Production Allocation', v_prod_fix_qty,
            'Internal Production Order', v_reference_id, 1
        );

        -- Abrimos el cursor para poder iterar sobre los inputs del producto
        OPEN cur_inputs_product;

        -- Iteramos sobre los inputs del producto
        SET v_done = 0;
        read_loop: LOOP
            -- Obtenemos los datos del input del producto en esta iteracion
            FETCH cur_inputs_product INTO v_input_id, v_input_name, v_equivalence;

            -- Flag que determina si se recorrieron todos los inputs
            IF v_done THEN
                LEAVE read_loop;
            END IF;

            -- Obtenemos el inventario comprometido de este insumo
            SELECT 
                IFNULL(SUM(timp.qty), 0) 
            INTO v_allocate_input
            FROM temp_inventory_movements_pop AS timp
            WHERE 
                timp.reference_type IN (
                    'Internal Production Order',
                    'Adjust Internal Production Order'
                )
                AND timp.movement_type = 'allocate'
                AND timp.item_id = v_input_id
                AND timp.item_type = 'input'
            LIMIT 1;

            -- Si tiene inventario comprometido de insumo
            IF v_allocate_input > 0 THEN

                -- El ajuste del insumo es (-insumo comprometido * equivalencia)
                SET v_prod_fix_input = v_prod_fix_qty * v_equivalence;
                
                INSERT INTO inventory_movements (
                    location_name, location_id, item_type,
                    item_id, item_name, movement_type, 
                    description, qty, reference_type, reference_id, is_locked
                ) VALUES (
                    v_location_name,
                    v_location_id, 'input', v_input_id, v_input_name, 'allocate', 
                    'Adjust Internal Production Allocation', 
                    CASE WHEN ABS(v_allocate_input) < ABS(v_prod_fix_input) 
                        THEN -v_allocate_input 
                        ELSE v_prod_fix_input 
                    END,       
                    'Internal Production Order', v_reference_id, 1
                );
            END IF;
        END LOOP;

        -- Cerramos el cursor
        CLOSE cur_inputs_product;

        IF v_production_qty > 0 THEN
            -- Si tiene produccion asociada, cancelamos para no perder rastreabilidad
            UPDATE production_orders
            SET status = 'cancel'
            WHERE id = v_reference_id;
        ELSE
            -- Si no tiene produccion asociada, eliminamos la orden de produccion
            DELETE FROM production_orders
            WHERE id = v_reference_id;
        END IF;

        -- Eliminamos la tabla temporal
        DROP TEMPORARY TABLE IF EXISTS temp_inventory_movements_pop;

    END IF;
END //
DELIMITER ;
