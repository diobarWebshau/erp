DROP PROCEDURE IF EXISTS sp_update_movement_inventory_ippo_update_fix;
DELIMITER //
CREATE PROCEDURE sp_update_movement_inventory_ippo_update_fix(
  IN in_ippo_id INT,
  IN in_new_qty INT,
  IN in_product_id INT,
  IN in_product_name VARCHAR(100)
)
BEGIN
  
END //
DELIMITER ;