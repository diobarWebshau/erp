import validateLocationTypesMiddleware from "../middleware/location-types/validationMiddleware.js";
import LocationTypeController from "../controllers/LocationTypes.controller.js";
import { Router } from "express";
const createLocationTypesRouter = () => {
    const locationsTypesRouter = Router();
    locationsTypesRouter.get("/", LocationTypeController.getAll);
    locationsTypesRouter.get("/id/:id", LocationTypeController.getById);
    locationsTypesRouter.get("/name/:name", LocationTypeController.getByName);
    locationsTypesRouter.post("/", validateLocationTypesMiddleware, LocationTypeController.create);
    locationsTypesRouter.patch("/:id", validateLocationTypesMiddleware, LocationTypeController.update);
    locationsTypesRouter.delete("/:id", LocationTypeController.delete);
    return locationsTypesRouter;
};
export default createLocationTypesRouter;
