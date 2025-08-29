import zod from "zod";
import { inputSchema } from "./../../../schemas.js";
const productInputSchema = zod.object({
    input_id: zod.number().int().min(1).nullable(),
    product_id: zod.number().int().min(1).nullable(),
    equivalence: zod.number(),
    input: inputSchema.partial().optional()
});
const validateSafeParse = (input) => {
    const result = productInputSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await productInputSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = productInputSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await productInputSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, productInputSchema };
