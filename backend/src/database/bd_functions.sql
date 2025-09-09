USE u482698715_shau_erp;
/**/
DELIMITER //
CREATE FUNCTION asign_production_line(
	in_location_id INT, 
	in_product_id INT
)
RETURNS INT
DETERMINISTIC
BEGIN
	DECLARE v_production_line_id INT DEFAULT 0;
	DECLARE v_workload DECIMAL(10,4) DEFAULT 0;
	SELECT 
		pl.id,
		(
			IFNULL((
				SELECT
					SUM(po.qty)
				FROM purchased_orders_products AS pop
				JOIN purchased_orders_products_locations_production_lines AS poppl
					ON poppl.purchase_order_product_id = pop.id
					AND poppl.production_line_id = pl.id
				JOIN production_orders AS po
					ON po.order_type = 'client'
					AND po.order_id = pop.id
				WHERE
					pop.product_id = p.id
					AND po.status != 'completed'
			), 0)
			+
			IFNULL((
				SELECT
					SUM(po.qty)
				FROM internal_product_production_orders AS ippo
				JOIN internal_production_orders_lines_products AS ipolp
					ON ipolp.internal_product_production_order_id = ippo.id
					AND ipolp.production_line_id = pl.id
				JOIN production_orders AS po
					ON po.order_type = 'internal'
					AND po.order_id = ippo.id
				WHERE
					ippo.product_id = p.id 
					AND po.status != 'completed'
			), 0)
		) AS workload_pop
	INTO
		v_production_line_id, v_workload
	FROM production_lines AS pl
	JOIN locations_production_lines AS lpl
		ON lpl.production_line_id = pl.id
	JOIN locations AS l
		ON l.id = lpl.location_id
	JOIN production_lines_products AS plp
		ON plp.production_line_id = pl.id
	JOIN products AS p
		ON p.id = plp.product_id
	WHERE
		p.id = in_product_id
	AND 
		l.id = in_location_id
	ORDER BY workload_pop ASC
	LIMIT 1;
	RETURN v_production_line_id;
END //
DELIMITER ;


/***/
DELIMITER // 
CREATE FUNCTION is_production_order_completed(
  in_production_order_id INT  
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_order_qty DECIMAL(10,4) DEFAULT 0;
  DECLARE v_production_qty DECIMAL(10,4) DEFAULT 0;
  DECLARE v_flag BOOLEAN DEFAULT FALSE;
  SELECT
      po.qty,
      IFNULL((
          SELECT
              SUM(p.qty)
          FROM productions as p
          WHERE p.production_order_id = po.id
      ),0)
  INTO
    v_order_qty, v_production_qty
  FROM
      production_orders AS po
  WHERE po.id = in_production_order_id;

  IF v_order_qty = v_production_qty THEN
    SET v_flag = TRUE;
  END IF;
  RETURN v_flag;
END //
DELIMITER ; 



/**/
DELIMITER //
CREATE FUNCTION is_order_completed(
	in_order_id INT,
	in_order_type VARCHAR(100)
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE v_flag BOOLEAN DEFAULT FALSE;
	DECLARE v_order_qty DECIMAL(10,4) DEFAULT 0.00;
	DECLARE v_production_qty DECIMAL(10,4) DEFAULT 0.00;
	DECLARE v_committed_qty DECIMAL(10,4) DEFAULT 0.00;

	IF in_order_type = 'client' THEN
		SELECT 
			pop.qty,
			IFNULL((
				SELECT 
					SUM(p.qty)
				FROM productions AS p
				WHERE p.production_order_id IN (
					SELECT id FROM production_orders
					WHERE order_type = 'client'
					AND status = 'completed'
					AND order_id = pop.id
				)
			),0),
			IFNULL((
				SELECT 
					SUM(im.qty)
				FROM inventory_movements AS im
				WHERE im.reference_type = 'Order'
				AND im.description = 'Inventory Allocation'
                AND im.item_type = 'product'
				AND im.reference_id = pop.id
			),0)
		INTO v_order_qty, v_production_qty, v_committed_qty
		FROM purchased_orders_products AS pop
		WHERE pop.id = in_order_id;

		IF v_committed_qty + v_production_qty >= v_order_qty THEN
			SET v_flag = TRUE;
		END IF;

	ELSE
		SELECT
			ippo.qty,
			IFNULL((
				SELECT 
					SUM(p.qty)
				FROM productions AS p
				WHERE p.production_order_id IN (
					SELECT id FROM production_orders
					WHERE order_type = 'internal'
					AND status = 'completed'
					AND order_id = ippo.id
				)
			), 0)
		INTO v_order_qty, v_production_qty
		FROM internal_product_production_orders AS ippo
		WHERE ippo.id = in_order_id;

		IF v_production_qty >= v_order_qty THEN
			SET v_flag = TRUE;
		END IF;
	END IF;

	RETURN v_flag;
END //
DELIMITER ;

/**/
DELIMITER //
CREATE FUNCTION is_pop_ordered_completetaly(
  in_pop_id INT
)
RETURNS JSON
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_flag BOOLEAN DEFAULT FALSE;
  DECLARE v_order_qty DECIMAL(10,4) DEFAULT 0.00;
  DECLARE v_production_qty DECIMAL(10,4) DEFAULT 0.00;
  DECLARE v_committed_qty DECIMAL(10,4) DEFAULT 0.00;

  -- Obtener la cantidad pedida (orden)
  SELECT IFNULL(pop.qty,0)
  INTO v_order_qty
  FROM purchased_orders_products AS pop
  WHERE pop.id = in_pop_id;
  
  -- No existe la orden
  IF v_order_qty > 0 THEN
  
      -- Sumar inventario comprometido
	  SELECT IFNULL(SUM(im.qty),0)
	  INTO v_production_qty
	  FROM inventory_movements AS im
	  WHERE im.reference_type IN ('Order', 'Production order')
		AND im.item_type = 'product'
		AND im.reference_id IN ( 
			SELECT id 
			FROM production_orders AS po 
			WHERE po.order_type='client' AND po.order_id = in_pop_id
		) AND im.description = 'Production Allocation';
	
    -- Sumar inventario comprometido
	  SELECT IFNULL(SUM(im.qty),0)
	  INTO v_committed_qty
	  FROM inventory_movements AS im
	  WHERE im.reference_type = 'Order'
		AND im.item_type = 'product'
		AND im.reference_id = in_pop_id
		AND im.description = 'Inventory Allocation';
        
		-- Verificar si se completó
	  IF (v_committed_qty + v_production_qty) >= v_order_qty THEN
		SET v_flag = TRUE;
	  END IF;
  END IF;
  
  RETURN JSON_OBJECT(
	'status', v_flag,
    'original_order_qty', v_order_qty, 
	'order_committed_qty',  v_committed_qty,
    'order_production_qty', v_production_qty
  );
END //
DELIMITER ;


/**/
DELIMITER //
CREATE FUNCTION order_has_production(
	in_order_id INT,
	in_order_type VARCHAR(100)
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE V_order_has_production BOOLEAN DEFAULT FALSE;
	DECLARE v_production_qty DECIMAL(10,4) DEFAULT 0.00;
	IF in_order_type = 'client' THEN
		SELECT
			IFNULL((
				SELECT SUM(p.qty)
				FROM productions AS p
				JOIN production_orders AS po
					ON po.id = p.production_order_id
					AND po.order_type = 'client'
					AND po.order_id = pop.id
			),0) as production_qty
		INTO v_production_qty
		FROM purchased_orders_products AS pop
		WHERE pop.id = in_order_id;
	ELSE
		SELECT
			IFNULL((
				SELECT SUM(p.qty)
				FROM productions AS p
				JOIN production_orders AS po
					ON po.id = p.production_order_id
					AND po.order_type = 'internal'
					AND po.order_id = ippo.id
			),0) as production_qty
		INTO v_production_qty
		FROM internal_product_production_orders AS ippo
		WHERE ippo.id = in_order_id;
	END IF;

	IF v_production_qty > 0 THEN
		SET V_order_has_production = TRUE;
	END IF;

	RETURN V_order_has_production;
END //
DELIMITER ;


/**/
DELIMITER //
CREATE FUNCTION is_purchased_order_shipped(order_id INT)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE areShipped BOOLEAN DEFAULT FALSE;
    DECLARE total_po INT DEFAULT 0;
    DECLARE total_shipped INT DEFAULT 0;
    SELECT 
		IFNULL(COUNT(*),0), 
		IFNULL(COUNT(CASE WHEN pop.status = 'shipping' THEN 1 END),0)
    INTO total_po, total_shipped
    FROM purchased_orders_products as pop
    WHERE pop.purchase_order_id = order_id;
    IF total_po>0 AND total_po = total_shipped THEN
		SET areShipped = TRUE;
    END IF;
    RETURN areShipped;
END //
DELIMITER ;

DELIMITER //
CREATE FUNCTION func_is_location_has_inventory(
	in_location_id INT
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
	-- VARIABLES PARA DETERMINAR SI LA UBICACIÓN TIENE INVENTARIO
	DECLARE v_is_location_has_inventory BOOLEAN DEFAULT FALSE;
	-- VARIABLE PARA ALMACENAR LA CANTIDAD TOTAL DE INVENTARIO EN LA UBICACIÓN
	DECLARE v_total_inventory DECIMAL(10,4) DEFAULT 0.00;
	-- MANEJO DE ERRORES PARA CUANDO NO SE ENCUENTRA LA UBICACIÓN
	-- (EN ESTE CASO, SE ASUME QUE NO HAY INVENTARIO)
	DECLARE CONTINUE HANDLER FOR NOT FOUND BEGIN
		SET v_total_inventory = 0;
	END;

	-- VERIFICAR SI LA UBICACIÓN EXISTE
	IF in_location_id IS NULL OR in_location_id <= 0 THEN
		RETURN v_is_location_has_inventory;
	END IF;

	-- OBTENER LA CANTIDAD TOTAL DE INVENTARIO EN LA UBICACIÓN
	SELECT 
		IFNULL(SUM(i.stock), 0)
	INTO v_total_inventory
    FROM locations AS l
    JOIN inventories_locations_items AS ili
    ON ili.location_id = l.id
    JOIN inventories AS i
    ON i.id = ili.inventory_id
    WHERE l.id = in_location_id
	LIMIT 1;

	-- SI LA CANTIDAD ES MAYOR A CERO, SE CONSIDERA QUE HAY INVENTARIO
	IF v_total_inventory > 0 THEN
		SET v_is_location_has_inventory = TRUE;
	END IF;

	-- RETORNAR EL RESULTADO (TRUE: HAY INVENTARIO, FALSE: NO HAY INVENTARIO)
	RETURN v_is_location_has_inventory;
END //
DELIMITER ;


DELIMITER //
CREATE FUNCTION func_validate_delete_product(
	in_product_id INT
)
RETURNS JSON
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE v_production_client INT DEFAULT 0;
    DECLARE v_production_internal INT DEFAULT 0;
    DECLARE v_production_total INT DEFAULT 0;
    DECLARE v_qty_inventory INT DEFAULT 0;

    -- Obtener inventario disponible
    BEGIN
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_qty_inventory = 0;

        SELECT IFNULL(SUM(stock), 0)
        INTO v_qty_inventory 
        FROM products AS p
        JOIN inventories_locations_items AS ili
          ON ili.item_id = p.id
        JOIN inventories AS i
          ON i.id = ili.inventory_id
        WHERE p.id = in_product_id
          AND ili.item_type = 'product';
    END;

    -- Producción pendiente tipo cliente
    BEGIN
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_production_client = 0;

        SELECT IFNULL(SUM(po.qty), 0)
        INTO v_production_client
        FROM products AS p
        JOIN purchased_orders_products AS pop
          ON pop.product_id = p.id
        JOIN production_orders AS po
          ON po.order_id = pop.id
        WHERE p.id = in_product_id
          AND po.order_type = 'client'
          AND po.status = 'pending';
    END;

    -- Producción pendiente tipo interna
    BEGIN
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_production_internal = 0;

        SELECT IFNULL(SUM(po.qty), 0)
        INTO v_production_internal
        FROM products AS p
        JOIN internal_product_production_orders AS ippo
          ON ippo.product_id = p.id
        JOIN production_orders AS po
          ON po.order_id = ippo.id
        WHERE p.id = in_product_id
          AND po.order_type = 'internal'
          AND po.status = 'pending';
    END;

    SET v_production_total = v_production_client + v_production_internal;

    RETURN JSON_OBJECT(
		'pending_production_qty', v_production_total,
        'inventory_qty', v_qty_inventory
    );
END //
DELIMITER ;


DELIMITER //
CREATE FUNCTION func_line_pending_production_summary(
	in_production_line_id INT
)
RETURNS JSON
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE v_internal_production_qty INT DEFAULT 0;
	DECLARE v_client_production_qty INT DEFAULT 0;

	-- Obtener cantidad de producción pendiente tipo "client"
	SELECT 
		IFNULL(SUM(po.qty), 0)
	INTO v_client_production_qty
	FROM production_lines AS p
	JOIN purchased_orders_products_locations_production_lines AS poppl 
		ON poppl.production_line_id = p.id
	JOIN purchased_orders_products AS pop 
		ON pop.id = poppl.purchase_order_product_id
	JOIN production_orders AS po 
		ON po.order_id = pop.id
	WHERE p.id = in_production_line_id
	  AND po.order_type = 'client'
	  AND po.status = 'pending';

	-- Obtener cantidad de producción pendiente tipo "internal"
	SELECT 
		IFNULL(SUM(po.qty), 0)
	INTO v_internal_production_qty
	FROM production_lines AS p
	JOIN internal_production_orders_lines_products AS ipolp 
		ON ipolp.production_line_id = p.id
	JOIN internal_product_production_orders AS ippo
		ON ippo.id = ipolp.internal_product_production_order_id 
	JOIN production_orders AS po 
		ON po.order_id = ippo.id
	WHERE p.id = in_production_line_id
	  AND po.order_type = 'internal'
	  AND po.status = 'pending';

	-- Retornar resultado en JSON
	RETURN JSON_OBJECT(
		'internal_production', v_internal_production_qty,
		'client_production', v_client_production_qty
	);
END //
DELIMITER ;

DROP FUNCTION IF EXISTS funct_get_info_location_stock_product;
DELIMITER //
CREATE FUNCTION funct_get_info_location_stock_product(
	in_product_id INT
)
RETURNS JSON
DETERMINISTIC
READS SQL DATA
BEGIN
  -- Variables
    DECLARE pop_product_id INT DEFAULT 0;
    DECLARE pop_product_name VARCHAR(100);
    DECLARE v_location_id INT;
    DECLARE v_location_name VARCHAR(100);
    DECLARE v_available DECIMAL(10,4);
    DECLARE v_stock DECIMAL(10,4);
    DECLARE v_maximum_stock DECIMAL(10,4);
    DECLARE v_minimum_stock DECIMAL(10,4);
    DECLARE result JSON;

    -- 1. Obtener datos del producto
    SELECT p.name, p.id
    INTO pop_product_name, pop_product_id
    FROM products p
    WHERE p.id = in_product_id;

    -- 2. Crear tabla temporal
    DROP TEMPORARY TABLE IF EXISTS temp_locations;
    CREATE TEMPORARY TABLE temp_locations AS
    SELECT
        l.id AS location_id,
        l.name AS location_name,
        lpd.minimum_stock AS minimum_stock,
        lpd.maximum_stock AS maximum_stock,
        IFNULL(lpd.stock, 0) AS stock,
        IFNULL(lpd.commited, 0) AS committed,
        (IFNULL(lpd.stock, 0) - IFNULL(lpd.commited, 0)) AS available
    FROM locations l
    JOIN locations_location_types llt ON llt.location_id = l.id
    JOIN location_types lt ON lt.id = llt.location_type_id
    JOIN (
        SELECT
            ili.item_id,
            i.stock,
            i.minimum_stock,
            i.maximum_stock,
            ili.location_id,
            (
                SELECT SUM(im.qty)
                FROM inventory_movements im
                WHERE im.item_type = 'product'
                  AND im.movement_type = 'allocate'
                  AND im.reference_type NOT IN ('Transfer', 'Scrap')
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

    -- 3. Obtener la ubicación con más stock
    SELECT location_id, location_name, available, stock, maximum_stock, minimum_stock
    INTO v_location_id, v_location_name, v_available, v_stock, v_maximum_stock, v_minimum_stock
    FROM temp_locations
    ORDER BY available DESC
    LIMIT 1;

    -- 4. Generar JSON o NULL
    IF v_location_id IS NOT NULL THEN
        SET result = JSON_OBJECT(
            'location_id', v_location_id,
            'location_name', v_location_name,
            'stock', v_stock,
            'maximum_stock', v_maximum_stock,
            'minimum_stock', v_minimum_stock,
            'available', v_available,
            'product_id', pop_product_id,
            'product_name', pop_product_name
        );
    ELSE
        SET result = NULL;
    END IF;

    RETURN result;
END //
DELIMITER ;


DELIMITER //
CREATE FUNCTION funct_client_has_pos_active(
	in_client_id INT
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE v_has_order_active BOOLEAN DEFAULT FALSE;
    SELECT 
		IFNULL(COUNT(*), 0) > 0
	INTO v_has_order_active
    FROM purchased_orders
    WHERE client_id = in_client_id
    AND status = 'pending';
	RETURN v_has_order_active;
END //
DELIMITER ;

DELIMITER //
CREATE FUNCTION func_input_is_asigned_product(
	in_input_id INT
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE v_is_asigned BOOLEAN DEFAULT FALSE;
    SELECT 
		IFNULL(COUNT(*), 0) > 0
	INTO v_is_asigned
    FROM products_inputs AS pi
    WHERE pi.input_id = in_input_id;
    RETURN v_is_asigned;
END //
DELIMITER ;

-- DROP FUNCTION IF EXISTS func_is_order_fully_shipped;
DELIMITER //
CREATE FUNCTION func_is_order_fully_shipped(
    in_purchase_order_product_id INT
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_is_fully_shipped BOOLEAN DEFAULT FALSE;

    SELECT
        pop.qty <= IFNULL(SUM(sopop.qty), 0)
    INTO v_is_fully_shipped
    FROM purchased_orders_products AS pop
    LEFT JOIN shipping_orders_purchased_order_products AS sopop
        ON sopop.purchase_order_product_id = pop.id
    WHERE pop.id = in_purchase_order_product_id
    GROUP BY pop.qty;

    RETURN v_is_fully_shipped;
END //
DELIMITER ;


-- DROP FUNCTION IF EXISTS func_generate_next_purchase_order_code;
DELIMITER //
CREATE FUNCTION func_generate_next_purchase_order_code()
RETURNS VARCHAR(100)
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE v_next_code VARCHAR(100);
	SELECT 
		CONCAT('PO-', AUTO_INCREMENT)
	INTO v_next_code
	FROM INFORMATION_SCHEMA.TABLES
	WHERE TABLE_NAME = 'purchased_orders'
  	AND TABLE_SCHEMA = DATABASE();
	RETURN v_next_code;
END //
DELIMITER ;

-- DROP FUNCTION IF EXISTS func_generate_next_shipping_order_code;
DELIMITER //
CREATE FUNCTION func_generate_next_shipping_order_code()
RETURNS VARCHAR(100)
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE v_next_code VARCHAR(100);
	SELECT 
		CONCAT('SO-', AUTO_INCREMENT)
	INTO v_next_code
	FROM INFORMATION_SCHEMA.TABLES
	WHERE TABLE_NAME = 'shipping_orders'
  	AND TABLE_SCHEMA = DATABASE();
	RETURN v_next_code;
END //
DELIMITER ;

DROP FUNCTION IF EXISTS func_get_production_summary_of_pop;
DELIMITER //
CREATE FUNCTION func_get_production_summary_of_pop(
    in_pop_id INT
)
RETURNS JSON
DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE v_production_summary JSON;
	DECLARE v_purchased_order_product_qty DECIMAL(14,4);
	DECLARE v_production_order_qty DECIMAL(14,4);
	DECLARE v_production_qty DECIMAL(14,4);

	SELECT
		IFNULL(pop.qty, 0),
		IFNULL(po_sum.production_order_qty, 0),
		IFNULL(p_sum.production_qty, 0)
	INTO
		v_purchased_order_product_qty,
		v_production_order_qty,
		v_production_qty
	FROM purchased_orders_products pop
	LEFT JOIN (
		SELECT order_id, SUM(qty) AS production_order_qty
		FROM production_orders
		WHERE order_type = 'client'
		AND status NOT IN ('cancel')
		GROUP BY order_id
	) po_sum ON po_sum.order_id = pop.id
	LEFT JOIN (
		SELECT po.order_id, SUM(p.qty) AS production_qty
		FROM productions p
		JOIN production_orders po ON p.production_order_id = po.id
		WHERE po.order_type = 'client'
		AND po.status NOT IN ('cancel')
		GROUP BY po.order_id
	) p_sum ON p_sum.order_id = pop.id
	WHERE pop.id = in_pop_id;

	SET v_production_summary = JSON_OBJECT(
		"purchased_order_product_qty", v_purchased_order_product_qty,
		"production_order_qty", v_production_order_qty,
		"production_qty", v_production_qty
	);

	RETURN v_production_summary;
END //
DELIMITER ;

DROP FUNCTION IF EXISTS funct_get_stock_available_of_pop_on_location;
DELIMITER //
CREATE FUNCTION funct_get_stock_available_of_pop_on_location(
	in_pop_id INT
)
RETURNS JSON
DETERMINISTIC
READS SQL DATA
BEGIN

    -- Variables
    DECLARE pop_product_id INT DEFAULT 0;
    DECLARE pop_product_name VARCHAR(100);
    DECLARE v_location_id INT;
    DECLARE v_location_name VARCHAR(100);
    DECLARE v_available DECIMAL(10,4);
    DECLARE v_stock DECIMAL(10,4);
    DECLARE v_maximum_stock DECIMAL(10,4);
    DECLARE v_minimum_stock DECIMAL(10,4);
    DECLARE result JSON;

    -- Handler para evitar error si SELECT ... INTO no devuelve filas
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_location_id = NULL;

    -- 1. Obtener datos del producto a partir del purchase_order_product_id
    SELECT p.name, p.id
    INTO pop_product_name, pop_product_id
    FROM purchased_orders_products pop
    JOIN products p ON p.id = pop.product_id
    WHERE pop.id = in_pop_id;

    -- 2. Crear tabla temporal con stock disponible en cada ubicación
    DROP TEMPORARY TABLE IF EXISTS temp_locations;
    CREATE TEMPORARY TABLE temp_locations AS
	WITH unique_locations AS (
		SELECT DISTINCT
			l.id AS location_id,
			l.name AS location_name
		FROM purchased_orders_products AS pop
		LEFT JOIN purchased_orders_products_locations_production_lines AS poplp
			ON poplp.purchase_order_product_id = pop.id
		LEFT JOIN production_lines AS pl
			ON pl.id = poplp.production_line_id
		LEFT JOIN locations_production_lines AS lpl
			ON lpl.production_line_id = pl.id
		LEFT JOIN locations AS l
			ON l.id = lpl.location_id
		LEFT JOIN locations_location_types AS llt 
			ON llt.location_id = l.id
		WHERE pop.id = in_pop_id
	)
	SELECT
		ul.location_id,
		ul.location_name,
		lpd.minimum_stock,
		lpd.maximum_stock,
		IFNULL(lpd.stock, 0) AS stock,
		IFNULL(lpd.commited, 0) AS committed,
		(IFNULL(lpd.stock, 0) - IFNULL(lpd.commited, 0)) AS available
	FROM unique_locations ul
	LEFT JOIN (
		SELECT
			ili.item_id,
			IFNULL(i.stock, 0) AS stock,
			i.minimum_stock,
			i.maximum_stock,
			ili.location_id,
			IFNULL((
				SELECT SUM(im.qty)
				FROM inventory_movements im
				WHERE im.item_type = 'product'
				AND im.movement_type = 'allocate'
				AND im.reference_type NOT IN ('Transfer', 'Scrap')
				AND im.is_locked = 1
				AND im.location_id = ili.location_id
				AND im.item_id = ili.item_id
			), 0) AS commited
		FROM inventories_locations_items ili
		JOIN inventories i ON i.id = ili.inventory_id
		WHERE ili.item_type = 'product'
		AND ili.item_id = pop_product_id
	) lpd ON ul.location_id = lpd.location_id;

    -- 3. Obtener la ubicación con más stock disponible
    SELECT location_id, location_name, available, stock, maximum_stock, minimum_stock
    INTO v_location_id, v_location_name, v_available, v_stock, v_maximum_stock, v_minimum_stock
    FROM temp_locations
    ORDER BY available DESC
    LIMIT 1;

    -- 4. Generar JSON o NULL si no hay ubicación
    IF v_location_id IS NOT NULL THEN
        SET result = JSON_OBJECT(
            'location_id', v_location_id,
            'location_name', v_location_name,
            'stock', v_stock,
            'maximum_stock', v_maximum_stock,
            'minimum_stock', v_minimum_stock,
            'available', v_available,
            'product_id', pop_product_id,
            'product_name', pop_product_name
        );
    ELSE
        SET result = NULL;
    END IF;

    RETURN result;
END //
DELIMITER ;

DROP FUNCTION IF EXISTS func_get_available_stock_item_on_location;
DELIMITER //
CREATE FUNCTION func_get_available_stock_item_on_location(
    in_location_id INT,
    in_item_id INT,
    in_item_type VARCHAR(100)
)
RETURNS DECIMAL(14,4)
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_available DECIMAL(14,4) DEFAULT 0.00;    
    SELECT
        (IFNULL(lpd.stock, 0) - IFNULL(lpd.commited, 0)) AS available
    INTO v_available
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
                WHERE im.item_type = in_item_type
                  AND im.movement_type = 'allocate'
                  AND im.reference_type NOT IN ('Transfer', 'Scrap')
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = ili.item_id
            ) AS commited
        FROM inventories_locations_items ili
        JOIN inventories i ON i.id = ili.inventory_id
        WHERE ili.item_type = in_item_type
          AND ili.item_id = in_item_id
    ) lpd ON l.id = lpd.location_id
    WHERE lt.name = 'Store'
    AND l.id = in_location_id
    ORDER BY available DESC; 

    RETURN v_available;
END //
DELIMITER ;


DROP FUNCTION IF EXISTS func_summary_shipping_on_client_order;
DELIMITER //
CREATE FUNCTION func_summary_shipping_on_client_order(
    pop_id INT
)
RETURNS JSON
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_purchased_order_product_qty DECIMAL(14,4) DEFAULT 0;
    DECLARE v_purchased_order_product_shipping_qty DECIMAL(14,4) DEFAULT 0;

    SELECT
        pop.qty,
        IFNULL(SUM(sopop.qty), 0)
    INTO
        v_purchased_order_product_qty,
        v_purchased_order_product_shipping_qty
    FROM purchased_orders_products AS pop
    LEFT JOIN shipping_orders_purchased_order_products AS sopop
        ON pop.id = sopop.purchase_order_product_id
    WHERE pop.id = pop_id
	GROUP BY pop.qty;
    
    RETURN JSON_OBJECT(
        'order_qty', v_purchased_order_product_qty,
        'shipping_qty', v_purchased_order_product_shipping_qty
    );
END //
DELIMITER ;


SELECT * FROM purchased_orders_products;
SELECT funct_get_stock_available_of_pop_on_location(4);
SELECT func_get_production_summary_of_pop(26);
SELECT * FROM purchased_orders_products;
SELECT func_generate_next_shipping_order_code();
SELECT func_generate_next_purchase_order_code();
SELECT func_validate_delete_product(2);
SELECT func_line_pending_production_summary(1);
SELECT funct_client_has_pos_active(1);
SELECT is_pop_ordered_completetaly(1);
SELECT func_is_location_has_inventory(1) AS has_inventory;
SELECT is_purchased_order_shipped(1);
SELECT order_has_production(1, 'client') AS has_production;
SELECT is_order_completed(1, 'client');
SELECT is_production_order_completed(1) AS validation;
SELECT asign_production_line(1,1) AS line;
SELECT funct_get_info_location_stock_product(1) AS line;

SELECT func_get_available_stock_item_on_location(
	1,1,"product"
);



DROP FUNCTION IF EXISTS func_get_inventory_locations_for_Inputs_of_product;
DELIMITER //
CREATE FUNCTION func_get_inventory_locations_for_Inputs_of_product(
	in_product_id INT,
	in_location_id INT
)
RETURNS JSON
NOT DETERMINISTIC
READS SQL DATA
BEGIN

	DECLARE json_agg JSON DEFAULT JSON_ARRAY();
	
	WITH products_inputs_temp AS (
		SELECT
			inp.id   AS input_id,
			inp.name AS input_name,
			pi.equivalence AS equivalence
		FROM products p
		JOIN products_inputs pi   
			ON pi.product_id = p.id
		JOIN inputs inp           
			ON inp.id = pi.input_id
		WHERE p.id = in_product_id
	),
	selected_location AS (
		SELECT l.id AS location_id
		FROM locations AS l
		JOIN locations_location_types AS llt 
			ON llt.location_id = l.id
		JOIN location_types AS lt          
			ON lt.id = llt.location_type_id
		WHERE lt.name = 'Store'
			AND l.id   = in_location_id
	),
	loc_product_stock AS (
		SELECT
			ili.item_id,
			ili.location_id,
			inv.stock,
			inv.minimum_stock,
			inv.maximum_stock,
			(
			SELECT COALESCE(SUM(im.qty), 0)
			FROM inventory_movements AS im
			WHERE im.item_type = 'input'
				AND im.movement_type = 'allocate'
				AND im.reference_type NOT IN ('Transfer', 'Scrap')
				AND im.is_locked = 1
				AND im.location_id = ili.location_id
				AND im.item_id = ili.item_id
			) AS commited
		FROM inventories_locations_items AS ili
		JOIN inventories AS inv 
			ON inv.id = ili.inventory_id
		JOIN selected_location AS 
			sl ON sl.location_id = ili.location_id
		WHERE ili.item_type = 'input'
	)
	SELECT
		COALESCE(
			JSON_ARRAYAGG(
				JSON_OBJECT(
						'input_id', pit.input_id,
						'input_name', pit.input_name,
						'equivalence', pit.equivalence,
						'stock', IFNULL(lps.stock, 0),
						'available', IFNULL(lps.stock, 0) - IFNULL(lps.commited, 0),
						'minimum_stock', lps.minimum_stock,
						'maximum_stock', lps.maximum_stock
					)
			), 
			JSON_ARRAY()
        )
	INTO json_agg
	FROM products_inputs_temp AS pit
	LEFT JOIN loc_product_stock AS lps
		ON lps.item_id = pit.input_id;
        
	RETURN json_agg;
END //
DELIMITER ;



DROP FUNCTION IF EXISTS func_get_product_production_locations;
DELIMITER //
CREATE FUNCTION func_get_product_production_locations(
	in_product_id INT
)
RETURNS JSON
NOT DETERMINISTIC
READS SQL DATA
BEGIN
	DECLARE json_agg JSON DEFAULT JSON_ARRAY();

	SELECT
		COALESCE(
			JSON_ARRAYAGG(
				JSON_OBJECT(
					'id', l.id,
					'name', l.name,
					'description', l.description,
					'is_active', l.is_active,
					'created_at', l.created_at,
					'updated_at', l.updated_at
				)
			),
			JSON_ARRAY()
		)
	INTO json_agg
	FROM locations AS l
	JOIN locations_location_types AS llt 
		ON llt.location_id = l.id
	JOIN location_types AS lt 
		ON lt.id = llt.location_type_id
	JOIN inventories_locations_items AS ili 
		ON ili.location_id = l.id
	JOIN inventories AS inv 
		ON inv.id = ili.inventory_id
	WHERE lt.name = 'Store'
	AND ili.item_type = 'product'
	AND ili.item_id = in_product_id;
    
	RETURN json_agg;
END //
DELIMITER ;


USE u482698715_shau_erp;

DROP FUNCTION IF EXISTS func_get_extra_data_production_order;
DELIMITER //
CREATE FUNCTION func_get_extra_data_production_order(
    in_order_id INT,
    in_order_type VARCHAR(100)
)
RETURNS JSON
NOT DETERMINISTIC
READS SQL DATA
BEGIN

    DECLARE extra_data JSON;
    DECLARE v_location JSON DEFAULT NULL;
    DECLARE v_production_line JSON DEFAULT NULL;
    DECLARE v_production_qty DECIMAL(14, 4) DEFAULT 0;
    DECLARE v_scrap_qty DECIMAL(14, 4) DEFAULT 0;

    -- Obtener la cantidad de producida y desecho de la orden de produccion
    SELECT 
        IFNULL(SUM(p.qty), 0),
        IFNULL(SUM(s.qty), 0)
    INTO 
        v_production_qty,
        v_scrap_qty
    FROM production_orders AS po
    LEFT JOIN productions AS p
        ON p.id = po.order_id
    LEFT JOIN scrap AS s
        ON s.reference_id = po.id
        AND s.reference_type = 'Production'
    WHERE po.id = in_order_id
        AND po.order_type = in_order_type;

    IF in_order_type = 'client' THEN

        -- Obtener datos extra de la orden de produccion
        SELECT 
            JSON_OBJECT(
                'id', l.id,
                'name', l.name,
                'description', l.description,
                'is_active', l.is_active,
                'created_at', l.created_at,
                'updated_at', l.updated_at
            ),
            JSON_OBJECT(
                'id', pl.id,
                'name', pl.name,
                'is_active', pl.is_active,
                'created_at', pl.created_at,
                'updated_at', pl.updated_at
            )
        INTO 
            v_location,
            v_production_line
        FROM production_orders AS po
        LEFT JOIN purchased_orders_products AS pop
            ON pop.id = po.order_id
        LEFT JOIN purchased_orders_products_locations_production_lines AS poplpl
            ON poplpl.purchase_order_product_id = pop.id
        LEFT JOIN production_lines AS pl
            ON pl.id = poplpl.production_line_id
        LEFT JOIN locations_production_lines AS lpl
            ON lpl.production_line_id = pl.id
        LEFT JOIN locations AS l
            ON l.id = lpl.location_id
        WHERE 
            po.id = in_order_id
            AND po.order_type = in_order_type;

    ELSE

        -- Obtener datos extra de la orden de produccion
        SELECT 
            JSON_OBJECT(
                'id', l.id,
                'name', l.name,
                'description', l.description,
                'is_active', l.is_active,
                'created_at', l.created_at,
                'updated_at', l.updated_at
            ),
            JSON_OBJECT(
                'id', pl.id,
                'name', pl.name,
                'is_active', pl.is_active,
                'created_at', pl.created_at,
                'updated_at', pl.updated_at
            )
        INTO 
            v_location,
            v_production_line
        FROM production_orders AS po
        LEFT JOIN internal_product_production_orders AS ippo
            ON ippo.id = po.order_id
        LEFT JOIN internal_production_orders_lines_products AS ipolp
            ON ipolp.internal_product_production_order_id = ippo.id
        LEFT JOIN production_lines AS pl
            ON pl.id = ipolp.production_line_id
        LEFT JOIN locations_production_lines AS lpl
            ON lpl.production_line_id = pl.id
        LEFT JOIN locations AS l
            ON l.id = lpl.location_id
        WHERE 
            po.id = in_order_id
            AND po.order_type = in_order_type;

    END IF;

    -- Crear el JSON con los datos extra
    SET extra_data = JSON_OBJECT(
        'location', v_location,
        'production_line', v_production_line,
        'production_qty', v_production_qty,
        'scrap_qty', v_scrap_qty
    );

    RETURN extra_data;

END //
DELIMITER ;


DROP FUNCTION IF EXISTS get_extra_date_purchased_order_detail;
DELIMITER //
CREATE FUNCTION get_extra_date_purchased_order_detail(
	in_order_id INT,
	in_order_type VARCHAR(100)
)
RETURNS JSON
NOT DETERMINISTIC
READS SQL DATA
BEGIN

	DECLARE v_extra_data JSON DEFAULT JSON_OBJECT();

	IF in_order_type = 'client' THEN
    
		SELECT
			JSON_OBJECT(
				'location', JSON_OBJECT(
					'id', l.id,
					'name', l.name,
					'description', l.description,
					'is_active', l.is_active,
					'created_at', l.created_at,
					'updated_at', l.updated_at
				),
				'production_line', JSON_OBJECT(
					'id', pl.id,
					'name', pl.name,
					'is_active', pl.is_active,
					'created_at', pl.created_at,
					'updated_at', pl.updated_at
				),
				'purchase_order', JSON_OBJECT(
					'id', pos.id,
					'order_code', pos.order_code,
					'delivery_date', pos.delivery_date,
					'status', pos.status,
					'client_id', pos.client_id,
					'company_name', pos.company_name,
					'tax_id', pos.tax_id,
					'email', pos.email,
					'phone', pos.phone,
					'city', pos.city,
					'state', pos.state,
					'country', pos.country,
					'address', pos.address,
					'payment_terms', pos.payment_terms,
					'zip_code', pos.zip_code,
					'tax_regimen', pos.tax_regimen,
					'cfdi', pos.cfdi,
					'payment_method', pos.payment_method,
					'client_address_id', pos.client_address_id,
					'shipping_address', pos.shipping_address,
					'shipping_city', pos.shipping_city,
					'shipping_state', pos.shipping_state,
					'shipping_country', pos.shipping_country,
					'shipping_zip_code', pos.shipping_zip_code,
					'total_price', pos.total_price,
					'created_at', pos.created_at,
					'updated_at', pos.updated_at,
					'purchase_order_products',
						(
							SELECT 
								COALESCE(
									JSON_ARRAYAGG(
										JSON_OBJECT(
											'id', pop2.id,
											'product_id', pop2.product_id,
											'product_name', pop2.product_name,
											'qty', pop2.qty,
											'status', pop2.status,
											'recorded_price', pop2.recorded_price,
											'original_price', pop2.original_price,
											'product', JSON_OBJECT(
												'id', p.id,
												'name', p.name,
												'description', p.description,
												'type', p.type,
												'sku', p.sku,
												'active', p.active,
												'sale_price', p.sale_price,
												'photo', p.photo,
												'created_at', p.created_at,
												'updated_at', p.updated_at
											)
										)
									),
									JSON_ARRAY()
								)
							FROM purchased_orders_products AS pop2
							LEFT JOIN products AS p
								ON p.id = pop2.product_id
							WHERE pop2.purchase_order_id = pos.id
						)
					)
			) AS payload
		INTO
			v_extra_data
		FROM production_orders AS po
		LEFT JOIN purchased_orders_products AS pop
			ON pop.id = po.order_id
		LEFT JOIN purchased_orders AS pos
			ON pos.id = pop.purchase_order_id
		LEFT JOIN purchased_orders_products_locations_production_lines AS poplpl
			ON poplpl.purchase_order_product_id = pop.id
		LEFT JOIN production_lines AS pl
			ON pl.id = poplpl.production_line_id
		LEFT JOIN locations_production_lines AS lpl
			ON lpl.production_line_id = pl.id
		LEFT JOIN locations AS l
			ON l.id = lpl.location_id
		WHERE pop.id = in_order_id
			AND po.order_type = in_order_type
		LIMIT 1;

	ELSE

		SELECT
		    COALESCE(
				JSON_OBJECT(
					'location', JSON_OBJECT(
						'id', l.id,
						'name', l.name,
						'description', l.description,
						'is_active', l.is_active,
						'created_at', l.created_at,
						'updated_at', l.updated_at
					),
					'production_line', JSON_OBJECT(
						'id', pl.id,
						'name', pl.name,
						'is_active', pl.is_active,
						'created_at', pl.created_at,
						'updated_at', pl.updated_at
					),
					'internal_order', JSON_OBJECT(
						'id', ippo.id,
						'product_id', ippo.product_id,
						'product_name', ippo.product_name,
						'qty', ippo.qty,
						'status', ippo.status,
						'location_id', ippo.location_id,
						'location_name', ippo.location_name,
						'created_at', ippo.created_at,
						'updated_at', ippo.updated_at
					)
				), 
				JSON_OBJECT()
			) AS payload
		INTO
			v_extra_data
		FROM production_orders AS po
		LEFT JOIN internal_product_production_orders AS ippo 
			ON ippo.id = po.order_id
		LEFT JOIN internal_production_orders_lines_products AS ipolp
			ON ipolp.internal_product_production_order_id = ippo.id
		LEFT JOIN production_lines AS pl
			ON pl.id = ipolp.production_line_id
		LEFT JOIN locations_production_lines AS lpl
			ON lpl.production_line_id = pl.id
		LEFT JOIN locations AS l
			ON l.id = lpl.location_id
		WHERE ippo.id = in_order_id
			AND po.order_type = in_order_type
		LIMIT 1;
	END IF;

	RETURN v_extra_data;
END //
DELIMITER ;









SELECT get_extra_date_purchased_order_detail(1, 'client');
select func_get_product_production_locations(1);
select func_get_extra_data_production_order(1, 'internal');









