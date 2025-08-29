SHOW DATABASES;
USE webshau_erp;

SELECT 
    pl.name, p.name
FROM
    purchased_orders_products AS pop
JOIN
    products as p ON p.id = pop.product_id
JOIN
    locations_production_lines_products as lplp
    ON lplp.product_id = p.id
JOIN
    locations_production_lines as lpl 
    ON lpl.id = lplp.location_production_line_id
join
    purchased_orders_products_locations_production_lines as poplpl
    ON poplpl.purchase_order_product_id = pop.id AND
    poplpl.location_production_line_id = lpl.id
JOIN
    production_lines AS pl ON pl.id = lpl.production_line_id
WHERE
    p.id = 2;
    

SELECT DISTINCT
    pl.name, p.name
FROM
    purchased_orders_products AS pop
JOIN
    products AS p ON p.id = pop.product_id
JOIN
    locations_production_lines_products AS lplp ON lplp.product_id = p.id
JOIN
    locations_production_lines AS lpl ON lpl.id = lplp.location_production_line_id
JOIN
    purchased_orders_products_locations_production_lines AS poplpl
    ON poplpl.purchase_order_product_id = pop.id 
    AND poplpl.location_production_line_id = lpl.id
JOIN
    production_lines AS pl ON pl.id = lpl.production_line_id
WHERE
    p.id = 1;


SELECT
    pl.id AS production_line_id,
    pl.name AS production_line_name,
    p.id AS product_id,
    p.name AS product_name
FROM products AS p
JOIN locations_production_lines_products AS lplp
    ON lplp.product_id = p.id
JOIN locations_production_lines AS lpl
    ON lpl.id = lplp.location_production_line_id
JOIN production_lines AS pl
    ON pl.id = lpl.production_line_id
WHERE p.id = 1;


SELECT 
    pl.name,
    p.name
FROM
    purchased_orders_products AS pop
JOIN
    products as p ON p.id = pop.product_id
JOIN
    locations_production_lines_products as lplp
    ON lplp.product_id = p.id
JOIN
    locations_production_lines as lpl 
    ON lpl.id = lplp.location_production_line_id
join
    purchased_orders_products_locations_production_lines as poplpl
    ON poplpl.purchase_order_product_id = pop.id AND
    poplpl.location_production_line_id = lpl.id
JOIN
    production_line_id AS pl ON pl.id = lpl.production_line_id
WHERE
    p.id = 1;

SELECT
    pl.id AS production_line_id,
    pl.name AS production_line_name,
    p.id AS product_id,
    p.name AS product_name
FROM products AS p
JOIN locations_production_lines_products AS lplp
    ON lplp.product_id = p.id
JOIN locations_production_lines AS lpl
    ON lpl.id = lplp.location_production_line_id
JOIN production_lines AS pl
    ON pl.id = lpl.production_line_id
JOIN inventories_locations_production_lines_products AS ilplp 
    ON ilplp.line_products_id = lplp.id
JOIN inventories as i
    ON i.id = ilplp.inventory
WHERE p.id = 1;


SELECT
    pl.id AS production_line_id,
    pl.name AS production_line_name,
    p.id AS product_id,
    p.name AS product_name,
    i.id AS inventory_id,
    i.stock AS stock
FROM products AS p
JOIN locations_production_lines_products AS lplp
    ON lplp.product_id = p.id
JOIN locations_production_lines AS lpl
    ON lpl.id = lplp.location_production_line_id
JOIN production_lines AS pl
    ON pl.id = lpl.production_line_id
LEFT JOIN inventories_locations_production_lines_products AS ilplp 
    ON ilplp.line_products_id = lplp.id
LEFT JOIN inventories as i
    ON i.id = ilplp.inventory_id 
WHERE p.id = 2;



SELECT * FROM (SELECT
	lpl.id AS location_production_line_id,
    pl.id AS production_line_id,
    pl.name AS production_line_name,
    p.id AS product_id,
    p.name AS product_name,
    i.id AS inventory_id,
    i.stock AS stock
FROM products AS p
JOIN locations_production_lines_products AS lplp
    ON lplp.product_id = p.id
JOIN locations_production_lines AS lpl
    ON lpl.id = lplp.location_production_line_id
JOIN production_lines AS pl
    ON pl.id = lpl.production_line_id
JOIN inventories_locations_production_lines_products AS ilplp 
    ON ilplp.line_products_id = lplp.id
JOIN inventories as i
    ON i.id = ilplp.inventory_id
WHERE p.id = 1) AS stock_inventory_products_location
ORDER BY 
	stock DESC
LIMIT 1;


SELECT * FROM (SELECT
	lpl.id AS location_production_line_id,
    pl.id AS production_line_id,
    pl.name AS production_line_name,
    p.id AS product_id,
    p.name AS product_name,
    i.id AS inventory_id,
    i.stock AS stock
FROM products AS p
JOIN locations_production_lines_products AS lplp
    ON lplp.product_id = p.id
JOIN locations_production_lines AS lpl
    ON lpl.id = lplp.location_production_line_id
JOIN production_lines AS pl
    ON pl.id = lpl.production_line_id
JOIN inventories_locations_production_lines_products AS ilplp 
    ON ilplp.line_products_id = lplp.id
JOIN inventories as i
    ON i.id = ilplp.inventory_id
WHERE p.id = 1
ORDER BY 
	i.stock DESC
LIMIT 1
) AS stock_inventory_products_location;


SELECT * FROM 
(
    SELECT
        lpl.id AS location_production_line_id,
        pl.id AS production_line_id,
        pl.name AS production_line_name,
        p.id AS product_id,
        p.name AS product_name,
        i.id AS inventory_id,
        i.stock AS stock,
        (
            SELECT 
                COUNT(*)
            FROM
                productions AS sub_prod
			JOIN
				purchased_orders_products as sub_pop
                ON sub_pop = 
        ) AS total_lines_with_products
    FROM products AS p
    JOIN locations_production_lines_products AS lplp
        ON lplp.product_id = p.id
    JOIN locations_production_lines AS lpl
        ON lpl.id = lplp.location_production_line_id
    JOIN production_lines AS pl
        ON pl.id = lpl.production_line_id
    JOIN inventories_locations_production_lines_products AS ilplp 
        ON ilplp.line_products_id = lplp.id
    JOIN inventories AS i
        ON i.id = ilplp.inventory_id
    WHERE p.id = 1
    ORDER BY 
        i.stock DESC
    LIMIT 1
) AS stock_inventory_products_location;






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
ORDER BY i.stock DESC
LIMIT 1;
