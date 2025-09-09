
DROP PROCEDURE IF EXISTS sp_update_movement_inventory_po_pop_update_fix;
DELIMITER //
CREATE PROCEDURE sp_update_movement_inventory_po_pop_update_fix(
  IN in_po_id INT,
  IN in_order_type VARCHAR(100),
  IN in_order_id INT,
  IN in_new_qty INT,
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

    -- VARIABLES DE INVENTARIO Y PRODUvCCION
    DECLARE v_production_allocation DECIMAL(14,4) DEFAULT 0.00;

    -- VARIABLES DE LA LOGICA
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_allocate_input DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_diff_prod DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_fix_qty_input DECIMAL(14,4) DEFAULT 0.00;
    
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
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    -- Creamos una tabla temporal para obtener los movimientos de inventario de la po
    DROP TEMPORARY TABLE IF EXISTS temp_inventory_movements_pop;
    CREATE TEMPORARY TABLE temp_inventory_movements_pop AS
        SELECT *
        FROM inventory_movements AS im
        WHERE im.reference_type IN ('Production Order')
            AND im.reference_id = in_po_id 
            AND im.item_type IN ('product', 'input')
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

    -- OBTENEMOS EL INVENTARIO COMPROMETIDO EN PRODUCCION DEL PRODUCTO 

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

    -- OBTENER LA DIFERENCIA
    SET v_diff_prod = (in_new_qty - v_production_allocation);

    -- Creamos el movimiento de ajuste de inventario comprometido
    INSERT INTO inventory_movements (
        location_name, location_id, item_type,
        item_id, item_name, movement_type, 
        description, qty, reference_type, 
        reference_id, is_locked
    ) VALUES (
        v_location_name, v_location_id, 'product', 
        in_product_id, in_product_name, 'allocate', 
        'Adjust Production Allocation', v_diff_prod,
        'Production Order', in_po_id, 1
    );

    OPEN cur_inputs_product;

    -- Creamos el movimiento de compromiso de la orden de produccion para sus insumos
    SET v_done = 0;
    read_loop: LOOP

        -- Obtenemos los datos del input del producto en esta iteracion
        FETCH cur_inputs_product INTO v_input_id, v_input_name, v_equivalence;
        
        -- Si el flag v_done es 1, significa que se recorrieron todos los inputs
        IF v_done THEN
            -- Salimos del loop
            LEAVE read_loop;
        END IF;

        -- Obtenemos el inventario comprometido de este insumo
        -- Si se obtiene un inventario menor o igual a cero, significa que no tiene inventario comprometido porque ya se produjo
        SELECT 
            IFNULL(SUM(timp.qty), 0) 
        INTO v_allocate_input
        FROM temp_inventory_movements_pop AS timp
        WHERE 
            timp.reference_type IN (
                'Production Order', 
                'Adjust Production Order'
            )
            AND timp.movement_type = 'allocate'
            AND timp.item_id = v_input_id
            AND timp.item_type = 'input'
        LIMIT 1;

        -- Si tiene inventario comprometido de insumo
        IF v_allocate_input > 0 THEN

            -- Calculamos la cantidad de insumo a ajustar con respecto a su equivalencia
            SET v_fix_qty_input = v_diff_prod * v_equivalence;

            -- Insertamos el movimiento de ajuste de inventario comprometido de insumo
            INSERT INTO inventory_movements (
                location_name, location_id, item_type,
                    item_id, item_name, movement_type, 
                description, qty, reference_type, 
                reference_id, is_locked
            ) VALUES (
                v_location_name, v_location_id, 'input',
                    v_input_id, v_input_name, 'allocate', 
                'Adjust Production Allocation',
                -- Si el inventario comprometido actual es menor que la cantidad equivalente a disminuir , 
                -- ajustamos el inventario comprometido actual completamente para evitar generar negativos
                CASE 
                    WHEN ABS(v_allocate_input) < ABS(v_fix_qty_input) 
                    THEN -v_allocate_input 
                    ELSE v_fix_qty_input 
                END,  
                'Production Order', in_po_id, 1
            );  
        END IF;
    END LOOP;

    -- Cerramos el cursor
    CLOSE cur_inputs_product;

    -- Eliminamos la tabla temporal
    DROP TEMPORARY TABLE IF EXISTS temp_inventory_movements_pop;
        
END //
DELIMITER ;
