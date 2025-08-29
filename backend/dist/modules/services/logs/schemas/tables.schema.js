import zod from "zod";
const tableSchema = zod.object({
    name: zod.string()
        .min(1, "Name is required"),
    table_name: zod.string()
        .min(1, "Table name is required")
});
const validateSafeParse = (input) => {
    const result = tableSchema
        .safeParse(input);
    return result;
};
const validateSafeParseAsync = async (input) => {
    const result = await tableSchema
        .safeParseAsync(input);
    return result;
};
const validatePartialSafeParse = (input) => {
    const result = tableSchema
        .partial().safeParse(input);
    return result;
};
const validatePartialSafeParseAsync = async (input) => {
    const result = await tableSchema
        .partial().safeParseAsync(input);
    return result;
};
export { validateSafeParse, validateSafeParseAsync, validatePartialSafeParse, validatePartialSafeParseAsync, tableSchema };
