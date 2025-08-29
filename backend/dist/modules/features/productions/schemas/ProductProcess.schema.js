import zod from "zod";
const productProcessSchema = zod.object({
    product_id: zod.number().int().min(1).nullable(),
    process_id: zod.number().int().min(1).nullable(),
    sort_order: zod.number().int().min(1).nullable()
});
const validateSafeParse = (input) => {
    const result = productProcessSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await productProcessSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = productProcessSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await productProcessSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, productProcessSchema };
