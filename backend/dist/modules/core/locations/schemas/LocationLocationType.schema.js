import zod from 'zod';
const locationLocationTypeSchema = zod.object({
    location_id: zod.number().int().min(1),
    location_type_id: zod.number().int().min(1),
});
const validateSafeParse = (input) => {
    const result = locationLocationTypeSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await locationLocationTypeSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = locationLocationTypeSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await locationLocationTypeSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, locationLocationTypeSchema };
