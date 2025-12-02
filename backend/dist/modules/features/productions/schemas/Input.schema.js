import zod from "zod";
import { inputTypeSchema } from "../../productions/schemas/InputType.schema.js";
const inputSchema = zod.object({
    name: zod.string().min(1, "Name is required").optional(),
    custom_id: zod.string().min(1, "Custom id is required").optional(),
    description: zod.string().min(1, "Description is required").optional(),
    presentation: zod.string().min(1, "Presentation is required").optional(),
    is_draft: zod.preprocess((val) => {
        if (typeof val === "boolean")
            return val;
        if (val === "true" || val === "1" || val === 1)
            return true;
        if (val === "false" || val === "0" || val === 0)
            return false;
        return val;
    }, zod.boolean({ required_error: "is_draft is required", invalid_type_error: "is_draft must be a boolean" })).optional(),
    input_types_id: zod
        .string()
        .min(1, "El tipo de entrada debe ser mayor o igual a 1")
        .transform((val) => parseInt(val, 10)) // Solo casteo a número
        .refine((val) => val >= 1, "El tipo de entrada debe ser mayor o igual a 1").optional(), // Validación de restricción
    unit_cost: zod.string().min(1, "The unit cost must not be zero")
        .transform((val) => parseFloat(val)).optional(), // Casteo de string a número
    supplier: zod.string().min(1, "Supplier is required").optional(),
    unit_of_measure: zod.string().min(1, "Unit of measure is required").optional(),
    sku: zod.string().min(1, "Sku is required").optional(),
    photo: zod.string().min(1, "Image is required").optional(),
    status: zod.preprocess((val) => {
        if (typeof val === "boolean")
            return val;
        if (val === "true" || val === "1" || val === 1)
            return true;
        if (val === "false" || val === "0" || val === 0)
            return false;
        return val;
    }, zod.boolean({ required_error: "Active is required", invalid_type_error: "Active must be a boolean" })).optional(),
    input_types: zod
        .preprocess((val) => {
        if (typeof val === "string") {
            try {
                return JSON.parse(val);
            }
            catch {
                return undefined;
            }
        }
        return val;
    }, inputTypeSchema.partial())
        .optional(),
});
const validateSafeParse = (input) => {
    const result = inputSchema.safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await inputSchema.safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = inputSchema.partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await inputSchema.partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, inputSchema };
