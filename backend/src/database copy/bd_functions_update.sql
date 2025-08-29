
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
				WHERE im.reference_type = 'order'
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


SELECT is_purchased_order_shipped(1);
SELECT order_has_production(1, 'client') AS has_production;
SELECT is_order_completed(1, 'client');
SELECT is_production_order_completed(1) AS validation;
SELECT asign_production_line(1,1) AS line;





SELECT *
FROM production_orders AS po
JOIN purchased_orders_products AS pop
ON	pop.id = po.order_id
JOIN internal_product_production_orders AS ippo
WHERE po.order_type = 'internal' OR po.order_type =  'client'
