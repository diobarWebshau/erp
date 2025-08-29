import validateInventoriesLocationsItemsMiddleware from "../middleware/inventories-locations-items/validationMiddleware.js";
import InventoriesLocationsItemsController from "../controllers/InvetoriesLocationsItems.controller.js";
import { Router } from "express";
const createInventoriesLocationsItemsRouter = () => {
    const inventoriesLocationsItemsRouter = Router();
    inventoriesLocationsItemsRouter.get("/", InventoriesLocationsItemsController.getAll);
    inventoriesLocationsItemsRouter.get("/id/:id", InventoriesLocationsItemsController.getById);
    inventoriesLocationsItemsRouter.post("/", validateInventoriesLocationsItemsMiddleware, InventoriesLocationsItemsController.create);
    inventoriesLocationsItemsRouter.patch("/:id", validateInventoriesLocationsItemsMiddleware, InventoriesLocationsItemsController.update);
    inventoriesLocationsItemsRouter.delete("/:id", InventoriesLocationsItemsController.delete);
    return inventoriesLocationsItemsRouter;
};
export default createInventoriesLocationsItemsRouter;
