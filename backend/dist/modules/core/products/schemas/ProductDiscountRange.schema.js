import zod from "zod";
const productDiscountRangeSchema = zod.object({
    product_id: zod.number().int().min(1).nullable(),
    unit_price: zod.number(),
    min_qty: zod.number().min(1),
    max_qty: zod.number().min(1),
});
const validateSafeParse = (input) => {
    const result = productDiscountRangeSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await productDiscountRangeSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = productDiscountRangeSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await productDiscountRangeSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, productDiscountRangeSchema };
