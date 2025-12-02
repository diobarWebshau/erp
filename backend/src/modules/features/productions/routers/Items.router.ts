import { Router } from "express";
import ItemsController from "../controllers/Items.controller.js";

const createItemsRouter = (): Router => {
    const ItemRouter = Router();
    ItemRouter.get("/", ItemsController.getAll);
    ItemRouter.get("/exclude", ItemsController.getItemsByExcludeIds);
    return ItemRouter;
}

export default createItemsRouter;
