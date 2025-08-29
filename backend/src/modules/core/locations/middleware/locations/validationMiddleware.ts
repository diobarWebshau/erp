// import { Request, Response, NextFunction } from "express";
// import { validatePartialSafeParseAsync, validateSafeParseAsync }
//     from "../../schemas/Location.schema.js";

// const validateLocationsMiddleware =
//     async (req: Request, res: Response, next: NextFunction) => {
//         const body = req.body;
//         const method = req.method;
//         try {
//             let result;
//             if (method === "POST") {
//                 result = await validateSafeParseAsync(body);
//             } else {
//                 result = await validatePartialSafeParseAsync(body);
//             }
//             if (!result.success) {
//                 const zod_errors = result.error.errors;
//                 res.status(400).json({ zod_validation: zod_errors });
//             } else {
//                 next();
//             }
//         } catch (error) {
//             next(error)
//         }
//     };

// export default validateLocationsMiddleware;


import { Request, Response, NextFunction } from "express";
import {
    validatePartialSafeParseAsync,
    validateSafeParseAsync
} from "../../schemas/Location.schema.js";

const validateLocationsMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
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
            // Mapea errores en un array con path y mensaje
            const formattedErrors = result.error.errors.map(err => ({
                message: err.message
            }));

            res.status(400).json({
                validation: formattedErrors.map(e => e.message)
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

export default validateLocationsMiddleware;
