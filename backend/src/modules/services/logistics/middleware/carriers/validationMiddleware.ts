import { Request, Response, NextFunction }
    from "express";
import { validatePartialSafeParseAsync, validateSafeParseAsync }
    from "../../schemas/Carrier.schema.js";

const validateUsersMiddleware =
    async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const method = req.method;
        try {
            let result;
            if (method === "POST") {
                result = await validateSafeParseAsync(body);
            } else {
                result = await validatePartialSafeParseAsync(body);
            }
            if (!result.success) {
                const zod_errors = result.error.errors;
                res.status(400).json({ zod_validation: zod_errors });
            } else {
                next();
            }
        } catch (error) {
            next(error)
        }
    };

export default validateUsersMiddleware;
