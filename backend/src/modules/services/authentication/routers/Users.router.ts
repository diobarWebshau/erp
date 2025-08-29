import validateUsersMiddleware
    from "../middleware/users/validationMiddleware.js";
import UsersController
    from "../controllers/Users.controller.js";
import { Router }
    from "express";

const createUsersRouter = (): Router => {
    const userRouter = Router();
    userRouter.get("/",
        UsersController.getAll);
    userRouter.get("/id/:id",
        UsersController.getById);
    userRouter.get("/username/:username",
        UsersController.getByName);
    userRouter.post("/",
        validateUsersMiddleware, 
        UsersController.create);
    userRouter.patch("/:id", 
        validateUsersMiddleware, 
        UsersController.update);
    userRouter.delete("/:id", 
        UsersController.delete);
    return userRouter;
}

export default createUsersRouter;