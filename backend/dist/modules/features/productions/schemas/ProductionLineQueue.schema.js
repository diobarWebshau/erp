import zod from "zod";
const productionLineQueueSchema = zod.object({
    production_line_id: zod.number().int().min(1),
    production_order_id: zod.number().int().min(1),
    position: zod.number().int().min(1).optional(),
});
const validateSafeParse = (input) => {
    const result = productionLineQueueSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await productionLineQueueSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = productionLineQueueSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await productionLineQueueSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, productionLineQueueSchema };
