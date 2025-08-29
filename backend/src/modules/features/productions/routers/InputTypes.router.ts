import validateInputTypesMiddleware 
    from "../middleware/input-types/validationMiddleware.js";
import InputTypesController 
    from "../controllers/InputTypes.controller.js";
import { Router } from "express";

const createInputTypesRouter = (): Router => {
    const inputTypesRouter = Router();
    inputTypesRouter.get("/", 
        InputTypesController.getAll);
    inputTypesRouter.get("/id/:id", 
        InputTypesController.getById);
    inputTypesRouter.get("/name/:name", 
        InputTypesController.getByName);
    inputTypesRouter.post("/", 
        validateInputTypesMiddleware, 
        InputTypesController.create);
    inputTypesRouter.patch("/:id", 
        validateInputTypesMiddleware, 
        InputTypesController.update);
    inputTypesRouter.delete("/:id", 
        InputTypesController.delete);
    inputTypesRouter.get("/:id/inputs", 
        InputTypesController.getInputsWithThisType);
    return inputTypesRouter;
}

export default createInputTypesRouter;