import validateInventoriesMiddleware
    from "../middleware/inventories/validationMiddleware.js";
import InventoriesController
    from "../controllers/Inventories.controller.js";
import { Router } from "express";

const createInventoriesRouter = (): Router => {
    const InventoriesRouter = Router();
    InventoriesRouter.get("/",
        InventoriesController.getAll);
    InventoriesRouter.get("/id/:id",
        InventoriesController.getById);
    InventoriesRouter.post("/",
        validateInventoriesMiddleware,
        InventoriesController.create);
    InventoriesRouter.patch("/:id",
        validateInventoriesMiddleware,
        InventoriesController.update);
    InventoriesRouter.delete("/:id",
        InventoriesController.delete);
    InventoriesRouter.get("/details",
        InventoriesController.getInventoryDetails
    );
    InventoriesRouter.get("/items",
        InventoriesController.getAllItemsOnInventory
    );
    InventoriesRouter.post("/items/like/:filter",
        InventoriesController.getAllItemsLike
    );
    InventoriesRouter.post("/batch",
        InventoriesController.createBatch
    );
    return InventoriesRouter;
}

export default createInventoriesRouter;
