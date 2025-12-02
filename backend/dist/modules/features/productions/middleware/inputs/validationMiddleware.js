import { validatePartialSafeParseAsync, validateSafeParseAsync } from "../../schemas/Input.schema.js";
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
            const formattedErrors = result.error.errors.map(err => ({
                message: `${err.path}-${err.message}`
            }));
            res.status(400).json({
                validation: formattedErrors.map(e => e.message)
            });
            return;
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
