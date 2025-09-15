import { validatePartialSafeParseAsync, validateSafeParseAsync } from "../../schemas/ProductionLineQueue.schema.js";
const validateProductionLineQueueMiddleware = async (req, res, next) => {
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
export default validateProductionLineQueueMiddleware;
