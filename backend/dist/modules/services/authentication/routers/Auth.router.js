import { AuthController } from "../controllers/Auth.controlador.js";
import { Router } from "express";
const createAuthRouter = () => {
    const authRouter = Router();
    authRouter.post("/", AuthController.auth);
    authRouter.get("/", AuthController.verifyToken);
    return authRouter;
};
export default createAuthRouter;
