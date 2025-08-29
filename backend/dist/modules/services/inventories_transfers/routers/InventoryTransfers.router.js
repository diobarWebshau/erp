import validateInventoryTransferMiddleware from "../middleware/inventory-transfers/validationMiddleware.js";
import InventoryTransfersController from "../controllers/InventoryTransfers.controller.js";
import { Router } from "express";
const createInventoryTransfersRouter = () => {
    const InventoryTransfersRouter = Router();
    InventoryTransfersRouter.get("/", InventoryTransfersController.getAll);
    InventoryTransfersRouter.get("/id/:id", InventoryTransfersController.getById);
    InventoryTransfersRouter.post("/", validateInventoryTransferMiddleware, InventoryTransfersController.create);
    InventoryTransfersRouter.patch("/:id", validateInventoryTransferMiddleware, InventoryTransfersController.update);
    InventoryTransfersRouter.delete("/:id", InventoryTransfersController.delete);
    return InventoryTransfersRouter;
};
export default createInventoryTransfersRouter;
