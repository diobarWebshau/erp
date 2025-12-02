import { validatePartialSafeParseAsync, validateSafeParseAsync } from "../../schemas/Location.schema.js";
import { normalizeValidationArray } from "../../../../../helpers/normalizeValidationArray.js";
const validateLocationsMiddleware = async (req, res, next) => {
    const body = req.body;
    const method = req.method;
    try {
        console.log(`req.body middle - `, req.body);
        let result;
        if (method === "POST")
            result = await validateSafeParseAsync(body);
        else
            result = await validatePartialSafeParseAsync(body);
        if (!result.success) {
            const formattedErrors = result.error.errors.map(err => `${err.path}-${err.message}`);
            res.status(400).json({ validation: normalizeValidationArray(formattedErrors) });
            return;
        }
        else
            next();
    }
    catch (error) {
        next(error);
    }
};
export default validateLocationsMiddleware;
