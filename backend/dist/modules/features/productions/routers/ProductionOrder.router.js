import validateProductionOrderMiddleware from "../middleware/production_order/validationMiddleware.js";
import { Router } from "express";
import ProductionOrdersController from "../controllers/ProductionOrder.controller.js";
const createProductionOrderRouter = () => {
    const productionOrderRouter = Router();
    productionOrderRouter.get("/", ProductionOrdersController.getAll);
    productionOrderRouter.get("/id/:id", ProductionOrdersController.getById);
    productionOrderRouter.post("/", validateProductionOrderMiddleware, ProductionOrdersController.create);
    productionOrderRouter.patch("/:id", validateProductionOrderMiddleware, ProductionOrdersController.update);
    productionOrderRouter.delete("/:id", ProductionOrdersController.delete);
    return productionOrderRouter;
};
export default createProductionOrderRouter;
