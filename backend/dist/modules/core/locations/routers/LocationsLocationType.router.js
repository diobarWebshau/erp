import validateLocationsLocationTypeMiddleware from "../middleware/locations-location-types/validationMiddleware.js";
import LocationsLocationTypesController from "../controllers/LocationsLocationTypes.controller.js";
import { Router } from "express";
const createLocationsLocationTypesRouter = () => {
    const locationsLocationTypesRouter = Router();
    locationsLocationTypesRouter.get("/", LocationsLocationTypesController.getAll);
    locationsLocationTypesRouter.get("/location", LocationsLocationTypesController.getTypesByLocationId);
    locationsLocationTypesRouter.post("/", validateLocationsLocationTypeMiddleware, LocationsLocationTypesController.create);
    locationsLocationTypesRouter.delete("/", LocationsLocationTypesController.deleteById);
    return locationsLocationTypesRouter;
};
export default createLocationsLocationTypesRouter;
