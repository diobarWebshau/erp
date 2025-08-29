import { Router } from "express";
import ScrapController from "../controllers/scrap.controller.js";
import validateScrapMiddleware from "../middleware/scraps/validationMiddleware.js";
const createScrapRouter = () => {
    const ScrapRouter = Router();
    ScrapRouter.get("/", ScrapController.getAll);
    ScrapRouter.get("/id/:id", ScrapController.getById);
    ScrapRouter.post("/", validateScrapMiddleware, ScrapController.create);
    ScrapRouter.patch("/:id", validateScrapMiddleware, ScrapController.update);
    ScrapRouter.delete("/:id", ScrapController.delete);
    return ScrapRouter;
};
export default createScrapRouter;
