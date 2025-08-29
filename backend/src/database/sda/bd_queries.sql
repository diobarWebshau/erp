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
                  AND im.movement_type = 'out'
                  AND im.reference_type != 'transfer'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = ili.item_id
            ) AS commited
        FROM inventories_locations_items ili
        JOIN inventories i ON i.id = ili.inventory_id
        WHERE ili.item_type = 'input'
          AND ili.item_id = 2
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
        WHERE im.reference_type = 'order'
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
	AND reference_type = "production"
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
				WHERE im.reference_type = 'order'
                AND im.description = 'Production order'
				AND im.reference_id = pop.id
			),0)
		FROM purchased_orders_products AS pop
		WHERE pop.id = 1;
        
        
        				SELECT 
					SUM(im.qty)
				FROM inventory_movements AS im
				WHERE im.reference_type = 'order'
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
		AND im.reference_type IN ('production', 'order')
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
    AND im.reference_type IN ('production', 'order')
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
  WHERE im.reference_type = 'order'
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
			WHERE reference_type = 'production'
			AND movement_type IN ('in', 'out')
			AND item_type = 'input'
			AND reference_id = 1
			AND description = 'Internal production';
            
            
            
    SELECT
        *
    FROM inventory_movements
    WHERE item_type = 'product'
        AND reference_type = "order"
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
      WHERE (im.reference_id = 1 AND im.reference_type = 'order')
         OR (
           im.reference_id IN (
             SELECT pop.id
             FROM purchased_orders_products AS pop
             JOIN production_orders AS po
               ON po.order_type = 'client'
               AND po.order_id = 1
           )
           AND im.reference_type = 'order'
           AND im.description = 'Production order'
         )
    ) AS subquery_ids
  );
  
  
    SELECT *
  FROM inventory_movements AS im
  JOIN production_orders AS po
  ON im.reference_id = po.order_id
  AND im.reference_type = 'order'
  AND im.description = 'Production order'
  WHERE po.id = 1;
  
  SELECT * FROM inventory_movements
  WHERE id IN (
    SELECT id FROM (
      SELECT im.id
      FROM inventory_movements im
      JOIN production_orders po
        ON im.reference_id = po.order_id
       AND im.reference_type = 'order'
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
       AND im.reference_type = 'order'
       AND im.description = 'Production order'
      WHERE po.id = 2
    ) AS sub_ids);
    
    
    
    -- Obtener cantidad ordenada para producir
    SELECT
        IFNULL(SUM(qty), 0)
    INTO v_production_qty
    FROM inventory_movements
    WHERE item_type = 'product'
        AND reference_type = 'production'
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
      AND im.reference_type IN ('production', 'order')
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
      i.id;
      
      
          SELECT id FROM (
      SELECT im.id
      FROM inventory_movements im
      WHERE (im.reference_id = 1 AND im.reference_type = 'order')
         OR (
           im.reference_id IN (
             SELECT pop.id
             FROM purchased_orders_products AS pop
             JOIN production_orders AS po
               ON po.order_type = 'client'
               AND po.order_id = pop.id
           )
           AND im.reference_type = 'order'
           AND im.description = 'Production order'
         )
    ) AS subquery_ids;
    
    
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
                  AND im.reference_type != 'Transfer'
                  AND im.is_locked = 1
                  AND im.location_id = ili.location_id
                  AND im.item_id = ili.item_id
            ) AS commited
        FROM inventories_locations_items ili
        JOIN inventories i ON i.id = ili.inventory_id
        WHERE ili.item_type = 'product'
          AND ili.item_id = 1
    ) lpd ON l.id = lpd.location_id
    WHERE lt.name = 'Store';
    
    
    
    
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
          AND ili.item_id = 1
    ) lpd ON l.id = lpd.location_id
    WHERE lt.name = 'Store';
    
    
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
            WHERE pi.product_id = 1
              AND ili.location_id = 1;
    