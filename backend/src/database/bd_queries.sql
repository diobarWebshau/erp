SHOW DATABASES;
USE u482698715_shau_erp;

-- Obtener el inventario de un producto de una location apartir
-- de una purchased order product ya asignada a una production line
SELECT
    i.id AS inventory_id,
    l.name,
    ili.item_type,
    ili.item_id,
    i.stock,
    pop.qty
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
    pop.id = 3
LIMIT 1;

-- Obtener todas los inventarios dentro de una location

SELECT
	l.name,
    ili.item_type,
    ili.item_id,
    i.stock
FROM
	locations as l
JOIN
	inventories_locations_items as ili
    ON ili.location_id = l.id
JOIN
	inventories as i
    ON i.id = ili.inventory_id
WHERE
	l.id = 1;
    

-- Obtener la location con mas stock de un producto

SELECT * FROM (
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
    WHERE p.id = 1
    ORDER BY 
        i.stock DESC
    LIMIT 1
) AS stock_inventory_location_item;


SELECT 
    l.id AS location_id,
    l.name AS location_name,
    i.stock
FROM inventories_locations_items AS ili
JOIN inventories AS i ON i.id = ili.inventory_id
JOIN locations AS l ON l.id = ili.location_id
WHERE ili.item_id = 1
  AND ili.item_type = 'product'
  AND i.stock >= 20
ORDER BY i.stock DESC;
-- LIMIT 1;



-- Obtener todas las locations con su respectivo stock de un producto

SELECT * FROM (
    SELECT
        l.id AS location_id,
        l.name AS location_name,
        p.id AS product_id,
        p.name AS product_name,
        i.id AS inventory_id,
        i.stock AS stock
    FROM products AS p
    JOIN inventories_locations_items AS ili
        ON ili.item_id = p.id
        AND ili.item_type = "product"
    JOIN locations AS l
        ON l.id = ili.location_id
    JOIN inventories as i
        ON i.id = ili.inventory_id
    WHERE p.id = 1
    ORDER BY 
        i.stock DESC
) AS stock_inventory_location_item;

SELECT
        l.id AS location_id,
        l.name AS location_name,
        p.id AS product_id,
        p.name AS product_name,
        i.id AS inventory_id,
        i.stock AS stock
    FROM products AS p
    JOIN inventories_locations_items AS ili
        ON ili.item_id = p.id
        AND ili.item_type = "product"
    JOIN locations AS l
        ON l.id = ili.location_id
    JOIN inventories as i
        ON i.id = ili.inventory_id
    WHERE p.id = 2
    AND l.id = 1
    LIMIT 1;



-- Obtener todos los stocks de los insumos de un producto por location

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

-- (PRUEBA DE JSON) Obtener todos los stocks de los insumos de un producto por location (MERAMENTE APRENDIZAJE)

SELECT
    location_id,
    location_name,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'product_id', product_id,
            'product_name', product_name,
            'input_id', input_id,
            'input_name', input_name,
            'inventory_id', inventory_id,
            'stock', stock,
            'stock_condition', stock_condition
        )
    ) AS inputs_details
FROM (
    SELECT
        l.id AS location_id,
        l.name AS location_name,
        p.id AS product_id,
        p.name AS product_name,
        inp.id AS input_id,
        inp.name AS input_name,
        i.id AS inventory_id,
        i.stock AS stock,
        CASE
            WHEN i.stock > 1000 THEN 'High Stock'
            WHEN i.stock <= 1000 THEN 'Low Stock'
            ELSE 'Unknown'
        END AS stock_condition
    FROM products AS p
    JOIN
        products_inputs AS pi
        ON pi.product_id = p.id
    JOIN
        inputs AS inp
        ON inp.id = pi.input_id
    JOIN inventories_locations_items AS ili
        ON ili.item_id = pi.input_id
        AND ili.item_type = "input"
    JOIN locations AS l
        ON l.id = ili.location_id
    JOIN inventories AS i
        ON i.id = ili.inventory_id
    WHERE 
        p.id = 1
) AS stock_inventory_details
GROUP BY location_id, location_name;


-- OBTENER LOS INPUTS DE UN PRODUCT

SELECT
	pi.input_id,
	i.name AS input_name,
	pi.equivalence
FROM products AS p
JOIN products_inputs AS pi
	ON pi.product_id = p.id
JOIN inputs AS i
	ON i.id = pi.input_id
WHERE
	p.id = 1;

-- 


-- Obtener el stock de un producto de las locaciones apartir de si satisfacen la demanda de una orden
SELECT 
	ili.location_id,
    l.name AS location_name,
    i.stock  AS stock
FROM inventories_locations_items AS ili
JOIN locations AS l
ON l.id = ili.location_id
JOIN inventories AS i ON i.id = ili.inventory_id
WHERE ili.item_id = 1
  AND ili.item_type = 'product'
  AND i.stock >= 100
ORDER BY i.stock DESC;
-- LIMIT 1;

-- Obtener resumen de stock de un producto en todas las locaciones

SELECT 
    l.name,
    lpd.item_type,
    lpd.item_id,
    lpd.stock AS stock,
    IFNULL(lpd.commited, 0) AS commited,
    IFNULL(lpd.stock, 0) - IFNULL(lpd.commited, 0) AS avalaible
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
            SELECT IFNULL(SUM(im.qty), 0)
            FROM inventory_movements AS im
            WHERE im.item_type = 'product'
              AND im.movement_type = 'out'
			  AND im.reference_type != 'transfer'
              AND im.location_id = ili.location_id
              AND im.item_id = ili.item_id
              AND im.is_locked = 1
        ) AS commited
    FROM inventories_locations_items AS ili
    JOIN inventories AS i ON i.id = ili.inventory_id
    WHERE ili.item_type = 'product' 
      AND ili.item_id = 2
) AS lpd ON l.id = lpd.location_id
WHERE lt.name = 'Store'
ORDER BY avalaible DESC;


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
                  AND im.movement_type = 'allocate'
                  AND im.reference_type != 'transfer'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = ili.item_id
            ) AS commited
        FROM inventories_locations_items ili
        JOIN inventories i ON i.id = ili.inventory_id
        WHERE ili.item_type = 'product'
          AND ili.item_id = 1
    ) lpd ON l.id = lpd.location_id
    WHERE lt.name = 'Store'
    ORDER BY available DESC;

-- OBTNER STOCKS DE INPUTS EN UNA LOCATION DE UN PRODUCTO

SELECT 
    i.id AS input_id,
    i.name AS input_name,
    pi.equivalence,
    ili.location_id,
    ili.item_id,
    inv.stock AS stock,
    (IFNULL((
        SELECT SUM(im.qty)
        FROM inventory_movements im
        WHERE im.item_type = 'input'
          AND im.movement_type = 'out'
          AND im.is_locked = 1
          AND im.location_id = ili.location_id
          AND im.item_id = i.id
    ), 0)) AS committed,
    (inv.stock - IFNULL((
        SELECT SUM(im.qty)
        FROM inventory_movements im
        WHERE im.item_type = 'input'
          AND im.movement_type = 'out'
          AND im.is_locked = 1
          AND im.location_id = ili.location_id
          AND im.item_id = i.id
    ), 0)) AS available
FROM products_inputs pi
JOIN inputs i ON i.id = pi.input_id
JOIN inventories_locations_items ili ON ili.item_id = i.id AND ili.item_type = 'input'
JOIN inventories inv ON inv.id = ili.inventory_id
WHERE pi.product_id = 1
   AND ili.location_id = 2;




SELECT 
	SUM(im.qty)
FROM inventory_movements AS im
WHERE im.item_type = "product"
  AND im.movement_type = "out"
  AND im.is_locked = 1
  AND im.location_id = 1;
  
  
SELECT 
	pl.id,
    pl.name,
    (
		SELECT
			IFNULL(SUM(po.qty), 0) AS workload
		FROM purchased_orders_products AS pop
        JOIN purchased_orders_products_locations_production_lines AS poppl
            ON poppl.purchase_order_product_id = pop.id
		JOIN production_lines AS sub_pl
            ON sub_pl.id = poppl.production_line_id
		JOIN production_orders AS po
            ON po.product_id = pop.product_id
		WHERE
			sub_pl.id = pl.id
		AND
			pop.product_id = p.id
		AND
			po.status != "completed"
    ) AS workload
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
	l.id = 1
AND
	p.id = 1
ORDER BY workload ASC
LIMIT 1;


sELECT * FROM purchased_orders_products;
SELECT * FROM inventory_movements;
SELECT * FROM production_orders;
SELECT * FROM purchased_orders_products_locations_production_lines;


		SELECT
			l.id AS id,
			l.name AS location_name,
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
			  AND ili.item_id = 1
		) AS lpd ON l.id = lpd.location_id

		WHERE lt.name = 'Store'   -- <<== FILTRO AÑADIDO
		ORDER BY available DESC;


-- VERSION ORIGINAL PARA ASIGNAR LINEA DE PRODUCCION, SOLO COMTEMPLA PRODUCCIONES DE ORDENES
	SELECT 
		pl.id,
		IFNULL((
			SELECT
				SUM(po.qty)
			FROM purchased_orders_products AS pop
			JOIN purchased_orders_products_locations_production_lines AS poppl
				ON poppl.purchase_order_product_id = pop.id
			JOIN production_lines AS sub_pl
				ON sub_pl.id = poppl.production_line_id
			JOIN production_orders AS po
				ON po.product_id = pop.product_id
			WHERE
				sub_pl.id = pl.id
			AND
				pop.product_id = p.id
			AND
				po.status != "completed"
		), 0) AS workload
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
		l.id = in_location_id
	AND
		p.id = in_product_id
	ORDER BY workload ASC
	LIMIT 1;


-- VERSION MEJORADA(ASIGNACION DE LINEA DE PRODUCTION) COMTEMPLA PRODUCCIONES INTERNAS Y DE ORDENES
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
    p.id = 1
AND --  comentar aqui si se desea buscar en todas las locations, es decir comparacion entre todas las lineas que lo produzcan
	l.id = 1 -- y esto tambien
ORDER BY workload_pop ASC; 



SELECT
    po.*,
    (
        SELECT
            SUM(p.qty)
        FROM productions as p
        WHERE p.production_order_id = po.id
    ) as qty_production
FROM
    production_orders AS po
WHERE po.id = 1;



SELECT 
    pop.id,
    pop.qty,
    IFNULL((
        SELECT 
            SUM(po.qty)
        FROM production_orders as po
        WHERE po.order_type = 'client'
        AND po.order_id = pop.id
        AND po.status = 'completed'
    ),0) AS production_qty,
    IFNULL((
        SELECT 
            SUM(im.qty)
        FROM inventory_movements as im
        WHERE im.reference_type = 'Order'
        AND im.reference_id = pop.id
    ),0) AS committed_qty
FROM purchased_orders_products AS pop
WHERE pop.id=4;


SELECT
    ippo.qty,
    IFNULL((
        SELECT 
            SUM(po.qty)
        FROM production_orders as po
        WHERE po.order_type = 'internal'
		AND po.status = 'completed'
        AND po.order_id = ippo.id
    ),0) AS production_qty
FROM internal_product_production_orders as ippo
WHERE ippo.id = 1;



SELECT 
	pop.qty,
    IFNULL((
		SELECT SUM(p.qty)
        FROM productions AS p
        JOIN production_orders AS po
			ON po.id = p.production_order_id
			AND po.order_type = 'client'
            AND po.order_id = pop.id
    ),0) as production_qty
FROM purchased_orders_products AS pop
WHERE pop.id = 1;



    SELECT qty, product_id
    FROM internal_product_production_orders
    WHERE id = 1;
    
    
      SELECT
    IFNULL(SUM(qty), 0)
  FROM inventory_movements
  WHERE item_type = 'product'
	AND reference_type = "Production Order"
    AND reference_id = 1
    AND item_id = 1;
    
  SELECT
    IFNULL(SUM(qty), 0)
  FROM production_orders
  WHERE order_type = 'internal'
    AND order_id = 1;
    
    
    
    SELECT status FROM internal_product_production_orders WHERE id =1;
    
    SELECT * FROM debug_log ORDER BY created_at DESC;
    
    
    
    
    SELECT * FROM production_orders AS po
    WHERE po.order_type='internal' and po.order_id = 1;
    
    
    SELECT * FROM logs;
 SELECT * FROM operations;
 
 
 				SELECT id FROM production_orders
				WHERE order_type = 'internal' 
                AND order_id = NEW.id
                AND description = 'Internal production';

    SELECT 
		po.id
	FROM purchased_orders AS po
    JOIN
		purchased_orders_products AS pop
    ON po.id = pop.purchase_order_id
    WHERE
		pop.id = 1;
        
        
            SELECT 
		IFNULL(COUNT(*),0), 
		IFNULL(COUNT(CASE WHEN pop.status = 'shipping' THEN 1 END),0)
    INTO total_po, total_shipped
    FROM purchased_orders_products as pop
    WHERE pop.purchased_order_id = 1;
    
    
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
                AND im.description = 'Production order'
				AND im.reference_id = pop.id
			),0)
		FROM purchased_orders_products AS pop
		WHERE pop.id = 1;
        
        
        				SELECT 
					SUM(im.qty)
				FROM inventory_movements AS im
				WHERE im.reference_type = 'Order'
                AND im.item_type = 'product'
				AND im.reference_id = 1;
                
	INSERT INTO 
		internal_product_production_orders(product_id, qty, status, product_name, location_id, location_name)
    VALUES (2, 500, 'pending', 'Product A', 2, 'Location B');
    
    SELECT 1
        FROM (SELECT 
        i.id AS input_id,
        pi.equivalence,
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
    WHERE pi.product_id = 1
	AND ili.location_id = 2) AS diobar WHERE (800 * equivalence) > available_input;    
    
    
            SELECT
            pi.input_id,
            i.name AS input_name,
            pi.equivalence
        FROM products AS p
        JOIN products_inputs AS pi
            ON pi.product_id = p.id
        JOIN inputs AS i
            ON i.id = pi.input_id
        WHERE p.id = 1;
        
        
        
        
SELECT
    l.id AS location_id,
    l.name AS location_name,
    lpd.item_type,
    lpd.item_id,
    CASE 
        WHEN lpd.item_type = 'product' THEN p.name
        WHEN lpd.item_type = 'input' THEN i.name
        ELSE NULL
    END AS item_name,
    IFNULL(lpd.stock, 0) AS stock,
    IFNULL(lpd.committed, 0) AS committed,
    (IFNULL(lpd.stock, 0) - IFNULL(lpd.committed, 0)) AS available
FROM locations l
JOIN locations_location_types llt ON llt.location_id = l.id
JOIN location_types lt ON lt.id = llt.location_type_id

LEFT JOIN (
    SELECT
        ili.item_type,
        ili.item_id,
        ili.location_id,
        i.stock,
        (
            SELECT SUM(im.qty)
            FROM inventory_movements im
            WHERE im.item_type = ili.item_type
              AND im.movement_type = 'out'
              AND im.reference_type != 'transfer'
              AND im.is_locked = 1
              AND im.location_id = ili.location_id
              AND im.item_id = ili.item_id
        ) AS committed
    FROM inventories_locations_items ili
    JOIN inventories i ON i.id = ili.inventory_id
) lpd ON l.id = lpd.location_id

LEFT JOIN products p ON (lpd.item_type = 'product' AND lpd.item_id = p.id)
LEFT JOIN inputs i ON (lpd.item_type = 'input' AND lpd.item_id = i.id)

WHERE lt.name = 'Store'
ORDER BY item_type, item_name, available DESC;

-- CTE: Inventario básico con stock y cantidad comprometida (locked outgoing movements)
WITH inventory_data AS (
	SELECT
		ili.item_type,
		ili.item_id,
		ili.location_id,
		i.stock AS stock,
		IFNULL(SUM(im.qty), 0) AS committed
	FROM inventories_locations_items ili
	JOIN inventories i ON i.id = ili.inventory_id
	LEFT JOIN inventory_movements im ON
		im.item_type = ili.item_type
		AND im.item_id = ili.item_id
		AND im.location_id = ili.location_id
		AND im.movement_type = 'out'
		AND im.reference_type != 'transfer'
		AND im.is_locked = 1
	GROUP BY
		ili.item_type,
		ili.item_id,
		ili.location_id,
		i.stock
),
-- CTE: Productos en producción agrupados por tipo, item y ubicación
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
-- CTE: Agrega cantidades en producción por item y ubicación
inventory_inProduction AS (
    SELECT
        item_type,
        item_id,
        location_id,
        SUM(qty) AS qty
    FROM raw_inventory_inProduction
    GROUP BY item_type, item_id, location_id
),
-- CTE: Inventario producido (movimientos "in" de producción o pedidos, no bloqueados)
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
		AND im.reference_type IN ('Production Order', 'Order')
		AND im.is_locked = 0
	LEFT JOIN production_orders AS po ON po.id = im.reference_id
	GROUP BY ili.item_type, ili.item_id, ili.location_id
)
-- Consulta final que une ubicaciones con inventarios, productos e insumos
SELECT
    l.id AS location_id,
    l.name AS location_name,
    id.item_type,
    id.item_id,
    CASE 
        WHEN id.item_type = 'product' THEN p.name
        WHEN id.item_type = 'input' THEN i.name
        ELSE NULL
    END AS item_name,
    IFNULL(id.stock, 0) AS stock,
    IFNULL(id.committed, 0) AS committed_qty,
    IFNULL(ii.qty, 0) AS ordered_production_qty,
    IFNULL(ii.qty, 0) - IFNULL(ip.produced, 0) AS pending_production_qty,
    IFNULL(ip.produced, 0) AS produced_qty,
    IFNULL(
      (IFNULL(id.stock, 0) - IFNULL(id.committed, 0) - IFNULL(IFNULL(ii.qty, 0) - IFNULL(ip.produced, 0), 0)),
      0
    ) AS available
FROM locations l
JOIN locations_location_types llt ON llt.location_id = l.id
JOIN location_types lt ON lt.id = llt.location_type_id
LEFT JOIN inventory_data id ON id.location_id = l.id
LEFT JOIN products p ON id.item_type = 'product' AND id.item_id = p.id
LEFT JOIN inputs i ON id.item_type = 'input' AND id.item_id = i.id
LEFT JOIN inventory_inProduction ii ON
    ii.location_id = l.id
    AND ii.item_id = id.item_id
    AND ii.item_type = id.item_type
LEFT JOIN inventory_produced ip ON
    ip.location_id = l.id
    AND ip.item_id = id.item_id
    AND ip.item_type = id.item_type
WHERE lt.name = 'Store'
GROUP BY
    l.id, l.name,
    id.item_type, id.item_id,
    id.stock, id.committed,
    ip.produced,
    ii.qty,
    p.name, i.name
ORDER BY id.item_type, item_name, available DESC;


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
    AND im.reference_type IN ('Production Order', 'Order')
    AND im.is_locked = 0
LEFT JOIN production_orders AS po ON po.id = im.reference_id
GROUP BY ili.item_type, ili.item_id, ili.location_id;

SELECT
	IFNULL(SUM(p.qty),0)
FROM purchased_orders AS po
JOIN purchased_orders_products AS pop
ON pop.purchase_order_id = po.id
JOIN production_orders AS poo
ON poo.order_type = 'client'
AND poo.order_id = pop.id
JOIN productions AS p
ON p.production_order_id = poo.id
WHERE po.id = 1;













  SELECT IFNULL(SUM(im.qty),0)
  FROM inventory_movements AS im
  WHERE im.reference_type = 'Order'
    AND im.item_type = 'product'
    AND im.reference_id = 2
	AND im.description = 'Already in inventory';





			SELECT
				l.id, l.name
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
			WHERE po.id = 2
			AND po.order_type = 'internal';
            
            
			SELECT
				l.id, l.name
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
			WHERE po.id = 1
			AND po.order_type = 'client';
            
            
			SELECT * FROM inventory_movements 
			WHERE reference_type = 'Production Order'
			AND movement_type IN ('in', 'out')
			AND item_type = 'input'
			AND reference_id = 1
			AND description = 'Internal production';
            
            
            
    SELECT
        *
    FROM inventory_movements
    WHERE item_type = 'product'
        AND reference_type = "Order"
        AND reference_id IN (SELECT id FROM production_orders AS po WHERE po.order_id=1 AND po.order_type='client')
        AND item_id = 1
        AND is_locked = 1
        AND description = 'Production order';
        
        
        SELECT id FROM production_orders AS po WHERE po.order_id=1 AND po.order_type='client';
        
  SELECT * FROM inventory_movements
  WHERE id IN (
    SELECT id FROM (
      SELECT im.id
      FROM inventory_movements im
      WHERE (im.reference_id = 1 AND im.reference_type = 'Order')
         OR (
           im.reference_id IN (
             SELECT pop.id
             FROM purchased_orders_products AS pop
             JOIN production_orders AS po
               ON po.order_type = 'client'
               AND po.order_id = 1
           )
           AND im.reference_type = 'Order'
           AND im.description = 'Production order'
         )
    ) AS subquery_ids
  );
  
  
    SELECT *
  FROM inventory_movements AS im
  JOIN production_orders AS po
  ON im.reference_id = po.order_id
  AND im.reference_type = 'Order'
  AND im.description = 'Production order'
  WHERE po.id = 1;
  
  SELECT * FROM inventory_movements
  WHERE id IN (
    SELECT id FROM (
      SELECT im.id
      FROM inventory_movements im
      JOIN production_orders po
        ON im.reference_id = po.order_id
       AND im.reference_type = 'Order'
       AND im.description = 'Production order'
      WHERE po.id = 1
    ) AS sub_ids
  );
  
  SELECT * FROM inventory_movements
  WHERE id IN (
    SELECT id FROM (
      SELECT im.id
      FROM inventory_movements im
      JOIN production_orders po
        ON im.reference_id = po.id
       AND im.reference_type = 'Order'
       AND im.description = 'Production order'
      WHERE po.id = 2
    ) AS sub_ids);
    
    
    
    -- Obtener cantidad ordenada para producir
    SELECT
        IFNULL(SUM(qty), 0)
    INTO v_production_qty
    FROM inventory_movements
    WHERE item_type = 'product'
        AND reference_type = 'Production Order'
        AND reference_id IN (SELECT id FROM production_orders AS po WHERE po.order_id=2 AND po.order_type='internal')
        AND item_id = 1
        AND is_locked = 1
        AND description = 'Internal production';

    SELECT qty, product_id
    FROM internal_product_production_orders
    WHERE id = 2;
    
    
    SELECT IFNULL(SUM(i.qty), 0)
    FROM locations AS l
    JOIN inventories_locations_items AS ili
    ON ili.location_id = l.id
    JOIN inventories AS i
    ON i.id = ili.inventory_id
    WHERE l.id = 1;
    
    


SELECT
    IFNULL(SUM(stock), 0) AS stock
FROM products AS p
JOIN inventories_locations_items AS ili
ON ili.item_id = p.id
JOIN inventories AS i
ON i.id = ili.inventory_id
AND ili.item_type = 'product'
WHERE p.id = 1;

SELECT
	i.id,
    i.name
FROM products AS p
JOIN products_inputs AS pi
ON pi.product_id = p.id
JOIN inputs AS i
ON i.id = pi.input_id
WHERE p.id = 1;


SELECT 
	i.stock
FROM inventories AS i
JOIN inventories_locations_items AS ili
ON ili.inventory_id = i.id;


		SELECT
			i.id
		FROM products_inputs AS pi
		JOIN inputs AS i
		ON i.id = pi.input_id
		WHERE pi.product_id = 1;
        
        
  -- Verificamos si el producto tiene inputs
    SELECT *
    FROM inventories_locations_items AS ili
    WHERE ili.location_id = 7
      AND ili.item_type = 'product'
      AND ili.item_id = 4;
      
      
SELECT IFNULL(l.id, 0) INTO v_location_id
FROM locations_production_lines AS lpl
JOIN locations AS l ON l.id = lpl.location_id
WHERE lpl.production_line_id = 7
LIMIT 1;     
      
	SELECT * FROM inventories;
    
    
  -- Obtener la location asociada a la línea de producción
	SELECT IFNULL(l.id, 0)
	FROM locations_production_lines AS lpl
	JOIN locations AS l ON l.id = lpl.location_id
	WHERE lpl.production_line_id = 7
	LIMIT 1;    
    
    
    SELECT
        l.id AS location_id,
        l.name AS location_name,
        IFNULL(lpd.stock, 0) AS stock,
        IFNULL(lpd.commited, 0) AS committed,
        (IFNULL(lpd.stock, 0) - IFNULL(lpd.commited, 0)) AS available
    FROM locations l
    JOIN locations_location_types llt ON llt.location_id = l.id
    JOIN location_types lt ON lt.id = llt.location_type_id
    JOIN (
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
          AND ili.item_id = 4
    ) lpd ON l.id = lpd.location_id
    WHERE lt.name = 'Production';



SELECT
    IFNULL(SUM(pop.qty), 0) AS purchased_order_product_qty,
    IFNULL(SUM(po.qty), 0) AS production_order_qty,
    IFNULL(SUM(p.qty), 0) AS production_qty
FROM purchased_orders_products AS pop
JOIN production_orders AS po 
	ON po.order_id = pop.id 
	AND po.order_type = 'client'
JOIN productions AS p
	ON p.production_order_id = po.id
WHERE pop.id = 26;


SELECT
    IFNULL(SUM(pop.qty), 0) AS purchased_order_product_qty,
    IFNULL(SUM(po.qty), 0) AS production_order_qty
FROM purchased_orders_products AS pop
JOIN production_orders AS po 
	ON po.order_id = pop.id 
	AND po.order_type = 'client';

SELECT
	*
FROM purchased_orders_products pop
JOIN purchased_orders_products_locations_production_lines poplp
	ON poplp.purchase_order_product_id = pop.id
JOIN locations_production_lines lpl
	ON lpl.production_line_id = poplp.production_line_id
JOIN locations l
	ON l.id = lpl.location_id
JOIN inventories_locations_items AS ili
	ON ili.location_id = l.id
    AND ili.item_id = pop.product_id
    AND ili.item_type = 'product'
JOIN inventories AS i
	ON i.id = ili.inventory_id
WHERE pop.id = 1;

SELECT * FROM purchased_orders_products;	



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
    WHERE pop.id = 5
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
        i.stock,
        i.minimum_stock,
        i.maximum_stock,
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
      AND ili.item_id = 3
) lpd ON ul.location_id = lpd.location_id;


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
      AND im.reference_type IN ('Production Order', 'Order')
      AND im.is_locked = 0
    LEFT JOIN production_orders AS po ON po.id = im.reference_id
    GROUP BY ili.item_type, ili.item_id, ili.location_id
  )
  
  SELECT
    d.item_type,
    d.item_id,
    d.location_id,
    d.stock,
    d.committed,
    ip.qty AS in_production,
    pr.produced
FROM inventory_data d
LEFT JOIN inventory_inProduction ip 
    ON ip.item_type = d.item_type
   AND ip.item_id = d.item_id
   AND ip.location_id = d.location_id
LEFT JOIN inventory_produced pr
    ON pr.item_type = d.item_type
   AND pr.item_id = d.item_id
   AND pr.location_id = d.location_id;
    
    
    	SELECT
		l.id AS location_id,
		l.name AS location_name,
		IFNULL(lpd.stock, 0) AS stock,
		IFNULL(lpd.committed, 0) AS committed,
		(IFNULL(lpd.stock, 0) - IFNULL(lpd.committed, 0)) AS available
	FROM locations l
	JOIN locations_location_types llt 
		ON llt.location_id = l.id
	JOIN location_types lt 
		ON lt.id = llt.location_type_id
	JOIN (
		SELECT
			ili.item_type,
			ili.item_id,
			ili.location_id,
			i.stock,
			IFNULL(SUM(im.qty), 0) AS committed
		FROM inventories_locations_items ili
		JOIN inventories i 
			ON i.id = ili.inventory_id
		LEFT JOIN inventory_movements im 
			ON im.item_id = ili.item_id
		   AND im.location_id = ili.location_id
		   AND im.item_type = 'product'
		   AND im.movement_type = 'allocate'
		   AND im.reference_type NOT IN ('Transfer', 'Scrap')
		   AND im.is_locked = 1
		WHERE ili.item_type = 'product'
		  AND ili.item_id = 1
		GROUP BY ili.item_type, ili.item_id, ili.location_id, i.stock
	) lpd 
		ON l.id = lpd.location_id
	WHERE lt.name = 'Store';
    
    SELECT pop.product_id, pop.qty, p.name
    FROM purchased_orders_products pop
    JOIN products p ON p.id = pop.product_id
    WHERE pop.id = 1;

  SELECT 
    IFNULL(SUM(im.qty), 0)
  FROM inventory_movements AS im
  WHERE im.reference_type = 'Order'
  AND im.reference_id = 1
  AND im.movement_type = 'allocate'
  AND im.description = 'Inventory allocation'
  AND im.item_id = 1
  AND im.item_type = 'product'
  ORDER BY qty ASC
  LIMIT 1;
  
    SELECT
    IFNULL(SUM(im.qty), 0)
  FROM inventory_movements AS im
  WHERE im.reference_type = 'Production Order'
  AND im.reference_id = 1
  AND im.movement_type = 'allocate'
  AND im.description = 'Production allocation'
  AND im.item_id = 1
  AND im.item_type = 'product'
  ORDER BY qty ASC
  LIMIT 1;
  
      SELECT *
    FROM inventory_movements AS im
    WHERE im.reference_type IN ('Order', 'Production Order')
      AND (
        im.reference_id = 1 
        OR im.reference_id IN (
          SELECT id
          FROM production_orders AS po
          WHERE po.order_type = 'client'
          AND po.order_id = 1
        )
      )
      AND im.item_type IN ('product', 'input')
      AND im.movement_type = 'allocate';
      
DELETE FROM inventory_movements WHERE id = 18;
      
      INSERT INTO inventory_movements (
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
    is_locked,
    created_at
) VALUES (
    1,                        -- location_id
    'Location A',             -- location_name
    2,                        -- item_id
    'input',                  -- item_type
    'Insumo z',               -- item_name
    -20.0000,                 -- qty (negativo)
    'allocate',               -- movement_type
    1,                        -- reference_id
    'Production Order',       -- reference_type
    'Production ',  -- description
    1,                        -- is_locked
    '2025-08-21 17:48:02'     -- created_at
);
  
  SELECT
    IFNULL(SUM(im.qty), 0)
  FROM inventory_movements AS im
  WHERE im.reference_type = 'Production Order'
  AND ( im.reference_id = 1
    OR im.reference_id IN (
      SELECT id
      FROM production_orders AS po
      WHERE po.order_type = 'client'
      AND po.status NOT IN ('cancel')
      AND po.order_id = 1
    )
  )
  AND im.movement_type = 'allocate'
  AND im.description IN ('Production Allocation', 'Adjust Production Allocation')
  AND im.item_id = 1
  AND im.item_type = 'product'
  LIMIT 1;
  
  SELECT 
    IFNULL(SUM(im.qty), 0)
  FROM inventory_movements AS im
  WHERE im.reference_type = 'Order'
  AND im.reference_id = 1
  AND im.movement_type = 'allocate'
  AND im.description IN ('Inventory Allocation', 'Adjust Inventory Allocation')
  AND im.item_id = 1
  AND im.item_type = 'product'
  LIMIT 1;
  
  
  	SELECT
		IFNULL(pop.qty, 0),
		IFNULL(po_sum.production_order_qty, 0),
		IFNULL(p_sum.production_qty, 0)
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
	WHERE pop.id = 1;

  -- inventario comprometido de produccion
  SELECT
    IFNULL(SUM(im.qty), 0)
  FROM inventory_movements AS im
  WHERE im.reference_type = 'Production Order'
  AND ( im.reference_id = 1
    OR im.reference_id IN (
      SELECT id
      FROM production_orders AS po
      WHERE po.order_type = 'client'
      AND po.status NOT IN ('cancel')
      AND po.order_id = 1
    )
  )
  AND im.movement_type = 'allocate'
  AND im.description IN ('Production Allocation', 'Adjust Production Allocation')
  AND im.item_id = 1
  AND im.item_type = 'product'
  LIMIT 1;
  
    SELECT
    IFNULL(SUM(im.qty), 0)
  FROM temp_inventory_movements_pop AS im
  WHERE im.reference_type = 'Production Order'
  AND ( im.reference_id = 1
    OR im.reference_id IN (
      SELECT id
      FROM production_orders AS po
      WHERE po.order_type = 'client'
      AND po.status NOT IN ('cancel')
      AND po.order_id = 1
    )
  )
  AND im.movement_type = 'allocate'
  AND im.description IN ('Production Allocation', 'Adjust Production Allocation')
  AND im.item_id = 1
  AND im.item_type = 'product'
  LIMIT 1;  
  
  WITH temp_inventory_movements_pop AS (
      SELECT *
    FROM inventory_movements AS im
    WHERE im.reference_type IN ('Order', 'Production Order')
      AND (
        im.reference_id = 1
        OR im.reference_id IN (
          SELECT id
          FROM production_orders AS po
          WHERE po.order_type = 'client'
          AND po.order_id = 1
        )
      )
      AND im.item_type IN ('product', 'input')
      AND im.movement_type = 'allocate'
  )
    SELECT
    IFNULL(SUM(im.qty), 0)
  FROM temp_inventory_movements_pop AS im
  WHERE im.reference_type = 'Production Order'
  AND ( im.reference_id = 1
    OR im.reference_id IN (
      SELECT id
      FROM production_orders AS po
      WHERE po.order_type = 'client'
      AND po.status NOT IN ('cancel')
      AND po.order_id = 1
    )
  )
  AND im.movement_type = 'allocate'
  AND im.description IN ('Production Allocation', 'Adjust Production Allocation')
  AND im.item_id = 1
  AND im.item_type = 'product'
  LIMIT 1;
  


WITH   temp_inventory_movements_pop  AS (
    SELECT *
    FROM inventory_movements AS im
    WHERE im.reference_type IN ('Order', 'Production Order')
      AND (
        im.reference_id = 1
        OR im.reference_id IN (
          SELECT id
          FROM production_orders AS po
          WHERE po.order_type = 'client'
          AND po.order_id = 1
        )
      )
      AND im.item_type IN ('product', 'input')
      AND im.movement_type = 'allocate'
)
    SELECT
    IFNULL(SUM(im.qty), 0)
  FROM temp_inventory_movements_pop AS im
  WHERE im.reference_type = 'Production Order'
  AND ( im.reference_id = 1
    OR im.reference_id IN (
      SELECT id
      FROM production_orders AS po
      WHERE po.order_type = 'client'
      AND po.status NOT IN ('cancel')
      AND po.order_id = 1
    )
  )
  AND im.movement_type = 'allocate'
  AND im.description IN ('Production Allocation', 'Adjust Production Allocation')
  AND im.item_id = 1
  AND im.item_type = 'product'
  LIMIT 1;
  





DROP PROCEDURE IF EXISTS test;
DELIMITER //
CREATE PROCEDURE test(
  IN in_pop_id INT,
  IN in_new_qty INT,
  IN in_product_id INT,
  IN in_product_name VARCHAR(100)
)
BEGIN
  DECLARE v_location_id INT DEFAULT 0;
  DECLARE v_location_name VARCHAR(100) DEFAULT '';
  DECLARE v_inventory_allocation DECIMAL(14,4) DEFAULT 0.00;
  DECLARE v_production_allocation DECIMAL(14,4) DEFAULT 0.00;
  DECLARE v_done INT DEFAULT 0;
  DECLARE v_input_id INT DEFAULT 0;
  DECLARE v_input_name VARCHAR(100) DEFAULT '';
  DECLARE v_equivalence DECIMAL(14,4) DEFAULT 0.00;
  
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
        im.reference_id = 1
        OR im.reference_id IN (
          SELECT id
          FROM production_orders AS po
          WHERE po.order_type = 'client'
          AND po.order_id = 1
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

  DROP TEMPORARY TABLE IF EXISTS temp_inventory_movements_pop;

  SELECT v_production_allocation;

END //
DELIMITER ;

SELECT * FROM debug_log;

CALL test(
	1,
    500,
    1,
    'Producto A'
);




SELECT 'product' AS entity,
       p.id        AS product_id,
       p.name      AS product_name,
       NULL        AS input_id,
       NULL        AS input_name
FROM products p
WHERE p.id = 1
UNION ALL
SELECT 'product_input' AS entity,
       pi.product_id   AS product_id,
       NULL            AS product_name,
       pi.input_id     AS input_id,
       NULL            AS input_name
FROM products_inputs pi
WHERE pi.product_id = 1
UNION ALL
SELECT 'input'  AS entity,
       p.id     AS product_id,
       NULL     AS product_name,
       i.id     AS input_id,
       i.name   AS input_name
FROM inputs i
JOIN products_inputs pi ON pi.input_id = i.id
JOIN products p ON p.id = pi.product_id
WHERE p.id = 1;





SELECT 'product' AS entity,
       p.id      AS product_id,
       p.name    AS product_name,
       NULL      AS input_id,
       NULL      AS input_name
FROM products p
WHERE p.id = 1

UNION ALL

SELECT 'input'  AS entity,
       p.id      AS product_id,
       p.name    AS product_name,
       i.id      AS input_id,
       i.name    AS input_name
FROM products p
JOIN products_inputs pi ON pi.product_id = p.id
JOIN inputs i ON i.id = pi.input_id
WHERE p.id = 1;








WITH products_inputs_temp AS (
  SELECT
    inp.id   AS input_id,
    inp.name AS input_name
  FROM products p
  JOIN products_inputs pi   
	ON pi.product_id = p.id
  JOIN inputs inp           
	ON inp.id = pi.input_id
  WHERE p.id = 1
),
selected_location AS (
  SELECT l.id AS location_id
  FROM locations AS l
  JOIN locations_location_types AS llt 
	ON llt.location_id = l.id
  JOIN location_types AS lt          
	ON lt.id = llt.location_type_id
  WHERE lt.name = 'Store'
    AND l.id   = 1
),
loc_product_stock AS (
  SELECT
    ili.item_id,
    ili.location_id,
    inv.stock,
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
  pit.input_id,
  pit.input_name,
  IFNULL(lps.stock, 0) AS stock,
  IFNULL(lps.stock, 0) - IFNULL(lps.commited, 0) AS available
FROM products_inputs_temp AS pit
LEFT JOIN loc_product_stock AS lps
       ON lps.item_id = pit.input_id
ORDER BY available DESC;


SELECT * FROM locations_production_lines;
SELECT * FROM production_lines_products;




	SELECT
		l.*
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
	AND ili.item_id = 1;
    
    
    

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
      'purchased_order_products',
        (
          SELECT COALESCE(
                   JSON_ARRAYAGG(
                     JSON_OBJECT(
                       'id', pop2.id,
                       'product_id', pop2.product_id,
                       'product_name', pop2.product_name,
                       'qty', pop2.qty,
                       'status', pop2.status,
                       'recorded_price', pop2.recorded_price,
                       'original_price', pop2.original_price
                     )
                   ),
                   JSON_ARRAY()
                 )
          FROM purchased_orders_products AS pop2
          WHERE pop2.purchase_order_id = pos.id
        )
    )
  ) AS payload
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
WHERE po.id = 2
  AND po.order_type = 'client'
LIMIT 1;



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
  )    
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
WHERE po.id = 1
AND po.order_type = 'internal';










SELECT
  JSON_OBJECT(
    'id', po.id,
    'order_type', po.order_type,
    'order_id', po.order_id,
    'product_id', po.product_id,
    'product_name', po.product_name,
    'qty', po.qty,
    'status', po.status,
    'created_at', po.created_at,
    'updated_at', po.updated_at,
    'productions', (
      SELECT 
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', p.id,
              'product_id', p.product_id,
              'product_name', p.product_name,
              'qty', p.qty,
              'created_at', p.created_at,
              'updated_at', p.updated_at
            )
          ),
          JSON_ARRAY()
        )
      FROM productions AS p
      WHERE p.production_order_id = po.id
    )
  )
FROM purchased_orders_products AS pop
JOIN production_orders AS po
  ON po.order_id = pop.id
  AND po.order_type = 'client'
WHERE pop.id = 1;

SELECT * FROM internal_production_orders_lines_products;
SELECT * FROM debug_log;
SELECT * FROM production_line_queue;
SELECT * FROM production_orders;

SHOW TRIGGERS LIKE 'productions';


SHOW CREATE TABLE productions;

describe productions;

INSERT INTO productions (
    production_order_id,
    product_id,
    product_name,
    qty,
    process_id
) VALUES (
    1,           -- production_order_id
    1,           -- product_id
    'Producto A',-- product_name
    3,          -- qty
    3           -- process_id
);



    SELECT 
        IFNULL(SUM(p.qty), 0),
        IFNULL(SUM(s.qty), 0)
    FROM production_orders AS po
    LEFT JOIN productions AS p
        ON p.production_order_id = po.order_id
    LEFT JOIN scrap AS s
        ON s.reference_id = po.id
        AND s.reference_type = 'Production'
    WHERE po.id = 4
        AND po.order_type = 'internal';
        
	SELECT * FROM productions;


SELECT * from products_processes;




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
        WHERE po.id = 2
            AND po.order_type = 'internal';
            
            
SELECT * FROM internal_product_production_orders;


SELECT
	p.id AS product_id,
    p.name AS product_name,
    i.name AS input_name,
    pi.equivalence,
    pr.id AS process_id,
    pr.name AS process_name,
    pip.qty as consumable_qty
FROM products_inputs_processes AS pip
JOIN products AS p
    ON p.id = pip.product_id
JOIN products_inputs AS pi
    ON pi.id = pip.product_input_id
JOIN inputs AS i
    ON i.id = pi.input_id
JOIN products_processes AS pp
    ON pp.id = pip.product_process_id
JOIN processes AS pr
    ON pr.id = pp.process_id
WHERE p.id = 1;




    SELECT pp.*
    FROM products_processes pp
    WHERE pp.product_id = 1
    AND pp.sort_order = (
        SELECT MAX(sort_order)
        FROM products_processes
        WHERE product_id = 1
    )
    LIMIT 1;
    
    
	SELECT 
        (
            SELECT pp.process_id
            FROM products_processes pp
            WHERE pp.product_id = 1
            AND pp.sort_order = (
                SELECT MAX(sort_order)
                FROM products_processes
                WHERE product_id = 1
            )
            LIMIT 1
        ) = 3;

