import zod from 'zod';

const locationTypeSchema = zod.object({
    name: zod.string().min(1, "Name is required"),
});

const validateSafeParse = (input: object) => {
    const result = locationTypeSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync = async (input: object) => {
    const result =
        await locationTypeSchema.safeParseAsync(input);
    return result;
}
const validatePartialSafeParse = (input: object) => {
    const result =
        locationTypeSchema.partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync = async (input: object) => {
    const result = await
        locationTypeSchema.partial().safeParseAsync(input);
    return result;
}

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    locationTypeSchema
}

