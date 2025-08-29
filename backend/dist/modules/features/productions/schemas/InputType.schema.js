import zod from "zod";
const inputTypeSchema = zod.object({
    name: zod.string().min(1, "Name is required")
});
const validateSafeParse = (input) => {
    const result = inputTypeSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await inputTypeSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = inputTypeSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await inputTypeSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, inputTypeSchema };
