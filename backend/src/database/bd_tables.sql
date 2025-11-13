SHOW DATABASES;
DROP DATABASE IF EXISTS u482698715_shau_erp;
CREATE DATABASE u482698715_shau_erp;
USE u482698715_shau_erp;
-- MODULOS CORES
-- LOCATIONS

CREATE TABLE location_types(
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

CREATE TABLE locations(
    -- info
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(100) NOT NULL,
    
    -- address
    street VARCHAR(100) NOT NULL,
    street_number INT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    zip_code INT NOT NULL,

    -- contact
    phone VARCHAR(100) NOT NULL,
    
    -- state
    is_active TINYINT DEFAULT 1 NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY(id)
);

CREATE TABLE locations_location_types(
    id INT AUTO_INCREMENT,
    location_id INT,
    location_type_id INT,
    PRIMARY KEY(id),
    FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY(location_type_id) REFERENCES location_types(id) ON DELETE CASCADE,
    INDEX idx_locations_location_types_location_id (location_id),
    INDEX idx_locations_location_types_location_id_type_id (location_type_id, location_id)
);

-- CLIENTS
CREATE TABLE clients(
    id INT AUTO_INCREMENT,
    company_name VARCHAR(100) NOT NULL UNIQUE,
    tax_id VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    street VARCHAR(100) NOT NULL,
    street_number INT NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    payment_terms VARCHAR(100) NULL,
    credit_limit DECIMAL(14, 4) NULL,
    zip_code INT NOT NULL,
    tax_regimen VARCHAR(100) NULL,
    cfdi VARCHAR(100) NOT NULL,
    payment_method VARCHAR(100) NULL,
    is_active TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    INDEX idx_clients_company_name(company_name)
);

CREATE TABLE clients_addresses(
    id INT AUTO_INCREMENT,
    client_id INT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    street VARCHAR(100) NOT NULL,
    street_number INT NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    zip_code INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_clients_addresses_client_id (client_id)
);

-- PRODUCTS
CREATE TABLE products(
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    active TINYINT NOT NULL,
    sale_price DECIMAL(14, 4) NOT NULL,
    photo VARCHAR(200) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    INDEX idx_products_name(name)
);

CREATE TABLE product_discounts_ranges (
    id INT AUTO_INCREMENT,
    product_id INT,
    unit_price DECIMAL(14, 4) NOT NULL,
    min_qty DECIMAL(14, 4) NOT NULL,
    max_qty DECIMAL(14, 4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_discounts_ranges_product_id (product_id)
);
-- MODULO SERVICES
-- AUTHENTICATION
CREATE TABLE permissions(
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);
CREATE TABLE roles(
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);
CREATE TABLE roles_permissions(
    id INT AUTO_INCREMENT,
    permission_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_roles_permissions_role_id (role_id)
);
CREATE TABLE users (
    id INT AUTO_INCREMENT,
    username VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE
    SET NULL,
        INDEX idx_users_role_id (role_id)
);
-- INVENTORIES
CREATE TABLE inventories(
    id INT AUTO_INCREMENT,
    stock DECIMAL(14, 4),
    minimum_stock DECIMAL(14, 4) NOT NULL,
    maximum_stock DECIMAL(14, 4) NOT NULL,
    lead_time INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);
CREATE TABLE inventories_locations_items(
    id INT AUTO_INCREMENT,
    inventory_id INT,
    location_id INT,
    item_type ENUM('product', "input") NOT NULL,
    item_id INT NOT NULL,
    PRIMARY KEY(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY(inventory_id) REFERENCES inventories(id) ON DELETE CASCADE,
    INDEX idx_inventories_locations_items_location_id_item_id_item_type (location_id, item_id, item_type)
);
-- INVENTORY TRANSFERS
CREATE TABLE inventory_transfers (
    id INT AUTO_INCREMENT,
    item_type ENUM('product', 'input') NOT NULL,
    item_id INT NOT NULL,
    item_name VARCHAR(100),
    qty DECIMAL(14, 4) NOT NULL,
    destination_location_id INT,
    source_location_id INT,
    reason TEXT,
    status VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(source_location_id) REFERENCES locations(id) ON DELETE
    SET NULL,
        FOREIGN KEY(destination_location_id) REFERENCES locations(id) ON DELETE
    SET NULL
);
-- LOGISTICS
CREATE TABLE carriers(
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    rfc VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    vehicle VARCHAR(100) NOT NULL,
    plates VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    active TINYINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

CREATE TABLE shipping_orders(
    id INT AUTO_INCREMENT,
    code VARCHAR(100),
    status VARCHAR(100) NOT NULL,
    carrier_id INT,
    load_evidence JSON DEFAULT NULL,
    tracking_number TEXT,
    shipment_type VARCHAR(100),
    transport_method VARCHAR(100),
    comments TEXT,
    -- ! Nuevo campo de fecha de entrega estimada
    delivery_date DATETIME NULL,
    scheduled_ship_date DATETIME NULL,
    -- ! ----------------------------------------
    -- ! Nuevo campo de fecha de envio
    shipping_date DATETIME NULL,
    finished_date DATETIME NULL,
    comments_finish TEXT,
    received_by VARCHAR(100) NULL,
    user_id INT NULL,
    user_name VARCHAR(100) NULL,
    -- ! ----------------------------------------
    delivery_cost DECIMAL(14, 4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(carrier_id) REFERENCES carriers(id) ON DELETE SET NULL
);
-- LOGS
CREATE TABLE tables(
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);
CREATE TABLE operations(
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);
CREATE TABLE logs(
    id INT AUTO_INCREMENT,
    operation_id INT,
    table_id INT,
    user_id INT,
    table_name VARCHAR(100),
    operation_name VARCHAR(100),
    user_name VARCHAR(100),
    old_data JSON,
    new_data JSON,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE
    SET NULL,
        FOREIGN KEY(operation_id) REFERENCES operations(id) ON DELETE
    SET NULL,
        FOREIGN KEY(table_id) REFERENCES tables(id) ON DELETE
    SET NULL
);
-- SALES
CREATE TABLE product_discounts_clients (
    id INT AUTO_INCREMENT,
    product_id INT NOT NULL,
    client_id INT NOT NULL,
    discount_percentage DECIMAL(14, 4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
create table purchased_orders(
    id INT AUTO_INCREMENT,
    order_code VARCHAR(100) UNIQUE,
    delivery_date DATETIME,
    status VARCHAR(100),
    -- client fields
    client_id INT,
    company_name VARCHAR(100) NOT NULL,
    tax_id VARCHAR(100) NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    street VARCHAR(100) NOT NULL,
    street_number VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    payment_terms VARCHAR(100) NULL,
    zip_code VARCHAR(100) NOT NULL,
    tax_regimen VARCHAR(100) NULL,
    cfdi VARCHAR(100) NOT NULL,
    payment_method VARCHAR(100) NULL,
    -- shipping fields (client address)
    client_address_id INT,
    shipping_street VARCHAR(100) NOT NULL,
    shipping_street_number VARCHAR(100) NOT NULL,
    shipping_neighborhood VARCHAR(100) NOT NULL,

    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    shipping_zip_code VARCHAR(100) NOT NULL,
    --
    total_price DECIMAL(14,4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY(client_address_id) REFERENCES clients_addresses(id) ON DELETE SET NULL
);

CREATE TABLE purchased_orders_products(
    id INT AUTO_INCREMENT,
    purchase_order_id INT,
    product_name VARCHAR(100),
    product_id INT,
    qty DECIMAL(14, 4) NOT NULL,
    recorded_price DECIMAL(14, 4) NOT NULL,
    original_price DECIMAL(14,4) NOT NULL,
    status VARCHAR(100) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(purchase_order_id) REFERENCES purchased_orders(id) ON DELETE SET NULL,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE applied_product_discounts_client (
    id INT AUTO_INCREMENT,
    purchase_order_product_id INT UNIQUE,
    product_discount_client_id INT,
    discount_percentage DECIMAL(14, 4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY (purchase_order_product_id) REFERENCES purchased_orders_products(id) ON DELETE CASCADE,
    FOREIGN KEY (product_discount_client_id) REFERENCES product_discounts_clients(id) ON DELETE
    SET NULL
);
CREATE TABLE applied_product_discounts_ranges (
    id INT AUTO_INCREMENT,
    product_discount_range_id INT,
    purchase_order_product_id INT,
    unit_discount DECIMAL(14, 4) NOT NULL,
    min_qty DECIMAL(14, 4) NOT NULL,
    max_qty DECIMAL(14, 4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY (product_discount_range_id) REFERENCES product_discounts_ranges(id) ON DELETE
    SET NULL,
        FOREIGN KEY (purchase_order_product_id) REFERENCES purchased_orders_products(id) ON DELETE CASCADE
);
-- INTEGRATION MODULES
-- PRODUCTION
-- PRODUCT V --> PRODUCTION
CREATE TABLE input_types(
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);
CREATE TABLE inputs(
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    input_types_id INT,
    unit_cost DECIMAL(14, 4),
    supplier VARCHAR(100) NOT NULL,
    photo VARCHAR(200) NOT NULL,
    status TINYINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(input_types_id) REFERENCES input_types(id) ON DELETE
    SET NULL
);
CREATE TABLE processes(
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);
DROP TABLE IF EXISTS products_inputs;
CREATE TABLE products_inputs(
    id INT AUTO_INCREMENT,
    product_id INT,
    input_id INT,
    equivalence DECIMAL(14, 4) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(input_id) REFERENCES inputs(id) ON DELETE CASCADE,
    UNIQUE(product_id, input_id),
    INDEX ix_products_inputs_id_product (id, product_id)
);
DROP TABLE IF EXISTS products_processes;
CREATE TABLE products_processes(
    id INT AUTO_INCREMENT,
    product_id INT,
    process_id INT,
    sort_order INT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(process_id) REFERENCES processes(id) ON DELETE CASCADE,
    UNIQUE(product_id, process_id), -- UNIQUE(product_id, sort_order)
    INDEX ix_products_inputs_id_product (id, product_id)
);
-- LOCATION V --> PRODUCTION
CREATE TABLE production_lines(
    id INT AUTO_INCREMENT,
    custom_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active TINYINT DEFAULT 1 NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);
CREATE TABLE locations_production_lines(
    id INT AUTO_INCREMENT,
    production_line_id INT,
    location_id INT,
    PRIMARY KEY(id),
    FOREIGN KEY(production_line_id) REFERENCES production_lines(id) ON DELETE CASCADE,
    FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE
);
-- LOCATION-PRODUCT --> PRODUCTION
CREATE TABLE production_lines_products(
    id INT AUTO_INCREMENT,
    product_id INT,
    production_line_id INT,
    PRIMARY KEY(id),
    FOREIGN KEY(production_line_id) REFERENCES production_lines(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(production_line_id, product_id)
);
-- PROPIAS DE PRODUCTION
CREATE TABLE shipping_orders_purchased_order_products(
    id INT AUTO_INCREMENT,
    shipping_order_id INT,
    purchase_order_product_id INT,
    location_id INT,
    location_name VARCHAR(100),
    qty INT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(shipping_order_id) REFERENCES shipping_orders(id) ON DELETE CASCADE,
    FOREIGN KEY(purchase_order_product_id) REFERENCES purchased_orders_products(id) ON DELETE CASCADE
);
CREATE TABLE purchased_orders_products_locations_production_lines(
    id INT AUTO_INCREMENT,
    production_line_id INT,
    purchase_order_product_id INT,
    PRIMARY KEY(id),
    FOREIGN KEY(production_line_id) REFERENCES production_lines(id) ON DELETE SET NULL,
    FOREIGN KEY(purchase_order_product_id) REFERENCES purchased_orders_products(id) ON DELETE CASCADE,
    UNIQUE(production_line_id, purchase_order_product_id)
);
CREATE TABLE internal_product_production_orders (
    id INT AUTO_INCREMENT,
    product_id INT,
    product_name VARCHAR(100),
    qty DECIMAL(14, 4) NOT NULL,
    status VARCHAR(100) NOT NULL,
    location_id INT,
    -- <--- NUEVO
    location_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);
CREATE TABLE internal_production_orders_lines_products(
    id INT AUTO_INCREMENT,
    internal_product_production_order_id INT,
    production_line_id INT,
    PRIMARY KEY(id),
    FOREIGN KEY(internal_product_production_order_id) REFERENCES internal_product_production_orders(id) ON DELETE CASCADE,
    FOREIGN KEY(production_line_id) REFERENCES production_lines(id) ON DELETE CASCADE,
    UNIQUE(internal_product_production_order_id, production_line_id)
);
CREATE TABLE production_orders(
    -- fields
    id INT AUTO_INCREMENT,
    order_type ENUM('internal', 'client') NOT NULL,
    order_id INT,
    product_id INT,
    product_name VARCHAR(100),
    qty DECIMAL(14, 4) NOT NULL,
    status VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- keys
    PRIMARY KEY(id),
    -- indexs
    INDEX idx_order(order_id, order_type)
);
CREATE TABLE productions(
    id INT AUTO_INCREMENT,
    production_order_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(100),
    qty DECIMAL(14, 4) NOT NULL,
    process_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE,
    FOREIGN KEY(process_id) REFERENCES processes(id) ON DELETE SET NULL
);
CREATE TABLE inventory_movements (
    -- fields
    id INT AUTO_INCREMENT,
    location_id INT,
    location_name VARCHAR(100) NOT NULL,
    item_id INT NOT NULL,
    item_type ENUM('product', 'input') NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    qty DECIMAL(14, 4) NOT NULL,
    movement_type ENUM('in', 'out', 'allocate') NOT NULL,
    reference_id INT,
    reference_type ENUM(
        'Production Order',
        'Order',
        'Transfer',
        "Purchased",
        "Scrap",
        "Internal Production Order",
        "Shipping"
    ),
    production_id INT,
    description TEXT,
    is_locked TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- keys
    PRIMARY KEY(id),
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE
    SET NULL,
        -- indexs
        INDEX idx_reference (reference_id, reference_type)
);
CREATE TABLE debug_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE global_settings (
    key_name VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    type ENUM('string', 'int', 'boolean', 'json') DEFAULT 'string',
    description TEXT
);

DROP TABLE IF EXISTS scrap;
CREATE TABLE scrap (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference_type ENUM('Production', 'Inventory', 'Shipping') NOT NULL,
    reference_id INT NULL,
    location_id INT,
    location_name VARCHAR(100), -- snapshot
    item_id INT,
    item_type ENUM('input', 'product') NOT NULL,
    item_name VARCHAR(100), -- snapshot
    qty DECIMAL(14, 4) NOT NULL,
    reason VARCHAR(200) NOT NULL,
    user_id INT,
    user_name VARCHAR(100), -- snapshot
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- FKs reales solo donde tiene sentido:
    FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE production_line_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_line_id INT NOT NULL,
    production_order_id INT NOT NULL,         -- SIEMPRE apunta a production_orders.id
    position BIGINT NULL,          -- 10, 20, 30... para insertar entremedias
    -- los valores NULL son para cuando ya no esta en cola la orden
    -- los valores NULL no se comtemplan en la restriccion uq_line_pos
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_line_pos   (production_line_id, position),
    UNIQUE KEY uq_line_order (production_line_id, production_order_id),
    
    -- Formas de declarar indices
    KEY ix_line  (production_line_id),
    INDEX ix_line_pos (production_line_id, position),
    /*

        Estándar de naming → en muchos equipos se sigue:

        pk_... para claves primarias

        fk_... para claves foráneas

        uq_... para restricciones únicas

        ix_... para índices normales

    */

    FOREIGN KEY (production_line_id) REFERENCES production_lines(id) ON DELETE CASCADE,
    FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS products_inputs_processes;
CREATE TABLE products_inputs_processes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  product_input_id INT NOT NULL,
  product_process_id INT NOT NULL,

  qty DECIMAL(18,6) NOT NULL DEFAULT 0,  -- consumo en ESTA etapa por 1 ud del producto

  CONSTRAINT fk_pip_input_same_product
    FOREIGN KEY (product_input_id, product_id)
    REFERENCES products_inputs(id, product_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_pip_process_same_product
    FOREIGN KEY (product_process_id, product_id)
    REFERENCES products_processes(id, product_id)
    ON DELETE CASCADE,

  UNIQUE KEY uq_pip (product_id, product_process_id, product_input_id),
  KEY ix_pip_product (product_id),
  KEY ix_pip_input   (product_input_id),
  KEY ix_pip_process (product_process_id)
);


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
                    -- info
                    'id', l.id,
                    'name', l.name,
                    'description', l.description,

                    -- address
                    'street', l.street,
                    'street_number', l.street_number,
                    'neighborhood', l.neighborhood,
                    'zip_code', l.zip_code,
                    'city', l.city,
                    'state', l.state,
                    'country', l.country,

                    -- contact
                    'phone', l.phone,
                    
                    -- state
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