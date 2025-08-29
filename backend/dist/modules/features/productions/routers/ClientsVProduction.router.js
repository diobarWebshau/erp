import validateClientsMiddleware from "../middleware/clients/validationMiddleware.js";
import ClientVProductionController from "../controllers/ClientsVProduction.controller.js";
import { Router } from "express";
const createClientVProduction = () => {
    const clientVProductionRouter = Router();
    clientVProductionRouter.get("/", ClientVProductionController.getAll);
    clientVProductionRouter.get("/id/:id", ClientVProductionController.getById);
    clientVProductionRouter.get("/company_name/:company_name", ClientVProductionController.getByCompanyName);
    clientVProductionRouter.post("/", validateClientsMiddleware, ClientVProductionController.create);
    clientVProductionRouter.patch("/:id", ClientVProductionController.update);
    clientVProductionRouter.delete("/:id", validateClientsMiddleware, ClientVProductionController.delete);
    clientVProductionRouter.get("/addresses/:id", ClientVProductionController.getAddresses);
    clientVProductionRouter.get("/discounts/:id", ClientVProductionController.getDiscountsOfClient);
    return clientVProductionRouter;
};
export default createClientVProduction;
