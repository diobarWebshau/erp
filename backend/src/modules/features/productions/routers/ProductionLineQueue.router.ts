import { Router } from "express";
import ProductionLineQueueController from "../controllers/ProductionLineQueue.js";
import validateProductionLineQueueMiddleware from "../middleware/production_line_queue/validationMiddleware.js";


const createProductionLineQueueRouter = (): Router => {
    const productionLineQueueRouter = Router();
    productionLineQueueRouter.get("/",
        ProductionLineQueueController.getAll);
    productionLineQueueRouter.get("/id/:id",
        ProductionLineQueueController.getById);
    productionLineQueueRouter.post("/",
        validateProductionLineQueueMiddleware,
        ProductionLineQueueController.create);
    productionLineQueueRouter.patch("/reorder/:production_line_id",
        ProductionLineQueueController.reorderProductionLineQueueOptimizadaTablaTemporal);
    return productionLineQueueRouter;
}

export default createProductionLineQueueRouter;
