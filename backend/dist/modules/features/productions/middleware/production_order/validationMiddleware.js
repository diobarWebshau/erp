import { validatePartialSafeParseAsync, validateSafeParseAsync } from "../../schemas/ProductionOrder.schema.js";
const validateProductionOrderMiddleware = async (req, res, next) => {
    const body = req.body;
    const method = req.method;
    try {
        let result;
        console.log(body);
        if (method === "POST") {
            result =
                await validateSafeParseAsync(body);
        }
        else {
            result =
                await validatePartialSafeParseAsync(body);
        }
        console.log("entro");
        if (!result.success) {
            console.log(result.error.errors);
            const formattedErrors = result.error.errors.map(err => ({
                message: err.message
            }));
            res.status(400).json({
                validation: formattedErrors.map(e => e.message)
            });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
export default validateProductionOrderMiddleware;
