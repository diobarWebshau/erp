import validateLocationsProductionLinesProductsMiddleware from "../middleware/production_lines_products/validationMiddleware.js";
import ProductionLineProductController from "../controllers/ProductionLinesProducts.controller.js";
import { Router } from "express";
const createProductionLinesProductsRouter = () => {
    const productionLinesProductsRouter = Router();
    productionLinesProductsRouter.get("/", ProductionLineProductController.getAll);
    productionLinesProductsRouter.get("/id/:id", ProductionLineProductController.getById);
    productionLinesProductsRouter.post("/", validateLocationsProductionLinesProductsMiddleware, ProductionLineProductController.create);
    productionLinesProductsRouter.patch("/:id", validateLocationsProductionLinesProductsMiddleware, ProductionLineProductController.update);
    productionLinesProductsRouter.delete("/:id", ProductionLineProductController.deleteById);
    return productionLinesProductsRouter;
};
export default createProductionLinesProductsRouter;
