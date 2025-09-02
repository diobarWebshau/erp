import validatepurchasedOrdersMiddleware from "../middleware/purcharsed-orders/validationMiddleware.js";
import PurchasedOrderController from "../controllers/PurchasedOrders.controller.js";
import { Router } from "express";
const createPurchasedOrderRouter = () => {
    const purchasedOrderRouter = Router();
    purchasedOrderRouter.get("/", PurchasedOrderController.getAll);
    purchasedOrderRouter.get("/id/:id", PurchasedOrderController.getById);
    purchasedOrderRouter.get("/like/:filter", PurchasedOrderController.getByLike);
    purchasedOrderRouter.get("/client/:client_id", PurchasedOrderController.getByClientId);
    purchasedOrderRouter.post("/", validatepurchasedOrdersMiddleware, PurchasedOrderController.create);
    purchasedOrderRouter.patch("/:id", validatepurchasedOrdersMiddleware, PurchasedOrderController.update);
    purchasedOrderRouter.delete("/:id", PurchasedOrderController.delete);
    return purchasedOrderRouter;
};
export default createPurchasedOrderRouter;
