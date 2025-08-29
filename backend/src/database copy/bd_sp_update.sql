SHOW DATABASES;
USE webshau_erp;

-- PROCEDURE STATEMENT PARA ACTUALIZAR PRECIO DE LA PURCHASED ORDER.
DELIMITER //
CREATE PROCEDURE update_purchased_order_total_price(
    IN purchased_order_id INT
)
BEGIN
    -- variable de actualizacion de precio para la purchased order
    DECLARE total_price DECIMAL(10,4) DEFAULT 0.00;
    -- variable auxiliar de total de precio por producto
    DECLARE total_price_product DECIMAL(10,4) DEFAULT 0.00;
    -- variable auxiliar de precio por producto dependiendo de los descuentos por rangos y cliente
    DECLARE real_price DECIMAL(10,4) DEFAULT 0.00;
    -- variable de precio final por producto
    DECLARE final_price DECIMAL(10,4) DEFAULT 0.00;

    -- variables de consulta multitabla
    DECLARE sale_price DECIMAL(10,4) DEFAULT 0.00;
    DECLARE qty DECIMAL(10,4) DEFAULT 0.00;
    DECLARE recorded_price DECIMAL(10,4) DEFAULT 0.00;
    DECLARE unit_discount DECIMAL(10,4) DEFAULT 0.00;
    DECLARE discount_percentage DECIMAL(10,4) DEFAULT 0.00;
    -- variable de control de cursor que indica si se ha llegado al final de la consulta
    -- y se ha terminado de recorrer todos los registros
    DECLARE done INT DEFAULT 0;

    DECLARE details_cursor CURSOR FOR
        SELECT 
            p.sale_price,
            pop.qty,
            pop.recorded_price,
            apdr.unit_discount,
            apdc.discount_percentage
        FROM purchased_orders AS po
        JOIN purchased_orders_products AS pop
            ON po.id = pop.purchase_order_id
        JOIN products AS p
            ON pop.product_id = p.id
        LEFT JOIN applied_product_discounts_ranges AS apdr
            ON pop.id = apdr.purchase_order_product_id
        LEFT JOIN product_discounts_ranges AS pdr
            ON apdr.product_discount_range_id = pdr.id
        LEFT JOIN applied_product_discounts_client AS apdc
            ON pop.id = apdc.purchase_order_product_id
        LEFT JOIN product_discounts_clients AS pdc
            ON apdc.product_discount_client_id = pdc.id
        WHERE po.id = purchased_order_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN details_cursor;

    REPEAT
        FETCH details_cursor INTO sale_price, qty, recorded_price, unit_discount, discount_percentage;
        IF done = 0 THEN
            -- Establecer el precio base como el precio de venta si no hay descuentos
            SET real_price = sale_price;

            -- Aplicar descuento unitario si existe
            IF unit_discount IS NOT NULL THEN
                SET real_price = unit_discount;
            END IF;

            -- Aplicar descuento por porcentaje si existe
            IF discount_percentage IS NOT NULL THEN
                SET real_price = real_price - (real_price * (discount_percentage / 100));
            END IF;

            -- Calcular el precio final por producto
            SET final_price = real_price * qty;
            
            -- Acumular el precio total
            SET total_price = total_price + final_price;
        END IF;
    UNTIL done = 1 END REPEAT;

    CLOSE details_cursor;

    -- Actualizar el precio total en la orden de compra
    UPDATE purchased_orders 
    SET total_price = total_price 
    WHERE id = purchased_order_id;

END //
DELIMITER ;
-- VER TODOS LOS PROCEDIMIENTOS EN LA BD
-- SHOW PROCEDURE STATUS WHERE Db = 'webshau_erp';
-- DROP PROCEDURE getDetailsOrder;
-- LLAMAR AL PROCEDIMIENTO
-- CALL update_purchased_order_total_price(1);
-- SELECT * FROM purchased_orders where id=1;


/*
    Procedimiento almacenado para transferencia de material de inventarios    
*/

DELIMITER //
CREATE PROCEDURE do_inventory_transfers(
    IN in_transfer_id INT,
    IN in_source_location_id INT,
    IN in_destination_location_id INT,
    IN in_item_id INT,
    IN in_item_type ENUM('product', 'input'),
    IN in_qty INT
)
BEGIN
    DECLARE v_source_location_name VARCHAR(100);
    DECLARE v_destination_location_name VARCHAR(100);
    DECLARE v_item_name VARCHAR(100);

    SELECT l.name INTO v_source_location_name
    FROM locations AS l WHERE l.id=in_source_location_id;

    SELECT l.name INTO v_destination_location_name
    FROM locations AS l WHERE l.id=in_destination_location_id;

    IF in_item_type = 'input' THEN
        SELECT i.name INTO v_item_name 
        FROM inputs AS i WHERE i.id = in_item_id;
    ELSE
        SELECT p.name INTO v_item_name 
        FROM products AS p WHERE p.id = in_item_id;
    END IF;

    INSERT INTO 
		inventory_movements(
			location_id, 
            location_name, 
            item_id, 
            item_type, 
            item_name, 
            qty, 
            movement_type, 
            reference_id, 
            reference_type, 
            description, 
            is_locked)
    VALUES
		(
			in_source_location_id,
            v_source_location_name,
            in_item_id,
            in_item_type,
            v_item_name,
            in_qty,
            'out',
            in_transfer_id,
            'transfer',
            'Inventory transfers',
            0
        );
    INSERT INTO 
        inventory_movements(
            location_id, 
            location_name, 
            item_id, 
            item_type, 
            item_name, 
            qty, 
            movement_type, 
            reference_id, 
            reference_type, 
            description, 
            is_locked)
    VALUES
		(
			in_destination_location_id,
            v_destination_location_name,
            in_item_id,
            in_item_type,
            v_item_name,
            in_qty,
            'in',
            in_transfer_id,
            'transfer',
            'Inventory transfers',
            0
        );
END //
DELIMITER ;

-- REVERTIR TRANSACION DE INVENTARIOS
DELIMITER //
CREATE PROCEDURE revert_inventory_transfer(IN transfer_id INT)
BEGIN
    -- DECLARE v_source_location_id INT;
    -- DECLARE v_destination_location_id INT;
    -- DECLARE v_qty INT;

    -- -- Obtener los detalles de la transferencia
    -- SELECT source_location_id, destination_location_id, qty
    -- INTO v_source_location_id, v_destination_location_id, v_qty
    -- FROM inventory_movements
    -- WHERE id = transfer_id;

    -- -- Revertir la transferencia: Restar stock del destino y agregarlo al origen
    -- UPDATE inventories
    -- SET stock = stock - v_qty
    -- WHERE id = v_destination_location_id;
    
    -- UPDATE inventories
    -- SET stock = stock + v_qty
    -- WHERE id = v_source_location_id;
    UPDATE inventory_movements
    SET is_locked = 1
    WHERE reference_type = 'transfer'
    AND reference_id = transfer_id;
END //

DELIMITER ;


-- OBTENER RESUMEN DE ORDENES DE LAS CANTIDADES PRODUCIDAS Y COMPROMETIDAS DE UNA PURCHASED ORDER PRODUCT
DELIMITER //

CREATE PROCEDURE get_order_summary_by_pop(
  IN in_order_id INT,
  IN in_order_type VARCHAR(100)
)
BEGIN
  DECLARE v_order_qty INT DEFAULT 0;
  DECLARE v_product_id INT DEFAULT 0;
  DECLARE v_committed_qty DECIMAL(10,2) DEFAULT 0;
  DECLARE v_production_qty DECIMAL(10,2) DEFAULT 0;
  DECLARE v_qty DECIMAL(10,2);

  -- Determinar los valores según el tipo de orden
  IF in_order_type = 'client' THEN
    -- Consulta directa para tipo de orden 'client'
    SELECT qty, product_id
    INTO v_order_qty, v_product_id
    FROM purchased_orders_products
    WHERE id = in_order_id;
  ELSE
    -- Consulta directa para tipo de orden 'internal'
    SELECT qty, product_id
    INTO v_order_qty, v_product_id
    FROM internal_product_production_orders
    WHERE id = in_order_id;
  END IF;

  -- Obtener cantidad comprometida
  IF in_order_type = 'client' THEN
    SELECT
        IFNULL(SUM(qty), 0)
    INTO v_committed_qty
    FROM inventory_movements
    WHERE item_type = 'product'
        AND reference_type = "order"
        AND reference_id = in_order_id
        AND item_id = v_product_id;
  ELSE
    SELECT
        IFNULL(SUM(qty), 0)
    INTO v_committed_qty
    FROM inventory_movements
    WHERE item_type = 'product'
    AND reference_type = "production"
        AND reference_id = in_order_id
        AND item_id = v_product_id;
  END IF;


  -- Obtener cantidad producida
  SELECT
    IFNULL(SUM(qty), 0)
  INTO v_production_qty
  FROM production_orders
  WHERE order_type = in_order_type
    AND order_id = in_order_id;

  -- Calcular cantidad restante
  SET v_qty = v_order_qty - (v_committed_qty + v_production_qty);

  -- Retornar el resultado como JSON
  SELECT JSON_OBJECT(
    'order_qty', v_order_qty,
    'committed_qty', v_committed_qty,
    'production_qty', v_production_qty,
    'qty', v_qty
  ) AS result;
END//

DELIMITER ;

/* ASIGNACION DE POP A LINEA AUTOMATICA */
/* sassssssssssssssssssssssssssssssss */

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
        IFNULL(lpd.commited, 0) AS committed,
        (IFNULL(lpd.stock, 0) - IFNULL(lpd.commited, 0)) AS available
    FROM locations l
    JOIN locations_location_types llt ON llt.location_id = l.id
    JOIN location_types lt ON lt.id = llt.location_type_id
    LEFT JOIN (
        SELECT
            ili.item_type,
            ili.item_id,
            i.stock,
            ili.location_id,
            (
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'product'
                  AND im.movement_type = 'out'
                  AND im.reference_type != 'transfer'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = ili.item_id
            ) AS commited
        FROM inventories_locations_items ili
        JOIN inventories i ON i.id = ili.inventory_id
        WHERE ili.item_type = 'product'
          AND ili.item_id = pop_product_id
    ) lpd ON l.id = lpd.location_id
    WHERE lt.name = 'Store';

    -- 3. Verificar si existe ubicación con stock suficiente
    SELECT location_id, location_name, available
    INTO v_location_id, v_location_name, v_available
    FROM temp_locations
    WHERE available >= pop_qty
    ORDER BY available DESC
    LIMIT 1;

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
                      AND im.movement_type = 'out'
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


DELIMITER //
CREATE PROCEDURE movements_inputs_production(
    IN in_pop_id INT,
    IN in_product_id INT,
    IN in_location_id INT,
    IN in_location_name VARCHAR(100),
    IN in_qty DECIMAL(10,4),
    IN in_production_id INT,
    IN in_type_order_description VARCHAR(100)
)
BEGIN
    -- Variables para control de cursores
    DECLARE done INT DEFAULT 0;
    -- Variables generales
    DECLARE input_id INT DEFAULT 0;
    DECLARE input_name VARCHAR(100) DEFAULT "";
    DECLARE equivalence DECIMAL(10,4) DEFAULT 0;
    DECLARE qty_input DECIMAL(10,4) DEFAULT 0;
    DECLARE type_production VARCHAR(100) DEFAULT "order";

    -- Cursor
    DECLARE input_cursor CURSOR FOR
        SELECT
            pi.input_id,
            i.name AS input_name,
            pi.equivalence
        FROM products AS p
        JOIN products_inputs AS pi
            ON pi.product_id = p.id
        JOIN inputs AS i
            ON i.id = pi.input_id
        WHERE p.id = in_product_id;

    -- Handler
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    
	IF in_type_order_description = 'Internal production' THEN
		SET type_production = 'production';
    END IF;
    
    -- Abrir cursor
    OPEN input_cursor;
    read_loop: LOOP
        FETCH input_cursor INTO input_id, input_name, equivalence;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;
        SET qty_input = equivalence * in_qty;
        INSERT INTO inventory_movements(
            location_id, location_name, 
            item_type, item_id, item_name,
            qty, movement_type, reference_id, reference_type,
            description, is_locked
        )
        VALUES (
            in_location_id, in_location_name,  
            'input', input_id, input_name,
            qty_input, 'out', in_production_id, type_production,
            in_type_order_description, 1
        );
    END LOOP read_loop;
    CLOSE input_cursor;
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE process_purchased_order_product(IN pop_id INT)
BEGIN
    -- Variables json
    DECLARE v_qty DECIMAL(10,4);
    DECLARE v_commited DECIMAL(10,4);
    DECLARE v_production DECIMAL(10,4);
    DECLARE v_location_id INT;
    DECLARE v_product_id INT;
    DECLARE v_product_name VARCHAR(100);
    DECLARE v_production_line_id INT DEFAULT 0;
    DECLARE v_production_order_id INT DEFAULT 0;
	DECLARE v_location_name VARCHAR(100) DEFAULT "";
    -- Inicializar variable de sesión
    SET @valor = NULL;
    -- Llamar procedimiento hijo
    CALL asigne_location_to_pop(pop_id, @valor);
    IF @valor IS NULL THEN
         -- SELECT @valor;
        UPDATE purchased_orders_products
        SET status = 'waiting'
        WHERE id = pop_id;
    ELSE
        -- Extraer valores del JSON en variables
        SET v_qty = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.qty'));
        SET v_commited = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.commited'));
        SET v_production = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.production'));
        SET v_location_id = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.location_id'));
        SET v_product_id = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.product_id'));
        SET v_product_name = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.product_name'));
        SET v_location_name = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.location_name'));
        -- SELECT v_qty, v_commited, v_production, v_location_id, v_product_id, v_product_name, v_location_name;
        SET v_production_line_id = asign_production_line(v_location_id,v_product_id);
            -- SELECT v_production_line;
        IF v_production_line_id > 0 THEN
            INSERT INTO 
              purchased_orders_products_locations_production_lines(production_line_id, purchase_order_product_id)
            VALUES (v_production_line_id, pop_id);
            IF v_production > 0 THEN
                INSERT INTO production_orders(order_type, order_id, product_id, product_name, qty, status)
                VALUES ("client", pop_id, v_product_id, v_product_name,  v_production, "pending");
                -- Recuperar el ID generado(Esto funciona sólo para la conexión actual. (No importa si hay otros usuarios insertando en otras conexiones.))
                SET v_production_order_id = LAST_INSERT_ID();
                CALL movements_inputs_production(
                  pop_id,
                  v_product_id,
                  v_location_id,
                  v_location_name,
                  v_production ,
                  v_production_order_id,
                  'Production order'
                );
            END IF;
            IF v_commited > 0 THEN
                INSERT INTO inventory_movements(
                  location_id, location_name, 
                  item_type, item_id, item_name,
                  qty, movement_type, reference_id, reference_type,
                  description, is_locked
                )
                VALUES (
                  v_location_id, v_location_name,  
                  'product', v_product_id, v_product_name,
                  v_commited, 'out', pop_id, 'order',
                  'Already in inventory', 1
                );
                -- SELECT "salida3";
            END IF;
        END IF;
    END IF;
END //
DELIMITER ;



DELIMITER //

CREATE PROCEDURE asigned_internal_order_production_line(
    IN in_location_id INT,
    IN in_product_id INT,
    IN in_qty INT
)
BEGIN
    -- Inicializar la variable de retorno
    DECLARE is_sufficient BOOLEAN DEFAULT TRUE;

    -- Crear tabla temporal con insumos disponibles
    DROP TEMPORARY TABLE IF EXISTS temp_inputs;
    CREATE TEMPORARY TABLE temp_inputs AS
    SELECT 
        i.id AS input_id,
        pi.equivalence,
        (inv.stock - IFNULL((
            SELECT SUM(im.qty)
            FROM inventory_movements im
            WHERE im.item_type = 'input'
                AND im.movement_type = 'out'
                AND im.is_locked = 1
                AND im.location_id = ili.location_id
                AND im.item_id = i.id
        ), 0)) AS available_input
    FROM products_inputs pi
    JOIN inputs i ON i.id = pi.input_id
    JOIN inventories_locations_items ili ON ili.item_id = i.id AND ili.item_type = 'input'
    JOIN inventories inv ON inv.id = ili.inventory_id
    WHERE pi.product_id = in_product_id
        AND ili.location_id = in_location_id;

    -- Verificar si algún insumo no cumple con la cantidad necesaria
    IF EXISTS (
        SELECT 1
        FROM temp_inputs
        WHERE (in_qty * equivalence) > available_input
    ) THEN
        SET is_sufficient = FALSE;
    END IF;
    SELECT is_sufficient;
END //
DELIMITER ;


DELIMITER // 
CREATE PROCEDURE asing_internal_order(
    IN in_internal_product_production_order_id INT,
    IN in_production_line_id INT,
    IN in_location_id INT,
    IN in_location_name VARCHAR(100),
    IN in_product_id INT,
    IN in_product_name VARCHAR(100),
    IN in_qty DECIMAL(10,4)
)
BEGIN

    DECLARE v_production_order_id INT;

    INSERT INTO internal_production_orders_lines_products (
        internal_product_production_order_id,
        production_line_id
    )
    VALUES (
        in_internal_product_production_order_id, 
        in_production_line_id
    );

    INSERT INTO production_orders (
        order_type, order_id, 
        product_id, product_name, 
        qty, status
    )
    VALUES (
        'internal', in_internal_product_production_order_id, 
        in_product_id, in_product_name, 
        in_qty, 'pending'
    );
    
    SET v_production_order_id = LAST_INSERT_ID();
    
    INSERT INTO inventory_movements (
        location_id, location_name, 
        item_type, item_id, item_name,
        qty, movement_type, reference_id, reference_type,
        description, is_locked
    )
    VALUES (
        in_location_id, in_location_name,  
        'product', in_product_id, in_product_name,
        in_qty, 'in', v_production_order_id , 'production',
        'Internal production', 1
    );

    CALL movements_inputs_production(
        in_internal_product_production_order_id,
        in_product_id,
        in_location_id,
        in_location_name,
        in_qty,
        v_production_order_id,
        'Internal production'
    );

END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE delete_pending_production_order_by_reference(
    IN in_order_id INT,
    IN in_order_type VARCHAR(100)
)
BEGIN
    DECLARE v_production_order_id INT DEFAULT 0;
    DECLARE v_inventory_committed_id INT DEFAULT 0;

    --  Obtener el ID de la orden de producción relacionada
    SELECT id INTO v_production_order_id
    FROM production_orders
    WHERE order_type = in_order_type
      AND order_id = in_order_id
      AND status = 'pending'
    LIMIT 1;

    -- Verificar si la orden de producción existe
    IF v_production_order_id IS NOT NULL THEN
        -- Eliminar los movimientos de inventario relacionados con esa orden de producción
        DELETE FROM inventory_movements
        WHERE reference_type = 'production'
        AND reference_id = v_production_order_id;
        -- Eliminar la orden de producción
        DELETE FROM production_orders
        WHERE order_type = in_order_type
        AND order_id = in_order_id
        AND status = 'pending';
        IF in_order_type = 'client' THEN
            DELETE FROM inventory_movements
            WHERE reference_type = 'order'
            AND reference_id = in_order_id;
        END IF;
    END IF;

    -- Eliminar la relación entre la orden de compra y la orden de producción
    IF in_order_type = 'client' THEN
        -- Eliminar la relación entre la orden de compra y la línea de producción
        DELETE FROM purchased_orders_products_locations_production_lines
        WHERE purchase_order_product_id = in_order_id;
    ELSE
        -- Eliminar la relación entre la orden de producción interna y la línea de producción
        DELETE FROM internal_production_orders_lines_products
        WHERE internal_product_production_order_id = in_order_id;
    END IF;
END//
DELIMITER;

DELIMITER //
CREATE PROCEDURE update_inventory_stock_from_movement(
    IN p_location_id INT,
    IN p_item_id INT,
    IN p_item_type VARCHAR(50),
    IN p_qty DECIMAL(10,4),
    IN p_movement_type VARCHAR(10),
    IN p_is_locked BOOLEAN
)
BEGIN
  DECLARE v_stock DECIMAL(10, 4) DEFAULT 0.00;
  DECLARE v_inventory_id INT DEFAULT 0;
  DECLARE v_new_stock DECIMAL(10, 4) DEFAULT 0.00;
  DECLARE v_should_update BOOLEAN DEFAULT FALSE;

  IF p_movement_type IN ('in', 'out') THEN
    SELECT
      i.id,
      i.stock
    INTO
      v_inventory_id, v_stock
    FROM
      inventories_locations_items AS ili
    JOIN
      locations AS l ON l.id = ili.location_id
    JOIN
      inventories AS i ON i.id = ili.inventory_id
    WHERE
      l.id = p_location_id
      AND ili.item_id = p_item_id
      AND ili.item_type = p_item_type
    LIMIT 1;

    IF p_movement_type = 'in' AND p_is_locked = 0 THEN
      SET v_new_stock = v_stock + p_qty;
      SET v_should_update = TRUE;
    ELSEIF p_movement_type = 'out' AND p_is_locked = 0 THEN
      SET v_new_stock = v_stock - p_qty;
      SET v_should_update = TRUE;
    END IF;

    IF v_inventory_id > 0 AND v_should_update THEN
      UPDATE inventories
      SET stock = v_new_stock
      WHERE id = v_inventory_id;
    END IF;
  END IF;
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE validate_production_order_completed(
    IN in_production_order_id INT
)
BEGIN
    DECLARE is_completed BOOLEAN DEFAULT FALSE;
    DECLARE status VARCHAR(100) DEFAULT '';

    SELECT po.status
    INTO status
    FROM production_orders as po
    WHERE po.id = in_production_order_id;

    SET is_completed = is_production_order_completed(in_production_order_id);
    
    IF is_completed THEN
        IF status != 'completed' THEN
            UPDATE production_orders    
            SET status = 'completed'
            WHERE id = in_production_order_id;
        END IF;
    ELSE
        if status = 'completed' THEN
            UPDATE production_orders    
            SET status = 'pending'
            WHERE id = in_production_order_id;
        END IF;
    END IF;
END//
DELIMITER ;


DELIMITER //
CREATE PROCEDURE validate_order_completed(
    IN in_order_id INT,
    IN in_order_type VARCHAR(100)
)
BEGIN
    DECLARE is_production_order_completed BOOLEAN DEFAULT FALSE;
    DECLARE v_status VARCHAR(100) DEFAULT '';

    SET is_production_order_completed = is_order_completed(in_order_id, in_order_type);

    IF in_order_type = 'client' THEN
        
        SELECT pop.status
        INTO v_status
        FROM purchased_orders_products as pop
        WHERE pop.id = in_order_id;

        IF is_production_order_completed THEN
            IF v_status  != 'completed' THEN
                UPDATE purchased_orders_products
                SET status = 'completed'
                WHERE id = in_order_id;
            END IF;
        ELSE 
            IF v_status = 'completed' THEN
                UPDATE purchased_orders_products
                SET status = 'pending'
                WHERE id = in_order_id;
            END IF;
        END IF;
    ELSE
        SELECT ippo.status
        INTO v_status
        FROM internal_product_production_orders as ippo
        WHERE ippo.id = in_order_id;

        IF is_production_order_completed THEN
            IF v_status  != 'completed' THEN
                UPDATE internal_product_production_orders
                SET status = 'completed'
                WHERE id = in_order_id;
            END IF;
        ELSE 
            IF v_status = 'completed' THEN
                UPDATE internal_product_production_orders
                SET status = 'pending'
                WHERE id = in_order_id;
            END IF;
        END IF;
    END IF;
END //
DELIMITER ;



DELIMITER //
CREATE PROCEDURE add_inventory_after_production(
    IN in_operation VARCHAR(100),
    IN in_location_id INT,
    IN in_item_id INT,
    IN in_item_type VARCHAR(100),
    IN in_qty DECIMAL(10,4)
)
BEGIN
    DECLARE v_update_stock DECIMAL(10,4) DEFAULT 0.00;
    DECLARE v_inventory_id INT DEFAULT 0.00;
    DECLARE v_stock DECIMAL(10,4) DEFAULT 0.00;


    IF in_item_type = 'product' THEN
        SELECT
            i.id,
            i.stock
        INTO v_inventory_id, v_stock
        FROM products AS p
        JOIN inventories_locations_items AS ili
            ON ili.item_id = p.id
            AND ili.item_type = in_item_type
        JOIN locations AS l
            ON l.id = ili.location_id
        JOIN inventories as i
            ON i.id = ili.inventory_id
        WHERE p.id = in_item_id
        AND l.id = in_location_id;
    ELSE
        SELECT
            i.id,
            i.stock
        INTO v_inventory_id, v_stock
        FROM inputs AS inp
        JOIN inventories_locations_items AS ili
            ON ili.item_id = inp.id
            AND ili.item_type = in_item_type
        JOIN locations AS l
            ON l.id = ili.location_id
        JOIN inventories as i
            ON i.id = ili.inventory_id
        WHERE inp.id = in_item_id
        AND l.id = in_location_id;

    END IF;

    IF in_operation = 'increment' THEN
        SET v_update_stock = v_stock + in_qty;
    ELSE
        SET v_update_stock = v_stock - in_qty;
    END IF;

    UPDATE inventories
    SET stock = v_update_stock
    WHERE id = v_inventory_id;

END //
DELIMITER ;


DELIMITER $$

CREATE PROCEDURE getInventoryByLocation()
BEGIN
  WITH inventory_data AS (
    SELECT
        ili.item_type,
        ili.item_id,
        ili.location_id,
        i.id AS inventory_id,
        i.stock,
        COALESCE(SUM(im.qty), 0) AS committed
    FROM inventories_locations_items ili
    JOIN inventories i ON i.id = ili.inventory_id
    LEFT JOIN inventory_movements im ON
        im.item_type = ili.item_type
        AND im.item_id = ili.item_id
        AND im.location_id = ili.location_id
        AND im.movement_type = 'out'
        AND im.reference_type != 'transfer'
        AND im.is_locked = 1
    GROUP BY ili.item_type, ili.item_id, ili.location_id, i.id, i.stock
  )

  SELECT JSON_ARRAYAGG(
    JSON_OBJECT(
      'location_id', l.id,
      'location_name', l.name,
      'inventory_id', id.inventory_id,
      'item_type', id.item_type,
      'item_id', id.item_id,
      'item_name', CASE 
                    WHEN id.item_type = 'product' THEN p.name
                    WHEN id.item_type = 'input' THEN i.name
                    ELSE NULL
                  END,
      'stock', COALESCE(id.stock, 0),
      'committed', COALESCE(id.committed, 0),
      'available', COALESCE(id.stock, 0) - COALESCE(id.committed, 0)
    )
  ) AS inventories
  FROM locations l
  JOIN locations_location_types llt ON llt.location_id = l.id
  JOIN location_types lt ON lt.id = llt.location_type_id
  LEFT JOIN inventory_data id ON id.location_id = l.id
  LEFT JOIN products p ON id.item_type = 'product' AND id.item_id = p.id
  LEFT JOIN inputs i ON id.item_type = 'input' AND id.item_id = i.id
  WHERE lt.name = 'Store';
END$$

DELIMITER ;


CALL getInventoryByLocation();










CALL process_purchased_order_product(1);
CALL validate_production_order_completed(1);
SELECT * FROM inventory_movements;
SELECT * FROM inventories;
SELECT * FROM purchased_orders_products_locations_production_lines;
SELECT * FROM production_orders;
SELECT * FROM productions;
SELECT * FROM purchased_orders_products;
SELECT * FROM internal_product_production_orders;
SELECT * FROM shipping_orders;
-- CALL get_order_summary_by_pop(1, "internal");

-- CALL add_inventory_after_production('decrement', 2, 2, 800);



    SELECT * FROM internal_product_production_orders;