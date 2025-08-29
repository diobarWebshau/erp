
/*
DELIMITER //
CREATE PROCEDURE assigend_purchse_order_product_production_line(
    IN purchase_order_product_id INT
    OUT location_id INT,
)
BEGIN

    DECLARE v_location_id INT DEFAULT 0;
    DECLARE v_product_id INT DEFAULT 0;
    DECLARE v_cantidad_product INT DEFAULT 0;

    -- obtengo la cantidad y el id producto de la purchase order product 
    SELECT
        product_id
        qty
    INTO
        v_cantidad_product,
        v_product_id
    FROM purchased_orders_products
    WHERE id = purchase_order_product_id;


    -- obtener los id inputs del producto y sus equivalencias con el input
    
    SELECT
        pi.input_id,
        pi.equivalence
    FROM products AS p
    JOIN products_inputs AS pi
        ON pi.product_id = p.id
    WHERE
        p.id = v_product_id;

    -- obtengo la location con mas stock de un producto

    SELECT
        lpl.id AS location_production_line_id,
        pl.id AS production_line_id,
        pl.name AS production_line_name,
        p.id AS product_id,
        p.name AS product_name,
        i.id AS inventory_id,
        i.stock AS stock
    FROM products AS p
    JOIN production_lines_products AS plp
        ON plp.product_id = p.id
    JOIN locations_production_lines AS lpl
        ON lpl.id = plp.production_line_id
    JOIN production_lines AS pl
        ON pl.id = lpl.production_line_id
    JOIN inventories_locations_items AS ili
        ON ili.item_id = p.id
        AND ili.item_type = "product"
    JOIN inventories as i
        ON i.id = ili.inventory_id
    WHERE p.id = v_product_id
    ORDER BY 
        i.stock DESC
    LIMIT 1;

    -- obtengo todos los stock de cada location de los inputs para fabricar el producto
    -- retorna multiples registros con cada input, stock y location
    SELECT
        l.id AS location_id,
        l.name AS location_name,
        p.id AS product_id,
        p.name AS product_name,
        inp.id AS input_id,
        inp.name AS input_name,
        i.id AS inventory_id,
        i.stock AS stock
    FROM products AS p
    JOIN
        products_inputs as pi
        ON pi.product_id = p.id
    JOIN
        inputs as inp
        ON inp.id = pi.input_id
    JOIN inventories_locations_items AS ili
        ON ili.item_id = pi.input_id
        AND ili.item_type = "input"
    JOIN locations AS l
        ON l.id = ili.location_id
    JOIN inventories as i
        ON i.id = ili.inventory_id
    WHERE 
        p.id = 1;

    /*
        Quiero que el procedimiento analize que location es mas para procesar la compra
        en base a los stocks de los insumos y el producto en stock
    */


END //

DELIMITER ;
*/



/* ANALIZAR


DELIMITER //
CREATE PROCEDURE assigend_purchse_order_product_production_line(
    IN purchase_order_product_id INT,
    OUT location_id INT
)
BEGIN

    DECLARE v_location_id INT DEFAULT 0;
    DECLARE v_product_id INT DEFAULT 0;
    DECLARE v_cantidad_product INT DEFAULT 0;

    -- variables para inputs
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_input_id INT;
    DECLARE v_equivalence DECIMAL(10,2);
    DECLARE v_required_qty DECIMAL(10,2);
    DECLARE v_stock DECIMAL(10,2);
    DECLARE v_location_input_id INT;

    DECLARE cur_inputs CURSOR FOR
        SELECT pi.input_id, pi.equivalence
        FROM products_inputs AS pi
        WHERE pi.product_id = v_product_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- obtengo la cantidad y el id del producto
    SELECT 
        qty, product_id
    INTO 
        v_cantidad_product, v_product_id
    FROM purchased_orders_products
    WHERE id = purchase_order_product_id;

    -- Verificar si ya hay suficiente stock del producto terminado en alguna location
    SELECT ili.location_id
    INTO v_location_id
    FROM inventories_locations_items AS ili
    JOIN inventories AS i ON i.id = ili.inventory_id
    WHERE ili.item_id = v_product_id
      AND ili.item_type = 'product'
      AND i.stock >= v_cantidad_product
    ORDER BY i.stock DESC
    LIMIT 1;

    IF v_location_id IS NOT NULL THEN
        SET location_id = v_location_id;
        LEAVE proc;
    END IF;

    -- Si no hay suficiente producto terminado, analizar los insumos
    -- Se requiere encontrar la location que tenga todos los insumos suficientes

    -- tabla temporal para almacenar los inputs necesarios
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_inputs_required (
        input_id INT,
        total_required DECIMAL(10,2)
    );

    DELETE FROM temp_inputs_required;

    -- Calcular inputs necesarios
    OPEN cur_inputs;
    read_loop: LOOP
        FETCH cur_inputs INTO v_input_id, v_equivalence;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SET v_required_qty = v_equivalence * v_cantidad_product;

        INSERT INTO temp_inputs_required (input_id, total_required)
        VALUES (v_input_id, v_required_qty);
    END LOOP;
    CLOSE cur_inputs;

    -- Buscar location que tenga todos los insumos con suficiente stock

    SELECT ili.location_id
    INTO v_location_id
    FROM inventories_locations_items AS ili
    JOIN inventories AS i ON i.id = ili.inventory_id
    JOIN temp_inputs_required AS tir ON tir.input_id = ili.item_id
    WHERE ili.item_type = 'input'
    GROUP BY ili.location_id
    HAVING SUM(CASE 
        WHEN i.stock >= tir.total_required THEN 1
        ELSE 0
    END) = (SELECT COUNT(*) FROM temp_inputs_required)
    ORDER BY SUM(i.stock) DESC
    LIMIT 1;

    -- Asignar location final
    IF v_location_id IS NOT NULL THEN
        SET location_id = v_location_id;
    ELSE
        SET location_id = 0; -- no hay location suficiente
    END IF;

    -- limpiar tabla temporal
    DROP TEMPORARY TABLE IF EXISTS temp_inputs_required;

    -- etiqueta de salida opcional
    proc: BEGIN END;

END //
DELIMITER ;


*/

DELIMITER //
CREATE PROCEDURE asigne_location_to_pop(
    IN pop_id INT
)
BEGIN
    DECLARE pop_product_id INT DEFAULT 0;
    DECLARE pop_qty DECIMAL(10,4) DEFAULT 0;


    
    DECLARE location_id_final INT NULL DEFAULT NULL;
    DECLARE differencial DECIMAL(10,4) DEFAULT 0;
    DECLARE qty_production DECIMAL (10,4) DEFAULT 0;
    DECLARE qty_committed DECIMAL (10,4) DEFAULT 0;
    DECLARE available_qty DECIMAL(10,4) NULL DEFAULT NULL;
    DECLARE bandera_input BOOLEAN DEFAULT TRUE;
    DECLARE json_info JSON DEFAULT NULL;

    -- obtener detalles de purchased order product 
    SELECT
        pop.product_id, pop.qty
    INTO
        pop_product_id, pop_qty
    FROM purchased_orders_products as pop
    WHERE pop.id = pop_id;

    -- verificar si con el inventario available se abastece la orden
    DECLARE location_product_cursor CURSOR FOR
        SELECT
            l.id AS id
            lpd.stock AS stock,
            IFNULL(lpd.commited, 0) AS commited,
            IFNULL(stock-commited, 0) AS avalaible
        FROM
            locations AS l
        JOIN
            locations_location_types AS lpt ON lpt.location_id = l.id
        JOIN
            location_types AS lt ON lpt.location_type_id = lt.id
        LEFT JOIN (
            SELECT
                ili.item_type,
                ili.item_id,
                i.stock,
                ili.location_id,
                (
                    SELECT SUM(im.qty)
                    FROM inventory_movements AS im
                    WHERE im.item_type = "product"
                    AND im.movement_type = "out"
                    AND im.location_id = ili.location_id
                    AND im.is_locked = 1
                ) AS commited
            FROM inventories_locations_items AS ili
            JOIN inventories AS i ON i.id = ili.inventory_id
            WHERE ili.item_type = "product" AND ili.item_id = pop_product_id
        ) AS lpd ON l.id = lpd.location_id
        ORDER BY avalaible DESC;
                
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN location_product_cursor;

    /**
         Se recorre el stock del producto en cada location

         Se evalua si la location tiene sufciente stock para completar la orden
         sin producir. Caso contrario la diferencia se manda a producir.

         Si se acompleta la orden sin necesidad de producir, se sale del bucle
        
    */

    REPEAT
        FETCH location_product_cursor INTO id, stock, commited, avalaible
        IF done = 0 THEN
            IF pop_qty < available THEN
                SET qty_committed = pop_qty;
                SET location_id_final = id;
                LEAVE location_product_cursor;
            ELSE
                SET qty_committed = available
                SET differencial = pop_qty - available;
                DECLARE location_input_cursor CURSOR FOR
                    SELECT 
                        i.id AS input_id,
                        i.name AS input_name,
                        pi.equivalence,
                        ili.location_id AS location_id_input,
                        ili.item_id AS item_id_input ,
                        inv.stock AS stock_input,
                        (IFNULL((
                            SELECT SUM(im.qty)
                            FROM inventory_movements im
                            WHERE im.item_type = 'input'
                            AND im.movement_type = 'out'
                            AND im.is_locked = 1
                            AND im.location_id = ili.location_id
                            AND im.item_id = i.id
                        ), 0)) AS committed_input,
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
                    AND ili.location_id = id;

                DECLARE CONTINUE HANDLER FOR NOT FOUND SET done1 = 1;
                /*
                    Se recorre que cada stock de los inputs en la locations sean suficientes para abastecer
                    la orden del diferencial(pendiente por productir), ya que junto con la otra cantidad
                    comprometida se acompleta(material que no requiere produccion porque existe en stock)

                    Se recorre cada stock de cada input, y se obtiene la equivalencia(cuantas pzs de inputs 
                    se requieren para fabricar un producto) para poder determinar si con el inventario disponible
                    en la location se abastece para poder fabricar la cantidad de producto pendiente.

                    Aqui se guarda la location, que tenga la capacidad de producir la cantidad faltante de la orden

                    Si en un input no se puede abastecer, no tiene caso evaluar los demas inputs

                */
                OPEN location_input_cursor 
                REPEAT
                    FETCH location_product_cursor INTO input_id, input_name, equivalence, location_id_input, stock_input, commited_input, available_input
                    IF done = 0 THEN
                        IF bandera_input IS TRUE THEN
                            IF((differencial*equivalence) < available_input) THEN
                                SET location_id_final = id;
                            ELSE
                                SET location_id_final = NULL;
                                SET bandera_input = FALSE;
                            END IF;
                        ELSE
                        END IF;
                    END IF;
                UNTIL done1 = 1 END REPEAT;
            END IF;    
            IF location_id_final IS NOT NULL THEN
                SET json_info = JSON_OBJECT(
                    "location_id": location_id_final,
                    "qty": pop_qty,
                    "commited": qty_committed,
                    "production": differencial,
                );
                LEAVE location_product_cursor;
            END IF
        END IF;
    END IF;

    UNTIL done = 1 END REPEAT;

    CLOSE location_product_cursor;

    IF json_info IS NULL THEN
        SET json_info = JSON_OBJECT(
            "location_id": NULL,
            "qty": NULL,
            "commited": NULL,
            "production": NULL,
        );
    END IF;


    SELECT json_info;

END//
DELIMITER ;
























DELIMITER //

CREATE PROCEDURE asigne_location_to_pop(
    IN pop_id INT
)
BEGIN
    -- Variables generales
    DECLARE pop_product_id INT DEFAULT 0;
    DECLARE pop_qty DECIMAL(10,4) DEFAULT 0;
    DECLARE location_id_final INT DEFAULT NULL;
    DECLARE differencial DECIMAL(10,4) DEFAULT 0;
    DECLARE qty_committed DECIMAL(10,4) DEFAULT 0;
    DECLARE bandera_input BOOLEAN DEFAULT TRUE;
    DECLARE json_info JSON DEFAULT NULL;

    -- Variables para producto
    DECLARE done INT DEFAULT 0;
    DECLARE location_id_cursor INT;
    DECLARE stock DECIMAL(10,4);
    DECLARE committed DECIMAL(10,4);
    DECLARE available DECIMAL(10,4);

    -- Variables para input
    DECLARE done_input INT DEFAULT 0;
    DECLARE input_id INT;
    DECLARE input_name VARCHAR(255);
    DECLARE equivalence DECIMAL(10,4);
    DECLARE location_id_input INT;
    DECLARE stock_input DECIMAL(10,4);
    DECLARE committed_input DECIMAL(10,4);
    DECLARE available_input DECIMAL(10,4);

    -- Cursores
    DECLARE cur_location_product CURSOR FOR
        SELECT
            l.id AS id,
            IFNULL(lpd.stock, 0) AS stock,
            IFNULL(lpd.commited, 0) AS committed,
            IFNULL(lpd.stock - IFNULL(lpd.commited, 0), 0) AS available
        FROM
            locations l
        JOIN
            locations_location_types llt ON llt.location_id = l.id
        JOIN
            location_types lt ON lt.id = llt.location_type_id
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
                      AND im.is_locked = 1
                      AND im.location_id = ili.location_id
                      AND im.item_id = ili.item_id
                ) AS commited
            FROM inventories_locations_items ili
            JOIN inventories i ON i.id = ili.inventory_id
            WHERE ili.item_type = 'product'
              AND ili.item_id = pop_product_id
        ) lpd ON l.id = lpd.location_id
        ORDER BY available DESC;

    DECLARE cur_input CURSOR FOR
        SELECT 
            i.id AS input_id,
            i.name AS input_name,
            pi.equivalence,
            ili.location_id,
            inv.stock,
            IFNULL((
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'input'
                  AND im.movement_type = 'out'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = i.id
            ),0) AS committed_input,
            (inv.stock - IFNULL((
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'input'
                  AND im.movement_type = 'out'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = i.id
            ),0)) AS available_input
        FROM products_inputs pi
        JOIN inputs i ON i.id = pi.input_id
        JOIN inventories_locations_items ili ON ili.item_id = i.id AND ili.item_type = 'input'
        JOIN inventories inv ON inv.id = ili.inventory_id
        WHERE pi.product_id = pop_product_id
          AND ili.location_id = location_id_cursor;

    -- Handlers
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done_input = 1;

    -- Obtener producto
    SELECT
        pop.product_id, pop.qty
    INTO
        pop_product_id, pop_qty
    FROM purchased_orders_products pop
    WHERE pop.id = pop_id;

    -- ABRIMOS CURSOR DE LOCATIONS
    OPEN cur_location_product;

    read_loop: LOOP
        FETCH cur_location_product INTO location_id_cursor, stock, committed, available;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        IF pop_qty <= available THEN
            -- Stock suficiente
            SET qty_committed = pop_qty;
            SET location_id_final = location_id_cursor;
            SET differencial = 0;
            LEAVE read_loop;
        ELSE
            -- No alcanza el stock, revisar inputs
            SET qty_committed = available;
            SET differencial = pop_qty - available;
            SET bandera_input = TRUE;

            -- Revisar insumos
            SET done_input = 0;
            OPEN cur_input;

            input_loop: LOOP
                FETCH cur_input INTO input_id, input_name, equivalence, location_id_input, stock_input, committed_input, available_input;
                IF done_input = 1 THEN
                    LEAVE input_loop;
                END IF;

                IF bandera_input = TRUE THEN
                    IF (differencial * equivalence) <= available_input THEN
                        SET location_id_final = location_id_cursor;
                    ELSE
                        SET bandera_input = FALSE;
                        SET location_id_final = NULL;
                    END IF;
                END IF;
            END LOOP input_loop;

            CLOSE cur_input;
        END IF;

        IF location_id_final IS NOT NULL THEN
            LEAVE read_loop;
        END IF;
    END LOOP read_loop;

    CLOSE cur_location_product;

    -- Salida final
    IF location_id_final IS NOT NULL THEN
        SET json_info = JSON_OBJECT(
            'location_id', location_id_final,
            'qty', pop_qty,
            'commited', qty_committed,
            'production', differencial
        );
    ELSE
        SET json_info = JSON_OBJECT(
            'location_id', NULL,
            'qty', NULL,
            'commited', NULL,
            'production', NULL
        );
    END IF;

    SELECT json_info;

END//

DELIMITER ;


/* PUERBAAAAAA   **/


DELIMITER //

CREATE PROCEDURE asigne_location_to_pop(
    IN pop_id INT
)
BEGIN
    -- Variables generales
    DECLARE pop_product_id INT DEFAULT 0;
    DECLARE pop_qty DECIMAL(10,4) DEFAULT 0;
    DECLARE location_id_final INT DEFAULT NULL;
    DECLARE differencial DECIMAL(10,4) DEFAULT 0;
    DECLARE qty_committed DECIMAL(10,4) DEFAULT 0;
    DECLARE bandera_input BOOLEAN DEFAULT TRUE;
    DECLARE json_info JSON DEFAULT NULL;

    -- Variables para producto
    DECLARE done_location INT DEFAULT 0;
    DECLARE location_id_cursor INT DEFAULT NULL;
    DECLARE stock DECIMAL(10,4) DEFAULT 0;
    DECLARE committed DECIMAL(10,4) DEFAULT 0;
    DECLARE available DECIMAL(10,4) DEFAULT 0;

    -- Variables para input
    DECLARE done_input INT DEFAULT 0;
    DECLARE input_id INT DEFAULT NULL;
    DECLARE input_name VARCHAR(255) DEFAULT NULL;
    DECLARE equivalence DECIMAL(10,4) DEFAULT 0;
    DECLARE location_id_input INT DEFAULT NULL;
    DECLARE stock_input DECIMAL(10,4) DEFAULT 0;
    DECLARE committed_input DECIMAL(10,4) DEFAULT 0;
    DECLARE available_input DECIMAL(10,4) DEFAULT 0;

    -- Cursores
    DECLARE cur_location_product CURSOR FOR
        SELECT
            l.id AS id,
            IFNULL(lpd.stock, 0) AS stock,
            IFNULL(lpd.commited, 0) AS committed,
            IFNULL(lpd.stock - IFNULL(lpd.commited, 0), 0) AS available
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
                      AND im.is_locked = 1
                      AND im.location_id = ili.location_id
                      AND im.item_id = ili.item_id
                ) AS commited
            FROM inventories_locations_items ili
            JOIN inventories i ON i.id = ili.inventory_id
            WHERE ili.item_type = 'product'
              AND ili.item_id = pop_product_id
        ) lpd ON l.id = lpd.location_id
        ORDER BY available DESC;

    DECLARE cur_input CURSOR FOR
        SELECT 
            i.id AS input_id,
            i.name AS input_name,
            pi.equivalence,
            ili.location_id,
            inv.stock,
            IFNULL((
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'input'
                  AND im.movement_type = 'out'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = i.id
            ),0) AS committed_input,
            (inv.stock - IFNULL((
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'input'
                  AND im.movement_type = 'out'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = i.id
            ),0)) AS available_input
        FROM products_inputs pi
        JOIN inputs i ON i.id = pi.input_id
        JOIN inventories_locations_items ili ON ili.item_id = i.id AND ili.item_type = 'input'
        JOIN inventories inv ON inv.id = ili.inventory_id
        WHERE pi.product_id = pop_product_id
          AND ili.location_id = location_id_cursor;

    -- Handlers
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_location = 1;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done_input = 1;

    -- Obtener el producto y cantidad
    SELECT pop.product_id, pop.qty
    INTO pop_product_id, pop_qty
    FROM purchased_orders_products pop
    WHERE pop.id = pop_id;

    -- Abrir cursor de locations
    OPEN cur_location_product;

    read_loop: LOOP
        FETCH cur_location_product INTO location_id_cursor, stock, committed, available;

        IF done_location = 1 THEN
            LEAVE read_loop;
        END IF;

        IF pop_qty <= available THEN
            -- Hay suficiente stock en esta ubicación
            SET qty_committed = pop_qty;
            SET location_id_final = location_id_cursor;
            SET differencial = 0;
            LEAVE read_loop;
        ELSE
            -- No hay suficiente stock, checar insumos
            SET qty_committed = available;
            SET differencial = pop_qty - available;
            SET bandera_input = TRUE;

            -- Revisar insumos
            SET done_input = 0;
            OPEN cur_input;

            input_loop: LOOP
                FETCH cur_input INTO input_id, input_name, equivalence, location_id_input, stock_input, committed_input, available_input;

                IF done_input = 1 THEN
                    LEAVE input_loop;
                END IF;

                IF bandera_input = TRUE THEN
                    IF (differencial * equivalence) <= available_input THEN
                        SET location_id_final = location_id_cursor;
                    ELSE
                        SET bandera_input = FALSE;
                        SET location_id_final = NULL;
                    END IF;
                END IF;
            END LOOP input_loop;

            CLOSE cur_input;
        END IF;

        -- Si ya encontramos una ubicación válida, salir
        IF location_id_final IS NOT NULL THEN
            LEAVE read_loop;
        END IF;

    END LOOP read_loop;

    CLOSE cur_location_product;

    -- Salida final
    IF location_id_final IS NOT NULL THEN
        SET json_info = JSON_OBJECT(
            'location_id', location_id_final,
            'qty', pop_qty,
            'commited', qty_committed,
            'production', differencial
        );
    ELSE
        SET json_info = JSON_OBJECT(
            'location_id', NULL,
            'qty', NULL,
            'commited', NULL,
            'production', NULL
        );
    END IF;

    SELECT json_info;
    
END //

DELIMITER ;













/*********************************************************/


DELIMITER //

CREATE PROCEDURE asigne_location_to_pop(
    IN pop_id INT,
    OUT json_info JSON
)
BEGIN
    -- Variables generales
    DECLARE pop_product_id INT DEFAULT 0;
    DECLARE pop_qty DECIMAL(10,4) DEFAULT 0;
    DECLARE location_id_final INT DEFAULT NULL;
    DECLARE differencial DECIMAL(10,4) DEFAULT 0;
    DECLARE qty_committed DECIMAL(10,4) DEFAULT 0;
    DECLARE bandera_input BOOLEAN DEFAULT TRUE;

    -- Variables para producto
    DECLARE done_location INT DEFAULT 0;
    DECLARE location_id_cursor INT DEFAULT NULL;
    DECLARE stock DECIMAL(10,4) DEFAULT 0;
    DECLARE committed DECIMAL(10,4) DEFAULT 0;
    DECLARE available DECIMAL(10,4) DEFAULT 0;

    -- Variables para input
    DECLARE done_input INT DEFAULT 0;
    DECLARE input_id INT DEFAULT NULL;
    DECLARE input_name VARCHAR(255) DEFAULT NULL;
    DECLARE equivalence DECIMAL(10,4) DEFAULT 0;
    DECLARE location_id_input INT DEFAULT NULL;
    DECLARE stock_input DECIMAL(10,4) DEFAULT 0;
    DECLARE committed_input DECIMAL(10,4) DEFAULT 0;
    DECLARE available_input DECIMAL(10,4) DEFAULT 0;

    -- Cursores
    DECLARE cur_location_product CURSOR FOR
        SELECT
            l.id AS id,
            IFNULL(lpd.stock, 0) AS stock,
            IFNULL(lpd.commited, 0) AS committed,
            IFNULL(lpd.stock - IFNULL(lpd.commited, 0), 0) AS available
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
                      AND im.is_locked = 1
                      AND im.location_id = ili.location_id
                      AND im.item_id = ili.item_id
                ) AS commited
            FROM inventories_locations_items ili
            JOIN inventories i ON i.id = ili.inventory_id
            WHERE ili.item_type = 'product'
              AND ili.item_id = pop_product_id
        ) lpd ON l.id = lpd.location_id
        ORDER BY available DESC;

    DECLARE cur_input CURSOR FOR
        SELECT 
            i.id AS input_id,
            i.name AS input_name,
            pi.equivalence,
            ili.location_id,
            inv.stock,
            IFNULL((
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'input'
                  AND im.movement_type = 'out'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = i.id
            ),0) AS committed_input,
            (inv.stock - IFNULL((
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'input'
                  AND im.movement_type = 'out'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = i.id
            ),0)) AS available_input
        FROM products_inputs pi
        JOIN inputs i ON i.id = pi.input_id
        JOIN inventories_locations_items ili ON ili.item_id = i.id AND ili.item_type = 'input'
        JOIN inventories inv ON inv.id = ili.inventory_id
        WHERE pi.product_id = pop_product_id
          AND ili.location_id = location_id_cursor;

    -- Handlers
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_location = 1;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done_input = 1;

    -- Obtener el producto y cantidad
    SELECT pop.product_id, pop.qty
    INTO pop_product_id, pop_qty
    FROM purchased_orders_products pop
    WHERE pop.id = pop_id;

    -- Abrir cursor de locations
    OPEN cur_location_product;

    read_loop: LOOP
        FETCH cur_location_product INTO location_id_cursor, stock, committed, available;

        IF done_location = 1 THEN
            LEAVE read_loop;
        END IF;

        IF pop_qty <= available THEN
            -- Hay suficiente stock en esta ubicación
            SET qty_committed = pop_qty;
            SET location_id_final = location_id_cursor;
            SET differencial = 0;
            LEAVE read_loop;
        ELSE
            -- No hay suficiente stock, checar insumos
            SET qty_committed = available;
            SET differencial = pop_qty - available;
            SET bandera_input = TRUE;

            -- Revisar insumos
            SET done_input = 0;
            OPEN cur_input;

            input_loop: LOOP
                FETCH cur_input INTO input_id, input_name, equivalence, location_id_input, stock_input, committed_input, available_input;

                IF done_input = 1 THEN
                    LEAVE input_loop;
                END IF;

                IF bandera_input = TRUE THEN
                    IF (differencial * equivalence) <= available_input THEN
                        SET location_id_final = location_id_cursor;
                    ELSE
                        SET bandera_input = FALSE;
                        SET location_id_final = NULL;
                    END IF;
                END IF;
            END LOOP input_loop;

            CLOSE cur_input;
        END IF;

        -- Si ya encontramos una ubicación válida, salir
        IF location_id_final IS NOT NULL THEN
            LEAVE read_loop;
        END IF;

    END LOOP read_loop;

    CLOSE cur_location_product;

    -- Salida final
    IF location_id_final IS NOT NULL THEN
        SET json_info = JSON_OBJECT(
            'location_id', location_id_final,
            'qty', pop_qty,
            'commited', qty_committed,
            'production', differencial,
            'product_id', pop_product_id
        );
    ELSE
        SET json_info = NULL;
    END IF;    
END //

DELIMITER ;

/**/

DELIMITER //

CREATE PROCEDURE procedimiento_padre(IN pop_id INT)
BEGIN
    -- Variables locales
    DECLARE v_qty DECIMAL(10,4);
    DECLARE v_commited DECIMAL(10,4);
    DECLARE v_production DECIMAL(10,4);
    DECLARE v_location_id INT;
    DECLARE v_product_id INT;

    -- Inicializar variable de sesión
    SET @valor = NULL;

    -- Llamar procedimiento hijo
    CALL asigne_location_to_pop(pop_id, @valor);
    
    IF @valor IS NULL THEN
        UPDATE purchased_orders_products
        SET status = "pendient"
		WHERE id=pop_id;
    ELSE
		-- Extraer valores del JSON en variables
		SET v_qty = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.qty'));
		SET v_commited = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.commited'));
		SET v_production = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.production'));
		SET v_location_id = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.location_id'));
		SET v_product_id = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.product_id'));
		-- Ahora puedes usar las variables
		SELECT v_qty, v_commited, v_production, v_location_id, v_product_id;
    END IF;
END //

DELIMITER ;

/***/

DELIMITER //

CREATE PROCEDURE procedimiento_padre(IN pop_id INT)
BEGIN
    -- Variables locales
    DECLARE v_qty DECIMAL(10,4);
    DECLARE v_commited DECIMAL(10,4);
    DECLARE v_production DECIMAL(10,4);
    DECLARE v_location_id INT;
    DECLARE v_product_id INT;

    -- Inicializar variable de sesión
    SET @valor = NULL;

    -- Llamar procedimiento hijo
    CALL asigne_location_to_pop(pop_id, @valor);
    
    IF @valor IS NULL THEN
        SELECT @valor;
    ELSE
		-- Extraer valores del JSON en variables
		SET v_qty = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.qty'));
		SET v_commited = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.commited'));
		SET v_production = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.production'));
		SET v_location_id = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.location_id'));
		SET v_product_id = JSON_UNQUOTE(JSON_EXTRACT(@valor, '$.product_id'));
		-- Ahora puedes usar las variables
		SELECT v_qty, v_commited, v_production, v_location_id, v_product_id;
    END IF;
END //

DELIMITER ;

CALL procedimiento_padre(1);


/**/


DELIMITER //

CREATE PROCEDURE asigne_location_to_pop(
    IN pop_id INT
)
BEGIN
    -- Variables generales
    DECLARE pop_product_id INT DEFAULT 0;
    DECLARE pop_qty DECIMAL(10,4) DEFAULT 0;
    DECLARE location_id_final INT DEFAULT NULL;
    DECLARE differencial DECIMAL(10,4) DEFAULT 0;
    DECLARE qty_committed DECIMAL(10,4) DEFAULT 0;
    DECLARE bandera_input BOOLEAN DEFAULT TRUE;
    DECLARE json_info JSON DEFAULT NULL;

    -- Variables para producto
    DECLARE done_location INT DEFAULT 0;
    DECLARE location_id_cursor INT DEFAULT NULL;
    DECLARE stock DECIMAL(10,4) DEFAULT 0;
    DECLARE committed DECIMAL(10,4) DEFAULT 0;
    DECLARE available DECIMAL(10,4) DEFAULT 0;

    -- Variables para input
    DECLARE done_input INT DEFAULT 0;
    DECLARE input_id INT DEFAULT NULL;
    DECLARE input_name VARCHAR(255) DEFAULT NULL;
    DECLARE equivalence DECIMAL(10,4) DEFAULT 0;
    DECLARE location_id_input INT DEFAULT NULL;
    DECLARE stock_input DECIMAL(10,4) DEFAULT 0;
    DECLARE committed_input DECIMAL(10,4) DEFAULT 0;
    DECLARE available_input DECIMAL(10,4) DEFAULT 0;

    -- Cursores
    DECLARE cur_location_product CURSOR FOR
        SELECT
            l.id AS id,
            IFNULL(lpd.stock, 0) AS stock,
            IFNULL(lpd.commited, 0) AS committed,
            IFNULL(lpd.stock - IFNULL(lpd.commited, 0), 0) AS available
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
                      AND im.is_locked = 1
                      AND im.location_id = ili.location_id
                      AND im.item_id = ili.item_id
                ) AS commited
            FROM inventories_locations_items ili
            JOIN inventories i ON i.id = ili.inventory_id
            WHERE ili.item_type = 'product'
              AND ili.item_id = pop_product_id
        ) lpd ON l.id = lpd.location_id
        ORDER BY available DESC;

    DECLARE cur_input CURSOR FOR
        SELECT 
            i.id AS input_id,
            i.name AS input_name,
            pi.equivalence,
            ili.location_id,
            inv.stock,
            IFNULL((
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'input'
                  AND im.movement_type = 'out'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = i.id
            ),0) AS committed_input,
            (inv.stock - IFNULL((
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'input'
                  AND im.movement_type = 'out'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = i.id
            ),0)) AS available_input
        FROM products_inputs pi
        JOIN inputs i ON i.id = pi.input_id
        JOIN inventories_locations_items ili ON ili.item_id = i.id AND ili.item_type = 'input'
        JOIN inventories inv ON inv.id = ili.inventory_id
        WHERE pi.product_id = pop_product_id
          AND ili.location_id = location_id_cursor;

    -- Handlers
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_location = 1;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done_input = 1;

    -- Obtener el producto y cantidad
    SELECT pop.product_id, pop.qty
    INTO pop_product_id, pop_qty
    FROM purchased_orders_products pop
    WHERE pop.id = pop_id;

    -- Abrir cursor de locations
    OPEN cur_location_product;

    read_loop: LOOP
        FETCH cur_location_product INTO location_id_cursor, stock, committed, available;

        IF done_location = 1 THEN
            LEAVE read_loop;
        END IF;

        IF pop_qty <= available THEN
            -- Hay suficiente stock en esta ubicación
            SET qty_committed = pop_qty;
            SET location_id_final = location_id_cursor;
            SET differencial = 0;
            LEAVE read_loop;
        ELSE
            -- No hay suficiente stock, checar insumos
            SET qty_committed = available;
            SET differencial = pop_qty - available;
            SET bandera_input = TRUE;

            -- Revisar insumos
            SET done_input = 0;
            OPEN cur_input;

            input_loop: LOOP
                FETCH cur_input INTO input_id, input_name, equivalence, location_id_input, stock_input, committed_input, available_input;

                IF done_input = 1 THEN
                    LEAVE input_loop;
                END IF;

                IF bandera_input = TRUE THEN
                    IF (differencial * equivalence) <= available_input THEN
                        SET location_id_final = location_id_cursor;
                    ELSE
                        SET bandera_input = FALSE;
                        SET location_id_final = NULL;
                    END IF;
                END IF;
            END LOOP input_loop;

            CLOSE cur_input;
        END IF;

        -- Si ya encontramos una ubicación válida, salir
        IF location_id_final IS NOT NULL THEN
            LEAVE read_loop;
        END IF;

    END LOOP read_loop;

    CLOSE cur_location_product;

    -- Salida final
    IF location_id_final IS NOT NULL THEN
        SET json_info = JSON_OBJECT(
            'location_id', location_id_final,
            'qty', pop_qty,
            'commited', qty_committed,
            'production', differencial
        );
    ELSE
        SET json_info = JSON_OBJECT(
            'location_id', NULL,
            'qty', NULL,
            'commited', NULL,
            'production', NULL
        );
    END IF;

    SELECT json_info;

END //

DELIMITER ;


/* sassssssssssssssssssssssssssssssss */

DELIMITER //

CREATE PROCEDURE asigne_location_to_pop(
    IN pop_id INT
)
BEGIN
    -- Variables generales
    DECLARE pop_product_id INT DEFAULT 0;
    DECLARE pop_qty DECIMAL(10,4) DEFAULT 0;
    DECLARE location_id_final INT DEFAULT NULL;
    DECLARE differencial DECIMAL(10,4) DEFAULT 0;
    DECLARE qty_committed DECIMAL(10,4) DEFAULT 0;
    DECLARE bandera_input BOOLEAN DEFAULT TRUE;
    DECLARE json_info JSON DEFAULT NULL;

    -- Variables para control de cursores
    DECLARE done INT DEFAULT 0;

    -- Variables para producto
    DECLARE location_id_cursor INT DEFAULT NULL;
    DECLARE stock DECIMAL(10,4) DEFAULT 0;
    DECLARE committed DECIMAL(10,4) DEFAULT 0;
    DECLARE available DECIMAL(10,4) DEFAULT 0;

    -- Variables para input
    DECLARE input_id INT DEFAULT NULL;
    DECLARE input_name VARCHAR(255) DEFAULT NULL;
    DECLARE equivalence DECIMAL(10,4) DEFAULT 0;
    DECLARE location_id_input INT DEFAULT NULL;
    DECLARE stock_input DECIMAL(10,4) DEFAULT 0;
    DECLARE committed_input DECIMAL(10,4) DEFAULT 0;
    DECLARE available_input DECIMAL(10,4) DEFAULT 0;

    -- Cursores
    DECLARE cur_location_product CURSOR FOR
        SELECT
            l.id AS id,
            IFNULL(lpd.stock, 0) AS stock,
            IFNULL(lpd.commited, 0) AS committed,
            IFNULL(lpd.stock - IFNULL(lpd.commited, 0), 0) AS available
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
                      AND im.is_locked = 1
                      AND im.location_id = ili.location_id
                      AND im.item_id = ili.item_id
                ) AS commited
            FROM inventories_locations_items ili
            JOIN inventories i ON i.id = ili.inventory_id
            WHERE ili.item_type = 'product'
              AND ili.item_id = pop_product_id
        ) lpd ON l.id = lpd.location_id
        ORDER BY available DESC;

    DECLARE cur_input CURSOR FOR
        SELECT 
            i.id AS input_id,
            i.name AS input_name,
            pi.equivalence,
            ili.location_id,
            inv.stock,
            IFNULL((
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'input'
                  AND im.movement_type = 'out'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = i.id
            ),0) AS committed_input,
            (inv.stock - IFNULL((
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'input'
                  AND im.movement_type = 'out'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = i.id
            ),0)) AS available_input
        FROM products_inputs pi
        JOIN inputs i ON i.id = pi.input_id
        JOIN inventories_locations_items ili ON ili.item_id = i.id AND ili.item_type = 'input'
        JOIN inventories inv ON inv.id = ili.inventory_id
        WHERE pi.product_id = pop_product_id
          AND ili.location_id = location_id_cursor;

    -- Handler único
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    -- Inicio de la lógica
    SELECT pop.product_id, pop.qty
    INTO pop_product_id, pop_qty
    FROM purchased_orders_products pop
    WHERE pop.id = pop_id;

    -- Abrir cursor de locations
    SET done = 0;
    OPEN cur_location_product;

    read_loop: LOOP
        FETCH cur_location_product INTO location_id_cursor, stock, committed, available;

        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        IF pop_qty <= available THEN
            -- Hay suficiente stock en esta ubicación
            SET qty_committed = pop_qty;
            SET location_id_final = location_id_cursor;
            SET differencial = 0;
            LEAVE read_loop;
        ELSE
            -- No hay suficiente stock, checar insumos
            SET qty_committed = available;
            SET differencial = pop_qty - available;
            SET bandera_input = TRUE;

            -- Revisar insumos
            SET done = 0;
            OPEN cur_input;

            input_loop: LOOP
                FETCH cur_input INTO input_id, input_name, equivalence, location_id_input, stock_input, committed_input, available_input;

                IF done = 1 THEN
                    LEAVE input_loop;
                END IF;

                IF bandera_input = TRUE THEN
                    IF (differencial * equivalence) <= available_input THEN
                        SET location_id_final = location_id_cursor;
                    ELSE
                        SET bandera_input = FALSE;
                        SET location_id_final = NULL;
                    END IF;
                END IF;
            END LOOP input_loop;

            CLOSE cur_input;
        END IF;

        -- Si ya encontramos una ubicación válida, salir
        IF location_id_final IS NOT NULL THEN
            LEAVE read_loop;
        END IF;

        -- Reseteamos done para el siguiente fetch del location
        SET done = 0;

    END LOOP read_loop;

    CLOSE cur_location_product;

    -- Salida final
    IF location_id_final IS NOT NULL THEN
        SET json_info = JSON_OBJECT(
            'location_id', location_id_final,
            'qty', pop_qty,
            'commited', qty_committed,
            'production', differencial
        );
    ELSE
        SET json_info = JSON_OBJECT(
            'location_id', NULL,
            'qty', NULL,
            'commited', NULL,
            'production', NULL
        );
    END IF;

    SELECT json_info;

END //

DELIMITER ;


CALL asigne_location_to_pop(1);


DELIMITER //
CREATE PROCEDURE movements_inputs_production(
    IN in_pop_id INT,
    IN in_product_id INT,
    IN in_location_id INT,
    IN in_location_name VARCHAR(100),
    IN in_qty DECIMAL(10,4),
    IN in_production_id INT
)
BEGIN

    -- Variables para control de cursores
    DECLARE done INT DEFAULT 0;

    -- Variables generales
    DECLARE input_id INT DEFAULT 0;
    DECLARE input_name VARCHAR(100) DEFAULT "";
    DECLARE equivalence DECIMAL(10,4) DEFAULT 0;
    DECLARE qty_input DECIMAL(10,4) DEFAULT 0;

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
            qty_input, 'out', in_production_id, 'production',
            'Production of order', 1
        );

    END LOOP read_loop;

    CLOSE input_cursor;

END //
DELIMITER ;



DELIMITER //
CREATE PROCEDURE asigned_internal_order_production_line(
    IN in_location_id,
    IN in_product_id,
    IN in_qty,
    IN internal_order_id
)
BEGIN

    DECLARE v_production_line_id INT DEFAULT 0;
    DECLARE done INT DEFAULT FALSE;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SET v_production_line_id = asign_production_line(v_location_id,v_product_id);

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
END // 
DELIMITER ;

















