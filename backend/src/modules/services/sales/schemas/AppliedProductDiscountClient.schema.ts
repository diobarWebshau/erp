import zod from "zod";

const appliedProductDiscountClientSchema =
    zod.object({
        purchase_order_product_id:
            zod.number().int().min(1),
        product_discount_client_id:
            zod.number().int().min(1),
    });

const validateSafeParse = (input: object) => {
    const result =
        appliedProductDiscountClientSchema
            .safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await appliedProductDiscountClientSchema
                .safeParseAsync(input);
        return result;
    }
const validatePartialSafeParse = (input: object) => {
    const result =
        appliedProductDiscountClientSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await appliedProductDiscountClientSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    appliedProductDiscountClientSchema
}