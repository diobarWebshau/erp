import validateInternalProductProductionOrderMiddleware from "../middleware/internal_product_production_order/validationMiddleware.js";
import InternalProductProductionOrderController from "../controllers/InternalProductProductionOrder.controller.js";
import { Router } from "express";
const createInternalProductProductionOrderRouter = () => {
    const internalProductionOrderLineProductRouter = Router();
    internalProductionOrderLineProductRouter.get("/", InternalProductProductionOrderController.getAll);
    internalProductionOrderLineProductRouter.get("/id/:id", InternalProductProductionOrderController.getById);
    internalProductionOrderLineProductRouter.post("/", validateInternalProductProductionOrderMiddleware, InternalProductProductionOrderController.create);
    internalProductionOrderLineProductRouter.patch("/:id", validateInternalProductProductionOrderMiddleware, InternalProductProductionOrderController.update);
    internalProductionOrderLineProductRouter.delete("/:id", InternalProductProductionOrderController.delete);
    internalProductionOrderLineProductRouter.get("/revert-order-production/:id", InternalProductProductionOrderController.revertProductionOfIppo);
    return internalProductionOrderLineProductRouter;
};
export default createInternalProductProductionOrderRouter;
