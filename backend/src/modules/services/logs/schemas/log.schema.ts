import zod from "zod";

const logSchema = zod.object({
    operation_id: zod.number().int().min(1).nullable(),
    table_id: zod.number().int().min(1).nullable(),
    user_id: zod.number().int().min(1).nullable(),
    old_data: zod.record(zod.unknown()).nullable(),
    new_data: zod.record(zod.unknown()).nullable(),
    message: zod.string().min(1,
        "Message is required"),
});

const validateSafeParse = (input: object) => {
    const result =
        logSchema.
            safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await logSchema
                .safeParseAsync(input);
        return result;
    }

const validatePartialSafeParse = (input: object) => {
    const result =
        logSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await logSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    logSchema
}
