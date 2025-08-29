import zod from "zod";

const roleSchema = zod.object({
    name: zod.string().min(1,
        "The name must contain at least one character")
});

const validateSafeParse = (input: object) => {
    const result =
        roleSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync = async (input: object) => {
    const result = await
        roleSchema.safeParseAsync(input);
    return result;
}

const validatePartialSafeParse = (input: object) => {
    const result =
        roleSchema.partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result = await
            roleSchema.partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    roleSchema
}