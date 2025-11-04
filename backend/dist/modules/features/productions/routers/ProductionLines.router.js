import validateProductionLinesMiddleware from "../middleware/production-lines/validationMiddleware.js";
import ProductionLinesController from "../controllers/ProductionLines.controller.js";
import { Router } from "express";
const createProductionLineRouter = () => {
    const productionLineRouter = Router();
    productionLineRouter.get("/", ProductionLinesController.getAll);
    productionLineRouter.get("/id/:id", ProductionLinesController.getById);
    productionLineRouter.get("/details/:id", ProductionLinesController.getProductionLineDetails);
    productionLineRouter.get("/name/:name", ProductionLinesController.getByName);
    productionLineRouter.post("/", validateProductionLinesMiddleware, ProductionLinesController.create);
    productionLineRouter.post("/complete", validateProductionLinesMiddleware, ProductionLinesController.createComplete);
    productionLineRouter.patch("/:id", validateProductionLinesMiddleware, ProductionLinesController.update);
    productionLineRouter.patch("/complete/:id", validateProductionLinesMiddleware, ProductionLinesController.updateComplete);
    productionLineRouter.delete("/:id", ProductionLinesController.delete);
    productionLineRouter.get("/:id/products", ProductionLinesController
        .getProductsOnProductionLine);
    productionLineRouter.post("/:id/products/", ProductionLinesController.addProduct);
    productionLineRouter.delete("/:id/products/:product_id", ProductionLinesController.deleteProduct);
    return productionLineRouter;
};
export default createProductionLineRouter;
