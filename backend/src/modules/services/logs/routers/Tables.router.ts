import validateTablesMiddleware
    from "../middleware/tables/validationMiddleware.js";
import TablesController
    from "../controllers/Tables.controller.js";
import { Router }
    from "express";

const createTablesRouter = (): Router => {
    const tablesRouter = Router();
    tablesRouter.get("/",
        TablesController.getAll);
    tablesRouter.get("/id/:id",
        TablesController.getById);
    tablesRouter.get("/name/:name",
        TablesController.getByName);
    tablesRouter.post("/",
        validateTablesMiddleware,
        TablesController.create);
    tablesRouter.patch("/:id",
        validateTablesMiddleware,
        TablesController.update);
    tablesRouter.delete("/:id",
        TablesController.delete);
    return tablesRouter;
}

export default createTablesRouter;