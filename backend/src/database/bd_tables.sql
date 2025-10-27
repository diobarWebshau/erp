CREATE TABLE suppliers (
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);


CREATE TABLE suppliers_inputs (
    id INT AUTO_INCREMENT,
    supplier_id INT,
    input_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);


/* EMPLEADO PARA PRUEBAS IGNORAR */
INSERT INTO operations(name)
VALUES ('create'),
    ('update'),
    ('delete');
SELECT *
FROM debug_log;
SELECT *
FROM shipping_orders;
SELECT *
FROM shipping_orders_purchased_order_products;
SELECT *
FROM products;
SELECT *
FROM purchased_orders_products;
SELECT *
FROM shipping_orders_purchased_order_products;
SELECT *
FROM inventory_transfers;
SELECT *
FROM scrap;
SELECT VERSION();

SELECT * FROM inventory_movements;


-- DROP FUNCTION IF EXISTS func_get_inventory_movements_commited_pop;
-- DELIMITER //
-- CREATE FUNCTION func_get_inventory_movements_commited_pop(
-- 	in_pop_id INT
-- )
-- RETURNS JSON
-- NOT DETERMINISTIC
-- READS SQL DATA  
-- BEGIN 
-- 	DECLARE v_json JSON DEFAULT JSON_OBJECT();
    
--     SELECT
-- 		JSON_OBJECT(
-- 			'id', im.id,
--             'location_id', im.location_id,
--             'location_name', im.location_name,
--             'item_name', im.item_name,
--             'item_id', im.item_id,
--             'item_type', im.item_type,
--             'movement_type', im.movement_type,
--             'reference_id', im.reference_id,
--             'reference_type', im.reference_type,
--             'production_id', im.production_id,
--             'description', im.description,
--             'is_locked', im.is_locked,
--             'qty', (
--                 SELECT IFNULL(SUM(im2.qty), 0)
--                 FROM inventory_movements AS im2
--                 WHERE im2.reference_id = im.reference_id
--                   AND im2.reference_type = im.reference_type
--                   AND im2.movement_type = im.movement_type
--             ),
--             'location', (
--                 SELECT JSON_OBJECT(
--                     'id', l.id,
--                     'name', l.name,
--                     'description', l.description,
--                     'address', l.address,
--                     'mail', l.mail,
--                     'phone', l.phone,
--                     'city', l.city,
--                     'state', l.state,
--                     'country', l.country,
--                     'is_active', l.is_active,
--                     'created_at', l.created_at,
--                     'updated_at', l.updated_at

--                 )
--                 FROM locations AS l
--                 WHERE l.id = im.location_id
--             )
--         )
-- 	INTO v_json
-- 	FROM inventory_movements AS im
-- 	WHERE
-- 		im.reference_id = in_pop_id
-- 		AND im.reference_type = 'Order'
-- 		AND im.movement_type = 'allocate'
-- 	LIMIT 1;

--     RETURN v_json;
-- END //
-- DELIMITER ;

DROP FUNCTION IF EXISTS func_get_inventory_movements_commited_pop;
DELIMITER //
CREATE FUNCTION func_get_inventory_movements_commited_pop(
	in_pop_id INT
)
RETURNS JSON
NOT DETERMINISTIC
READS SQL DATA  
BEGIN 
	DECLARE v_json JSON DEFAULT JSON_OBJECT();
    
    SELECT
		JSON_OBJECT(
			'id', im.id,
            'location_id', im.location_id,
            'location_name', im.location_name,
            'item_name', im.item_name,
            'item_id', im.item_id,
            'item_type', im.item_type,
            'movement_type', im.movement_type,
            'reference_id', im.reference_id,
            'reference_type', im.reference_type,
            'production_id', im.production_id,
            'description', im.description,
            'is_locked', im.is_locked,
            'qty', (
                SELECT IFNULL(SUM(im2.qty), 0)
                FROM inventory_movements AS im2
                WHERE im2.reference_id = im.reference_id
                  AND im2.reference_type = im.reference_type
                  AND im2.movement_type = im.movement_type
            ),
            'location', (
                SELECT JSON_OBJECT(
                    'id', l.id,
                    'name', l.name,
                    'description', l.description,
                    'address', l.address,
                    'mail', l.mail,
                    'phone', l.phone,
                    'city', l.city,
                    'state', l.state,
                    'country', l.country,
                    'is_active', l.is_active,
                    'created_at', l.created_at,
                    'updated_at', l.updated_at,
                    /* --- agregado: objeto inventory --- */
                    'inventory',
                    (
                      SELECT
                        COALESCE(
                          JSON_OBJECT(
                            'location_id',   l2.id,
                            'location_name', l2.name,
                            'item_type',     idt.item_type,
                            'item_id',       idt.item_id,
                            'inventory_id',  idt.inventory_id,
                            'item_name',
                              CASE
                                WHEN idt.item_type = 'product' THEN p.name
                                WHEN idt.item_type = 'input'   THEN inp.name
                                ELSE NULL
                              END,
                            'stock',                  IFNULL(idt.stock, 0),
                            'minimum_stock',          IFNULL(idt.minimum_stock, 0),
                            'maximum_stock',          IFNULL(idt.maximum_stock, 0),
                            'committed_qty',          IFNULL(idt.committed, 0),
                            'pending_production_qty', IFNULL(iip.qty, 0),
                            'available',              IFNULL(IFNULL(idt.stock,0) - IFNULL(idt.committed,0), 0)
                            -- ,'produced_qty',       IFNULL(ipr.produced, 0)
                          ),
                          JSON_OBJECT()
                        )
                      FROM locations AS l2
                      /* --- inventory_data (idt): stock + committed bloqueado --- */
                      LEFT JOIN (
                        SELECT
                          ili.item_type,
                          ili.item_id,
                          ili.location_id,
                          inv.stock AS stock,
                          inv.minimum_stock AS minimum_stock,
                          inv.maximum_stock AS maximum_stock,
                          inv.id    AS inventory_id,
                          IFNULL(SUM(
                            CASE
                              WHEN im3.movement_type  = 'allocate'
                               AND im3.reference_type NOT IN ('Transfer','Scrap')
                               AND im3.is_locked      = 1
                              THEN im3.qty ELSE 0
                            END
                          ),0) AS committed
                        FROM inventories_locations_items AS ili
                        JOIN inventories AS inv
                          ON inv.id = ili.inventory_id
                        LEFT JOIN inventory_movements AS im3
                          ON im3.item_type   = ili.item_type
                         AND im3.item_id     = ili.item_id
                         AND im3.location_id = ili.location_id
                        GROUP BY
                          ili.item_type, ili.item_id, ili.location_id, inv.stock, inv.minimum_stock, inv.maximum_stock, inv.id
                      ) AS idt
                        ON idt.location_id = l2.id
                       AND idt.item_type   = im.item_type
                       AND idt.item_id     = im.item_id

                      /* Nombres por tipo */
                      LEFT JOIN products p
                        ON idt.item_type = 'product' AND p.id   = idt.item_id
                      LEFT JOIN inputs   inp
                        ON idt.item_type = 'input'   AND inp.id = idt.item_id

                      /* --- inventory_inProduction (iip): pendiente por producir --- */
                      LEFT JOIN (
                        SELECT item_type, item_id, location_id, SUM(qty) AS qty
                        FROM (
                          SELECT
                            'product' AS item_type,
                            po.product_id AS item_id,
                            l3.id AS location_id,
                            po.qty
                          FROM production_orders po
                          LEFT JOIN purchased_orders_products pop
                            ON po.order_type = 'client'  AND pop.id  = po.order_id
                          LEFT JOIN internal_product_production_orders ippo
                            ON po.order_type = 'internal' AND ippo.id = po.order_id
                          LEFT JOIN internal_production_orders_lines_products ipolp
                            ON ippo.id = ipolp.internal_product_production_order_id
                          LEFT JOIN purchased_orders_products_locations_production_lines poplpl
                            ON poplpl.purchase_order_product_id = pop.id
                          JOIN locations_production_lines lpl
                            ON (
                                  (po.order_type = 'client'  AND lpl.production_line_id = poplpl.production_line_id)
                               OR (po.order_type = 'internal' AND lpl.production_line_id = ipolp.production_line_id)
                            )
                          LEFT JOIN locations l3 ON l3.id = lpl.location_id
                          WHERE po.order_type IN ('client','internal')
                            AND (po.product_id = pop.product_id OR po.product_id = ippo.product_id)
                            AND po.status <> 'completed'
                            AND po.product_id = im.item_id   -- correlación con el item del movimiento
                        ) z
                        GROUP BY item_type, item_id, location_id
                      ) AS iip
                        ON iip.location_id = l2.id
                       AND iip.item_id     = idt.item_id
                       AND iip.item_type   = idt.item_type

                      WHERE l2.id = im.location_id
                    )
                )
                FROM locations AS l
                WHERE l.id = im.location_id
            )
        )
	INTO v_json
	FROM inventory_movements AS im
	WHERE
		im.reference_id = in_pop_id
		AND im.reference_type = 'Order'
		AND im.movement_type = 'allocate'
	LIMIT 1;

    RETURN v_json;
END //
DELIMITER ;


SELECT func_get_inventory_movements_commited_pop(1);

SELECT * FROM purchased_orders_products;
SELECT  
	IFNULL(SUM(im.qty),0)
FROM inventory_movements AS im 
WHERE im.reference_type = 'Order'
AND im.movement_type = 'allocate'
AND im.reference_id = 1;