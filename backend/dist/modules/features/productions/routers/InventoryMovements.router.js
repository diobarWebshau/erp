import { Router } from "express";
import validateInventoryMovementsMiddleware from "../middleware/inventory_movements/validationMiddleware.js";
import InvetoryMovementsController from "../controllers/InventoryMovements.controller.js";
const createInventoryMovementsRouter = () => {
    const inventoryMovementsRouter = Router();
    inventoryMovementsRouter.get("/", InvetoryMovementsController.getAll);
    inventoryMovementsRouter.get("/id/:id", InvetoryMovementsController.getById);
    inventoryMovementsRouter.post("/", validateInventoryMovementsMiddleware, InvetoryMovementsController.create);
    inventoryMovementsRouter.patch("/:id", validateInventoryMovementsMiddleware, InvetoryMovementsController.update);
    return inventoryMovementsRouter;
};
export default createInventoryMovementsRouter;
