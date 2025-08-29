import zod from "zod";

const productDiscountClientSchema =
    zod.object({
        client_id:
            zod.number().int().min(1).nullable(),
        product_id:
            zod.number().int().min(1).nullable(),
        discount_percentage:
            zod.number().min(0).max(
                100,
                "Discount percentage must be between 0 and 100"
            ),
    });

const validateSafeParse = (input: object) => {
    const result = productDiscountClientSchema
        .safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await productDiscountClientSchema
                .safeParseAsync(input);
        return result;
    }

const validatePartialSafeParse = (input: object) => {
    const result =
        productDiscountClientSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await productDiscountClientSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    productDiscountClientSchema
}
