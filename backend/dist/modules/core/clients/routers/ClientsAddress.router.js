import validateClientsAddressesMiddleware from "../middleware/clients_addresses/validationMiddleware.js";
import ClientsAddressesController from "../controllers/ClientAddresses.controller.js";
import { Router } from "express";
const createClientAddressesRouter = () => {
    const clientAddressesRouter = Router();
    clientAddressesRouter.get("/", ClientsAddressesController.getAll);
    clientAddressesRouter.get("/id/:id", ClientsAddressesController.getById);
    clientAddressesRouter.get("/filter/:filter/:client_id", ClientsAddressesController.getByLike);
    clientAddressesRouter.get("/client/:client_id", ClientsAddressesController.getAddressByClientId);
    clientAddressesRouter.post("/", validateClientsAddressesMiddleware, ClientsAddressesController.create);
    clientAddressesRouter.patch("/:id", validateClientsAddressesMiddleware, ClientsAddressesController.update);
    clientAddressesRouter.delete("/:id", ClientsAddressesController.delete);
    return clientAddressesRouter;
};
export default createClientAddressesRouter;
