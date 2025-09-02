USE u482698715_shau_erp;

DROP FUNCTION IF EXISTS func_get_extra_data_production_order;
DELIMITER //
CREATE FUNCTION func_get_extra_data_production_order(
    in_order_id INT,
    in_order_type VARCHAR(100)
)
RETURNS JSON
NOT DETERMINISTIC
READS SQL DATA
BEGIN

    DECLARE extra_data JSON;
    DECLARE v_location JSON DEFAULT NULL;
    DECLARE v_production_line JSON DEFAULT NULL;
    DECLARE v_production_qty DECIMAL(14, 4) DEFAULT 0;
    DECLARE v_scrap_qty DECIMAL(14, 4) DEFAULT 0;

    -- Obtener la cantidad de producida y desecho de la orden de produccion
    SELECT 
        IFNULL(SUM(p.qty), 0),
        IFNULL(SUM(s.qty), 0)
    INTO 
        v_production_qty,
        v_scrap_qty
    FROM production_orders AS po
    LEFT JOIN productions AS p
        ON p.id = po.order_id
    LEFT JOIN scrap AS s
        ON s.reference_id = po.id
        AND s.reference_type = 'Production'
    WHERE po.id = in_order_id
        AND po.order_type = in_order_type;

    IF in_order_type = 'client' THEN

        -- Obtener datos extra de la orden de produccion
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
        INTO 
            v_location,
            v_production_line
        FROM production_orders AS po
        LEFT JOIN purchased_orders_products AS pop
            ON pop.id = po.order_id
        LEFT JOIN purchased_orders_products_locations_production_lines AS poplpl
            ON poplpl.purchase_order_product_id = pop.id
        LEFT JOIN production_lines AS pl
            ON pl.id = poplpl.production_line_id
        LEFT JOIN locations_production_lines AS lpl
            ON lpl.production_line_id = pl.id
        LEFT JOIN locations AS l
            ON l.id = lpl.location_id
        WHERE 
            po.id = in_order_id
            AND po.order_type = in_order_type;

    ELSE

        -- Obtener datos extra de la orden de produccion
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
        INTO 
            v_location,
            v_production_line
        FROM production_orders AS po
        LEFT JOIN internal_product_production_orders AS ippo
            ON ippo.id = po.order_id
        LEFT JOIN internal_product_production_orders_locations_production_lines AS ippolpl
            ON ippolpl.internal_product_production_order_id = ippo.id
        LEFT JOIN production_lines AS pl
            ON pl.id = ippolpl.production_line_id
        LEFT JOIN locations_production_lines AS lpl
            ON lpl.production_line_id = pl.id
        LEFT JOIN locations AS l
            ON l.id = lpl.location_id
        WHERE 
            po.id = in_order_id
            AND po.order_type = in_order_type;

    END IF;

    -- Crear el JSON con los datos extra
    SET extra_data = JSON_OBJECT(
        'location', v_location,
        'production_line', v_production_line,
        'production_qty', v_production_qty,
        'scrap_qty', v_scrap_qty
    );

    RETURN extra_data;

END //
DELIMITER ;