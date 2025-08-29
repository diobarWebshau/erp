import validateShippingOrdersPurchasedOrdersProductsMiddleware
from "../middleware/shipping-orders-purchased_order_products/validationMiddleware.js";
import ShippingOrderPurchaseOrderProductController from
"../controllers/ShippingOrdersPurchasedOrdersProducts.controller.js";
import { Router } from "express";

const createShippingOrderPurchasedOrdersProductsRouter = (): Router => {
    const shippingOrderPurchasedOrdersProductsRouter = Router();
    shippingOrderPurchasedOrdersProductsRouter.get("/",
        ShippingOrderPurchaseOrderProductController.getAll);
    shippingOrderPurchasedOrdersProductsRouter.get("/id/:id",
        ShippingOrderPurchaseOrderProductController.getById);
    shippingOrderPurchasedOrdersProductsRouter.post("/",
        validateShippingOrdersPurchasedOrdersProductsMiddleware,
        ShippingOrderPurchaseOrderProductController.create);
    shippingOrderPurchasedOrdersProductsRouter.patch("/:id",
        validateShippingOrdersPurchasedOrdersProductsMiddleware,
        ShippingOrderPurchaseOrderProductController.update);
    shippingOrderPurchasedOrdersProductsRouter.delete("/:id",
        ShippingOrderPurchaseOrderProductController.deleteById);
    shippingOrderPurchasedOrdersProductsRouter.get("/prueba/:id",
        ShippingOrderPurchaseOrderProductController.prueba);
    return shippingOrderPurchasedOrdersProductsRouter;
}

export default createShippingOrderPurchasedOrdersProductsRouter;