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
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(100) NOT NULL,
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
    address TEXT NOT NULL,
    payment_terms VARCHAR(100) NOT NULL,
    credit_limit DECIMAL(14, 4) NOT NULL,
    zip_code VARCHAR(100) NOT NULL,
    tax_regimen VARCHAR(100) NOT NULL,
    cfdi VARCHAR(100) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    is_active TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    INDEX idx_clients_company_name(company_name)
);
CREATE TABLE clients_addresses(
    id INT AUTO_INCREMENT,
    client_id INT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    zip_code VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_clients_addresses_client_id (client_id),
    INDEX idx_clients_addresses_address(address(255))
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
    -- ! Nuevo campo de fecha de entrega estimada
    delivery_date DATETIME,
    -- ! ----------------------------------------
    -- ! Nuevo campo de fecha de envio
    shipping_date DATETIME,
    -- ! ----------------------------------------
    delivery_cost DECIMAL(14, 4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(carrier_id) REFERENCES carriers(id) ON DELETE
    SET NULL
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
    tax_id VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    payment_terms VARCHAR(100) NOT NULL,
    zip_code VARCHAR(100) NOT NULL,
    tax_regimen VARCHAR(100) NOT NULL,
    cfdi VARCHAR(100) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    -- shipping fields (client address)
    client_address_id INT,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    shipping_zip_code VARCHAR(100) NOT NULL,
    --
    total_price DECIMAL(14,4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE
    SET NULL,
        FOREIGN KEY(client_address_id) REFERENCES clients_addresses(id) ON DELETE
    SET NULL
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
    FOREIGN KEY(purchase_order_id) REFERENCES purchased_orders(id) ON DELETE
    SET NULL,
        FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE
    SET NULL
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
CREATE TABLE products_inputs(
    id INT AUTO_INCREMENT,
    product_id INT,
    input_id INT,
    equivalence DECIMAL(14, 4) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(input_id) REFERENCES inputs(id) ON DELETE CASCADE,
    UNIQUE(product_id, input_id)
);
CREATE TABLE products_processes(
    id INT AUTO_INCREMENT,
    product_id INT,
    process_id INT,
    sort_order INT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(process_id) REFERENCES processes(id) ON DELETE CASCADE,
    UNIQUE(product_id, process_id) -- UNIQUE(product_id, sort_order)
);
-- LOCATION V --> PRODUCTION
CREATE TABLE production_lines(
    id INT AUTO_INCREMENT,
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
    FOREIGN KEY(production_line_id) REFERENCES production_lines(id) ON DELETE
    SET NULL,
        FOREIGN KEY(purchase_order_product_id) REFERENCES purchased_orders_products(id) ON DELETE CASCADE
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
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE
    SET NULL,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE
    SET NULL
);
CREATE TABLE internal_production_orders_lines_products(
    id INT AUTO_INCREMENT,
    internal_product_production_order_id INT,
    production_line_id INT,
    PRIMARY KEY(id),
    FOREIGN KEY(internal_product_production_order_id) REFERENCES internal_product_production_orders(id) ON DELETE CASCADE,
    FOREIGN KEY(production_line_id) REFERENCES production_lines(id) ON DELETE CASCADE
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
    scrap DECIMAL(14, 4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
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
    movement_type ENUM('in', 'out') NOT NULL,
    reference_id INT,
    reference_type ENUM(
        'production',
        'order',
        'transfer',
        "purchased",
        "scrap"
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
CREATE TABLE scrap(
    id INT AUTO_INCREMENT NOT NULL,
    reference_type ENUM('production') NOT NULL,
    reference_id INT,
    location_id INT,
    location_name VARCHAR(100) NOT NULL,
    item_id INT,
    item_type ENUM('input', 'product') NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    qty DECIMAL(14, 4) NOT NULL,
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

SELECT * FROM purchased_orders_products;

SELECT * FROM purchased_orders