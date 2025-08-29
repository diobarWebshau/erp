import validateProductionMiddleware from "../middleware/production/validationMiddleware.js";
import ProductionsController from "../controllers/Production.controller.js";
import { Router } from "express";
const createProductionRouter = () => {
    const productionRouter = Router();
    productionRouter.get("/", ProductionsController.getAll);
    productionRouter.get("/id/:id", ProductionsController.getById);
    productionRouter.post("/", validateProductionMiddleware, ProductionsController.create);
    productionRouter.patch("/:id", validateProductionMiddleware, ProductionsController.update);
    productionRouter.delete("/:id", ProductionsController.delete);
    return productionRouter;
};
export default createProductionRouter;
