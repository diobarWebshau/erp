import { Request, Response, NextFunction }
    from "express";
import { validatePartialSafeParseAsync, validateSafeParseAsync }
    from "../../schemas/InternalProductProductionOrder.schema.js";

const validateInternalProductProductionOrderMiddleware =
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
                const formattedErrors = result.error.errors.map(err => ({
                    message: err.message
                }));
                res.status(400).json({
                    validation: formattedErrors.map(e => e.message)
                });
            }
            next();

        } catch (error) {
            next(error)
        }
    };

export default validateInternalProductProductionOrderMiddleware;
