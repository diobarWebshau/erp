import createPermissionsRouter from "./routers/Permission.router.js";
import createUsersRouter from "./routers/Users.router.js";
import createRolesRouter from "./routers/Roles.router.js";
import createRolesPermissionsRouter from "./routers/RolesPermissions.router.js";
import createAuthRouter from "./routers/Auth.router.js";
const Authentication = {
    createPermissionsRouter,
    createRolesRouter,
    createRolesPermissionsRouter,
    createUsersRouter,
    createAuthRouter
};
export default Authentication;
