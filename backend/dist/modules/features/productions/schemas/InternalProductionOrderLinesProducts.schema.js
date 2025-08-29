import zod from "zod";
const internalProductionOrderLineProductSchema = zod.object({
    internal_product_production_order_id: zod.number().int().min(1),
    production_line_id: zod.number()
});
const validateSafeParse = (input) => {
    const result = internalProductionOrderLineProductSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await internalProductionOrderLineProductSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = internalProductionOrderLineProductSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await internalProductionOrderLineProductSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, internalProductionOrderLineProductSchema };
