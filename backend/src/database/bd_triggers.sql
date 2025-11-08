USE u482698715_shau_erp;

/****************************************
*		TABLE inventory_movements		*
****************************************/

DROP TRIGGER IF EXISTS trigger_created_inventory_movements;
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
DROP TRIGGER IF EXISTS trigger_update_inventory_movements;
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
*	     TABLE purchased_orders		    *
****************************************/

DROP TRIGGER IF EXISTS trigger_delete_purchased_orders;
DELIMITER //
CREATE TRIGGER trigger_delete_purchased_orders
BEFORE DELETE ON purchased_orders
FOR EACH ROW
BEGIN
	DELETE FROM purchased_orders_products
	WHERE purchase_order_id = OLD.id;
END//
DELIMITER ;

/****************************************
*	TABLE purchased_orders_products		*
****************************************/

DROP TRIGGER IF EXISTS trigger_delete_purchased_orders_products;
DELIMITER //
CREATE TRIGGER trigger_delete_purchased_orders_products
BEFORE DELETE ON purchased_orders_products
FOR EACH ROW
BEGIN
	CALL sp_revert_movement_inventory_pop(
		OLD.id,
		OLD.product_id,
		OLD.product_name
	);
END//
DELIMITER ;

DROP TRIGGER IF EXISTS trigger_update_purchased_orders_products; 
DELIMITER //
CREATE TRIGGER trigger_update_purchased_orders_products
AFTER UPDATE ON purchased_orders_products
FOR EACH ROW
BEGIN

	DECLARE v_location INT DEFAULT 0;

	SELECT location_id 
	INTO v_location
	FROM purchased_orders_products_locations_production_lines AS poplpl
	JOIN locations_production_lines AS lpl ON poplpl.production_line_id = lpl.id
	JOIN locations AS l ON lpl.location_id = l.id
	WHERE purchase_order_product_id = NEW.id
	LIMIT 1;

    IF NEW.status <> OLD.status THEN
		IF NEW.status = 'shipping' AND OLD.status = 'completed' THEN
			UPDATE inventory_movements
			SET is_locked = 0 
			WHERE reference_type = 'Order'
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
		CALL sp_update_movement_inventory_pop_update_fix(
			NEW.id,
			NEW.qty,
			NEW.product_id,
			NEW.product_name
		);
	END IF;
END //
DELIMITER ;

/***********************************************
*	 TABLE internal_product_production_order  *
***********************************************/

DROP TRIGGER IF EXISTS trigger_update_internal_production_order;
DELIMITER //
CREATE TRIGGER trigger_update_internal_production_order
AFTER UPDATE ON internal_product_production_orders
FOR EACH ROW
BEGIN

	IF NEW.qty <> OLD.qty THEN
		CALL sp_update_inventory_movements_ippo(
			NEW.id,
			NEW.product_id,
			NEW.product_name,
			NEW.qty,
            OLD.qty
		);
	END IF;

	IF NEW.location_id <> OLD.location_id THEN
		UPDATE inventory_movements AS im
		SET 
			location_id = NEW.location_id,
			location_name = NEW.location_name
		WHERE im.reference_type IN (
				'Internal Production Order'
			)
			AND (
				im.reference_id = NEW.id OR 
				im.reference_id IN (
					SELECT id
					FROM production_orders AS po
					WHERE po.order_type = 'internal'
					AND po.order_id = NEW.id
				)
			)
			AND im.item_type IN (
				'product', 
				'input'
			)
			AND im.movement_type = 'allocate';
	END IF;
	
END //
DELIMITER ;

/****************************************
*		TABLE productions_orders		*
****************************************/

DROP TRIGGER IF EXISTS trigger_create_production_order;
DELIMITER //
CREATE TRIGGER trigger_create_production_order
AFTER INSERT ON production_orders
FOR EACH ROW
BEGIN
	CALL sp_assign_production_order_to_queue(
		NEW.id,
		NEW.order_id,
		NEW.order_type
	);
END //
DELIMITER ;

-- DROP TRIGGER IF EXISTS trigger_after_delete_production_orders;
-- DELIMITER //
-- CREATE TRIGGER trigger_after_delete_production_orders
-- BEFORE DELETE ON production_orders
-- FOR EACH ROW
-- BEGIN
-- 	CALL sp_delete_production_order(
-- 		OLD.id,
-- 		OLD.order_id,
-- 		OLD.order_type,
-- 		OLD.product_id,
-- 		OLD.product_name
-- 	);
-- END //
-- DELIMITER ;

/****************************************
*		   TABLE productions			*
****************************************/


DROP TRIGGER IF EXISTS trigger_create_production;
DELIMITER //
CREATE TRIGGER trigger_create_production
AFTER INSERT ON productions
FOR EACH ROW
BEGIN
	CALL sp_apply_process_input_consumption(
		NEW.id,
		NEW.production_order_id,
		NEW.product_id,
		NEW.process_id,
		NEW.qty
	);
END //
DELIMITER ;


/*
DROP TRIGGER IF EXISTS trigger_create_update_status_production_order;
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
        SET v_reference_type = 'Production';
        SET v_description  = 'Production Receipt';
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
        SET v_reference_type = 'Production';
        SET v_description  = 'Internal Production Receipt';
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

    CALL validate_production_order_completed(NEW.production_order_id);
	CALL validate_order_completed(v_order_id, v_order_type);
END//
DELIMITER ; 

DROP TRIGGER IF EXISTS trigger_before_delete_update_status_production_order;
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

DROP TRIGGER IF EXISTS trigger_after_delete_update_status_production_order;
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

DROP TRIGGER IF EXISTS trigger_update_update_status_production_order;
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
*/
/************************************************************
*		TABLE shipping_orders_purchased_order_products		*
************************************************************/

DROP TRIGGER IF EXISTS trigger_create_shipping_orders_purchased_order_products;
DELIMITER //
CREATE TRIGGER trigger_create_shipping_orders_purchased_order_products
AFTER INSERT ON shipping_orders_purchased_order_products
FOR EACH ROW
BEGIN
 	 /* ───────── DECLARACIONES ───────── */
	-- PO
	DECLARE v_purchase_order_id INT DEFAULT 0;
	DECLARE v_purchase_order_status VARCHAR(100) DEFAULT '';
	-- POP
	DECLARE v_pop_id INT DEFAULT 0;
	DECLARE v_pop_product_id INT DEFAULT 0;
	DECLARE v_pop_product_name VARCHAR(100) DEFAULT '';
	DECLARE v_pop_location_id INT DEFAULT 0;
	DECLARE v_pop_location_name VARCHAR(100) DEFAULT '';
	DECLARE v_pop_qty_committed DECIMAL(14,4) DEFAULT NULL;
	DECLARE v_pop_shipping_summary JSON DEFAULT JSON_OBJECT();
	DECLARE v_pop_shipping_qty DECIMAL(14,4) DEFAULT 0;
	-- Normalizado
	DECLARE v_qty_new DECIMAL(14,4) DEFAULT 0;

	/* ───────── Normalización ───────── */
	SET v_qty_new = IFNULL(NEW.qty, 0);

	/* Si no hay cantidad, no hay nada que reflejar */
	IF v_qty_new <> 0 THEN
		/* ───────── Contexto PO/POP/Ubicación ───────── */
		SELECT 
			po.id, po.status,
			pop.id, pop.product_id, pop.product_name,
			l.id, l.name
		INTO 
			v_purchase_order_id, v_purchase_order_status,
			v_pop_id, v_pop_product_id, v_pop_product_name,
			v_pop_location_id, v_pop_location_name
		FROM purchased_orders AS po
		JOIN purchased_orders_products AS pop
			ON po.id = pop.purchase_order_id
		JOIN purchased_orders_products_locations_production_lines AS poplpl
			ON pop.id = poplpl.purchase_order_product_id
		JOIN locations_production_lines AS lpl
			ON lpl.production_line_id = poplpl.production_line_id
		JOIN locations AS l
			ON l.id = lpl.location_id
		WHERE pop.id = NEW.purchase_order_product_id
		LIMIT 1;

		/* ¿Existe historial/stock comprometido a nivel POP? (NULL si jamás hubo) */
		SELECT SUM(im.qty)
		INTO v_pop_qty_committed
		FROM inventory_movements AS im
		WHERE im.reference_id = NEW.purchase_order_product_id
			AND im.reference_type = 'Order'
			AND im.movement_type = 'allocate';

		/* ───────── POP espejo (si hay historial/saldo) ─────────
		Consumir desde POP lo que va a tomar la SOP (sin deltas). */
		IF v_pop_qty_committed IS NOT NULL AND v_pop_qty_committed <> 0 THEN
			INSERT INTO inventory_movements(
			location_id, location_name,
			item_id, item_type, item_name, qty,
			movement_type, reference_id, reference_type,
			production_id, description, is_locked
			) VALUES (
			v_pop_location_id, v_pop_location_name,
			v_pop_product_id, 'product', v_pop_product_name, (0 - v_qty_new),
			'allocate', v_pop_id, 'Order',
			NULL, 'Adjust Inventory Allocation by Shipping', 1
			);
		END IF;

		/* ───────── SOP (Shipping row): aplicar lo nuevo ───────── */
		INSERT INTO inventory_movements(
			location_id, location_name,
			item_id, item_type, item_name, qty,
			movement_type, reference_id, reference_type,
			production_id, description, is_locked
		) VALUES (
			NEW.location_id, NEW.location_name,
			v_pop_product_id, 'product', v_pop_product_name, v_qty_new,
			'allocate', NEW.id, 'Shipping',
			NULL, 'Shipping Allocation', 1
		);

		/* ───────── Recalcular estado de la PO ───────── */
		IF func_is_purchase_order_fully_shipped(v_purchase_order_id) THEN
			IF v_purchase_order_status <> 'shipping' THEN
				UPDATE purchased_orders 
				SET status = 'shipping'
				WHERE id = v_purchase_order_id;
			END IF;
		ELSE
			SET v_pop_shipping_summary = func_summary_shipping_on_client_order(v_pop_id);
			SET v_pop_shipping_qty = JSON_UNQUOTE(JSON_EXTRACT(v_pop_shipping_summary, '$.shipping_qty'));

			IF v_pop_shipping_qty > 0 THEN
				IF v_purchase_order_status <> 'partially_shipping' THEN
					UPDATE purchased_orders 
					SET status = 'partially_shipping'
					WHERE id = v_purchase_order_id;
				END IF;
			ELSE
				IF v_purchase_order_status <> 'pending' THEN
					UPDATE purchased_orders 
					SET status = 'pending'
					WHERE id = v_purchase_order_id;
				END IF;
			END IF;
		END IF;
	END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trigger_delete_shipping_orders_purchased_order_products;
DELIMITER //
CREATE TRIGGER trigger_delete_shipping_orders_purchased_order_products
AFTER DELETE ON shipping_orders_purchased_order_products
FOR EACH ROW
BEGIN
  /* ───────── DECLARACIONES ───────── */
  -- PO
  DECLARE v_purchase_order_id INT DEFAULT 0;
  DECLARE v_purchase_order_status VARCHAR(100) DEFAULT '';
  -- POP
  DECLARE v_pop_id INT DEFAULT 0;
  DECLARE v_pop_product_id INT DEFAULT 0;
  DECLARE v_pop_product_name VARCHAR(100) DEFAULT '';
  DECLARE v_pop_location_id INT DEFAULT 0;
  DECLARE v_pop_location_name VARCHAR(100) DEFAULT '';
  DECLARE v_pop_qty_committed DECIMAL(14,4) DEFAULT NULL;
  DECLARE v_pop_shipping_summary JSON DEFAULT JSON_OBJECT();
  DECLARE v_pop_shipping_qty DECIMAL(14,4) DEFAULT 0;
  -- Normalizado
  DECLARE v_qty_old DECIMAL(14,4) DEFAULT 0;

  /* ───────── Normalización ───────── */
  SET v_qty_old = IFNULL(OLD.qty, 0);

  /* Si no hay cantidad, no hay nada que revertir */
  IF v_qty_old <> 0 THEN
	/* ───────── Contexto PO/POP/Ubicación ───────── */
	SELECT 
		po.id, po.status,
		pop.id, pop.product_id, pop.product_name,
		l.id, l.name
	INTO 
		v_purchase_order_id, v_purchase_order_status,
		v_pop_id, v_pop_product_id, v_pop_product_name,
		v_pop_location_id, v_pop_location_name
	FROM purchased_orders AS po
	JOIN purchased_orders_products AS pop
		ON po.id = pop.purchase_order_id
	JOIN purchased_orders_products_locations_production_lines AS poplpl
		ON pop.id = poplpl.purchase_order_product_id
	JOIN locations_production_lines AS lpl
		ON lpl.production_line_id = poplpl.production_line_id
	JOIN locations AS l
		ON l.id = lpl.location_id
	WHERE pop.id = OLD.purchase_order_product_id
	LIMIT 1;

	/* ¿Existe historial/stock comprometido a nivel POP? (NULL si jamás hubo) */
	SELECT SUM(im.qty)
	INTO v_pop_qty_committed
	FROM inventory_movements AS im
	WHERE im.reference_id = OLD.purchase_order_product_id
		AND im.reference_type = 'Order'
		AND im.movement_type = 'allocate';

	/* ───────── POP espejo (si hay historial) ─────────
		Devolver a POP lo que tenía la SOP (sin deltas). */
	IF v_pop_qty_committed IS NOT NULL AND v_pop_qty_committed <> 0 THEN
		INSERT INTO inventory_movements(
		location_id, location_name,
		item_id, item_type, item_name, qty,
		movement_type, reference_id, reference_type,
		production_id, description, is_locked
		) VALUES (
		v_pop_location_id, v_pop_location_name,
		v_pop_product_id, 'product', v_pop_product_name, v_qty_old,
		'allocate', v_pop_id, 'Order',
		NULL, 'POP mirror: return SOP allocation (DELETE)', 1
		);
	END IF;

	/* ───────── SOP (Shipping row): revertir lo viejo ───────── */
	INSERT INTO inventory_movements(
		location_id, location_name,
		item_id, item_type, item_name, qty,
		movement_type, reference_id, reference_type,
		production_id, description, is_locked
	) VALUES (
		OLD.location_id, OLD.location_name,
		v_pop_product_id, 'product', v_pop_product_name, (0 - v_qty_old),
		'allocate', OLD.id, 'Shipping',
		NULL, 'Revert Shipping Allocation (DELETE)', 1
	);

	/* ───────── Recalcular estado de la PO ───────── */
	INSERT INTO debug_log(message) VALUES (CONCAT('func_is_purchase_order_fully_shipped(v_purchase_order_id): ', func_is_purchase_order_fully_shipped(v_purchase_order_id), ' v_purchase_order_status: ', v_purchase_order_status));
	IF func_is_purchase_order_fully_shipped(v_purchase_order_id) THEN
		IF v_purchase_order_status <> 'shipping' THEN
		UPDATE purchased_orders 
		SET status = 'shipping'
		WHERE id = v_purchase_order_id;
		END IF;
	ELSE
		SET v_pop_shipping_summary = func_summary_shipping_on_client_order(v_pop_id);
		SET v_pop_shipping_qty = JSON_UNQUOTE(JSON_EXTRACT(v_pop_shipping_summary, '$.shipping_qty'));

		INSERT INTO debug_log(message) VALUES (CONCAT('v_pop_shipping_qty: ', v_pop_shipping_qty));

		IF v_pop_shipping_qty > 0 THEN
			IF v_purchase_order_status <> 'partially_shipping' THEN
				UPDATE purchased_orders 
				SET status = 'partially_shipping'
				WHERE id = v_purchase_order_id;
			END IF;
		ELSE
			IF v_purchase_order_status <> 'pending' THEN
				UPDATE purchased_orders 
				SET status = 'pending'
				WHERE id = v_purchase_order_id;
			END IF;
		END IF;
	END IF;
  END IF;
END //
DELIMITER ;


DROP TRIGGER IF EXISTS trigger_update_shipping_orders_purchased_order_products;
DELIMITER //
CREATE TRIGGER trigger_update_shipping_orders_purchased_order_products
AFTER UPDATE ON shipping_orders_purchased_order_products
FOR EACH ROW
BEGIN
	/* ───────── DECLARACIONES ───────── */
	-- PO
	DECLARE v_purchase_order_id INT DEFAULT 0;
	DECLARE v_purchase_order_status VARCHAR(100) DEFAULT '';
	-- POP
	DECLARE v_pop_id INT DEFAULT 0;
	DECLARE v_pop_product_id INT DEFAULT 0;
	DECLARE v_pop_product_name VARCHAR(100) DEFAULT '';
	DECLARE v_pop_location_id INT DEFAULT 0;
	DECLARE v_pop_location_name VARCHAR(100) DEFAULT '';
	DECLARE v_pop_qty_committed DECIMAL(14,4) DEFAULT NULL;
	DECLARE v_pop_shipping_summary JSON DEFAULT JSON_OBJECT();
	DECLARE v_pop_shipping_qty DECIMAL(14,4) DEFAULT 0;
	-- Normalizados
	DECLARE v_qty_old DECIMAL(14,4) DEFAULT 0;
	DECLARE v_qty_new DECIMAL(14,4) DEFAULT 0;
	-- Flags de cambio
	DECLARE v_qty_changed TINYINT(1) DEFAULT 0;
	DECLARE v_loc_changed TINYINT(1) DEFAULT 0;

	/* ───────── Normalización y detección de cambios ───────── */
	SET v_qty_old = IFNULL(OLD.qty, 0);
	SET v_qty_new = IFNULL(NEW.qty, 0);
	SET v_qty_changed = (v_qty_old <> v_qty_new);
	SET v_loc_changed = (NOT (NEW.location_id <=> OLD.location_id));

	/* Si no cambió ni cantidad ni ubicación, no hay nada que hacer */
	IF (v_qty_changed = 1 OR v_loc_changed = 1) THEN

		/* ───────── Contexto PO/POP/Ubicación base ───────── */
		SELECT 
			po.id, po.status,
			pop.id, pop.product_id, pop.product_name,
			l.id, l.name
		INTO 
			v_purchase_order_id, v_purchase_order_status,
			v_pop_id, v_pop_product_id, v_pop_product_name,
			v_pop_location_id, v_pop_location_name
		FROM purchased_orders AS po
		JOIN purchased_orders_products AS pop
			ON po.id = pop.purchase_order_id
		JOIN purchased_orders_products_locations_production_lines AS poplpl
			ON pop.id = poplpl.purchase_order_product_id
		JOIN locations_production_lines AS lpl
			ON lpl.production_line_id = poplpl.production_line_id
		JOIN locations AS l
			ON l.id = lpl.location_id
		WHERE pop.id = NEW.purchase_order_product_id
		LIMIT 1;

		/* ¿Existe historial/stock comprometido a nivel POP? (NULL si jamás hubo) */
		SELECT SUM(im.qty)
		INTO v_pop_qty_committed
		FROM inventory_movements AS im
		WHERE im.reference_id = NEW.purchase_order_product_id
			AND im.reference_type = 'Order'
			AND im.movement_type = 'allocate';

		/* ───────── SOP (Shipping row): reset & apply SIN deltas ───────── */
		-- 1) Revertir lo anterior en la ubicación OLD (solo si había algo)
		IF v_qty_old <> 0 THEN
			INSERT INTO inventory_movements(
				location_id, location_name,
				item_id, item_type, item_name, qty,
				movement_type, reference_id, reference_type,
				production_id, description, is_locked
			) VALUES (
				OLD.location_id, OLD.location_name,
				v_pop_product_id, 'product', v_pop_product_name, (0 - v_qty_old),
				'allocate', OLD.id, 'Shipping',
				NULL, 'Reset prev Shipping Allocation', 1
			);
		END IF;

		-- 2) Aplicar el nuevo en la ubicación NEW (solo si hay algo)
		IF v_qty_new <> 0 THEN
			INSERT INTO inventory_movements(
				location_id, location_name,
				item_id, item_type, item_name, qty,
				movement_type, reference_id, reference_type,
				production_id, description, is_locked
			) VALUES (
				NEW.location_id, NEW.location_name,
				v_pop_product_id, 'product', v_pop_product_name, v_qty_new,
				'allocate', OLD.id, 'Shipping',
				NULL, 'Apply new Shipping Allocation', 1
			);
		END IF;

		/* ───────── POP espejo (si hay historial) ─────────
			Regla: devolver OLD.qty y consumir NEW.qty. SIN deltas. */
		IF v_pop_qty_committed IS NOT NULL AND v_pop_qty_committed <> 0 THEN
			-- Devolver a POP lo que la SOP tenía antes
			IF v_qty_old <> 0 THEN
			INSERT INTO inventory_movements(
				location_id, location_name,
				item_id, item_type, item_name, qty,
				movement_type, reference_id, reference_type,
				production_id, description, is_locked
			) VALUES (
				v_pop_location_id, v_pop_location_name,
				v_pop_product_id, 'product', v_pop_product_name, v_qty_old,
				'allocate', v_pop_id, 'Order',
				NULL, 'POP mirror: return previous SOP allocation', 1
			);
			END IF;

			-- Consumir desde POP lo que ahora tiene la SOP
			IF v_qty_new <> 0 THEN
			INSERT INTO inventory_movements(
				location_id, location_name,
				item_id, item_type, item_name, qty,
				movement_type, reference_id, reference_type,
				production_id, description, is_locked
			) VALUES (
				v_pop_location_id, v_pop_location_name,
				v_pop_product_id, 'product', v_pop_product_name, (0 - v_qty_new),
				'allocate', v_pop_id, 'Order',
				NULL, 'POP mirror: consume for new SOP allocation', 1
			);
			END IF;
		END IF;

		/* ───────── Recalcular estado de la PO SIEMPRE ───────── */
		IF func_is_purchase_order_fully_shipped(v_purchase_order_id) THEN
			IF v_purchase_order_status <> 'shipping' THEN
				UPDATE purchased_orders 
				SET status = 'shipping'
				WHERE id = v_purchase_order_id;
			END IF;
		ELSE
			SET v_pop_shipping_summary = func_summary_shipping_on_client_order(v_pop_id);
			SET v_pop_shipping_qty = JSON_UNQUOTE(JSON_EXTRACT(v_pop_shipping_summary, '$.shipping_qty'));

			IF v_pop_shipping_qty > 0 THEN
			IF v_purchase_order_status <> 'partially_shipping' THEN
				UPDATE purchased_orders 
				SET status = 'partially_shipping'
				WHERE id = v_purchase_order_id;
			END IF;
			ELSE
			IF v_purchase_order_status <> 'pending' THEN
				UPDATE purchased_orders 
				SET status = 'pending'
				WHERE id = v_purchase_order_id;
			END IF;
			END IF;
		END IF;
	END IF;
END //
DELIMITER ;


/****************************************
*		TABLE inventory_transfers		*
*****************************************/

DROP TRIGGER IF EXISTS trigger_create_inventory_transfers;
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

DROP TRIGGER IF EXISTS trigger_update_inventory_transfers;
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

DROP TRIGGER IF EXISTS trigger_delete_inventory_transfers;
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

DROP TRIGGER IF EXISTS delete_shipping_order;
DELIMITER //
CREATE TRIGGER delete_shipping_order
BEFORE DELETE ON shipping_orders
FOR EACH ROW
BEGIN
	DELETE FROM shipping_orders_purchased_order_products 
	WHERE shipping_order_id = OLD.id;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS update_shipping_order;
DELIMITER //
CREATE TRIGGER update_shipping_order
BEFORE UPDATE ON shipping_orders
FOR EACH ROW
BEGIN	
	IF NEW.status <> OLD.status THEN
		IF NEW.status = 'shipping' AND OLD.status = 'released' THEN
			CALL sp_apply_shipping_inventory_movements(NEW.id);
		END IF;
	END IF;
END //
DELIMITER ;


/************************************************************
*					Production lines products				*
************************************************************/

DROP TRIGGER IF EXISTS trigger_after_create_production_lines_products;
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

DROP TRIGGER IF EXISTS trigger_after_insert_scrap;
DELIMITER //
CREATE TRIGGER trigger_after_insert_scrap
AFTER INSERT ON scrap
FOR EACH ROW
BEGIN
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


DROP TRIGGER IF EXISTS trigger_after_delete_scrap;
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


DROP TRIGGER IF EXISTS trigger_after_update_scrap;
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


/************************************************************
*						clients								*
************************************************************/