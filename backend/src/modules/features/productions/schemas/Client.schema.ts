import zod from "zod";

const clientSchema = zod.object({
    company_name: zod.string().min(1, "Company name is required"),
    tax_id: zod.string().min(1, "Tax_id  is required"),
    email: zod.string().email("Email must be valid"),
    phone: zod.string().min(1, "Phone  is required"),
    city: zod.string().min(1, "City  is required"),
    state: zod.string().min(1, "State  is required"),
    country: zod.string().min(1, "Country is required"),
    address: zod.string().min(1, "Address  is required"),
    payment_terms: zod.string().min(1, "Payment_terms  is required"),
    credit_limit: zod.number().min(0, "Credit_limit is required"),
    zip_code: zod.string().min(1, "Zip_code  is required"),
    tax_regimen: zod.string().min(1, "Tax_regimen  is required"),
    cfdi: zod.string().min(1, "Cfdi  is required"),
    payment_method: zod.string().min(1, "Payment_method  is required"),
});


const validateSafeParse = (input: object) => {
    const result =
        clientSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync = async (input: object) => {
    const result =
        await clientSchema.safeParseAsync(input);
    return result;
}
const validatePartialSafeParse = (input: object) => {
    const result =
        clientSchema.partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync = async (input: object) => {
    const result =
        await clientSchema.partial().safeParseAsync(input);
    return result;
}

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    clientSchema
}