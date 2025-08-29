import { validatePartialSafeParseAsync, validateSafeParseAsync } from "../../schemas/Input.schema.js";
import ImageHandler from "../../../../../classes/ImageHandler.js";
const validateInputsMiddleware = async (req, res, next) => {
    const body = req.body;
    const method = req.method;
    try {
        let result;
        if (method === "POST") {
            result = await validateSafeParseAsync(body);
        }
        else {
            result = await validatePartialSafeParseAsync(body);
        }
        if (!result.success) {
            await ImageHandler.removeImageIfExists(req.body.url);
            const zod_errors = result.error.errors;
            res.status(400).json({ zod_validation: zod_errors });
        }
        else {
            next();
        }
    }
    catch (error) {
        next(error);
    }
};
export default validateInputsMiddleware;
