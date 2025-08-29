import zod from "zod";
const poductionLineProductSchema = zod.object({
    production_line_id: zod.number().min(1),
    product_id: zod.number().min(1)
});
const validateSafeParse = (input) => {
    const result = poductionLineProductSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await poductionLineProductSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = poductionLineProductSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await poductionLineProductSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, poductionLineProductSchema };
