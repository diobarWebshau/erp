import {
    sendMultipleInputs,
    sendMultipleInputTypes,
    sendMultipleProcesses,
    sendMultipleProductProcesses,
    sendMultipleProductsInputs,
    sendMultipleProductionLines,
    sendMultipleLocationProductionLine,
    sendMultipleProductionLineProducts,
    sendMultipleInternalProductProductionOrder,
    sendMultipleProductions,
    sendMultipleInternalProductionOrderLinesProduct,
    sendMultiplePurchasedOrderProductLocations,
    sendMultipleInventoryMovement,
    sendMultipleProductsInputsProcesses,
} from "./modules2/features/production/index.js"

import insertDataCoresModules from "./modules2/core/index.js"

import {
    insertDataModuleAuthentication,
    insertDataInventoriesModules,
    insertDataInventoryTransfersModules,
    insertDataModuleLogistics,
    // insertDataModuleLogs,
} from "./modules2/services/index.js"

import {
    sendMultipleProductDiscountData,
    sendMultiplePurchasedOrderData,
    sendMultiplePurchaseOrderProductData,
    sendMultipleAppliedProductDiscountData,
    sendMultipleAppliedProductDiscountRangeData,
} from "./modules2/services/sales/index.js"

try {
    // creamos productos, clients y locaciones
    await insertDataCoresModules();

    // creamos lo relacionado con productos
    await sendMultipleInputTypes(),
    await sendMultipleProcesses(),
    await sendMultipleInputs(),
    await sendMultipleProductProcesses(),
    await sendMultipleProductsInputs(),
    await sendMultipleProductsInputsProcesses(),

    // creacion de lineas de produccion
    await sendMultipleProductionLines();
    await sendMultipleLocationProductionLine();
    
    // creamos inventarios para las locaciones
    await insertDataInventoriesModules();
    await sendMultipleInventoryMovement();
    
    // crea modulos indenpendientes de servicios
    await insertDataModuleAuthentication();
    await insertDataModuleLogistics();
    await sendMultipleProductionLineProducts();
    // await insertDataModuleLogs();

    // craemos ordenes de compra
    await sendMultipleProductDiscountData();
    // await sendMultiplePurchasedOrderData();
    // await sendMultiplePurchaseOrderProductData();    
    // await sendMultipleAppliedProductDiscountData();
    // await sendMultipleAppliedProductDiscountRangeData();
    // await sendMultipleInternalProductProductionOrder();

} catch (error) {
    console.error(error);
}