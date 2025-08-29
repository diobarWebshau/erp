import uploadImageMiddleware
    from "../../../../middlewares/multer/multerMiddleware.js";
import validateInputsMiddleware
    from "../middleware/inputs/validationMiddleware.js";
import InputsController
    from "../controllers/Inputs.controller.js";
import { Router } from "express";

const createInputsRouter = (): Router => {
    const InputRouter = Router();
    InputRouter.get("/",
        InputsController.getAll);
    InputRouter.get("/types/:id",
        InputsController.getInputsWithInputType);
    InputRouter.get("/id/:id",
        InputsController.getById);
    InputRouter.get("/name/:name",
        InputsController.getByName);
    InputRouter.post("/",
        uploadImageMiddleware,
        validateInputsMiddleware,
        InputsController.create);
    InputRouter.post(`/create-complete`,
        uploadImageMiddleware,
        validateInputsMiddleware,
        InputsController.createComplete
    )
    InputRouter.patch("/:id",
        uploadImageMiddleware,
        validateInputsMiddleware,
        InputsController.update);
    InputRouter.patch(`/update-complete/:id`,
        uploadImageMiddleware,
        validateInputsMiddleware,
        InputsController.updateComplete
    )
    InputRouter.delete("/:id",
        InputsController.delete);
    return InputRouter;
}

export default createInputsRouter;