SHOW DATABASES;
USE webshau_erp;

-------------------- INSERCIONES TABLAS BASES

-- Permisos
INSERT INTO permissions (name) VALUES
('Read'),
('Write'),
('Execute'),
('Admin'),
('Delete');

-- Clientes
INSERT INTO clients (company_name, tax_id, email, phone, city, state, country, address, payment_terms, credit_limit) VALUES
('Tech Solutions', 'TXS123456', 'contact@techsolutions.com', '555-1234', 'San Diego', 'California', 'USA', '123 Tech St, San Diego, CA', '30 days', 50000.00),
('Global Enterprises', 'GE123789', 'support@globalenterprises.com', '555-5678', 'Los Angeles', 'California', 'USA', '456 Global Rd, Los Angeles, CA', '45 days', 75000.00),
('Innovative Concepts', 'IC987654', 'info@innovativeconcepts.com', '555-8765', 'New York', 'New York', 'USA', '789 Innovation Ave, New York, NY', '60 days', 100000.00),
('Eco Supplies', 'ES654321', 'contact@ecosupplies.com', '555-4321', 'Chicago', 'Illinois', 'USA', '321 Eco Blvd, Chicago, IL', '30 days', 20000.00),
('Creative Designs', 'CD112233', 'service@creativedesigns.com', '555-3456', 'Austin', 'Texas', 'USA', '654 Creative Ln, Austin, TX', '30 days', 30000.00);

-- Productos
INSERT INTO products (name, type, description, sku, active, sale_price, photo) VALUES
('Laptop X100', 'Electronics', 'High-performance laptop for professionals.', 'LAP100X', 1, 1200.99, 'https://example.com/laptop-x100'),
('Wireless Mouse', 'Accessories', 'Ergonomic wireless mouse for comfortable use.', 'MOU-WL01', 1, 25.50, 'https://example.com/wireless-mouse'),
('4K Monitor', 'Electronics', 'Ultra-clear 4K monitor with HDR support.', 'MON4K100', 1, 450.00, 'https://example.com/4k-monitor'),
('Smartphone Pro', 'Electronics', 'Latest model with advanced camera features.', 'PHO-PRO2025', 1, 999.99, 'https://example.com/smartphone-pro'),
('Bluetooth Headphones', 'Accessories', 'Noise-canceling wireless Bluetooth headphones.', 'HEAD-BT100', 1, 120.75, 'https://example.com/bluetooth-headphones');

-- Procesos
INSERT INTO processes (name) VALUES
('Manufacturing'),
('Shipping'),
('Assembly'),
('Quality Control'),
('Packaging');

-- Tipos de entrada
INSERT INTO input_types (name) VALUES
('Purchase Order'),
('Return'),
('Stock Transfer'),
('Supplier Delivery'),
('Customer Order');

-- Ubicaciones
INSERT INTO production_lines(name) VALUES
('Line A'),
('Line B'),
('Line C'),
('Line D'),
('Line E');

-- Transportistas
INSERT INTO carriers (name, rfc, company_name, type, phone, vehicle, plates, license_number, active) VALUES
('Carrier One', 'RFC123456', 'Fast Transport', 'Freight', '555-0001', 'Truck', 'ABC123', 'LIC123', 1),
('Carrier Two', 'RFC789101', 'Express Logistics', 'Parcel', '555-0002', 'Van', 'XYZ456', 'LIC456', 1),
('Carrier Three', 'RFC112233', 'Cargo Movers', 'Freight', '555-0003', 'Truck', 'LMN789', 'LIC789', 1),
('Carrier Four', 'RFC445566', 'Speedy Delivery', 'Parcel', '555-0004', 'Motorcycle', 'OPQ123', 'LIC012', 0),
('Carrier Five', 'RFC778899', 'Rapid Ship', 'Freight', '555-0005', 'Truck', 'RST012', 'LIC345', 1);

-- Inventarios
INSERT INTO inventories (stock, minimum_stock, maximum_stock, lead_time) VALUES
(1000, 50, 2000, 7),
(2000, 100, 5000, 14),
(1500, 75, 3000, 10),
(1200, 60, 2500, 5),
(800, 40, 1500, 20);

-- Líneas de producción
INSERT INTO locations (name, type, description, active) VALUES
('Location A', 'Assembly', 'Main assembly location for electronics', 1),
('Location B', 'Packaging', 'Packaging location for finished products', 1),
('Location C', 'Manufacturing', 'Raw material processing location', 1),
('Location D', 'Quality Control', 'Final quality check and testing location', 1),
('Location E', 'Shipping', 'Shipping and dispatch location', 1);


-------------------- INSERCIONES TABLAS BASES

-- Roles
INSERT INTO roles (name, permission_id) VALUES
('Admin', 1),
('Editor', 2),
('Viewer', 3),
('Manager', 4),
('Guest', 5);

-- Usuarios
INSERT INTO users (username, password, role_id) VALUES
('john_doe', 'password123', 1),
('jane_smith', 'password456', 2),
('alice_williams', 'password789', 3),
('bob_johnson', 'password321', 4),
('charlie_brown', 'password654', 5);

-- Ordenes de compra
INSERT INTO purchased_orders (order_code, delivery_date, status, client_id, total_price) VALUES
('ORD001', '2025-04-15', 'Pending', 1, 5000.00),
('ORD002', '2025-04-16', 'Shipped', 2, 12000.00),
('ORD003', '2025-04-17', 'Delivered', 3, 8500.00),
('ORD004', '2025-04-18', 'Cancelled', 4, 1500.00),
('ORD005', '2025-04-19', 'Pending', 5, 3000.00);

-- Descuentos de productos para clientes
INSERT INTO product_discounts_clients (name, product_id, client_id, discount_percentage) VALUES
('Discount A', 1, 1, 10.00),
('Discount B', 2, 2, 15.00),
('Discount C', 3, 3, 20.00),
('Discount D', 4, 4, 5.00),
('Discount E', 5, 5, 25.00);

-- Descuentos de productos por rango
INSERT INTO product_discounts_ranges (name, product_id, unit_price, min_qty, max_qty) VALUES
('Range Discount A', 1, 1000.00, 10, 50),
('Range Discount B', 2, 1200.00, 5, 30),
('Range Discount C', 3, 500.00, 20, 100),
('Range Discount D', 4, 300.00, 15, 75),
('Range Discount E', 5, 150.00, 50, 200);

-- insumos de productos
INSERT INTO inputs (name, input_types_id, unit_cost, supplier, photo, status) VALUES
('Input A', 1, 500.00, 'Supplier A', 'https://supplierA.com/inputA', 1),
('Input B', 2, 150.00, 'Supplier B', 'https://supplierB.com/inputB', 1),
('Input C', 3, 300.00, 'Supplier C', 'https://supplierC.com/inputC', 0),
('Input D', 4, 700.00, 'Supplier D', 'https://supplierD.com/inputD', 1),
('Input E', 5, 200.00, 'Supplier E', 'https://supplierE.com/inputE', 0);

-- Ordenes de envío
INSERT INTO shipping_orders (status, name, carrier_id, load_evidence, delivery_cost) VALUES
('In Transit',"Shipping order1", 1, '{"tracking_number":"TN12345"}', 50.00),
('Delivered',"Shipping order2", 2, '{"tracking_number":"TN67890"}', 75.00),
('Pending',"Shipping order3", 3, NULL, 30.00),
('Shipped',"Shipping order4", 4, '{"tracking_number":"TN54321"}', 60.00),
('Cancelled',"Shipping order5", 5, NULL, 40.00);


-------------------- INSERCIONES TABLAS JUNCTIONS

-- Purchased Orders Products
INSERT INTO purchased_orders_products (purchase_order_id, product_name, product_id, qty, recorded_price, status) VALUES
(1, 'Product A', 1, 50.00, 1000.00, 'Shipped'),
(2, 'Product B', 2, 30.00, 1200.00, 'Shipped'),
(3, 'Product C', 3, 20.00, 500.00, 'Delivered'),
(4, 'Product D', 4, 15.00, 300.00, 'Cancelled'),
(5, 'Product E', 5, 10.00, 150.00, 'Pending');

-- Products Inputs
INSERT INTO products_inputs (product_id, input_id, equivalence) VALUES
(1, 1, 2.00),
(2, 2, 3.00),
(3, 3, 1.50),
(4, 4, 5.00),
(5, 5, 4.00);

-- Products Processes
INSERT INTO products_processes (product_id, process_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-------------------- INSERCIONES TABLAS REFERENCES

-- Productions
INSERT INTO productions (purchase_order_product_id, qty, scrap) VALUES
(1, 50.0000, 5.0000),
(2, 30.0000, 2.0000),
(3, 100.0000, 10.0000),
(4, 60.0000, 6.0000),
(5, 120.0000, 12.0000);

-- Logs
INSERT INTO logs (user_id, message, module, action_type) VALUES
(1, 'Created production order', 'Production', 'Insert'),
(2, 'Updated inventory data', 'Inventory', 'Update'),
(3, 'Deleted a purchased order', 'Orders', 'Delete'),
(4, 'Logged in to system', 'Authentication', 'Login'),
(5, 'Updated user profile', 'Users', 'Update');

-------------------- INSERCIONES TABLAS JUNCTIONS

-- Locations Production Lines
INSERT INTO locations_production_lines (production_line_id, location_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- Applied Product Discounts Client
INSERT INTO applied_product_discounts_client (purchase_order_product_id, product_discount_client_id, discount_percentage, discount_name) VALUES
(1, 1, 10.0000, 'Spring Sale'),
(2, 2, 5.0000, 'Holiday Discount'),
(3, 3, 15.0000, 'Black Friday Deal'),
(4, 4, 8.0000, 'Summer Special'),
(5, 5, 20.0000, 'End of Year Sale');

-- Applied Product Discounts Ranges
INSERT INTO applied_product_discounts_ranges (product_discount_range_id, purchase_order_product_id, unit_discount, discount_name, min_qty, max_qty) VALUES
(1, 1, 2.0000, 'Range Discount 1', 10, 100),
(2, 2, 3.0000, 'Range Discount 2', 20, 200),
(3, 3, 1.5000, 'Range Discount 3', 15, 150),
(4, 4, 2.5000, 'Range Discount 4', 25, 250),
(5, 5, 4.0000, 'Range Discount 5', 30, 300);

-- Locations Production Lines Products
INSERT INTO locations_production_lines_products (location_production_line_id, product_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- Shipping Orders Purchased Order Products
INSERT INTO shipping_orders_purchased_order_products (shipping_order_id, purchase_order_product_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- Purchased Orders Products Locations Production Lines
INSERT INTO purchased_orders_products_locations_production_lines (location_production_line_id, purchase_order_product_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- Inventories Production Lines Locations Products
INSERT INTO inventories_locations_production_lines_products (inventory_id, line_products_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);