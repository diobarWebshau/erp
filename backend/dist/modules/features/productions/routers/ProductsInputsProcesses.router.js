import { Router } from "express";
import ProductInputProcessController from "../controllers/ProductsInputsProcesses.controller.js";
import validateProductInputProcessMiddleware from "../middleware/product-input-process/validationMiddleware.js";
const createProductInputProcessRouter = () => {
    const router = Router();
    // Listado
    router.get("/", ProductInputProcessController.getAll);
    // Obtener por id
    router.get("/id/:id", validateProductInputProcessMiddleware, ProductInputProcessController.getById);
    // Crear
    router.post("/", validateProductInputProcessMiddleware, ProductInputProcessController.create);
    // Actualizar
    router.patch("/:id", validateProductInputProcessMiddleware, ProductInputProcessController.update);
    // Eliminar
    router.delete("/:id", validateProductInputProcessMiddleware, ProductInputProcessController.deleteById);
    return router;
};
export default createProductInputProcessRouter;
