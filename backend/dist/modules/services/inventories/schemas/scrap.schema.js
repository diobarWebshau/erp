import zod from "zod";
const scrapSchema = zod.object({
    reference_type: zod.enum(["production"]),
    reference_id: zod.number().int().min(1),
    location_id: zod.number().int().min(1),
    location_name: zod.string(),
    item_id: zod.number().int().min(1),
    item_type: zod.enum(["product", "input"]),
    item_name: zod.string(),
    qty: zod.number().int().min(1),
});
const validateSafeParse = (input) => {
    const result = scrapSchema.safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await scrapSchema.safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = scrapSchema.partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await scrapSchema.partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, scrapSchema };
