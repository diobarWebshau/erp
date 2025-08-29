import validateCarriersMiddleware 
    from "../middleware/carriers/validationMiddleware.js";
import CarrierController 
    from "../controllers/Carriers.controller.js";
import { Router } from "express";

const createCarrierRouter = (): Router => {
    const CarrierRouter = Router();
    CarrierRouter.get("/", 
        CarrierController.getAll);
    CarrierRouter.get("/id/:id", 
        CarrierController.getById);
    CarrierRouter.get("/name/:name",
        CarrierController.getByName);
    CarrierRouter.get("/rfc/:rfc",
        CarrierController.getByRfc);
    CarrierRouter.post("/", 
        validateCarriersMiddleware,
        CarrierController.create);
    CarrierRouter.patch("/:id",
        CarrierController.update);
    CarrierRouter.delete("/:id",
        validateCarriersMiddleware,
        CarrierController.delete);
    return CarrierRouter;
}

export default createCarrierRouter;