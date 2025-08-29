import createClientVProduction
    from "./routers/ClientsVProduction.router.js";
import createInputsRouter
    from "./routers/Inputs.router.js";
import createInputTypesRouter
    from "./routers/InputTypes.router.js";
import createInternalProductProductionOrderRouter
    from "./routers/InternalProductProductionOrder.router.js";
import createInternalProductionOrderLineProductsRouter
    from "./routers/InternalProductionOrderLinesProducts.router.js";
import createLocationsProductionLinesRouter
    from "./routers/LocationsProductionLines.router.js";
import createLocationsVProductionRouter
    from "./routers/LocationVProduction.router.js";
import createProcessesRouter
    from "./routers/Processes.router.js";
import createProductionRouter
    from "./routers/Production.router.js";
import createProductionLineRouter
    from "./routers/ProductionLines.router.js";
import createProductionLinesProductsRouter
    from "./routers/ProductionLinesProducts.router.js";
import createProductsInputsRouter
    from "./routers/ProductsInputs.router.js";
import createProductsProcessesRouter
    from "./routers/ProductsProcesses.router.js";
import createPurchasedOrdersProductsLocationsProductionLineRouter
    from "./routers/PurchasedOrderProductLocationsProductionLines.router.js";
import createShippingOrderPurchasedOrdersProductsRouter
    from "./routers/ShippingOrderPurchasedOrderProducts.router.js";
import createProductVProductionController
    from "./routers/ProductVProduction.router.js";
import createPurchasedOrderVProductionRouter
    from "./routers/PurchasedOrderVProduction.router.js";
import createPurchaseOrdersProductsRouter
    from "./routers/PurchasedOrderProduct.router.js";
import createInventoryMovementsRouter
    from "./routers/InventoryMovements.router.js";
import createProductionOrderRouter
    from "./routers/ProductionOrder.router.js";

const Production = {
    createClientVProduction,
    createInputsRouter,
    createInputTypesRouter,
    createInternalProductProductionOrderRouter,
    createInternalProductionOrderLineProductsRouter,
    createLocationsProductionLinesRouter,
    createLocationsVProductionRouter,
    createProcessesRouter,
    createProductionRouter,
    createProductionLineRouter,
    createProductionLinesProductsRouter,
    createProductsInputsRouter,
    createProductsProcessesRouter,
    createPurchasedOrdersProductsLocationsProductionLineRouter,
    createShippingOrderPurchasedOrdersProductsRouter,
    createPurchasedOrderVProductionRouter,
    createPurchaseOrdersProductsRouter,
    createProductVProductionController,
    createInventoryMovementsRouter,
    createProductionOrderRouter,
}

export default Production;