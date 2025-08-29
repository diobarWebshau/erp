import validateClientsMiddleware from "../middleware/clients/validationMiddleware.js";
import ClientController from "../controllers/Clients.controller.js";
import { Router } from "express";
const createClientRouter = () => {
    const clientRouter = Router();
    clientRouter.get("/", ClientController.getAll);
    clientRouter.get("/id/:id", ClientController.getById);
    clientRouter.get("/company_name/:company_name", ClientController.getByCompanyName);
    clientRouter.get("/filter/:filter", ClientController.getByLike);
    clientRouter.post("/", validateClientsMiddleware, ClientController.create);
    clientRouter.post("/create-complete", validateClientsMiddleware, ClientController.createComplete);
    clientRouter.patch("/:id", validateClientsMiddleware, ClientController.update);
    clientRouter.patch("/update-complete/:id", validateClientsMiddleware, ClientController.updateComplete);
    clientRouter.delete("/:id", ClientController.delete);
    clientRouter.get("/addresses/:id", ClientController.getAddresses);
    return clientRouter;
};
export default createClientRouter;
