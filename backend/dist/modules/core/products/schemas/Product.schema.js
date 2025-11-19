import zod from "zod";
import { productDiscountRangeSchema, productInputSchema, productProcessSchema } from "../../../schemas.js";
const productSchema = zod.object({
    name: zod.string()
        .min(1, "Name is required")
        .max(100, "Name must be at most 100 characters"),
    custom_id: zod.string()
        .min(1, "Custom id is required")
        .max(100, "Custom id must be at most 100 characters"),
    type: zod.string()
        .min(1, "Type is required")
        .max(100, "Type must be at most 100 characters"),
    description: zod.string()
        .min(1, "Description is required"),
    sku: zod.string()
        .min(1, "Part number is required")
        .max(100, "Part number must be at most 100 characters"),
    sale_price: zod.string()
        .min(1, "Sale price must not be zodero")
        .transform((val) => parseFloat(val))
        .refine((val) => val >= 0, "Sale price must be greater than or equal to 0"),
    photo: zod.string()
        .min(1, "photo is required")
        .max(200, "photo must be at most 100 characters"),
    active: zod.preprocess((val) => {
        if (typeof val === "boolean")
            return val;
        if (val === "true" || val === "1" || val === 1)
            return true;
        if (val === "false" || val === "0" || val === 0)
            return false;
        return val;
    }, zod.boolean({ required_error: "Active is required", invalid_type_error: "Active must be a boolean" })),
    products_inputs: zod
        .preprocess((val) => {
        if (typeof val === 'string') {
            try {
                return JSON.parse(val);
            }
            catch {
                return undefined;
            }
        }
        return val;
    }, zod.array(productInputSchema.partial()))
        .optional(),
    product_processes: zod
        .preprocess((val) => {
        if (typeof val === 'string') {
            try {
                return JSON.parse(val);
            }
            catch {
                return undefined;
            }
        }
        return val;
    }, zod.array(productProcessSchema.partial()))
        .optional(),
    product_discount_ranges: zod
        .preprocess((val) => {
        if (typeof val === 'string') {
            try {
                return JSON.parse(val);
            }
            catch {
                return undefined;
            }
        }
        return val;
    }, zod.array(productDiscountRangeSchema.partial()))
        .optional(), // ← ahora sí funciona
});
const validateSafeParse = (input) => {
    const result = productSchema.safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await productSchema.safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = productSchema.partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await productSchema.partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, productSchema };
