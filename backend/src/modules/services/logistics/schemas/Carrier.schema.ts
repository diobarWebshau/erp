import zod from "zod";

const carrierSchema = zod.object({
    name: zod.string().min(1, "Name is required"),
    company_name: zod.string().min(1, "Company name is required"),
    rfc: zod.string().min(1, "Rfc is required"),
    type: zod.string().min(1, "Type is required"),
    phone: zod.string().min(1, "phone is required"),
    vehicle: zod.string().min(1, "vehicle is required"),
    plates: zod.string().min(1, "plates is required"),
    license_number: zod.string().min(1, "lisense_number is required"),
    active: zod.number().int().min(0).max(1),
});

const validateSafeParse = (input: object) => {
    const result = carrierSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync = async (input: object) => {
    const result = await carrierSchema.safeParseAsync(input);
    return result;
}
const validatePartialSafeParse = (input: object) => {
    const result = carrierSchema.partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync = async (input: object) => {
    const result = await carrierSchema.partial().safeParseAsync(input);
    return result;
}

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    carrierSchema
}