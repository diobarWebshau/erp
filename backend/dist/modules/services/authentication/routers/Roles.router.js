import validateRolesMiddleware from "../middleware/roles/validationMiddleware.js";
import RolesController from "../controllers/Roles.controller.js";
import { Router } from "express";
const createRolesRouter = () => {
    const rolesRouter = Router();
    rolesRouter.get("/", RolesController.getAll);
    rolesRouter.get("/id/:id", RolesController.getById);
    rolesRouter.get("/name/:name", RolesController.getByName);
    rolesRouter.post("/", validateRolesMiddleware, RolesController.create);
    rolesRouter.patch("/:id", validateRolesMiddleware, RolesController.update);
    rolesRouter.delete("/:id", RolesController.delete);
    rolesRouter.get("/users/:id", RolesController.getUsersWithRole);
    return rolesRouter;
};
export default createRolesRouter;
