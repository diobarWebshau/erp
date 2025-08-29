SHOW DATABASES;

USE webshau_erp;

/************************************************
*   shipping_orders_purchased_order_products    *
************************************************/

/*
     @TABLA --> shipping_orders_purchased_order_products
     @Operacion --> CREATE
     
     Contexto  -->
        Decrementar el inventory de la ubicacion cuando se
        se asigna una orden de envio a una orden de compra
        de producto.
*/

DELIMITER //

CREATE TRIGGER trigger_updated_inventory
AFTER INSERT ON shipping_orders_purchased_order_products
FOR EACH ROW
BEGIN
    DECLARE inventory_id INT;
    DECLARE stock DECIMAL(10,4);
    DECLARE qty DECIMAL(10,4);
    DECLARE new_stock DECIMAL(10,4);

    SELECT
        i.id,
        i.stock,
        pop.qty
    INTO
        inventory_id, stock, qty
    FROM
        purchased_orders_products AS pop
    JOIN purchased_orders_products_locations_production_lines AS poplpl
        ON poplpl.purchase_order_product_id = pop.id
    JOIN production_lines AS pl
        ON pl.id = poplpl.production_line_id
    JOIN production_lines_products AS plp
        ON plp.production_line_id = pl.id
    JOIN products AS p
        ON p.id = pop.product_id AND plp.product_id = p.id
    JOIN locations_production_lines AS lpl
        ON lpl.production_line_id = pl.id
    JOIN locations AS l
        ON l.id = lpl.location_id
    JOIN inventories_locations_items AS ili
        ON ili.item_type = 'product'
        AND ili.item_id = p.id
        AND ili.location_id = l.id
    JOIN inventories AS i
        ON i.id = ili.inventory_id
    WHERE
        pop.id = NEW.purchase_order_product_id
    LIMIT 1;

    -- Calcular nuevo stock
    SET new_stock = stock - qty;

    -- Actualizar inventario
    UPDATE inventories
    SET stock = new_stock
    WHERE id = inventory_id;
END //

DELIMITER ;


/*
     @TABLA --> shipping_orders_purchased_order_products
     @Operacion --> DELETE
     
     Contexto  -->
        Revertir el descuento del inventory de la ubicacion
        cuando se elimina de la orden de envio una orden de
        compra de producto.
*/

DELIMITER //

CREATE TRIGGER trigger_updated_inventory_delete_pop
AFTER DELETE ON shipping_orders_purchased_order_products
FOR EACH ROW
BEGIN
    DECLARE inventory_id INT;
    DECLARE stock DECIMAL(10,4);
    DECLARE qty DECIMAL(10,4);
    DECLARE new_stock DECIMAL(10,4);

    -- Obtener el inventario asociado y la cantidad que se había descontado
    SELECT
        i.id,
        i.stock,
        pop.qty
    INTO
        inventory_id, stock, qty
    FROM
        purchased_orders_products AS pop
    JOIN purchased_orders_products_locations_production_lines AS poplpl
        ON poplpl.purchase_order_product_id = pop.id
    JOIN production_lines AS pl
        ON pl.id = poplpl.production_line_id
    JOIN production_lines_products AS plp
        ON plp.production_line_id = pl.id
    JOIN products AS p
        ON p.id = pop.product_id AND plp.product_id = p.id
    JOIN locations_production_lines AS lpl
        ON lpl.production_line_id = pl.id
    JOIN locations AS l
        ON l.id = lpl.location_id
    JOIN inventories_locations_items AS ili
        ON ili.item_type = 'product'
        AND ili.item_id = p.id
        AND ili.location_id = l.id
    JOIN inventories AS i
        ON i.id = ili.inventory_id
    WHERE
        pop.id = OLD.purchase_order_product_id
    LIMIT 1;

    -- Calcular nuevo stock
    SET new_stock = stock + qty;

    -- Actualizar inventario
    UPDATE inventories
    SET stock = new_stock
    WHERE id = inventory_id;
END //

DELIMITER ;

/*
     @TABLA --> shipping_orders_purchased_order_products
     @Operacion --> UPDATE
     
     Contexto  -->
        Revertir el descuento del inventory de la ubicacion
        cuando se elimina de la orden de envio una orden de
        compra de producto, y aplicar el nuevo descuento a
        el inventario de la ubicacion.
*/

DELIMITER //

CREATE TRIGGER trigger_updated_inventory_update_pop
AFTER UPDATE ON shipping_orders_purchased_order_products
FOR EACH ROW
BEGIN
    DECLARE inventory_id INT;
    DECLARE stock DECIMAL(10,4);
	DECLARE qty DECIMAL(10,4);
    DECLARE old_qty DECIMAL(10,4);
    DECLARE new_qty DECIMAL(10,4);
    DECLARE new_stock DECIMAL(10,4);

    -- Solo ejecutar si cambió la orden de compra asignada
    IF OLD.purchase_order_product_id != NEW.purchase_order_product_id THEN

        SELECT
            i.id,
            i.stock,
            pop.qty
        INTO
            inventory_id, stock, qty
        FROM
            purchased_orders_products AS pop
        JOIN purchased_orders_products_locations_production_lines AS poplpl
            ON poplpl.purchase_order_product_id = pop.id
        JOIN production_lines AS pl
            ON pl.id = poplpl.production_line_id
        JOIN production_lines_products AS plp
            ON plp.production_line_id = pl.id
        JOIN products AS p
            ON p.id = pop.product_id AND plp.product_id = p.id
        JOIN locations_production_lines AS lpl
            ON lpl.production_line_id = pl.id
        JOIN locations AS l
            ON l.id = lpl.location_id
        JOIN inventories_locations_items AS ili
            ON ili.item_type = 'product'
            AND ili.item_id = p.id
            AND ili.location_id = l.id
        JOIN inventories AS i
            ON i.id = ili.inventory_id
        WHERE
            pop.id = OLD.purchase_order_product_id
        LIMIT 1;

        -- Obtener cantidad nueva
        SELECT qty 
        INTO new_qty
        FROM purchased_orders_products 
        WHERE id = NEW.purchase_order_product_id;

        -- Revertir y aplicar cambio
        SET new_stock = (stock + old_qty) - new_qty;

        -- Actualizar inventario
        UPDATE inventories
        SET stock = new_stock
        WHERE id = inventory_id;

    END IF;
END //

DELIMITER ;


/************************************************
*       *
************************************************/