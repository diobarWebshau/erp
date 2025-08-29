import zod from "zod";
const inventarySchema = zod.object({
    stock: zod.number().min(0),
    minimum_stock: zod.number(),
    maximum_stock: zod.number(),
    lead_time: zod.number()
});
const validateSafeParse = (input) => {
    const result = inventarySchema.
        safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await inventarySchema.
        safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = inventarySchema.
        partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await inventarySchema.
        partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, inventarySchema };
