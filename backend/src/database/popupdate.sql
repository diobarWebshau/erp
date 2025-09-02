USE u482698715_shau_erp;

DROP PROCEDURE IF EXISTS sp_update_movement_inventory_pop_update_fix;
DELIMITER //
CREATE PROCEDURE sp_update_movement_inventory_pop_update_fix(
  IN in_pop_id INT,
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
    DECLARE v_reference_id INT DEFAULT 0;

    -- VARIABLES DE INPUT DEL PRODUCTO
    DECLARE v_equivalence DECIMAL(14,4) DEFAULT 0.00;

    -- VARIABLES DE INVENTARIO Y PRODUCCION
    DECLARE v_inventory_allocation DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_production_allocation DECIMAL(14,4) DEFAULT 0.00;

    -- VARIABLES DE LA LOGICA
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_ajuste_stock DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_ajuste_prod DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_allocate_input DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_ajuste_input DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_diff_stock DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_diff_prod DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_production_order_id INT DEFAULT 0;
    DECLARE v_qty_fix_po DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_diff_available DECIMAL(14,4) DEFAULT 0.00;
    DECLARE v_available DECIMAL(14,4) DEFAULT 0.00;
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

    INSERT into debug_log(message) VALUES (CONCAT('Valor de POP :', in_pop_id));
    
    -- Creamos una tabla temporal para obtener los movimientos de inventario de la pop
    DROP TEMPORARY TABLE IF EXISTS temp_inventory_movements_pop;
    CREATE TEMPORARY TABLE temp_inventory_movements_pop AS
        SELECT *
        FROM inventory_movements AS im
        WHERE im.reference_type IN ('Order', 'Production Order')
        AND (
            im.reference_id = in_pop_id 
            OR im.reference_id IN (
            SELECT id
            FROM production_orders AS po
            WHERE po.order_type = 'client'
            AND po.order_id = in_pop_id       
            )
        )
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
    WHERE poplpl.purchase_order_product_id = in_pop_id
    LIMIT 1;

    -- OBTENEMOS EL INVENTARIO COMPROMETIDO EN STOCK Y EN PRODUCCION DEL PRODUCTO 

    -- inventario comprometido de stock
    SELECT 
        IFNULL(SUM(im.qty), 0)
    INTO 
        v_inventory_allocation
    FROM temp_inventory_movements_pop AS im
    WHERE im.reference_type = 'Order'
    AND im.reference_id = in_pop_id
    AND im.movement_type = 'allocate'
    AND im.description IN ('Inventory Allocation', 'Adjust Inventory Allocation')
    AND im.item_id = in_product_id
    AND im.item_type = 'product'
    LIMIT 1;

    INSERT into debug_log(message) VALUES (CONCAT('Valor de v_inventory_allocation :', v_inventory_allocation));

    -- inventario comprometido de produccion
    SELECT
        IFNULL(SUM(im.qty), 0)
    INTO 
        v_production_allocation
    FROM temp_inventory_movements_pop AS im
    WHERE im.reference_type = 'Production Order'
    AND ( im.reference_id = in_pop_id 
        OR im.reference_id IN (
        SELECT id
        FROM production_orders AS po
        WHERE po.order_type = 'client'
        AND po.status NOT IN ('cancel')
        AND po.order_id = in_pop_id
        )
    )
    AND im.movement_type = 'allocate'
    AND im.description IN ('Production Allocation', 'Adjust Production Allocation')
    AND im.item_id = in_product_id
    AND im.item_type = 'product'
    LIMIT 1;

    INSERT into debug_log(message) VALUES (CONCAT('Valor de v_production_allocation :', v_production_allocation));


    -- ANALIZAMOS EL CASO DE LA ACTUALIZACION

    INSERT into debug_log(message) VALUES (CONCAT('Condicion de entrada, tiene produccion comprometida:', v_production_allocation > 0));

    -- Si tiene inventario para produccion comprometido
    IF v_inventory_allocation > 0 THEN 
        IF v_production_allocation > 0 THEN -- ! #MARK: PRODUCCION y STOCK
        
            -- Obtenemos la referencia(pop, po, etc) del movimiento
            SELECT 
                timp.reference_id
            INTO v_reference_id
            FROM temp_inventory_movements_pop AS timp
            WHERE timp.reference_type = 'Production Order'
                AND timp.movement_type = 'allocate'
                AND timp.item_id = in_product_id
                AND timp.item_type = 'product'
                AND timp.reference_id IN (
                    SELECT id
                    FROM production_orders AS po
                    WHERE po.order_type = 'client'
                    AND po.status NOT IN ('cancel')
                    AND po.order_id = in_pop_id
                )
            LIMIT 1;

            -- Abrimos el cursor para poder iterar sobre los inputs del producto
            OPEN cur_inputs_product;

            -- Si la nueva cantidad es menor que el inventario comprometido de stock
            INSERT into debug_log(message) VALUES (CONCAT('Produccion --> la nueva cantidad es menor que el inventario comprometido de stock:', in_new_qty <= v_inventory_allocation));
            
            IF in_new_qty <= v_inventory_allocation THEN
                -- MARK: Cancel production
                /* 
                    En este caso se pretende eliminar el compromiso con el sobrante del 
                    inventario de stock y todo el resto del inventario comprometido de 
                    produccion(Ya que se acompleta con una parte del inventario de stock)
                */
                BEGIN
                    -- diferencia entre la nueva cantidad y el inventario comprometido de stock
                    SET v_ajuste_stock = in_new_qty - v_inventory_allocation;
                    -- El ajuste del compromiso seria (-diferencia - inventario comprometido de produccion)
                    SET v_ajuste_prod = - v_production_allocation;

                    -- Efectuamos el movimiento para establcer el ajuste de inventario comprometido en stock 
                    INSERT INTO inventory_movements (
                        location_name, location_id, item_type,
                        item_id, item_name, movement_type, 
                        description, qty, reference_type, 
                        reference_id, is_locked
                    ) VALUES (
                        v_location_name, v_location_id, 'product', 
                        in_product_id, in_product_name, 'allocate', 
                        'Adjust Inventory Allocation', v_ajuste_stock,
                        'Order', in_pop_id, 1
                    );

                    -- Efectuamos el movimiento para establcer el ajuste de inventario comprometido en produccion
                    INSERT INTO inventory_movements (
                        location_name, location_id, item_type,
                        item_id, item_name, movement_type, 
                        description, qty, reference_type, 
                        reference_id, is_locked
                    ) VALUES (
                        v_location_name, v_location_id, 'product',
                        in_product_id, in_product_name, 'allocate', 
                        'Adjust Production Allocation', v_ajuste_prod,
                        'Production Order', v_reference_id, 1
                    );
                
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
                            -- El ajuste del insumo es (-insumo comprometido * equivalencia)
                            SET v_ajuste_input = v_ajuste_prod * v_equivalence;
                            INSERT INTO inventory_movements (
                                location_name,
                            location_id, item_type, item_id, item_name, movement_type, 
                            description, qty, reference_type, reference_id, is_locked
                            ) VALUES (
                            v_location_name,
                            v_location_id, 'input', v_input_id, v_input_name, 'allocate', 
                            'Adjust Production Allocation', 
                            CASE WHEN ABS(v_allocate_input) < ABS(v_ajuste_input) 
                                THEN -v_allocate_input 
                                ELSE v_ajuste_input 
                            END,       
                            'Production Order',
                            v_reference_id,
                            1
                            );
                        END IF;
                    END LOOP;
                    -- Cerramos el cursor
                    CLOSE cur_inputs_product;
                    -- Cancelamos la orden de produccion, para indicar que ya no seguira con su produccion
                    UPDATE production_orders SET STATUS = 'cancel'
                    WHERE id = v_reference_id;
                END;
            ELSE -- ! MARK: Edit production
                INSERT into debug_log(message) VALUES (CONCAT('Produccion --> la nueva cantidad es mayor que el inventario comprometido de stock:', in_new_qty > v_inventory_allocation));
                -- Obtenermos la diferencia entre la nueva cantidad y el inventario comprometido de stock
                SET v_diff_stock = ABS(in_new_qty - v_inventory_allocation);

                -- Si la diferencia es menor, significa que se ajusta todo el inventario comprometido de produccion(eliminar y cancelar)
                IF v_diff_stock <= v_production_allocation THEN

                    -- !  MARK: less production

                    -- diferencia entre la nueva cantidad y el inventario comprometido de stock
                    -- Si es positivo(Se añade a la produccion)
                    -- Si es negativo(Se resta de la produccion)
                    SET v_diff_prod = v_diff_stock - v_production_allocation;

                    -- Establecemos la nueva qty de produccion
                    SET v_qty_fix_po = ABS(v_diff_stock);

                    -- Si no es igual a cero, indica que si existe difrencia y necesita una ajuste de inventario comprometido
                    IF v_diff_prod < 0 THEN

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
                            'Production Order', v_reference_id, 1
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
                                    'Adjust Production Allocation',
                                    -- Si el inventario comprometido actual es menor que la cantidad equivalente a disminuir , 
                                    -- ajustamos el inventario comprometido actual completamente para evitar generar negativos
                                    CASE 
                                        WHEN ABS(v_allocate_input) < ABS(v_fix_qty_input) 
                                        THEN -v_allocate_input 
                                        ELSE v_fix_qty_input 
                                    END,  
                                    'Production Order', v_reference_id, 1
                                );  
                            END IF;
                        END LOOP;

                        -- Cerramos el cursor
                        CLOSE cur_inputs_product;
                        
                        -- Actualizamos la orden de produccion, para ajustar la nueva cantidad para la orden de produccion
                        UPDATE production_orders
                        SET qty = v_qty_fix_po
                        WHERE id = v_reference_id;
                    END IF;
                ELSE  -- ! MARK: More production

                    -- Sumamos la diferencia de stock con la de produccion
                    SET v_diff_prod = ABS(v_diff_stock - v_production_allocation);

                    -- Obtenemos el stock disponible del producto 
                    SET v_available = func_get_available_stock_item_on_location(v_location_id, in_product_id, 'product');

                    IF v_available > 0 THEN -- ! MARK: Stock disponible

                        INSERT INTO debug_log(message) VALUES (CONCAT('Hay stock disponible para ajustar'));
                    
                        IF v_diff_stock <= v_available THEN -- ! MARK: Stock cubre
                            
                            INSERT INTO debug_log(message) VALUES (CONCAT('El stock disponible compensa totalmente la diferencia, no necesita orden de produccion'));
                            
                            -- Como es menor, podemos ajustar directamente la cantidad comprometida de stock
                            SET v_diff_available = v_diff_stock;

                            -- Insertamos el movimiento de ajuste de inventario comprometido para incluir la cantidad faltante(+)
                            INSERT INTO inventory_movements (
                                location_name, location_id, item_type,
                                item_id, item_name, movement_type, 
                                description, qty, reference_type,
                                    reference_id, is_locked
                            ) VALUES (
                                v_location_name, v_location_id, 'product',
                                    in_product_id, in_product_name, 'allocate', 
                                'Adjust Inventory Allocation',  v_diff_available,
                                'Order', in_pop_id, 1
                            );
                        ELSE --  ! MARK: Stock no cubre
                            
                            INSERT INTO debug_log(message) VALUES (CONCAT('El stock disponible no es suficiente para ajustar la diferencia, se necesita orden de produccion'));
                            
                            -- Obtenemos la cantidad necesaria para mandar a producir para completar la diferencia
                            SET v_diff_available = ABS(v_diff_stock - v_available);

                            -- Creamos el movimiento para comprometer la cantidad disponible de stock para completar la diferencia
                            INSERT INTO inventory_movements (
                                location_name, location_id, item_type,
                                item_id, item_name, movement_type, 
                                description, qty, reference_type, reference_id, is_locked
                            ) VALUES (
                                v_location_name, v_location_id, 'product', 
                                in_product_id, in_product_name, 'allocate', 
                                'Adjust Inventory Allocation',  v_available,
                                'Order', in_pop_id, 1
                            );

                            -- Creamos el movimiento de compromiso de la orden de produccion del producto
                            INSERT INTO inventory_movements (
                                location_name, location_id, item_type,
                                item_id, item_name, movement_type, 
                                description, qty, reference_type, 
                                reference_id, is_locked
                            ) VALUES (
                                v_location_name, v_location_id, 'product',
                                in_product_id, in_product_name, 'allocate', 
                                'Adjust Production Allocation', v_diff_available,
                                'Production Order', v_reference_id, 1
                            );

                            -- Creamos el movimiento de compromiso de la orden de produccion para sus insumos
                            SET v_done = 0;
                            read_loop: LOOP
                                -- Obtenemos los datos del input del producto en esta iteracion
                                FETCH cur_inputs_product INTO v_input_id, v_input_name, v_equivalence;
                                
                                -- Si no hay mas insumos, salimos del loop
                                IF v_done THEN
                                    LEAVE read_loop;
                                END IF;

                                -- Calculamos la cantidad de insumo a ajustar con respecto a su equivalencia
                                SET v_fix_qty_input = v_diff_available * v_equivalence;

                                -- Efectuamos el movimiento de compromiso de la orden de produccion para el insumo
                                INSERT INTO inventory_movements (
                                    location_name,
                                    location_id, item_type, item_id, item_name, movement_type, 
                                    description, qty, reference_type, reference_id, is_locked
                                ) VALUES (
                                    v_location_name,
                                    v_location_id, 'input', v_input_id, v_input_name, 'allocate', 
                                    'Adjust Production Allocation', 
                                    v_fix_qty_input,
                                    'Production Order',
                                    v_reference_id,
                                    1
                                );
                            END LOOP;

                            -- Cerramos el cursor
                            CLOSE cur_inputs_product;
                            
                            -- Actualizamos la orden de produccion, para ajustar la nueva cantidad para la orden de produccion
                            UPDATE production_orders
                            SET qty = v_diff_available + v_production_allocation
                            WHERE id = v_reference_id;

                        END IF;
                            
                    ELSE -- ! MARK: No stock disponible
                        
                        INSERT INTO debug_log(message) VALUES (CONCAT('No hay stock disponible para ajustar, se necesita orden de produccion'));

                        -- asignamos toda la diferencia como valor para la orden de produccion
                        SET v_diff_available = ABS(v_diff_stock);

                        -- Creamos el movimiento de compromiso de la orden de produccion del producto
                        INSERT INTO inventory_movements (
                            location_name,
                            location_id, item_type, item_id, item_name, movement_type, 
                            description, qty, reference_type, reference_id, is_locked
                        ) VALUES (
                            v_location_name,
                            v_location_id, 'product', in_product_id, in_product_name, 'allocate', 
                            'Adjust Production Allocation', 
                            v_diff_available,
                            'Production Order',
                            v_reference_id,
                            1
                        );

                        -- Creamos el movimiento de compromiso de la orden de produccion para sus insumos
                        SET v_done = 0;
                        read_loop: LOOP

                            -- Obtenemos los datos del input del producto en esta iteracion
                            FETCH cur_inputs_product INTO v_input_id, v_input_name, v_equivalence;
                            
                            -- Si no hay mas insumos, salimos del loop
                            IF v_done THEN
                                LEAVE read_loop;
                            END IF;

                            -- Calculamos la cantidad de insumo a ajustar con respecto a su equivalencia                            
                            SET v_fix_qty_input = v_diff_available * v_equivalence;

                            -- Insertamos el movimiento de ajuste de inventario comprometido de insumo                            
                            INSERT INTO inventory_movements (
                                location_name, location_id, item_type,
                                item_id, item_name, movement_type, 
                                description, qty, reference_type, 
                                reference_id, is_locked
                            ) VALUES (
                                v_location_name, v_location_id, 'input',
                                v_input_id, v_input_name, 'allocate', 
                                'Adjust Production Allocation', v_fix_qty_input, 
                                'Production Order', v_reference_id, 1
                            );
                        END LOOP;
                        
                        -- Cerramos el cursor
                        CLOSE cur_inputs_product;
                        
                        -- Actualizamos la orden de produccion, para ajustar la nueva cantidad para la orden de produccion
                        UPDATE production_orders
                        SET qty = v_diff_available + v_production_allocation
                        WHERE id = v_reference_id;
                
                    END IF;
                
                END IF;

            END IF;
        ELSE     -- ! MARK: No tiene produccion

            -- Abrimos el cursor de los insumos del producto
            OPEN cur_inputs_product;

            --  Determinamos la diferencia entre la nueva cantidad y el inventario comprometido de stock
            -- Si es positivo, significa que comprometemos la diferencia
            -- Si es negativo, significa que descomprometeremos la diferencia
            IF in_new_qty <= v_inventory_allocation THEN
                INSERT into debug_log(message) VALUES (CONCAT('Stock --> la nueva cantidad es menor que el inventario comprometido de stock:', in_new_qty <= v_inventory_allocation));
                SET v_diff_stock = in_new_qty - v_inventory_allocation;
            ELSE
                INSERT into debug_log(message) VALUES (CONCAT('Stock --> la nueva cantidad es mayor que el inventario comprometido de stock:', in_new_qty > v_inventory_allocation));   
                SET v_diff_stock = ABS(in_new_qty - v_inventory_allocation);
            END IF;

            
            INSERT INTO debug_log(message) VALUES (CONCAT('Stock --> la diferencia es:', v_diff_stock));

            IF v_diff_stock > 0 THEN -- ! #MARK: Mas producto
            
                -- Obtenemos la cantidad disponible de stock del producto
                SET v_available = func_get_available_stock_item_on_location(v_location_id, in_product_id, 'product');
            
                INSERT INTO debug_log(message) VALUES (CONCAT('Stock --> la cantidad disponible es:', v_available));
            
                IF v_available > 0 THEN -- ! #MARK: Stock disponible
                    
                    INSERT INTO debug_log(message) VALUES (CONCAT('Hay stock disponible para ajustar'));
                    
                    IF v_diff_stock <= v_available THEN -- ! #MARK: Stock cubre
                        
                        INSERT INTO debug_log(message) VALUES (CONCAT('El stock disponible compensa totalmente la diferencia, no necesita orden de produccion'));
                        
                        -- Como es menor, podemos ajustar directamente la cantidad comprometida de stock
                        SET v_diff_available = v_diff_stock;
                        
                        -- Insertamos el movimiento de ajuste de inventario comprometido para incluir la cantidad faltante(+)
                        INSERT INTO inventory_movements (
                            location_name, location_id, item_type,
                            item_id, item_name, movement_type, description,
                            qty, reference_type, reference_id, is_locked
                        ) VALUES (
                            v_location_name, v_location_id, 'product', 
                            in_product_id, in_product_name, 'allocate', 
                            'Adjust Inventory Allocation', v_diff_available,
                            'Order', in_pop_id, 1
                        );
                    ELSE -- ! #MARK: Stock no cubre

                        INSERT INTO debug_log(message) VALUES (CONCAT('El stock disponible no es suficiente para ajustar la diferencia, se necesita orden de produccion'));
                    
                        -- Obtenemos la cantidad necesaria para mandar a producir para completar la diferencia
                        SET v_diff_available = ABS(v_diff_stock - v_available);

                        -- Creamos el movimiento para comprometer la cantidad disponible de stock para completar la diferencia
                        INSERT INTO inventory_movements (
                            location_name, location_id, item_type, 
                            item_id, item_name, movement_type,  
                            description, qty, reference_type, 
                            reference_id, is_locked
                        ) VALUES (
                            v_location_name, v_location_id, 'product', 
                            in_product_id, in_product_name, 'allocate', 
                            'Adjust Inventory Allocation',  v_available,
                            'Order', in_pop_id, 1
                        );

                        -- Creamos la orden de produccion con la cantidad necesaria para completar la diferencia
                        INSERT INTO production_orders (
                            order_type, order_id, product_id,
                            product_name, qty, status
                        ) VALUES (
                            'client', in_pop_id, in_product_id,
                            in_product_name, v_diff_available, 'pending'
                        );


                        SET v_production_order_id = LAST_INSERT_ID();

                        -- Creamos el movimiento de compromiso de la orden de produccion del producto

                        INSERT INTO inventory_movements (
                            location_name, location_id, item_type,
                            item_id, item_name, movement_type, 
                            description, qty, reference_type,
                            reference_id, is_locked
                        ) VALUES (
                            v_location_name, v_location_id, 'product', 
                            in_product_id, in_product_name, 'allocate', 
                            'Production Allocation',  v_diff_available,
                            'Production Order', v_production_order_id, 1
                        );

                        -- Creamos el movimiento de compromiso de la orden de produccion para sus insumos
                        SET v_done = 0;
                        read_loop: LOOP
                            FETCH cur_inputs_product INTO v_input_id, v_input_name, v_equivalence;
                            IF v_done THEN
                                LEAVE read_loop;
                            END IF;

                            SET v_fix_qty_input = v_diff_available * v_equivalence;

                            INSERT INTO inventory_movements (
                                location_name,
                                location_id, item_type, item_id, item_name, movement_type, 
                                description, qty, reference_type, reference_id, is_locked
                            ) VALUES (
                                v_location_name,
                                v_location_id, 'input', v_input_id, v_input_name, 'allocate', 
                                'Production Allocation', 
                                v_fix_qty_input,
                                'Production Order',
                                v_production_order_id,
                                1
                            );
                        END LOOP;
                        -- Cerramos el cursor
                        CLOSE cur_inputs_product;
                END IF;
                ELSE -- ! #MARK: No stock disponible

                    INSERT INTO debug_log(message) VALUES (CONCAT('No hay stock disponible para ajustar, se necesita orden de produccion'));

                    -- asignamos toda la diferencia como valor para la orden de produccion
                    SET v_diff_available = ABS(v_diff_stock);

                    -- Creamos la orden de produccion con la cantidad necesaria para completar la diferencia
                    INSERT INTO production_orders (
                        order_type,
                        order_id,
                        product_id,
                        product_name,
                        qty,
                        status
                    ) VALUES (
                        'client',
                        in_pop_id,
                        in_product_id,
                        in_product_name,
                        v_diff_available,
                        'pending'
                    );

                    SET v_production_order_id = LAST_INSERT_ID();

                    -- Creamos el movimiento de compromiso de la orden de produccion del producto
                    INSERT INTO inventory_movements (
                        location_name,
                        location_id, item_type, item_id, item_name, movement_type, 
                        description, qty, reference_type, reference_id, is_locked
                    ) VALUES (
                        v_location_name,
                        v_location_id, 'product', in_product_id, in_product_name, 'allocate', 
                        'Production Allocation', 
                        v_diff_available,
                        'Production Order',
                        v_production_order_id,
                        1
                    );

                    -- Creamos el movimiento de compromiso de la orden de produccion para sus insumos
                    SET v_done = 0;
                    read_loop: LOOP
                        FETCH cur_inputs_product INTO v_input_id, v_input_name, v_equivalence;
                        IF v_done THEN
                            LEAVE read_loop;
                        END IF;

                        SET v_fix_qty_input = v_diff_available * v_equivalence;

                        INSERT INTO inventory_movements (
                            location_name,
                            location_id, item_type, item_id, item_name, movement_type, 
                            description, qty, reference_type, reference_id, is_locked
                        ) VALUES (
                            v_location_name,
                            v_location_id, 'input', v_input_id, v_input_name, 'allocate', 
                            'Production Allocation', 
                            v_fix_qty_input,
                            'Production Order',
                            v_production_order_id,
                            1
                        );
                    END LOOP;
            
                    -- Cerramos el cursor
                    CLOSE cur_inputs_product;
                END IF;
            ELSE -- ! #MARK: Menos producto

                INSERT INTO debug_log(message) VALUES (CONCAT('Stock --> la diferencia es:', v_diff_stock));
                
                -- Creamos el movimiento de ajuste de inventario
                INSERT INTO inventory_movements (
                    location_name,
                    location_id, item_type, item_id, item_name, movement_type, 
                    description, qty, reference_type, reference_id, is_locked
                )
                VALUES (
                    v_location_name,
                    v_location_id, 'product', in_product_id, in_product_name, 'allocate', 
                    'Adjust Inventory Allocation',  v_diff_stock, 'Order', in_pop_id, 1
                );
            END IF;
        END IF;
    ELSE 
        IF v_production_allocation > 0 THEN -- ! #MARK: Solo produccion

            -- Obtenemos la referencia(pop, po, etc) del movimiento
            SELECT 
                timp.reference_id
            INTO v_reference_id
            FROM temp_inventory_movements_pop AS timp
            WHERE timp.reference_type = 'Production Order'
                AND timp.movement_type = 'allocate'
                AND timp.item_id = in_product_id
                AND timp.item_type = 'product'
                AND timp.reference_id IN (
                    SELECT id
                    FROM production_orders AS po
                    WHERE po.order_type = 'client'
                    AND po.status NOT IN ('cancel')
                    AND po.order_id = in_pop_id
                )
            LIMIT 1;

            -- Abrimos el cursor para poder iterar sobre los inputs del producto
            OPEN cur_inputs_product;

            -- Establecemos la nueva qty de produccion
            SET v_qty_fix_po = in_new_qty;

            -- Obtenemos el stock disponible del producto 
            SET v_available = func_get_available_stock_item_on_location(v_location_id, in_product_id, 'product');

            IF in_new_qty <= v_production_allocation THEN -- ! #MARK: Menos produccion
                
                -- Calculamos la cantidad a descomrometer
                SET v_diff_prod = in_new_qty - v_production_allocation;

                IF v_diff_prod < 0 THEN
                    
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
                        'Production Order', v_reference_id, 1
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
                                'Adjust Production Allocation',
                                -- Si el inventario comprometido actual es menor que la cantidad equivalente a disminuir , 
                                -- ajustamos el inventario comprometido actual completamente para evitar generar negativos
                                CASE 
                                    WHEN ABS(v_allocate_input) < ABS(v_fix_qty_input) 
                                    THEN -v_allocate_input 
                                    ELSE v_fix_qty_input 
                                END,  
                                'Production Order', v_reference_id, 1
                            );  
                        END IF;
                    END LOOP;

                    -- Cerramos el cursor
                    CLOSE cur_inputs_product;
                    
                    -- Actualizamos la orden de produccion, para ajustar la nueva cantidad para la orden de produccion
                    UPDATE production_orders
                    SET qty = v_production_allocation + v_qty_fix_po
                    WHERE id = v_reference_id;

                END IF;

            ELSE -- ! #MARK: Mas produccion

                -- Calculamos la cantidad a comprometer
                SET v_diff_prod = ABS(in_new_qty - v_production_allocation);

                IF v_available > 0 THEN -- ! #MARK: Stock disponible

                    INSERT INTO debug_log(message) VALUES (CONCAT('Hay stock disponible para ajustar'));
                    
                    IF v_diff_prod <= v_available THEN -- ! MARK: Stock cubre
                        
                        INSERT INTO debug_log(message) VALUES (CONCAT('El stock disponible compensa totalmente la diferencia, no necesita orden de produccion'));
                        
                        -- Como es menor, podemos ajustar directamente la cantidad comprometida de stock
                        SET v_diff_available = v_diff_prod;

                        -- Insertamos el movimiento de ajuste de inventario comprometido para incluir la cantidad faltante(+)
                        INSERT INTO inventory_movements (
                            location_name, location_id, item_type,
                            item_id, item_name, movement_type, 
                            description, qty, reference_type,
                                reference_id, is_locked
                        ) VALUES (
                            v_location_name, v_location_id, 'product',
                                in_product_id, in_product_name, 'allocate', 
                            'Adjust Inventory Allocation',  v_diff_available,
                            'Order', in_pop_id, 1
                        );
                        
                    ELSE --  ! MARK: Stock no cubre
                            
                        INSERT INTO debug_log(message) VALUES (CONCAT('El stock disponible no es suficiente para ajustar la diferencia, se necesita orden de produccion'));
                        
                        -- Obtenemos la cantidad necesaria para mandar a producir para completar la diferencia
                        SET v_diff_available = ABS(v_diff_prod - v_available);

                        -- Creamos el movimiento para comprometer la cantidad disponible de stock para completar la diferencia
                        INSERT INTO inventory_movements (
                            location_name, location_id, item_type,
                            item_id, item_name, movement_type, 
                            description, qty, reference_type, reference_id, is_locked
                        ) VALUES (
                            v_location_name, v_location_id, 'product', 
                            in_product_id, in_product_name, 'allocate', 
                            'Adjust Inventory Allocation',  v_available,
                            'Order', in_pop_id, 1
                        );

                        -- Creamos el movimiento de compromiso de la orden de produccion del producto
                        INSERT INTO inventory_movements (
                            location_name, location_id, item_type,
                            item_id, item_name, movement_type, 
                            description, qty, reference_type, 
                            reference_id, is_locked
                        ) VALUES (
                            v_location_name, v_location_id, 'product',
                            in_product_id, in_product_name, 'allocate', 
                            'Adjust Production Allocation', v_diff_available,
                            'Production Order', v_reference_id, 1
                        );

                        -- Creamos el movimiento de compromiso de la orden de produccion para sus insumos
                        SET v_done = 0;
                        read_loop: LOOP
                            -- Obtenemos los datos del input del producto en esta iteracion
                            FETCH cur_inputs_product INTO v_input_id, v_input_name, v_equivalence;
                            
                            -- Si no hay mas insumos, salimos del loop
                            IF v_done THEN
                                LEAVE read_loop;
                            END IF;

                            -- Calculamos la cantidad de insumo a ajustar con respecto a su equivalencia
                            SET v_fix_qty_input = v_diff_available * v_equivalence;

                            -- Efectuamos el movimiento de compromiso de la orden de produccion para el insumo
                            INSERT INTO inventory_movements (
                                location_name,
                                location_id, item_type, item_id, item_name, movement_type, 
                                description, qty, reference_type, reference_id, is_locked
                            ) VALUES (
                                v_location_name,
                                v_location_id, 'input', v_input_id, v_input_name, 'allocate', 
                                'Adjust Production Allocation', 
                                v_fix_qty_input,
                                'Production Order',
                                v_reference_id,
                                1
                            );
                        END LOOP;

                        -- Cerramos el cursor
                        CLOSE cur_inputs_product;
                        
                        -- Actualizamos la orden de produccion, para ajustar la nueva cantidad para la orden de produccion
                        UPDATE production_orders
                        SET qty = v_diff_available
                        WHERE id = v_reference_id;

                    END IF;

                ELSE -- ! #MARK: Sin stock disponible
                    
                    INSERT INTO debug_log(message) VALUES (CONCAT('No hay stock disponible para ajustar, se necesita incrementar la orden de produccion'));

                    -- asignamos toda la diferencia como valor para la orden de produccion
                    SET v_diff_available = ABS(v_diff_stock);

                    -- Creamos el movimiento de compromiso de la orden de produccion del producto
                    INSERT INTO inventory_movements (
                        location_name,
                        location_id, item_type, item_id, item_name, movement_type, 
                        description, qty, reference_type, reference_id, is_locked
                    ) VALUES (
                        v_location_name,
                        v_location_id, 'product', in_product_id, in_product_name, 'allocate', 
                        'Adjust Production Allocation', 
                        v_diff_available,
                        'Production Order',
                        v_reference_id,
                        1
                    );

                    -- Creamos el movimiento de compromiso de la orden de produccion para sus insumos
                    SET v_done = 0;
                    read_loop: LOOP

                        -- Obtenemos los datos del input del producto en esta iteracion
                        FETCH cur_inputs_product INTO v_input_id, v_input_name, v_equivalence;
                        
                        -- Si no hay mas insumos, salimos del loop
                        IF v_done THEN
                            LEAVE read_loop;
                        END IF;

                        -- Calculamos la cantidad de insumo a ajustar con respecto a su equivalencia                            
                        SET v_fix_qty_input = v_diff_available * v_equivalence;

                        -- Insertamos el movimiento de ajuste de inventario comprometido de insumo                            
                        INSERT INTO inventory_movements (
                            location_name, location_id, item_type,
                            item_id, item_name, movement_type, 
                            description, qty, reference_type, 
                            reference_id, is_locked
                        ) VALUES (
                            v_location_name, v_location_id, 'input',
                            v_input_id, v_input_name, 'allocate', 
                            'Adjust Production Allocation', v_fix_qty_input, 
                            'Production Order', v_reference_id, 1
                        );
                    END LOOP;
                    
                    -- Cerramos el cursor
                    CLOSE cur_inputs_product;
                    
                    -- Actualizamos la orden de produccion, para ajustar la nueva cantidad para la orden de produccion
                    UPDATE production_orders
                    SET qty = v_diff_available
                    WHERE id = v_reference_id;
           
                END IF;
        
            END IF;

        END IF;
    END IF;

    -- Eliminamos la tabla temporal
    DROP TEMPORARY TABLE IF EXISTS temp_inventory_movements_pop;
END // 
DELIMITER ;