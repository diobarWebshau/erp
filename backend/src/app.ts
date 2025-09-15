import errorMiddleware
    from "./middlewares/error/errorMiddleware.js";
import corsMiddleware
    from "./middlewares/cors/corsMiddleware.js";
import morganUtil from
    "./utils/morgan/morgan.js";
import helmetUtil from
    "./utils/helmet/helmet.js";
import express, { Express }
    from "express";
import cookieParser
    from "cookie-parser";
import { Core, Services, Features }
    from "./modules/index.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const createApp = (): Express => {
    const app = express();

    app.use(corsMiddleware);
    app.use(morganUtil);
    app.use(helmetUtil);
    app.use(cookieParser());

    // SOLO uno de estos, con límite aumentado
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use('/uploads',
        express.static(
            path.resolve(
                __dirname,
                '../uploads')
        )
    );

    app.use("/clients/clients",
        Core.Clients
            .createClientRouter());
    app.use("/clients/client-addresses",
        Core.Clients
            .createClientAddressesRouter());


    app.use("/locations/locations",
        Core.Locations
            .createLocationsRouter());
    app.use("/locations/location-types",
        Core.Locations
            .createLocationTypesRouter());
    app.use("/locations/locations-location-types",
        Core.Locations
            .createLocationsLocationTypesRouter());


    app.use("/products/products",
        Core.Products
            .createProductsRouter());
    app.use("/products/product-discounts-ranges",
        Core.Products
            .createProductDiscountRangesRouter());


    app.use("/authentication/permissions",
        Services.Authentication
            .createPermissionsRouter());
    app.use("/authentication/roles",
        Services.Authentication
            .createRolesRouter());
    app.use("/authentication/roles-permissions",
        Services.Authentication
            .createRolesPermissionsRouter());
    app.use("/authentication/users",
        Services.Authentication
            .createUsersRouter());
    app.use("/authentication/auth",
        Services.Authentication
            .createAuthRouter());



    app.use("/inventories/inventories",
        Services.Inventories
            .createInventoriesRouter());

    app.use("/inventories/inventories-locations-items",
        Services.Inventories
            .createInventoriesLocationsItemsRouter());
    app.use("/inventories/scrap",
        Services.Inventories
            .createScrapRouter());



    app.use("/inventory-transfers",
        Services.InventoryTransfers
            .createInventoryTransfersRouter());



    app.use("/logistics/carriers",
        Services.Logistic
            .createCarrierRouter());

    app.use("/logistics/shipping-orders",
        Services.Logistic
            .createShippingOrdersRouter());



    app.use("/logs/tables",
        Services.Logs
            .createTablesRouter());

    app.use("/logs/operations",
        Services.Logs
            .createOperationRouter());

    app.use("/logs/logs",
        Services.Logs
            .createLogsRouter());



    app.use("/sales/purchased-orders",
        Services.Sales
            .createPurchasedOrderRouter());

    app.use("/sales/purchased-orders-products",
        Services.Sales
            .createPurchaseOrdersProductsRouter());

    app.use("/sales/product-discounts-clients",
        Services.Sales
            .createProductDiscountsClientRouter());

    app.use("/sales/applied-product-discounts-ranges",
        Services.Sales
            .createAppliedProductDiscountsRangesRouter());

    app.use("/sales/applied-product-discounts-clients",
        Services.Sales
            .createAppliedProductDiscountsClientRouter());

    


    app.use("/production/products",
        Features.Production
            .createProductVProductionController());
    app.use("/production/input-types",
        Features.Production
            .createInputTypesRouter());
    app.use("/production/inputs",
        Features.Production
            .createInputsRouter());
    app.use("/production/processes",
        Features.Production
            .createProcessesRouter());
    app.use("/production/products-inputs",
        Features.Production
            .createProductsInputsRouter());
    app.use("/production/products-processes",
        Features.Production
            .createProductsProcessesRouter());


    app.use("/production/locations",
        Features.Production
            .createLocationsVProductionRouter());
    app.use("/production/production-lines",
        Features.Production
            .createProductionLineRouter());
    app.use("/production/locations-production-lines",
        Features.Production
            .createLocationsProductionLinesRouter());


    app.use("/production/clients/",
        Features.Production
            .createClientVProduction());



    app.use("/production/purchased-orders",
        Features.Production
            .createPurchasedOrderVProductionRouter());


    app.use("/production/purchased-orders-products",
        Features.Production.createPurchaseOrdersProductsRouter());

    app.use("/production/production-lines-products",
        Features.Production
            .createProductionLinesProductsRouter());

    app.use("/production/productions",
        Features.Production
            .createProductionRouter());

    app.use("/production/purchased-orders-products-production-lines",
        Features.Production
            .createPurchasedOrdersProductsLocationsProductionLineRouter()
    );
    app.use("/production/internal-production-order-lines-products",
        Features.Production
            .createInternalProductionOrderLineProductsRouter());

    app.use("/production/internal-product-production-orders",
        Features.Production
            .createInternalProductProductionOrderRouter());

    app.use("/production/shipping-orders-purchased-orders-products",
        Features.Production
            .createShippingOrderPurchasedOrdersProductsRouter()
    );

    app.use("/production/inventory-movements",
        Features.Production
            .createInventoryMovementsRouter());

    app.use("/production/production-orders",
        Features.Production
            .createProductionOrderRouter());

    app.use("/production/production-line-queue",
        Features.Production
            .createProductionLineQueueRouter());

    app.use(errorMiddleware);

    return app;
}

export { createApp };