import validateLocationsMiddleware
    from "../middleware/locations/validationMiddleware.js";
import LocationController
    from "../controllers/LocationVProduction.controller.js";
import { Router }
    from "express";

const createLocationsVProductionRouter = (): Router => {
    const locationRouter = Router();
    locationRouter.get("/",
        LocationController.getAll);
    locationRouter.get("/id/:id",
        LocationController.getById);
    locationRouter.get("/name/:name",
        LocationController.getByName);
    locationRouter.post("/",
        validateLocationsMiddleware,
        LocationController.create);
    locationRouter.patch("/:id",
        validateLocationsMiddleware,
        LocationController.update);
    locationRouter.delete("/:id",
        LocationController.delete);
    locationRouter.get("/:id/production-lines",
        LocationController.getProductionLines);
    locationRouter.get("/:id/location-types",
        LocationController.getTypesOfLocation);
    locationRouter.post(
        "/:id/production-lines/:production_line_id",
        LocationController.addProductionLine);
    locationRouter.delete(
        "/:id/production-lines/:production_line_id",
        LocationController.removeProductionLine);
    return locationRouter;
}

export default createLocationsVProductionRouter;