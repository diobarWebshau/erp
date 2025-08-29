import zod from "zod";
const appliedProductDiscountRangeSchema = zod.object({
    purchase_order_product_id: zod.number().int().min(1),
    product_discount_range_id: zod.number().int().min(1),
});
const validateSafeParse = (input) => {
    const result = appliedProductDiscountRangeSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await appliedProductDiscountRangeSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = appliedProductDiscountRangeSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await appliedProductDiscountRangeSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, appliedProductDiscountRangeSchema };
