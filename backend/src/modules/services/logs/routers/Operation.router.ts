import validateOperationsMiddleware
    from "../middleware/operations/validationMiddleware.js";
import OperationController
    from "../controllers/Operations.controller.js";
import { Router }
    from "express";

const createOperationRouter = (): Router => {
    const operationRouter = Router();
    operationRouter.get("/",
        OperationController.getAll);
    operationRouter.get("/id/:id",
        OperationController.getById);
    operationRouter.get("/name/:name",
        OperationController.getByName);
    operationRouter.post("/",
        validateOperationsMiddleware,
        OperationController.create);
    operationRouter.patch("/:id",
        validateOperationsMiddleware,
        OperationController.update);
    operationRouter.delete("/:id",
        OperationController.delete);
    return operationRouter;
}

export default createOperationRouter;