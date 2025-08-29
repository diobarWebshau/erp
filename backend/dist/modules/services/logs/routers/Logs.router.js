import validateLogsMiddleware from "../middleware/logs/validationMiddleware.js";
import LogsController from "../controllers/Logs.controller.js";
import { Router } from "express";
const createLogsRouter = () => {
    const logRouter = Router();
    logRouter.get("/", LogsController.getAll);
    logRouter.get("/id/:id", LogsController.getById);
    logRouter.get("/operation-name/:operation_name", LogsController.getByOperationName);
    logRouter.get("/user-name/:user_name", LogsController.getByUserName);
    logRouter.get("/table-name/:table_name", LogsController.getByTableName);
    logRouter.post("/", validateLogsMiddleware, LogsController.create);
    logRouter.patch("/:id", validateLogsMiddleware, LogsController.update);
    logRouter.delete("/:id", LogsController.delete);
    return logRouter;
};
export default createLogsRouter;
