import validateRolePermissionMiddleware
    from "../middleware/roles-permissions/validationMiddleware.js";
import RolesPermissionsController
    from "../controllers/RolesPermissions.controller.js";
import { Router }
    from "express";

const createRolesPermissionsRouter = (): Router => {
    const rolesPermissionsRouter = Router();
    rolesPermissionsRouter.get("/",
        RolesPermissionsController.getAll);
    rolesPermissionsRouter.get("/id/:id",
        RolesPermissionsController.getById);
    rolesPermissionsRouter.post("/",
        validateRolePermissionMiddleware,
        RolesPermissionsController.create);
    rolesPermissionsRouter.patch("/:id",
        validateRolePermissionMiddleware,
        RolesPermissionsController.update);
    rolesPermissionsRouter.delete("/:id",
        RolesPermissionsController.delete);
    return rolesPermissionsRouter;
}

export default createRolesPermissionsRouter;