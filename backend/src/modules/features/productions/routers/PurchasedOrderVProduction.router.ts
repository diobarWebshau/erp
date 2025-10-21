import validatepurchasedOrdersMiddleware
    from "../middleware/purcharsed-orders/validationMiddleware.js";
import PurchasedOrdersVProduction
    from "../controllers/PurchasedOrderVProduction.controller.js";
import { Router } from "express";

const createPurchasedOrderVProductionRouter = (): Router => {
    const purchasedOrderRouter = Router();
    purchasedOrderRouter.get("/",
        PurchasedOrdersVProduction.getAll);
    purchasedOrderRouter.get("/id/:id",
        PurchasedOrdersVProduction.getById);
    purchasedOrderRouter.get("/client/:client_id",
        PurchasedOrdersVProduction.getByClientId);
    purchasedOrderRouter.get("/ids",
        PurchasedOrdersVProduction.getByIds);
    purchasedOrderRouter.post("/",
        validatepurchasedOrdersMiddleware,
        PurchasedOrdersVProduction.create);
    purchasedOrderRouter.patch("/:id",
        validatepurchasedOrdersMiddleware,
        PurchasedOrdersVProduction.updateComplete);
    purchasedOrderRouter.delete("/:id",
        PurchasedOrdersVProduction.delete);
    purchasedOrderRouter.get("/products/:id",
        PurchasedOrdersVProduction.getProductsInOrder);
    purchasedOrderRouter.post("/products/:id",
        PurchasedOrdersVProduction.addProductOnOrder);
    purchasedOrderRouter.post("/products/batch/:id",
        PurchasedOrdersVProduction.addProductsOnOrder);
    purchasedOrderRouter.delete("/products/:id",
        PurchasedOrdersVProduction.removeProductOfOrder);
    purchasedOrderRouter.delete("/products/batch/:id",
        PurchasedOrdersVProduction.removeProductsOnOrder);
    purchasedOrderRouter.get("/details/:id",
        PurchasedOrdersVProduction.getAllDetailsOfOrder);
    purchasedOrderRouter.post('/batch',
        validatepurchasedOrdersMiddleware,
        PurchasedOrdersVProduction.createComplete2);
    purchasedOrderRouter.get("/address/:client_address_id",
        PurchasedOrdersVProduction.getProductsOrderProductByClientAddress
    );
    purchasedOrderRouter.delete("/delete-secure/:id",
        PurchasedOrdersVProduction.deleteWhenNoProduction);
    return purchasedOrderRouter;
}

export default createPurchasedOrderVProductionRouter;