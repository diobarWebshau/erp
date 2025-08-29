import validatePurchasedOrdersProductsMiddleware
    from "../middleware/purcharsed-orders-products/validationMiddleware.js";
import PurchaseOrderProductController
    from "../controllers/PurchaseOrdersProducts.controller.js";
import {
    Router
} from "express";

const createPurchaseOrdersProductsRouter = (): Router => {
    const purchaseOrdersProductsRouter = Router();
    purchaseOrdersProductsRouter.get("/",
        PurchaseOrderProductController.getAll);
    purchaseOrdersProductsRouter.get(
        "/client-address/:client_address_id",
        PurchaseOrderProductController
            .getPopsByClientAddress);
    purchaseOrdersProductsRouter.get("/id/:id",
        PurchaseOrderProductController.getById);
    purchaseOrdersProductsRouter.get(
        "/orders-products/:purchase_order_id",
        PurchaseOrderProductController.getByIdPO
    );
    purchaseOrdersProductsRouter.post("/",
        validatePurchasedOrdersProductsMiddleware,
        PurchaseOrderProductController.create);
    purchaseOrdersProductsRouter.post(
        "/batch/:purchase_order_id",
        PurchaseOrderProductController
            .createBatchToPurchaseOrder);
    purchaseOrdersProductsRouter.patch("/:id",
        validatePurchasedOrdersProductsMiddleware,
        PurchaseOrderProductController.update);
    purchaseOrdersProductsRouter.delete("/:id",
        PurchaseOrderProductController.deleteById);
    purchaseOrdersProductsRouter.get("/revert-order-production/:id",
        PurchaseOrderProductController.deleteById);
    return purchaseOrdersProductsRouter;
}

export default createPurchaseOrdersProductsRouter;