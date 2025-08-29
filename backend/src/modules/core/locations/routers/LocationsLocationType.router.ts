import validateLocationsLocationTypeMiddleware 
    from "../middleware/locations-location-types/validationMiddleware.js";
import LocationsLocationTypesController 
    from "../controllers/LocationsLocationTypes.controller.js";
import { Router }
    from "express";

const createLocationsLocationTypesRouter = (): Router => {
    const locationsLocationTypesRouter = Router();
    locationsLocationTypesRouter.get("/", 
        LocationsLocationTypesController.getAll);
    locationsLocationTypesRouter.get("/id/:id", 
        LocationsLocationTypesController.getById);
    locationsLocationTypesRouter.get("/location/:id", 
        LocationsLocationTypesController.getTypesByLocationId);
    locationsLocationTypesRouter.post("/", 
        validateLocationsLocationTypeMiddleware, 
        LocationsLocationTypesController.create);
    locationsLocationTypesRouter.patch("/:id", 
        validateLocationsLocationTypeMiddleware, 
        LocationsLocationTypesController.update);
    locationsLocationTypesRouter.delete("/:id", 
        LocationsLocationTypesController.deleteById);
    return locationsLocationTypesRouter;
}

export default createLocationsLocationTypesRouter;