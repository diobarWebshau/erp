
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
		IF NEW.is_locked = 1 AND OLD.is_locked =0 THEN
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
	CALL process_purchased_order_product(NEW.id);
	CALL update_purchased_order_total_price(NEW.purchase_order_id);
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
	CALL update_purchased_order_total_price(OLD.purchase_order_id);
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
    IF NEW.status <> OLD.status THEN
		IF NEW.status = 'shipping' AND OLD.status = 'completed' THEN
			UPDATE inventory_movements
			SET is_locked = 0 
			WHERE reference_type = 'order'
			AND reference_id IN (
				SELECT id FROM production_orders
				WHERE order_type = 'client' 
                AND order_id = NEW.id
			)
            AND description = 'Production order';
		END IF;
        IF NEW.status = 'completed' AND OLD.status = 'shipping' THEN
			UPDATE inventory_movements
			SET is_locked = 1 
			WHERE reference_type = 'order'
			AND reference_id IN (
				SELECT id FROM production_orders
				WHERE order_type = 'client' 
                AND order_id = NEW.id
              
			)
			AND description = 'Production order';
        END IF;
    ELSE
		CALL update_purchased_order_total_price(OLD.purchase_order_id);
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
DELIMITER //
CREATE TRIGGER trigger_delete_internal_production_order
AFTER DELETE ON internal_product_production_orders
FOR EACH ROW
BEGIN
	CALL delete_pending_production_order_by_reference(OLD.id, 'internal');
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trigger_update_internal_production_order
AFTER UPDATE ON internal_product_production_orders
FOR EACH ROW
BEGIN
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
	CALL validate_production_order_completed(NEW.production_order_id);
	SELECT order_type, order_id INTO v_order_type, v_order_id FROM production_orders WHERE id = NEW.production_order_id;
	CALL validate_order_completed(v_order_id, v_order_type);
END//
DELIMITER ; 

DELIMITER //
CREATE TRIGGER trigger_delete_update_status_production_order
AFTER DELETE ON productions
FOR EACH ROW
BEGIN
	DECLARE v_order_type VARCHAR(100) DEFAULT '';
	DECLARE v_order_id INT DEFAULT 0;
	CALL validate_production_order_completed(OLD.production_order_id);
	SELECT order_type, order_id INTO v_order_type, v_order_id FROM production_orders WHERE id = OLD.production_order_id;
	CALL validate_order_completed(v_order_id, v_order_type);

END//
DELIMITER ; 

DELIMITER //
CREATE TRIGGER trigger_update_update_status_production_order
AFTER UPDATE ON productions
FOR EACH ROW
BEGIN
	DECLARE v_order_type VARCHAR(100) DEFAULT '';
	DECLARE v_order_id INT DEFAULT 0;
	CALL validate_production_order_completed(NEW.production_order_id);
	SELECT order_type, order_id INTO v_order_type, v_order_id FROM production_orders WHERE id = NEW.production_order_id;
	CALL validate_order_completed(v_order_id, v_order_type);
END//
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