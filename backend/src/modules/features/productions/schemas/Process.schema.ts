import zod from "zod";

const processSchema = zod.object({
    name:
        zod.string().min(1, "Name is required")
});

const validateSafeParse = (input: object) => {
    const result =
        processSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await processSchema
                .safeParseAsync(input);
        return result;
    }
const validatePartialSafeParse = (input: object) => {
    const result = processSchema
        .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await processSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    processSchema
}
