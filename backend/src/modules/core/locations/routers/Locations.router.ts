import validateLocationsMiddleware
    from "../middleware/locations/validationMiddleware.js";
import LocationController
    from "../controllers/Locations.controller.js";
import { Router }
    from "express";

const createLocationsRouter = (): Router => {
    const locationRouter = Router();
    locationRouter.get("/",
        LocationController.getAll);
    locationRouter.get("/filter",
        LocationController.getAllWithFilters);
    locationRouter.get("/with-types",
        LocationController.getAllWithTypes);
    locationRouter.get("/id/:id",
        LocationController.getById);
    locationRouter.get("/with-all-information/:id",
        LocationController.getLocationWithAllInformation);
    locationRouter.get("/inventory-inputs/:product_id/:location_id",
        LocationController.getInventoryInputsOfProductInOneLocation);
    locationRouter.get("/produced/:product_id",
        LocationController.getLocationsProducedOneProduct);
    locationRouter.get("/production-lines/:location_id/:product_id",
        LocationController.getProductionLinesForProductAtLocation);
    locationRouter.get("/types/:id",
        LocationController.getTypesOfLocation);
    locationRouter.get("/name/:name",
        LocationController.getByName);
    locationRouter.post("/",
        validateLocationsMiddleware,
        LocationController.create);
    locationRouter.post("/create-complete",
        validateLocationsMiddleware,
        LocationController.createComplete);
    locationRouter.patch("/:id",
        validateLocationsMiddleware,
        LocationController.update);
    locationRouter.patch("/update-complete/:id",
        LocationController.updateComplete);
    locationRouter.delete("/:id",
        LocationController.delete);
    return locationRouter;
}

export default createLocationsRouter;