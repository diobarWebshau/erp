import validateInternalProductionOrderLineProductsMiddleware
    from "../middleware/internal_production_order_lines_products/validationMiddleware.js";
import InternalProductionOrderLineProductController
    from "../controllers/InternalProductionOrderLinesProducts.controller.js";
import { Router } from "express";

const createInternalProductionOrderLineProductsRouter = (): Router => {
    const internalProductionOrderLineProductRouter = Router();
    internalProductionOrderLineProductRouter.get("/",
        InternalProductionOrderLineProductController.getAll);
    internalProductionOrderLineProductRouter.get("/id/:id",
        InternalProductionOrderLineProductController.getById);
    internalProductionOrderLineProductRouter.post("/",
        validateInternalProductionOrderLineProductsMiddleware,
        InternalProductionOrderLineProductController.create);
    internalProductionOrderLineProductRouter.patch("/:id",
        validateInternalProductionOrderLineProductsMiddleware,
        InternalProductionOrderLineProductController.update);
    internalProductionOrderLineProductRouter.delete("/:id",
        InternalProductionOrderLineProductController.delete);
    return internalProductionOrderLineProductRouter;
}

export default createInternalProductionOrderLineProductsRouter;
