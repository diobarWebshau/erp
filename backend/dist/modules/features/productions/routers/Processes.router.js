import validateProcessesMiddleware from "../middleware/processes/validationMiddleware.js";
import processesController from "../controllers/Processes.controller.js";
import { Router } from "express";
const createProcessesRouter = () => {
    const processesRouter = Router();
    processesRouter.get("/", processesController.getAll);
    processesRouter.get("/id/:id", processesController.getById);
    processesRouter.get("/exclude", processesController.getByLikeExcludeIds);
    processesRouter.get("/name/:name", processesController.getByName);
    processesRouter.post("/", validateProcessesMiddleware, processesController.create);
    processesRouter.patch("/:id", validateProcessesMiddleware, processesController.update);
    processesRouter.delete("/:id", processesController.delete);
    return processesRouter;
};
export default createProcessesRouter;
