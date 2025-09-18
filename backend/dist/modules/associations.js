import sequelize from "../mysql/configSequelize.js";
// MODULE CORE
import { 
// CLIENT MODULE
ClientAddressesModel, ClientModel, 
// PRODUCT MODULE
ProductModel, ProductDiscountRangeModel, 
// LOCATION MODULE
LocationModel, LocationLocationTypeModel, LocationTypeModel } from "./core/associations.js";
// MODULE SERVICES
import { 
// AUTHENTICATION MODULE
UserModel, PermissionModel, RoleModel, RolePermissionModel, 
// INVETORIES MODULE
InventoryLocationItemModel, InventoryModel, 
// INVENTORY TRANSFERS MODULE
InventoryTransferModel, 
// LOGISTICS MODULE
CarrierModel, ShippingOrderModel, 
// LOGS MODULE
LogModel, OperationModel, TableModel, 
// SALES MODULE
AppliedProductDiscountClientModel, AppliedProductDiscountRangeModel, ProductDiscountClientModel, PurchasedOrderModel, ScrapModel, PurchaseOrderProductModel, } from "./services/associations.js";
// INTEGRATION MODULES
import { 
// PRODUCTION
ProductionModel, ProductionOrderModel, PurchasedOrdersProductsLocationsProductionLinesModel, ShippingOrderPurchaseOrderProductModel, ProductionLineProductModel, InternalProductProductionOrderModel, InternalProductionOrderLineProductModel, LocationsProductionLinesModel, ProductionLineModel, ProductProcessModel, ProductInputModel, InputTypeModel, ProcessModel, InputModel, InventoryMovementModel, ProductionLineQueueModel, ProductInputProcessModel, } from "./features/associations.js";
/*
    En Sequelize (y en cualquier ORM con asociaciones), la regla de oro es:

    El modelo que contiene la clave foránea (foreignKey) usa belongsTo.

    El modelo referenciado (la tabla “padre”) usa hasOne o hasMany dependiendo de la cardinalidad.

*/
// Un registro de products_inputs_processes pertenece a un product_input
ProductInputProcessModel.belongsTo(ProductInputModel, {
    foreignKey: "product_input_id",
    as: "product_input",
    onDelete: "CASCADE"
});
// Un registro de products_inputs_processes pertenece a un product_process
ProductInputProcessModel.belongsTo(ProductProcessModel, {
    foreignKey: "product_process_id",
    as: "product_process",
    onDelete: "CASCADE"
});
// Un product_input puede estar en muchas relaciones products_inputs_processes
ProductInputModel.hasMany(ProductInputProcessModel, {
    foreignKey: "product_input_id",
    as: "input_processes",
    onDelete: "CASCADE"
});
// Un product_process puede estar en muchas relaciones products_inputs_processes
ProductProcessModel.hasMany(ProductInputProcessModel, {
    foreignKey: "product_process_id",
    as: "process_inputs",
    onDelete: "CASCADE"
});
// production_line_queue → production_line (FK está aquí)
ProductionLineQueueModel.belongsTo(ProductionLineModel, {
    foreignKey: "production_line_id",
    as: "production_line",
    onDelete: "CASCADE"
});
// production_line → production_line_queue (tiene muchas filas en la cola)
ProductionLineModel.hasMany(ProductionLineQueueModel, {
    foreignKey: "production_line_id",
    as: "production_line_queue",
    onDelete: "CASCADE"
});
// production_line_queue → production_order (FK está aquí)
ProductionLineQueueModel.belongsTo(ProductionOrderModel, {
    foreignKey: "production_order_id",
    as: "production_order",
    onDelete: "CASCADE"
});
// production_order → production_line_queue (solo puede estar en una cola)
ProductionOrderModel.hasOne(ProductionLineQueueModel, {
    foreignKey: "production_order_id",
    as: "production_order_queue",
    onDelete: "CASCADE"
});
/****************************************
 *                                      *
 *     SERVICES MODULES RELATIONS       *
 *                                      *
 ***************************************/
/* Inventory - Locations -Items
* Una location puede tener muchos InventoryLocationsItems,
pero InventoryLocationsItems solo puede tener un locations
* Un inventory puede tener solo un InventoryLocationsItems,
pero InventoryLocationsItems solo puede tener un inventory
 */
InventoryLocationItemModel.belongsTo(InventoryModel, {
    foreignKey: "inventory_id",
    as: "inventory",
    onDelete: "CASCADE"
});
InventoryLocationItemModel.belongsTo(LocationModel, {
    foreignKey: "location_id",
    as: "location",
    onDelete: "CASCADE",
});
LocationModel.hasMany(InventoryLocationItemModel, {
    foreignKey: "location_id",
    as: "inventory_location_item"
});
InventoryModel.hasOne(InventoryLocationItemModel, {
    foreignKey: "inventory_id",
    as: "inventory_location_item"
});
/* InventoryTransfers-Locations
* Un inventoryTransfers tiene dos locations(source, destionation)
* Una Locations puede tener muchos inventoryTransfers
*/
LocationModel.hasMany(InventoryTransferModel, {
    foreignKey: 'source_location_id',
    as: 'source_movements'
});
LocationModel.hasMany(InventoryTransferModel, {
    foreignKey: 'destination_location_id',
    as: 'destination_movements'
});
InventoryTransferModel.belongsTo(LocationModel, {
    foreignKey: 'source_location_id',
    as: 'source_location',
    onDelete: 'SET NULL'
});
InventoryTransferModel.belongsTo(LocationModel, {
    foreignKey: 'destination_location_id',
    as: 'destination_location',
    onDelete: 'SET NULL'
});
/* Logs - Users
* Un user puede tener muchos logs
* Un log puede tener solo un user
*/
UserModel.hasMany(LogModel, {
    foreignKey: "user_id",
    as: "logs",
});
LogModel.belongsTo(UserModel, {
    foreignKey: "user_id",
    as: "user"
});
/* PurchasedOrderModel- ClientModel
* Un cliente puede tener muchas ordenes de compra
* Una orden de compra pertenece a un cliente
*/
ClientModel.hasMany(PurchasedOrderModel, {
    foreignKey: "client_id",
    as: "purchase_orders",
});
PurchasedOrderModel.belongsTo(ClientModel, {
    foreignKey: "client_id",
    onDelete: "SET NULL",
    as: "client"
});
/* PurchasedOrderModel-ClientAddresses
* Una PurchasedOrderModel solamente puede tener una clientAddresses
* Un clientAddresses puede tener muchas PurchasedOrderModel
*/
ClientAddressesModel.hasMany(PurchasedOrderModel, {
    foreignKey: "client_address_id",
    as: "purchased_order"
});
PurchasedOrderModel.belongsTo(ClientAddressesModel, {
    foreignKey: "client_address_id",
    onDelete: "SET NULL",
    as: "client_address"
});
/* PurchasedOrder-Product (PurchaseOrderProduct)
* Una purchasedOrder puede tener muchos purchasedOrderProduct, pero
una purchasedOrderProduct solo puede tener una purchaseOrder
* Un product puede tener muchos purchasedOrderProducts, pero una
purchasedOrderProduct solo puede tener un product
*/
ProductModel.hasMany(PurchaseOrderProductModel, {
    foreignKey: "product_id",
    as: "purchase_order_product",
    onDelete: "SET NULL"
});
PurchaseOrderProductModel.belongsTo(ProductModel, {
    foreignKey: "product_id",
    as: "product"
});
PurchasedOrderModel.hasMany(PurchaseOrderProductModel, {
    foreignKey: "purchase_order_id",
    as: "purchase_order_products",
    onDelete: "CASCADE"
});
PurchaseOrderProductModel.belongsTo(PurchasedOrderModel, {
    foreignKey: "purchase_order_id",
    as: "purchase_order"
});
/* Products-Clients (ProductDiscountsClient)
* Un Product puede tener muchos ProductsDiscountsClient, pero un
ProductDiscountsClient solo puede tener un Product
* Un client puede tener muchos ProductsDiscountsClient, pero un
ProductDiscountsClient solo puede tener un Client
*/
ProductModel.hasMany(ProductDiscountClientModel, {
    foreignKey: "product_id",
    as: "product_discounts_clients",
});
ProductDiscountClientModel.belongsTo(ProductModel, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
    as: "product"
});
ClientModel.hasMany(ProductDiscountClientModel, {
    foreignKey: "client_id",
    as: "pruduct_discounts_client",
});
ProductDiscountClientModel.belongsTo(ClientModel, {
    foreignKey: "client_id",
    as: "client",
    onDelete: "CASCADE"
});
/* PurchasedOrderProduct-ProductDiscountClient (AppliedProductDiscountClient)
* Un PurchasedOrderProduct puede tener solo un AppliedProductDiscountClient,
pero AppliedProducDiscountClient puede aplicarse a muchos
PurchasedOrderProduct
* Un ProductDiscountClient puede tener muchos AppliedProductDiscountClient,
pero AppliedProducDiscountClient pero solo puede tener un
ProductDiscountsClient
*/
PurchaseOrderProductModel.hasOne(AppliedProductDiscountClientModel, {
    foreignKey: "purchase_order_product_id",
    as: "applied_product_discount_client",
});
ProductDiscountClientModel.hasMany(AppliedProductDiscountClientModel, {
    foreignKey: "product_discount_client_id",
    as: "applied_product_discounts_clients",
});
AppliedProductDiscountClientModel.belongsTo(PurchaseOrderProductModel, {
    foreignKey: "purchase_order_product_id",
    as: "purchased_order_product",
    onDelete: "CASCADE"
});
AppliedProductDiscountClientModel.belongsTo(ProductDiscountClientModel, {
    foreignKey: "product_discount_client_id",
    as: "product_discount_client",
    onDelete: "SET NULL"
});
/* ProductDiscountRanges-PurchaseOrderProducts (AppliedProductDiscountRanges)
* Un PurchaseOrderProduct tiene un solo AppliedProductDiscountsRanges, y
AppliedProductDiscountRanges solo puede tener un purchase order porduct
* Un productDiscountRange puede tener muchos AppliedProductDiscountRange,
pero un AppliedProductDiscountRange solo puede tener un productDiscountRange
*/
PurchaseOrderProductModel.hasOne(AppliedProductDiscountRangeModel, {
    foreignKey: "purchase_order_product_id",
    as: "applied_product_discount_range",
    onDelete: "SET NULL"
});
AppliedProductDiscountRangeModel.belongsTo(PurchaseOrderProductModel, {
    foreignKey: "purchase_order_product_id",
    as: "purchase_order_product"
});
ProductDiscountRangeModel.hasMany(AppliedProductDiscountRangeModel, {
    foreignKey: "product_discount_range_id",
    as: "applied_product_discount_range",
    onDelete: "SET NULL"
});
AppliedProductDiscountRangeModel.belongsTo(ProductDiscountRangeModel, {
    foreignKey: "product_discount_range_id",
    as: "product_discount_range"
});
/****************************************
 *                                      *
 *    INTEGRATION MODULES RELATIONS     *
 *                                      *
 ***************************************/
/****** PRODUCTION ******/
/* ShippingOrder-PurchasedOrderProduct(ShippingOrderPurchaseOrderProductModel)
* Una shippingOrder puede tener muchos ShippingOrderPurchaseOrderProductModel,
pero una ShippingOrderPurchaseOrderProductModel solo puede tener una
shippingOrder
* Una PurchaseOrderProduct puede tener solo un ShippingOrderPurchaseOrderProductModel,
pero ShippingOrderPurchaseOrderProductModel solo puede tener solo una ShippingOrder
*/
ShippingOrderModel.hasMany(ShippingOrderPurchaseOrderProductModel, {
    foreignKey: "shipping_order_id",
    as: "shipping_order_purchase_order_product"
});
PurchaseOrderProductModel.hasMany(ShippingOrderPurchaseOrderProductModel, {
    foreignKey: "purchase_order_product_id",
    as: "shipping_order_purchase_order_product"
});
ShippingOrderPurchaseOrderProductModel.belongsTo(ShippingOrderModel, {
    foreignKey: "shipping_order_id",
    as: "shipping_order"
});
ShippingOrderPurchaseOrderProductModel.belongsTo(PurchaseOrderProductModel, {
    foreignKey: "purchase_order_product_id",
    as: "purchase_order_products"
});
/* PurchasedOrderProduct-ProductionLines
    (purchased_order_product_location_production_line)
* PurchasedOrderProduct solo puede tener un
purchased_order_product_location_production_line, pero
un purchased_order_product_location_production_line
solo puede tener un PurchasedOrderProduct
* ProductionLine puede tener muchos
purchased_order_product_location_production_line, pero
un purchased_order_product_location_production_line
solo puede tener un ProductionLine
*/
PurchaseOrderProductModel.hasOne(PurchasedOrdersProductsLocationsProductionLinesModel, {
    foreignKey: "purchase_order_product_id",
    as: "purchase_order_product_location_production_line"
});
ProductionLineModel.hasMany(PurchasedOrdersProductsLocationsProductionLinesModel, {
    foreignKey: "production_line_id",
    as: "purchase_order_product_location_production_line"
});
PurchasedOrdersProductsLocationsProductionLinesModel.belongsTo(PurchaseOrderProductModel, {
    foreignKey: "purchase_order_product_id",
    as: "purchase_order_product",
});
PurchasedOrdersProductsLocationsProductionLinesModel.belongsTo(ProductionLineModel, {
    foreignKey: "production_line_id",
    as: "production_line",
});
/*


*/
/****** LOCATIONS V PRODUCTION ******/
/* Location-ProductionLine (locations_production_lines)
* Una ProductionLine tiene un unico LocationProductionLines, pero
LocationProductionLines tiene muchos ProductionLines
* Una Locations tiene muchas LocationProductionLines, pero una
LocationProductionLines tiene muchas locations
*/
ProductionLineModel.hasOne(LocationsProductionLinesModel, {
    foreignKey: "production_line_id",
    as: "location_production_line"
});
LocationsProductionLinesModel.belongsTo(ProductionLineModel, {
    foreignKey: "production_line_id",
    as: "production_line",
    onDelete: "CASCADE"
});
LocationModel.hasMany(LocationsProductionLinesModel, {
    foreignKey: "location_id",
    as: "location_production_line",
});
LocationsProductionLinesModel.belongsTo(LocationModel, {
    foreignKey: "location_id",
    as: "location",
    onDelete: "CASCADE"
});
/****** PRODUCTS V PRODUCTION ******/
/* InputType - InputModel
* Un input puede tener solo un InputType, pero un InputType
puede tener muchos Inputs
*/
InputTypeModel.hasMany(InputModel, {
    foreignKey: "input_types_id",
    as: "inputs"
});
InputModel.belongsTo(InputTypeModel, {
    foreignKey: "input_types_id",
    as: "input_types",
    onDelete: "SET NULL"
});
/* Products - Procceses
* Un products puede tener muchos registros en ProductProcess, pero
un ProductProcess solo puede tener un products
* Un process puede tener muchos registros en ProductProcess, pero
un ProductProcess solo puede tener un process
*/
ProductModel.hasMany(ProductProcessModel, {
    foreignKey: "product_id",
    as: "product_processes"
});
ProcessModel.hasMany(ProductProcessModel, {
    foreignKey: "process_id",
    as: "process_product"
});
ProductProcessModel.belongsTo(ProductModel, {
    foreignKey: "product_id",
    as: "product",
    onDelete: "CASCADE"
});
ProductProcessModel.belongsTo(ProcessModel, {
    foreignKey: "process_id",
    as: "process",
    onDelete: "CASCADE"
});
/* Products-Input
* Un Products puede tener multiples registros en ProductInput, pero
ProductInput solo puede tener un products
* Un Input puede tener multiples registros en ProductInput, pero
ProductInput solo puede tener un Input
*/
ProductModel.hasMany(ProductInputModel, {
    foreignKey: "product_id",
    as: "products_inputs",
});
InputModel.hasMany(ProductInputModel, {
    foreignKey: "input_id",
    as: "products_inputs",
});
ProductInputModel.belongsTo(ProductModel, {
    foreignKey: "product_id",
    as: "products",
    onDelete: "CASCADE"
});
ProductInputModel.belongsTo(InputModel, {
    foreignKey: "input_id",
    as: "inputs",
    onDelete: "CASCADE"
});
/* Product-InternalProductProductionOrders
* Un product puede tener muchos InternalProductProductionOrders,
pero un InternalProductProductionOrders solo puede tener un
product
 */
ProductModel.hasMany(InternalProductProductionOrderModel, {
    foreignKey: "product_id",
    as: "internal_order",
});
InternalProductProductionOrderModel.belongsTo(ProductModel, {
    foreignKey: "product_id",
    as: "product",
    onDelete: "SET NULL"
});
/* InternalProductProductionOrder-ProductionLine (InternalProductionOrderLineProduct)
* InternalProductProductionOrder solo puede tener un InternalProductionOrderLineProduct
pero un InternalProductionOrderLineProduct solo puede tener un InternalProductProductionOrder
* Una ProductionLine puede tener muchos InternalProductionOrderLineProduct, pero un
InternalProductionOrderLineProduct solo puede tener un ProductionLine
 */
InternalProductProductionOrderModel.hasOne(InternalProductionOrderLineProductModel, {
    foreignKey: "internal_product_production_order_id",
    as: "internal_production_order_line_product"
});
ProductionLineModel.hasMany(InternalProductionOrderLineProductModel, {
    foreignKey: "production_line_id",
    as: "internal_production_order_line_product"
});
InternalProductionOrderLineProductModel.belongsTo(InternalProductProductionOrderModel, {
    foreignKey: "internal_product_production_order_id",
    as: "internal_product_production_order"
});
InternalProductionOrderLineProductModel.belongsTo(ProductionLineModel, {
    foreignKey: "production_line_id",
    as: "production_line"
});
/* ProductionLine-Products (production_lines_products)
* Una ProductionLine puede tener muchos ProductionLinesProducts
pero una ProductionLinesProducts solo puede tener una ProductionLine
* Un Product puede tener muchos ProductionLinesProducts pero
una ProductionLinesProducts solo puede tener un Product
 */
ProductionLineModel.hasMany(ProductionLineProductModel, {
    foreignKey: "production_line_id",
    as: "production_lines_products"
});
ProductModel.hasMany(ProductionLineProductModel, {
    foreignKey: "product_id",
    as: "production_lines_products"
});
ProductionLineProductModel.belongsTo(ProductionLineModel, {
    foreignKey: "production_line_id",
    as: "production_lines"
});
ProductionLineProductModel.belongsTo(ProductModel, {
    foreignKey: "product_id",
    as: "products"
});
/* InventoryMovement-Location
* Un InventoryMovement solo puede tener una Location, pero una Location
puede tener muchos InventoryMovement
*/
LocationModel.hasMany(InventoryMovementModel, {
    foreignKey: "location_id",
    as: "inventory_movements"
});
InventoryMovementModel.belongsTo(LocationModel, {
    foreignKey: "location_id",
    as: "location",
    onDelete: "SET NULL"
});
/* ProductionOrder - Production
* Una ProductionOrder puede tener muchos productions, pero una
Production solo puede tener una ProductionOrder
*/
ProductionOrderModel.hasMany(ProductionModel, {
    foreignKey: "production_order_id",
    as: "productions"
});
ProductionModel.belongsTo(ProductionOrderModel, {
    foreignKey: "production_order_id",
    onDelete: "CASCADE",
    as: "production_order"
});
ProductionOrderModel.belongsTo(ProductModel, {
    foreignKey: "product_id",
    as: "product"
});
ProductModel.hasMany(ProductionOrderModel, {
    foreignKey: "product_id",
    as: "production_orders"
});
/* Scrap-Location
* Un Scrap puede tener una Location, pero una Location puede tener muchos Scraps
*/
ScrapModel.belongsTo(LocationModel, {
    foreignKey: "location_id",
    as: "location"
});
LocationModel.hasMany(ScrapModel, {
    foreignKey: "location_id",
    onDelete: "SET NULL",
    as: "scrap"
});
/* Client Module */
ClientModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "clients";
    const operation_name = 'update';
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ClientModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "clients";
    const operation_name = 'create';
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    // Log creation
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ClientModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "clients";
    const operation_name = 'delete';
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ClientAddressesModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "clients_addresses";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ClientAddressesModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "clients_addresses";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ClientAddressesModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "clients_addresses";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
/* Location Module */
LocationModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "locations";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
LocationModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "locations";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
LocationModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "locations";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
LocationTypeModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "location_types";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
LocationTypeModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "location_types";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
LocationTypeModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "location_types";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
LocationLocationTypeModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "locations_location_types";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
LocationLocationTypeModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "locations_location_types";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
LocationLocationTypeModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "locations_location_types";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
/*   Hooks Product Module   */
ProductModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "products";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ProductModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "products";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ProductModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "products";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ProductDiscountRangeModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "product_discounts_ranges";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ProductDiscountRangeModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "product_discounts_ranges";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ProductDiscountRangeModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "product_discounts_ranges";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
/****************************************
 *                                      *
 *      Hooks to Services Modules       *
 *                                      *
 ***************************************/
/*   Hooks Authentication Module   */
PermissionModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "permissions";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
PermissionModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "permissions";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
PermissionModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "permissions";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
RoleModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "roles";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
RoleModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "roles";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
RoleModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "roles";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
RolePermissionModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "roles_permissions";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
RolePermissionModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "roles_permissions";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
RolePermissionModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "roles_permissions";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
UserModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "users";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
UserModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "users";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
UserModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "users";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
/*   Hooks Inventories Module   */
InventoryModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "inventories";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
InventoryModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "inventories";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
InventoryModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "inventories";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
InventoryLocationItemModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "inventories_locations_items";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
InventoryLocationItemModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "inventories_locations_items";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
InventoryLocationItemModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "inventories_locations_items";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
/*   Hooks Inventory Transfers Module   */
InventoryTransferModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "inventory_transfers";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
InventoryTransferModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "inventory_transfers";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
InventoryTransferModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "inventory_transfers";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
/*   Hooks Logistics Module   */
CarrierModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "carriers";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
CarrierModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "carriers";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
CarrierModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "carriers";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ShippingOrderModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "shipping_orders";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ShippingOrderModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "shipping_orders";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ShippingOrderModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "shipping_orders";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
/*   Hooks Sales Module   */
PurchaseOrderProductModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "purchased_orders_products";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
PurchaseOrderProductModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "purchased_orders_products";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
PurchaseOrderProductModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "purchased_orders_products";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
AppliedProductDiscountClientModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "applied_product_discounts_client";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
AppliedProductDiscountClientModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "applied_product_discounts_client";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
AppliedProductDiscountClientModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "applied_product_discounts_client";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
AppliedProductDiscountRangeModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "applied_product_discounts_ranges";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
AppliedProductDiscountRangeModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "applied_product_discounts_ranges";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
AppliedProductDiscountRangeModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "applied_product_discounts_ranges";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ProductDiscountClientModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "product_discounts_clients";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ProductDiscountClientModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "product_discounts_clients";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ProductDiscountClientModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "product_discounts_clients";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
PurchasedOrderModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "purchased_orders";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
PurchasedOrderModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "purchased_orders";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
PurchasedOrderModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "purchased_orders";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
/****************************************
 *                                      *
 *      Hooks to Features Modules       *
 *                                      *
 ***************************************/
/* Hooks Production Module */
InputTypeModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "input_types";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
InputTypeModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "input_types";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
InputTypeModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "input_types";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ProcessModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "processes";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ProcessModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "processes";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ProcessModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "processes";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ProductionLineModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "production_lines";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ProductionLineModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "production_lines";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name || null,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ProductionLineModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "production_lines";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [responseOperation, responseTable] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = responseOperation?.toJSON() || null;
    const table = responseTable?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name || null,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
InternalProductProductionOrderModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "internal_product_production_orders";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
InternalProductProductionOrderModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "internal_product_production_orders";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
InternalProductProductionOrderModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "internal_product_production_orders";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
InternalProductionOrderLineProductModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "internal_production_orders_lines_products";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
InternalProductionOrderLineProductModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "internal_production_orders_lines_products";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
InternalProductionOrderLineProductModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "internal_production_orders_lines_products";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
LocationsProductionLinesModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "locations_production_lines";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
LocationsProductionLinesModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "locations_production_lines";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
LocationsProductionLinesModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "locations_production_lines";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ProductInputModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "products_inputs";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ProductInputModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "products_inputs";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ProductInputModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "products_inputs";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ProductionLineProductModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "production_lines_products";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ProductionLineProductModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "production_lines_products";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ProductionLineProductModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "production_lines_products";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ProductProcessModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "products_processes";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ProductProcessModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "products_processes";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ProductProcessModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "products_processes";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
PurchasedOrdersProductsLocationsProductionLinesModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "purchased_orders_products_locations_production_lines";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
PurchasedOrdersProductsLocationsProductionLinesModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "purchased_orders_products_locations_production_lines";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
PurchasedOrdersProductsLocationsProductionLinesModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "purchased_orders_products_locations_production_lines";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ShippingOrderPurchaseOrderProductModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "shipping_orders_purchased_order_products";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ShippingOrderPurchaseOrderProductModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "shipping_orders_purchased_order_products";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ShippingOrderPurchaseOrderProductModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "shipping_orders_purchased_order_products";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
InputModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "inputs";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
InputModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "inputs";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
InputModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "inputs";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
InventoryMovementModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "inventory_movements";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
InventoryMovementModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "inventory_movements";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
InventoryMovementModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "inventory_movements";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ProductionOrderModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "production_orders";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ProductionOrderModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "production_orders";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ProductionOrderModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "production_orders";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
ProductionModel.addHook("afterCreate", async (instance, options) => {
    const tableName = "productions";
    const operation_name = "create";
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: newValues,
        old_data: null,
        message: `${operation_name} in ${tableName}`
    });
});
ProductionModel.addHook("afterUpdate", async (instance, options) => {
    const tableName = "productions";
    const operation_name = "update";
    const oldValues = instance.previous();
    const newValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    if (JSON.stringify(oldValues)
        !== JSON.stringify(newValues)) {
        await LogModel.create({
            operation_id: operation?.id || null,
            operation_name: operation?.name,
            table_id: table?.id || null,
            table_name: table?.name,
            user_id: options?.userId || null,
            user_name: options?.userName || null,
            new_data: newValues,
            old_data: oldValues,
            message: `${operation_name} in ${tableName}`
        });
    }
});
ProductionModel.addHook("afterDestroy", async (instance, options) => {
    const tableName = "productions";
    const operation_name = "delete";
    const oldValues = instance.dataValues;
    const [operationRes, tableRes] = await Promise.all([
        OperationModel.findOne({
            where: { name: operation_name }
        }),
        TableModel.findOne({
            where: { name: tableName }
        })
    ]);
    const operation = operationRes?.toJSON() || null;
    const table = tableRes?.toJSON() || null;
    await LogModel.create({
        operation_id: operation?.id || null,
        operation_name: operation?.name,
        table_id: table?.id || null,
        table_name: table?.name,
        user_id: options?.userId || null,
        user_name: options?.userName || null,
        new_data: null,
        old_data: oldValues,
        message: `${operation_name} in ${tableName}`
    });
});
/****************************************
 *                                      *
 *    SYNCHRONIZED MODULES RELATIONS    *
 *                                      *
 ***************************************/
sequelize.sync({ force: false })
    .then(() => {
    console.log("Modelos features e integration "
        + "sincronizados correctamente");
})
    .catch(err => {
    console.error("Error al sincronizar los modelos:", err);
});
export { 
/* CORE'S MODULES */
ClientModel, ClientAddressesModel, ProductDiscountRangeModel, ProductModel, LocationLocationTypeModel, LocationModel, LocationTypeModel, 
/* SERVICE'S MODULES */
UserModel, PermissionModel, RoleModel, RolePermissionModel, InventoryLocationItemModel, InventoryModel, InventoryTransferModel, CarrierModel, ShippingOrderModel, PurchaseOrderProductModel, AppliedProductDiscountClientModel, AppliedProductDiscountRangeModel, ProductDiscountClientModel, PurchasedOrderModel, LogModel, TableModel, OperationModel, 
/* INTEGRATION MODULES */
ProductionModel, ProductionOrderModel, PurchasedOrdersProductsLocationsProductionLinesModel, ShippingOrderPurchaseOrderProductModel, ProductionLineProductModel, InternalProductProductionOrderModel, InternalProductionOrderLineProductModel, LocationsProductionLinesModel, ProductionLineModel, ProductProcessModel, ProductInputModel, InputTypeModel, ProcessModel, InputModel, InventoryMovementModel, ScrapModel, ProductionLineQueueModel, ProductInputProcessModel };
