import zod from "zod";

const operationSchema = zod.object({
    name: zod.string()
        .min(1, "Name is required")
});

const validateSafeParse = (input: object) => {
    const result = operationSchema
        .safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result = await operationSchema
            .safeParseAsync(input);
        return result;
    }

const validatePartialSafeParse = (input: object) => {
    const result =
        operationSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await operationSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    operationSchema
}
