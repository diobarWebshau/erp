import validateProductionLinesLocationsMiddleware from "../middleware/location-production-lines/validationMiddleware.js";
import ProductionLineLocationsController from "../controllers/LocationsProductionLines.controller.js";
import { Router } from "express";
const createLocationsProductionLinesRouter = () => {
    const productionLineLocationsRouter = Router();
    productionLineLocationsRouter.get("/", ProductionLineLocationsController.getAll);
    productionLineLocationsRouter.get("/id/:id", ProductionLineLocationsController.getById);
    productionLineLocationsRouter.post("/", validateProductionLinesLocationsMiddleware, ProductionLineLocationsController.create);
    productionLineLocationsRouter.patch("/:id", validateProductionLinesLocationsMiddleware, ProductionLineLocationsController.update);
    productionLineLocationsRouter.delete("/:id", ProductionLineLocationsController.deleteById);
    return productionLineLocationsRouter;
};
export default createLocationsProductionLinesRouter;
