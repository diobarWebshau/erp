import { AuthController }
    from "../controllers/Auth.controlador.js";
import { Router } from "express"

const createAuthRouter = (): Router => {
    const authRouter = Router();
    authRouter.post("/",
        AuthController.auth);
    authRouter.get("/",
        AuthController.verifyToken);
    authRouter.post("/logout",
        AuthController.logout);
    return authRouter;

}

export default createAuthRouter;