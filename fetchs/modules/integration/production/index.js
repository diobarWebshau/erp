// junctions
import sendMultipleInventoryLineProducts 
    from "./junctions/inventories_locations_production_lines_products/many.js";
import sendMultiplePurchasedOrderProductLocations 
    from "./junctions/purchased_orders_products_locations_production_lines/many.js";
import sendMultipleShippingOrderPurchaseOrderProducts 
    from "./junctions/shipping_orders_purchased_orders_products/many.js";
import sendMultiplePurchaseOrderProducts 
    from "./junctions/purchased-orders-products/many.js";
import sendMultipleLocationLineProducts 
    from "./junctions/locations-production_lines_products/many.js";

// references
import sendMultipleAppliedProductDiscountClient
    from "./references/appliedProductDiscountsClients/many.js";
import sendMultipleAppliedProductDiscountRange
    from "./references/appliedProductDiscountsRanges/many.js";
import sendMultipleProductDiscountClient
    from "./references/productDiscountsClients/many.js";
import sendMultipleProductions
    from "./references/productions/many.js";

const insertDataModuleProduction = async () => {
    try {
        await sendMultiplePurchaseOrderProducts();
        await sendMultipleProductDiscountClient();
        await sendMultipleLocationLineProducts();
        await sendMultipleInventoryLineProducts();
        await sendMultipleProductions();
        await sendMultiplePurchasedOrderProductLocations();
        await sendMultipleAppliedProductDiscountRange();
        await sendMultipleAppliedProductDiscountClient();
        // await sendMultipleShippingOrderPurchaseOrderProducts();
    } catch (error) {
        console.error(error);
    }
}

export default insertDataModuleProduction;