import { normalizeFormDataBody } from "../../../../helpers/normalizedObjectFromFormData.js";
import validateProductMiddleware from "../middleware/products/validationMiddleware.js";
import ProductVProductionController from "../controllers/ProductsVProduction.controller.js";
import uploadImageMiddleware from "../../../../middlewares/multer/multerMiddleware.js";
import { Router } from "express";

const createProductVProductionController = (): Router => {
    const productRouter = Router();

    productRouter.get("/",
        ProductVProductionController.getAll);
    productRouter.get("/details/:id",
        ProductVProductionController.getProductDetails);
    productRouter.get("/id/:id",
        ProductVProductionController.getById);
    productRouter.get("/name/:name",
        ProductVProductionController.getByName);
    productRouter.post("/",
        uploadImageMiddleware,
        validateProductMiddleware,
        ProductVProductionController.create);
    productRouter.post("/create-complete",
        uploadImageMiddleware,
        normalizeFormDataBody(),
        validateProductMiddleware,
        ProductVProductionController.
            createCompleteProduct);
    productRouter.patch("/:id",
        uploadImageMiddleware,
        validateProductMiddleware,
        ProductVProductionController.update);
    productRouter.patch("/update-complete/:id",
        uploadImageMiddleware,
        normalizeFormDataBody(),
        validateProductMiddleware,
        ProductVProductionController.updateCompleteProduct);
    productRouter.delete("/:id",
        ProductVProductionController.delete);
    productRouter.get(
        "/product-discounts-ranges/:id",
        ProductVProductionController
            .getDiscountsRanges);
    productRouter.get("/input/:id",
        ProductVProductionController
            .getInputsOfProduct);
    productRouter.post("/:id/input/:input_id",
        ProductVProductionController
            .addInputToProduct);
    productRouter.delete("/:id/input/:input_id",
        ProductVProductionController
            .deleteInput);
    productRouter.patch("/:id/input/:input_id",
        ProductVProductionController
            .EditEquivalenceInProductInput);
    productRouter.get("/processes/:id",
        ProductVProductionController
            .getInputsOfProduct);
    productRouter.post("/:id/processes/:process_id",
        ProductVProductionController
            .assignProcessToProduct);
    productRouter.get("/best-location/:id",
        ProductVProductionController
            .getInfoBestLocationOfProduct);
    productRouter.delete("/:id/processes/:process_id",
        ProductVProductionController
            .deleteProcess);
    return productRouter;
}

export default createProductVProductionController;
