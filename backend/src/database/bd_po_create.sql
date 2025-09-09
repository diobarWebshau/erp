DELIMITER //
CREATE PROCEDURE sp_create_production_order(
    IN in_pop_id INT,
    IN in_order_type VARCHAR(100),
    IN in_order_id INT,
    IN in_product_id INT,
    IN in_product_name VARCHAR(100),
    IN in_location_id INT,
    IN in_location_name VARCHAR(100),
    IN in_qty INT
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

    DECLARE v_description VARCHAR(100) DEFAULT '';
    DECLARE v_reference_type VARCHAR(100) DEFAULT '';
    DECLARE v_description_input VARCHAR(100) DEFAULT '';
    
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


    IF in_order_type = 'client' THEN
        SET v_reference_type = 'Production Order';
        SET v_description = 'Production Allocation';
    ELSE
        SET v_reference_type = 'Internal Production Order';
        SET v_description = 'Internal Production Allocation';
    END IF;

    -- Creamos el movimiento de ajuste de inventario comprometido
    INSERT INTO inventory_movements (
        location_name, location_id, item_type,
        item_id, item_name, movement_type, 
        description, qty, reference_type, 
        reference_id, is_locked
    ) VALUES (
        v_location_name, v_location_id, 'product', 
        in_product_id, in_product_name, 'allocate', 
        v_description, v_diff_prod,
        v_reference_type, in_po_id, 1
    );

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
                v_description, 
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

END //;
DELIMITER ;