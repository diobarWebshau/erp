import validatePermissionMiddleware from "../middleware/permissions/validationMiddleware.js";
import PermissionController from "../controllers/Permissions.controller.js";
import { Router } from "express";
const createPermissionsRouter = () => {
    const permissionsRouter = Router();
    permissionsRouter.get("/", PermissionController.getAll);
    permissionsRouter.get("/id/:id", PermissionController.getById);
    permissionsRouter.get("/name/:name", PermissionController.getByName);
    permissionsRouter.post("/", validatePermissionMiddleware, PermissionController.create);
    permissionsRouter.patch("/:id", validatePermissionMiddleware, PermissionController.update);
    permissionsRouter.delete("/:id", PermissionController.delete);
    permissionsRouter.get("/roles/:id", PermissionController.getRolesWithPermission);
    return permissionsRouter;
};
export default createPermissionsRouter;
