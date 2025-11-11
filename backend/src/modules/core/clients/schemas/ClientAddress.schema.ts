import zod from 'zod';

const ClientAddressSchema = zod.object({
    
    client_id: zod.number().int().min(1),
    street: zod.string().min(1),
    street_number: zod.number().int(),
    neighborhood: zod.string().min(1),
    city: zod.string().min(1),
    state: zod.string().min(1),
    country: zod.string().min(1),
    zip_code: zod.number().int(),

});

const validateSafeParse = (input: object) => {
    const result =
        ClientAddressSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync = async (input: object) => {
    const result =
        await ClientAddressSchema.safeParseAsync(input);
    return result;
}
const validatePartialSafeParse = (input: object) => {
    const result =
        ClientAddressSchema.partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync = async (input: object) => {
    const result =
        await ClientAddressSchema.partial().safeParseAsync(input);
    return result;
}

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    ClientAddressSchema
}