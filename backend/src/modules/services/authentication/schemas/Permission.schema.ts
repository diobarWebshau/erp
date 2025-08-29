import zod from "zod";

const permissionSchema = zod.object({
    name: zod.string().min(1, "Name is required ")
});

const validateSafeParse = (input: object) => {
    const result =
        permissionSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result = await
            permissionSchema.safeParseAsync(input);
        return result;
    }
const validatePartialSafeParse = (input: object) => {
    const result =
        permissionSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await permissionSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    permissionSchema
}