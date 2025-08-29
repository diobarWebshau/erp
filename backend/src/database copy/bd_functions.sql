
-- OBTENER RESUMEN DE ORDENES DE LAS CANTIDADES PRODUCIDAS Y COMPROMETIDAS DE UNA PURCHASED ORDER PRODUCT
DELIMITER //
CREATE FUNCTION get_order_summary_by_type(
    in_order_id INT,
    in_order_type VARCHAR(100)
)
RETURNS JSON
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE result JSON;

  IF in_order_type = 'client' THEN
    SELECT JSON_OBJECT(
      'order_qty', pop.qty,
      'committed_qty', IFNULL(im.committed_qty, 0),
      'production_qty', IFNULL(p.production_qty, 0),
      'qty', pop.qty - IFNULL(im.committed_qty, 0) - IFNULL(p.production_qty, 0)
    )
    INTO result
    FROM purchased_orders_products AS pop
    LEFT JOIN (
      SELECT item_id, reference_id, SUM(qty) AS committed_qty
      FROM inventory_movements
      WHERE item_type = 'product'
      GROUP BY item_id, reference_id
    ) AS im ON im.item_id = pop.product_id AND im.reference_id = pop.id
    LEFT JOIN (
      SELECT order_id, SUM(qty) AS production_qty
      FROM productions
      WHERE order_type = 'client'
      GROUP BY order_id
    ) AS p ON p.order_id = pop.id
    WHERE pop.id = in_order_id;

  ELSE
    SELECT JSON_OBJECT(
      'order_qty', ipo.qty,
      'committed_qty', IFNULL(im.committed_qty, 0),
      'production_qty', IFNULL(p.production_qty, 0),
      'qty', ipo.qty - IFNULL(im.committed_qty, 0) - IFNULL(p.production_qty, 0)
    )
    INTO result
    FROM internal_product_production_orders AS ipo
    LEFT JOIN (
      SELECT item_id, reference_id, SUM(qty) AS committed_qty
      FROM inventory_movements
      WHERE item_type = 'product'
      GROUP BY item_id, reference_id
    ) AS im ON im.item_id = ipo.product_id AND im.reference_id = ipo.id
    LEFT JOIN (
      SELECT order_id, SUM(qty) AS production_qty
      FROM productions
      WHERE order_type = 'internal'
      GROUP BY order_id
    ) AS p ON p.order_id = ipo.id
    WHERE ipo.id = in_order_id;
  END IF;

  RETURN result;
END;
//
DELIMITER ;


/***/
DELIMITER // 
CREATE FUNCTION validate_production_order_completed(
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

SELECT validate_production_order_completed(1);
