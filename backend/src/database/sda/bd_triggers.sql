USE u482698715_shau_erp;

/****************************************
*		TABLE inventory_movements		*
****************************************/

DELIMITER //
CREATE TRIGGER trigger_created_inventory_movements
AFTER INSERT ON inventory_movements
FOR EACH ROW
BEGIN
	CALL update_inventory_stock_from_movement(
	NEW.location_id,
	NEW.item_id,
	NEW.item_type,
	NEW.qty,
	NEW.movement_type,
	NEW.is_locked
	);
END //
DELIMITER ;

/***/
DELIMITER //
CREATE TRIGGER trigger_update_inventory_movements
AFTER UPDATE ON inventory_movements
FOR EACH ROW
BEGIN
	IF NEW.movement_type = 'in' THEN
		IF NEW.is_locked = 1 AND OLD.is_locked =0 THEN
			CALL add_inventory_after_production(
			"decrement",
			NEW.location_id,
			NEW.item_id,
			NEW.item_type,
			NEW.qty
			);
		ELSEIF NEW.is_locked = 0 AND OLD.is_locked = 1 THEN
			CALL add_inventory_after_production(
			"increment",
			NEW.location_id,
			NEW.item_id,
			NEW.item_type,
			NEW.qty
			);  
		END IF;
	ELSE
		IF NEW.is_locked = 1 AND OLD.is_locked = 0 THEN
			CALL add_inventory_after_production(
			"increment",
			NEW.location_id,
			NEW.item_id,
			NEW.item_type,
			NEW.qty
			);	
		ELSEIF NEW.is_locked = 0 AND OLD.is_locked = 1 THEN
			CALL add_inventory_after_production(
			"decrement",
			NEW.location_id,
			NEW.item_id,
			NEW.item_type,
			NEW.qty
			);  
		END IF;
	END IF;
END //
DELIMITER ;


/****************************************
*	TABLE purchased_orders_products		*
****************************************/

/* Trigger en create
* Asignacion de location, linea automatica
* Crear orden de produccion si lo requiere
* Realizar movimientos de inventario a produccion si lo requiere
* Actualizar precio de la purchased_order
*/
DELIMITER //
CREATE TRIGGER trigger_insert_purchased_orders_products
AFTER INSERT ON purchased_orders_products
FOR EACH ROW
BEGIN
	-- CALL process_purchased_order_product_single(NEW.id);
	-- CALL update_purchased_order_total_price(NEW.purchase_order_id);
END//
DELIMITER ;

/* Trigger en delete
* (REQUISITO) NO TENER PRODUCCION EMPEZADA
* Eliminacion de la relacion con location, linea
* Eliminar ordenes de produccion de la purchased_order
* Eliminar los movimientos de inventario a produccion si lo requiere
* Actualizacion de precio de la purchased_order
*/
DELIMITER //
CREATE TRIGGER trigger_delete_purchased_orders_products
AFTER DELETE ON purchased_orders_products
FOR EACH ROW
BEGIN
	CALL delete_pending_production_order_by_reference(OLD.id, 'client');
    -- CALL revert_asign_purchased_order_product_after_update(OLD.id);
	-- CALL update_purchased_order_total_price(OLD.purchase_order_id);
END//
DELIMITER ;

/* Trigger para update
* (REQUISITO) NO TENER PRODUCCION EMPEZADA
* Eliminacion de la relacion con location, linea
* Eliminar ordenes de produccion de la purchased_order
* Eliminar los movimientos de inventario a produccion si lo requiere
* Asignacion de location, linea automatica
* Crear orden de produccion si lo requiere
* Realizar movimientos de inventario a produccion si lo requiere
* Actualizacion de precio de la purchased_order
*/
DELIMITER //
CREATE TRIGGER trigger_update_purchased_orders_products
AFTER UPDATE ON purchased_orders_products
FOR EACH ROW
BEGIN

	DECLARE v_location INT DEFAULT 0;

	SELECT location_id 
	INTO v_location
	FROM purchased_orders_products_locations_production_lines
	WHERE purchase_order_product_id = NEW.id
	LIMIT 1;

    IF NEW.status <> OLD.status THEN
		IF NEW.status = 'shipping' AND OLD.status = 'completed' THEN
			UPDATE inventory_movements
			SET is_locked = 0 
			WHERE reference_type = 'order'
			AND description IN ('Production order', 'Already in inventory')
			AND movement_type = 'out'
			AND item_type = 'product'
			AND (
				reference_id IN (
					SELECT id FROM production_orders
					WHERE order_type = 'client' 
					AND order_id = NEW.id
				)
				OR (
				reference_id = NEW.id
				)
			);
		END IF;
        IF NEW.status = 'completed' AND OLD.status = 'shipping' THEN
			UPDATE inventory_movements
			SET is_locked = 1 
			WHERE reference_type = 'order'
			AND description IN ('Production order', 'Already in inventory')
			AND movement_type = 'out'
			AND item_type = 'product'
			AND (
				reference_id IN (
					SELECT id FROM production_orders
					WHERE order_type = 'client' 
					AND order_id = NEW.id
				)
				OR (
				reference_id = NEW.id
				)
			);
        END IF;
	END IF;

	IF NEW.qty <> OLD.qty THEN
			UPDATE inventory_movements
			SET is_locked = 0 
			WHERE reference_type = 'order'
			AND description IN ('Production order', 'Already in inventory')
			AND movement_type = 'out'
			AND item_type = 'product'
			AND (
				reference_id IN (
					SELECT id FROM production_orders
					WHERE order_type = 'client' 
					AND order_id = NEW.id
				)
				OR (
				reference_id = NEW.id
				)
			);

			WITH inventory_data AS (
				SELECT
					ili.item_type,
					ili.item_id,
					ili.location_id,
					i.stock AS stock,
					i.id AS inventory_id,
				IFNULL(SUM(im.qty), 0) AS committed
				FROM inventories_locations_items AS ili
				JOIN inventories AS i ON i.id = ili.inventory_id
				LEFT JOIN inventory_movements AS im ON
				im.item_type = ili.item_type
				AND im.item_id = ili.item_id
				AND im.location_id = ili.location_id
				AND im.movement_type = 'out'
				AND im.reference_type != 'transfer' AND im.reference_type != 'scrap'
				AND im.is_locked = 1
				GROUP BY
					ili.item_type,
					ili.item_id,
					ili.location_id,
					i.stock,
					i.id
			),
			raw_inventory_inProduction AS (
				SELECT
				'product' AS item_type,
				po.product_id AS item_id,
				l.id AS location_id,
				po.qty
				FROM production_orders po
				LEFT JOIN purchased_orders_products pop ON po.order_type = 'client' AND pop.id = po.order_id
				LEFT JOIN internal_product_production_orders ippo ON po.order_type = 'internal' AND ippo.id = po.order_id
				LEFT JOIN internal_production_orders_lines_products ipolp ON ippo.id = ipolp.internal_product_production_order_id
				LEFT JOIN purchased_orders_products_locations_production_lines poplpl ON poplpl.purchase_order_product_id = pop.id
				JOIN locations_production_lines lpl ON (
				(po.order_type = 'client' AND lpl.production_line_id = poplpl.production_line_id)
				OR
				(po.order_type = 'internal' AND lpl.production_line_id = ipolp.production_line_id)
				)
				LEFT JOIN locations l ON l.id = lpl.location_id
				WHERE po.order_type IN ('client', 'internal')
				AND (po.product_id = pop.product_id OR po.product_id = ippo.product_id)
				AND po.status != 'completed'
			),
			inventory_inProduction AS (
				SELECT
				item_type,
				item_id,
				location_id,
				SUM(qty) AS qty
				FROM raw_inventory_inProduction
				GROUP BY item_type, item_id, location_id
			),
			inventory_produced AS (
				SELECT
				ili.item_type,
				ili.item_id,
				ili.location_id,
				IFNULL(SUM(
					CASE
					WHEN po.status = 'pending' THEN im.qty
					ELSE 0
					END
				), 0) AS produced
				FROM inventories_locations_items ili
				JOIN inventories i ON i.id = ili.inventory_id
				LEFT JOIN inventory_movements im ON
				im.item_type = ili.item_type
				AND im.item_id = ili.item_id
				AND im.location_id = ili.location_id
				AND im.movement_type = 'in'
				AND im.reference_type IN ('production', 'order')
				AND im.is_locked = 0
				LEFT JOIN production_orders AS po ON po.id = im.reference_id
				GROUP BY ili.item_type, ili.item_id, ili.location_id
			)
	END IF;

END //
DELIMITER ;

/***********************************************
*	 TABLE internal_product_production_order  *
***********************************************/

/* Trigger para eliminar orden interna
* (REQUISITO) NO TENER PRODUCCION EMPEZADA
* Para eliminar una orden interna no tiene que tener produccion empezada
*/

/*
DELIMITER //
CREATE TRIGGER trigger_create_internal_production_order
AFTER CREATE ON internal_product_production_orders
FOR EACH ROW
BEGIN

END //
DELIMITER ;
*/

DELIMITER //
CREATE TRIGGER trigger_delete_internal_production_order
AFTER DELETE ON internal_product_production_orders
FOR EACH ROW
BEGIN
	INSERT INTO debug_log(message) values(OLD.id);
	CALL revert_asign_internal_after_update(OLD.id);
	CALL delete_pending_production_order_by_reference(OLD.id, 'internal');
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trigger_update_internal_production_order
AFTER UPDATE ON internal_product_production_orders
FOR EACH ROW
BEGIN
/*
	IF NEW.status <> OLD.status THEN
		IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
			UPDATE inventory_movements
			SET is_locked = 0 
			WHERE reference_type = 'production'
			AND reference_id IN (
				SELECT id FROM production_orders
				WHERE order_type = 'internal' 
                AND order_id = NEW.id
                AND description = 'Internal production'
			);
		END IF;
		IF NEW.status = 'pending' AND OLD.status = 'completed' THEN
			UPDATE inventory_movements
			SET is_locked = 1 
			WHERE reference_type = 'production'
			AND reference_id IN (
				SELECT id FROM production_orders
				WHERE order_type = 'internal' 
                AND order_id = NEW.id
                AND description = 'Internal production'
			);
		END IF;
	END IF;
*/
END //
DELIMITER ;
	
/****************************************
*		TABLE productions		*
****************************************/

DELIMITER //
CREATE TRIGGER trigger_create_update_status_production_order
AFTER INSERT ON productions
FOR EACH ROW
BEGIN
	DECLARE v_order_type VARCHAR(100) DEFAULT '';
	DECLARE v_order_id INT DEFAULT 0;
    DECLARE v_location_id INT DEFAULT 0;
    DECLARE v_location_name VARCHAR(100) DEFAULT '';
    DECLARE v_product_id INT DEFAULT 0;
    DECLARE v_product_name VARCHAR(100) DEFAULT '';
    DECLARE v_qty DECIMAL(10,4) DEFAULT NEW.qty;
    DECLARE v_reference_type VARCHAR(100) DEFAULT '';
    DECLARE v_description VARCHAR(100) DEFAULT '';
    
    SELECT order_type, order_id 
	INTO v_order_type, v_order_id 
	FROM production_orders 
    WHERE id = NEW.production_order_id
    LIMIT 1;
    
    IF v_order_type = 'client' THEN
		SELECT 
			pop.product_id,
            pop.product_name,
            l.id,
            l.name
		INTO
			v_product_id,
            v_product_name,
            v_location_id,
            v_location_name
        FROM purchased_orders_products AS pop
        JOIN purchased_orders_products_locations_production_lines AS poplpl
        ON poplpl.purchase_order_product_id = pop.id
        JOIN locations_production_lines AS lpl
		ON lpl.production_line_id = poplpl.production_line_id
        JOIN locations AS l
        ON l.id = lpl.location_id
        WHERE pop.id = v_order_id
         LIMIT 1;
        SET v_reference_type = 'order';
        SET v_description  = 'Production order';
    ELSE 
		SELECT 
			ippo.product_id,
            ippo.product_name,
            l.id,
            l.name
		INTO
			v_product_id,
            v_product_name,
            v_location_id,
            v_location_name
        FROM internal_product_production_orders AS ippo
        JOIN internal_production_orders_lines_products AS ipolp
        ON ipolp.internal_product_production_order_id = ippo.id
        JOIN locations_production_lines AS lpl
		ON lpl.production_line_id = ipolp.production_line_id
        JOIN locations AS l
        ON l.id = lpl.location_id
        WHERE ippo.id = v_order_id
         LIMIT 1;
        SET v_reference_type = 'production';
        SET v_description  = 'Internal production';
    END IF;
    INSERT INTO inventory_movements(
		location_id, location_name, item_id, 
        item_type, item_name, qty, movement_type, 
        reference_id, reference_type, description, production_id
    ) VALUES (
		v_location_id, v_location_name, v_product_id, 
        'product', v_product_name, v_qty, 'in',
        NEW.production_order_id, v_reference_type, v_description, NEW.id
    );
	/*
    IF v_order_type = 'client' THEN
		INSERT INTO inventory_movements(
			location_id, location_name, item_id, 
			item_type, item_name, qty, movement_type, 
			reference_id, reference_type, description,
            production_id, is_locked
        ) VALUES (
			v_location_id, v_location_name, v_product_id, 
			'product', v_product_name, v_qty, 'out',
			NEW.production_order_id, v_reference_type, 
            v_description, NEW.id, 1
        );
    END IF;
	*/
    CALL validate_production_order_completed(NEW.production_order_id);
	CALL validate_order_completed(v_order_id, v_order_type);
END//
DELIMITER ; 

/****************************************
*		TABLE productions_orders		*
****************************************/

DELIMITER //
CREATE TRIGGER trigger_after_update_production_order
AFTER UPDATE ON production_orders
FOR EACH ROW
BEGIN
	
	DECLARE v_location_id INT DEFAULT 0;
	DECLARE v_location_name VARCHAR(100) DEFAULT '';

	IF NEW.order_type='client' THEN
		IF  NEW.qty <> OLD.qty THEN
			-- ACTUALIZAMOS EL COMPROMETIDO DE LA PRODUCCION
			UPDATE inventory_movements 
			SET qty  = NEW.qty
			WHERE reference_type = 'order'
			AND movement_type = 'out'
			AND item_type = 'product'
			AND reference_id = NEW.id
			AND description = 'Production order';

			-- REVERTIMOS LOS MOVIMIENTOS DE INSUMOS DE INVENTARIO
			DELETE FROM inventory_movements 
			WHERE reference_type = 'order'
			AND movement_type = 'out'
			AND item_type = 'input'
			AND reference_id = NEW.id
			AND description = 'Production order';

			-- OBTENEMOS LA LOCATION
			SELECT
				l.id, l.name
			INTO
				v_location_id, v_location_name
			FROM production_orders AS po
			JOIN purchased_orders_products AS pop
			ON pop.id = po.order_id
			JOIN purchased_orders_products_locations_production_lines AS poplpl
			ON poplpl.purchase_order_product_id = pop.id
			JOIN production_lines AS pl
			ON pl.id = poplpl.production_line_id
			JOIN locations_production_lines AS lpl
			ON lpl.production_line_id = pl.id
			JOIN locations AS l
			ON l.id = lpl.location_id
			WHERE po.id = NEW.id
			AND po.order_type = 'client';

			-- REALIZAMOS EL MOVIMIENTO DE INVENTARIO
			CALL movements_inputs_production(
				NEW.order_id,
				NEW.product_id,
				v_location_id,
				v_location_name,
				NEW.qty,
				NEW.id,
				'Production order'
			);
		END IF;
	ELSE
		IF  NEW.qty <> OLD.qty THEN

			-- ACTUALIZAMOS EL COMPROMETIDO DE LA PRODUCCION
			UPDATE inventory_movements 
			SET qty  = NEW.qty
			WHERE reference_type = 'production'
			AND movement_type = 'in'
			AND item_type = 'product'
			AND reference_type = NEW.id
			AND description = 'Internal production';

			-- REVERTIMOS LOS MOVIMIENTOS DE INSUMOS DE INVENTARIO
			DELETE FROM inventory_movements 
			WHERE reference_type = 'production'
			AND movement_type = 'out'
			AND item_type = 'input'
			AND reference_id = NEW.id
			AND description = 'Internal production';

			-- OBTENEMOS LA LOCATION
			SELECT
				l.id, l.name
			INTO
				v_location_id, v_location_name
			FROM production_orders AS po
			JOIN internal_product_production_orders AS ippo
			ON ippo.id = po.order_id
			JOIN internal_production_orders_lines_products AS ipolp
			ON ipolp.internal_product_production_order_id = ippo.id
			JOIN production_lines AS pl
			ON pl.id = ipolp.production_line_id
			JOIN locations_production_lines AS lpl
			ON lpl.production_line_id = pl.id
			JOIN locations AS l
			ON l.id = lpl.location_id
			WHERE po.id = NEW.id
			AND po.order_type = 'internal';

			-- EFECTUAR MOVIMIENTOS DE INSUMOS PARA ORDEN DE PRODUCCION
			CALL movements_inputs_production(
				NEW.order_id,
				NEW.product_id,
				v_location_id,
				v_location_name,
				NEW.qty,
				NEW.id,
				'Internal production'
			);
		END IF;
	END IF;
    
END //
DELIMITER ;


DELIMITER //
CREATE TRIGGER trigger_after_delete_production_orders
BEFORE DELETE ON production_orders
FOR EACH ROW
BEGIN
	CALL revert_movements_production_order_after_delete(OLD.id);
END //
DELIMITER ;


-- DELIMITER //
-- CREATE TRIGGER trigger_after_create_production_order
-- AFTER INSERT ON production_orders
-- FOR EACH ROW
-- BEGIN
	
-- 	DECLARE v_location_id INT DEFAULT 0;
-- 	DECLARE v_location_name VARCHAR(100) DEFAULT '';

-- 	IF NEW.order_type='client' THEN

-- 		-- OBTENEMOS LA LOCATION
-- 		SELECT
-- 			l.id, l.name
-- 		INTO
-- 			v_location_id, v_location_name
-- 		FROM production_orders AS po
-- 		JOIN purchased_orders_products AS pop
-- 		ON pop.id = po.order_id
-- 		JOIN purchased_orders_products_locations_production_lines AS poplpl
-- 		ON poplpl.purchase_order_product_id = pop.id
-- 		JOIN production_lines AS pl
-- 		ON pl.id = poplpl.production_line_id
-- 		JOIN locations_production_lines AS lpl
-- 		ON lpl.production_line_id = pl.id
-- 		JOIN locations AS l
-- 		ON l.id = lpl.location_id
-- 		WHERE po.id = NEW.id
-- 		AND po.order_type = 'client';

-- 		INSERT INTO inventory_movements(
-- 			location_id, location_name, 
-- 			item_type, item_id, item_name,
-- 			qty, movement_type, reference_id, reference_type,
-- 			description, is_locked
-- 		)
-- 		VALUES (
-- 			v_location_id, v_location_name,  
-- 			'product', NEW.product_id, NEW.product_name,
-- 			NEW.qty , 'out', NEW.id , 'order',
-- 			'Production order', 1
-- 		);

-- 		-- REALIZAMOS EL MOVIMIENTO DE INVENTARIO
-- 		CALL movements_inputs_production(
-- 			NEW.order_id,
-- 			NEW.product_id,
-- 			v_location_id,
-- 			v_location_name,
-- 			NEW.qty,
-- 			NEW.id,
-- 			'Production order'
-- 		);
-- 	ELSE
-- 		-- OBTENEMOS LA LOCATION
-- 		SELECT
-- 			l.id, l.name
-- 		INTO
-- 			v_location_id, v_location_name
-- 		FROM production_orders AS po
-- 		JOIN internal_product_production_orders AS ippo
-- 		ON ippo.id = po.order_id
-- 		JOIN internal_production_orders_lines_products AS ipolp
-- 		ON ipolp.internal_product_production_order_id = ippo.id
-- 		JOIN production_lines AS pl
-- 		ON pl.id = ipolp.production_line_id
-- 		JOIN locations_production_lines AS lpl
-- 		ON lpl.production_line_id = pl.id
-- 		JOIN locations AS l
-- 		ON l.id = lpl.location_id
-- 		WHERE po.id = NEW.id
-- 		AND po.order_type = 'internal';

-- 		INSERT INTO inventory_movements (
-- 			location_id, location_name, 
-- 			item_type, item_id, item_name,
-- 			qty, movement_type, reference_id, reference_type,
-- 			description, is_locked
-- 		)
-- 		VALUES (
-- 			in_location_id, in_location_name,  
-- 			'product', NEW.product_id, NEW.product_name,
-- 			NEW.qty, 'in', NEW.id , 'production',
-- 			'Internal production', 1
-- 		);

-- 		-- EFECTUAR MOVIMIENTOS DE INSUMOS PARA ORDEN DE PRODUCCION
-- 		CALL movements_inputs_production(
-- 			NEW.order_id,
-- 			NEW.product_id,
-- 			v_location_id,
-- 			v_location_name,
-- 			NEW.qty,
-- 			NEW.id,
-- 			'Internal production'
-- 		);
-- 	END IF;
    
-- END //
-- DELIMITER ;



-- DELIMITER //
-- CREATE TRIGGER trigger_before_delete_update_status_production_order
-- BEFORE DELETE ON productions
-- FOR EACH ROW
-- BEGIN

-- 	DECLARE v_inventory_movement_id INT DEFAULT 0;

-- 	SELECT id
-- 	INTO v_inventory_movement_id
-- 	FROM inventory_movements
-- 	WHERE production_id = OLD.id
-- 	LIMIT 1;

-- 	UPDATE inventory_movements
-- 	SET is_locked = 1
-- 	WHERE id = v_inventory_movement_id;

-- END//
-- DELIMITER ; 

-- DELIMITER //
-- CREATE TRIGGER trigger_delete_update_status_production_order
-- AFTER DELETE ON productions
-- FOR EACH ROW
-- BEGIN
-- 	DECLARE v_order_type VARCHAR(100) DEFAULT '';
-- 	DECLARE v_order_id INT DEFAULT 0;
	
-- 	DECLARE v_inventory_movement_id INT DEFAULT 0;
-- 	SELECT id
-- 	INTO v_inventory_movement_id
-- 	FROM inventory_movements
-- 	WHERE production_id = OLD.id
-- 	LIMIT 1;
-- 		DELETE inventory_movements
-- 	WHERE id = v_inventory_movement_id;
-- 	CALL validate_production_order_completed(OLD.production_order_id);
-- 	SELECT order_type, order_id INTO v_order_type, v_order_id FROM production_orders WHERE id = OLD.production_order_id;
-- 	CALL validate_order_completed(v_order_id, v_order_type);
-- END//
-- DELIMITER ; 

DELIMITER //
CREATE TRIGGER trigger_before_delete_update_status_production_order
BEFORE DELETE ON productions
FOR EACH ROW
BEGIN
	DECLARE v_inventory_movement_id INT DEFAULT 0;
	-- Intentar obtener el ID del movimiento relacionado
	SELECT id
	INTO v_inventory_movement_id
	FROM inventory_movements
	WHERE production_id = OLD.id
	LIMIT 1;
	-- Marcar como bloqueado si se encontró
	IF v_inventory_movement_id IS NOT NULL AND v_inventory_movement_id > 0 THEN
		UPDATE inventory_movements
		SET is_locked = 1
		WHERE id = v_inventory_movement_id;
	END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER trigger_after_delete_update_status_production_order
AFTER DELETE ON productions
FOR EACH ROW
BEGIN
	DECLARE v_order_type VARCHAR(100) DEFAULT '';
	DECLARE v_order_id INT DEFAULT 0;
	DECLARE v_inventory_movement_id INT DEFAULT 0;
	-- Handler único para evitar error si no hay resultados en cualquier SELECT INTO
	DECLARE CONTINUE HANDLER FOR NOT FOUND 
	BEGIN
		SET v_inventory_movement_id = 0;
		SET v_order_type = '';
		SET v_order_id = 0;
	END;
	-- Intentar obtener el ID del movimiento relacionado
	SELECT id
	INTO v_inventory_movement_id
	FROM inventory_movements
	WHERE production_id = OLD.id
	LIMIT 1;
	-- Si existe, eliminar el movimiento
	IF v_inventory_movement_id > 0 THEN
		DELETE FROM inventory_movements
		WHERE id = v_inventory_movement_id;
	END IF;
	-- Validar la orden de producción
	CALL validate_production_order_completed(OLD.production_order_id);
	-- Obtener tipo e ID de la orden asociada
	SELECT order_type, order_id
	INTO v_order_type, v_order_id
	FROM production_orders
	WHERE id = OLD.production_order_id;
	-- Si existe valida si la orden de completo
	IF v_order_id > 0 AND v_order_type != '' THEN 
		-- Validar la orden asociada
		CALL validate_order_completed(v_order_id, v_order_type);
	END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER trigger_update_update_status_production_order
AFTER UPDATE ON productions
FOR EACH ROW
BEGIN
	DECLARE v_order_type VARCHAR(100) DEFAULT '';
	DECLARE v_order_id INT DEFAULT 0;
	DECLARE v_inventory_movement_id INT DEFAULT 0;
	-- Handler único para evitar error si no hay resultados en cualquier SELECT INTO
	DECLARE CONTINUE HANDLER FOR NOT FOUND 
	BEGIN
		SET v_inventory_movement_id = 0;
		SET v_order_type = '';
		SET v_order_id = 0;
	END;
	-- Solo si cambió la cantidad
	IF NEW.qty <> OLD.qty THEN
		-- Intentar obtener el ID del movimiento relacionado
		SELECT id
		INTO v_inventory_movement_id
		FROM inventory_movements
		WHERE production_id = NEW.id
		LIMIT 1;
		-- Si existe, actualizar la cantidad
		IF v_inventory_movement_id > 0 THEN
			-- Actualizamos el is_locked del movimiento del inventario para revertir los cambios al inventario
			UPDATE inventory_movements
			SET is_locked = 1
			WHERE id = v_inventory_movement_id;
			-- Actualizamos la cantidad del movimiento de inventario
			UPDATE inventory_movements
			SET qty = NEW.qty
			WHERE id = v_inventory_movement_id;
			-- Actualizamos nuevamente is_locked del movimiento del inventario para aplicar los cambios al inventario
			UPDATE inventory_movements
			SET is_locked = 0
			WHERE id = v_inventory_movement_id;
		END IF;
        
	END IF;
	-- Validar producción
	CALL validate_production_order_completed(NEW.production_order_id);
	-- Obtener tipo e ID de la orden asociada
	SELECT order_type, order_id
	INTO v_order_type, v_order_id
	FROM production_orders
	WHERE id = NEW.production_order_id;
	-- Si existe valida si la orden de completo
	IF v_order_id > 0 AND v_order_type != '' THEN 
		-- Validar la orden asociada
		CALL validate_order_completed(v_order_id, v_order_type);
	END IF;
END //
DELIMITER ;



/****************************************
*		TABLE productions orders		*
****************************************/


-- DELIMITER //
-- CREATE TRIGGER trigger_create_update_status_order_type
-- AFTER INSERT ON production_orders
-- FOR EACH ROW
-- BEGIN
--   CALL validate_order_completed(NEW.order_id, NEW.order_type);
-- END//
-- DELIMITER ; 

-- DELIMITER //
-- CREATE TRIGGER trigger_delete_update_status_order_type
-- AFTER DELETE ON production_orders
-- FOR EACH ROW
-- BEGIN
--     CALL validate_order_completed(OLD.order_id, OLD.order_type);
-- END//
-- DELIMITER ; 


-- DELIMITER //
-- CREATE TRIGGER trigger_update_update_status_order_type
-- AFTER UPDATE ON production_orders
-- FOR EACH ROW
-- BEGIN
--   CALL validate_order_completed(NEW.order_id, NEW.order_type);
-- END//
-- DELIMITER ; 

/************************************************************
*		TABLE shipping_orders_purchased_order_products		*
************************************************************/

DELIMITER //
CREATE TRIGGER trigger_create_shipping_orders_purchased_order_products
AFTER INSERT ON shipping_orders_purchased_order_products
FOR EACH ROW
BEGIN
	DECLARE v_is_shipping_order BOOLEAN DEFAULT FALSE;
	DECLARE po_id INT DEFAULT 0;
    
	SELECT po.id
	INTO po_id
	FROM purchased_orders AS po
    JOIN purchased_orders_products AS pop
    ON po.id = pop.purchase_order_id
    WHERE pop.id = NEW.purchase_order_product_id
    LIMIT 1;
    
	UPDATE purchased_orders_products 
	SET status = 'shipping'
	WHERE id = NEW.purchase_order_product_id
	AND status != 'shipping';

	SET v_is_shipping_order = is_purchased_order_shipped(po_id);
    IF  v_is_shipping_order THEN
		UPDATE purchased_orders
        SET status = 'shipping'
        WHERE id = po_id;
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER trigger_delete_shipping_orders_purchased_order_products
AFTER DELETE ON shipping_orders_purchased_order_products
FOR EACH ROW
BEGIN
	DECLARE v_is_shipping_order BOOLEAN DEFAULT FALSE;
	DECLARE po_id INT DEFAULT 0;
    
	SELECT po.id
	INTO po_id
	FROM purchased_orders AS po
    JOIN purchased_orders_products AS pop
    ON po.id = pop.purchase_order_id
    WHERE pop.id = OLD.purchase_order_product_id
    LIMIT 1;

	UPDATE purchased_orders_products 
	SET status='completed'
	WHERE id = OLD.purchase_order_product_id
    AND status != 'completed';
    
    SET v_is_shipping_order = is_purchased_order_shipped(po_id);
    IF  NOT v_is_shipping_order THEN
		UPDATE purchased_orders
        SET status = 'pending'
        WHERE id = po_id;
    END IF;
END //
DELIMITER ;

/**/

DELIMITER //
CREATE TRIGGER trigger_create_inventory_transfers
AFTER INSERT ON inventory_transfers
FOR EACH ROW
BEGIN
	CALL do_inventory_transfers(
		NEW.id,
		NEW.source_location_id,
		NEW.destination_location_id,
		NEW.item_id ,
		NEW.item_type,
		NEW.qty
	);
END //
DELIMITER ;


DELIMITER //
CREATE TRIGGER trigger_update_inventory_transfers
AFTER UPDATE ON inventory_transfers
FOR EACH ROW
BEGIN
	IF NEW.status <> OLD.status THEN
		IF NEW.status = 'canceled' AND OLD.status = 'completed' THEN
			CALL revert_inventory_transfer(NEW.id);
		END IF;
	END IF;
END //
DELIMITER ;


DELIMITER //
CREATE TRIGGER trigger_delete_inventory_transfers
AFTER DELETE ON inventory_transfers
FOR EACH ROW
BEGIN
	IF OLD.status != 'canceled' THEN
		CALL revert_inventory_transfer(OLD.id);
	END IF;
	DELETE FROM inventory_movements
    WHERE reference_type = 'transfer'
    AND reference_id = OLD.id;
END //
DELIMITER ;


/************************************************************
*					Shipping orders							*
************************************************************/

DELIMITER //
CREATE TRIGGER delete_shipping_order
BEFORE DELETE ON shipping_orders
FOR EACH ROW
BEGIN
	UPDATE
        purchased_orders_products
    SET status='completed'
    WHERE id IN (
        SELECT 
            sopop.purchase_order_product_id
        FROM shipping_orders_purchased_order_products AS sopop
        WHERE sopop.shipping_order_id = OLD.id 
    );
END //
DELIMITER ;


/************************************************************
*					Production lines products				*
************************************************************/


DELIMITER //
CREATE TRIGGER trigger_after_create_production_lines_products
AFTER INSERT ON production_lines_products
FOR EACH ROW
BEGIN
	CALL sp_create_inventory_for_product_inputs_new_pl(
		NEW.production_line_id, 
		NEW.product_id
	);
END //

/************************************************************
*						scrap								*
************************************************************/

DELIMITER //
CREATE TRIGGER trigger_after_insert_scrap
AFTER INSERT ON scrap
FOR EACH ROW
BEGIN
	IF NEW.reference_type = 'Production' THEN
		INSERT INTO inventory_movements(
			location_id, location_name,
			item_id, item_type, item_name,
			qty, movement_type, 
			reference_id, reference_type, production_id,
			description, is_locked
		)
		VALUES (
			NEW.location_id, NEW.location_name, 
			NEW.item_id, NEW.item_type, NEW.item_name, 
			NEW.qty, 'out', NEW.id, 'scrap', 
			NEW.reference_id, null, 0
		);
	ELSE
		INSERT INTO inventory_movements(
			location_id, location_name, 
			item_id, item_type, item_name,
			qty, movement_type, 
			reference_id, reference_type, production_id,
			description, is_locked
		)
		VALUES (
			NEW.location_id,NEW.location_name,
			NEW.item_id, NEW.item_type, NEW.item_name, 
			NEW.qty, 'out', NEW.id, 'scrap', null,
			null, 0
		);
	END IF;
END //
DELIMITER;

DELIMITER // 
CREATE TRIGGER trigger_after_delete_scrap
AFTER DELETE ON scrap
FOR EACH ROW
BEGIN
	IF OLD.reference_type = 'production' THEN
		-- Lock the movement ( deshabilita el movimiento)
		UPDATE inventory_movements
		SET is_locked = 1
		WHERE reference_type = 'scrap'
		AND production_id = OLD.reference_id;
		-- Delete the movement (elimina el movimiento)
		DELETE FROM inventory_movements
		WHERE reference_type = 'scrap'
		AND production_id = OLD.reference_id;
	ELSE
		-- Lock the movement ( deshabilita el movimiento)
		UPDATE inventory_movements
		SET is_locked = 1
		WHERE reference_type = 'scrap'
		AND reference_id = OLD.id;
		-- Delete the movement (elimina el movimiento)
		DELETE FROM inventory_movements
		WHERE reference_type = 'scrap'
		AND reference_id = OLD.id;
	END IF;
END //
DELIMITER ;


DELIMITER //
CREATE TRIGGER trigger_after_update_scrap
AFTER UPDATE ON scrap
FOR EACH ROW
BEGIN
	IF OLD.reference_type = 'production' THEN
		-- Lock the movement ( deshabilita el movimiento)
		UPDATE inventory_movements
		SET is_locked = 1
		WHERE reference_type = 'scrap'
		AND production_id = OLD.reference_id;
		-- Delete the movement (elimina el movimiento)
		DELETE FROM inventory_movements
		WHERE reference_type = 'scrap'
		AND production_id = OLD.reference_id;
	ELSE
		-- Lock the movement ( deshabilita el movimiento)
		UPDATE inventory_movements
		SET is_locked = 1
		WHERE reference_type = 'scrap'
		AND reference_id = OLD.id;
		-- Delete the movement (elimina el movimiento)
		DELETE FROM inventory_movements
		WHERE reference_type = 'scrap'
		AND reference_id = OLD.id;
	END IF;

	IF NEW.reference_type = 'production' THEN
		INSERT INTO inventory_movements(
			location_id,
			location_name,
			item_id,
			item_type,
			item_name,
			qty,
			movement_type,
			reference_id,
			reference_type,
			production_id,
			description,
			is_locked
		)
		VALUES (
			NEW.location_id,
			NEW.location_name,
			NEW.item_id,
			NEW.item_type,
			NEW.item_name,
			NEW.qty,
			'out',
			NEW.id,
			'scrap',
			NEW.reference_id,
			null,
			0
		);
	ELSE
		INSERT INTO inventory_movements(
			location_id,
			location_name,
			item_id,
			item_type,
			item_name,
			qty,
			movement_type,
			reference_id,
			reference_type,
			production_id,
			description,
			is_locked
		)
		VALUES (
			NEW.location_id,
			NEW.location_name,
			NEW.item_id,
			NEW.item_type,
			NEW.item_name,
			NEW.qty,
			'out',
			NEW.id,
			'scrap',
			null, 
			null,
			0
		);
	END IF;
END //
DELIMITER ;