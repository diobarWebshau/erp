import zod from "zod";

const rolePermissionSchema = zod.object({
    permission_id: zod.number().int().min(1),
    role_id: zod.number().int().min(1)
});

const validateSafeParse = (input: object) => {
    const result =
        rolePermissionSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync =
    async (input: object) => {
        const result =
            await rolePermissionSchema
                .safeParseAsync(input);
        return result;
    }
const validatePartialSafeParse = (input: object) => {
    const result =
        rolePermissionSchema
            .partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync =
    async (input: object) => {
        const result =
            await rolePermissionSchema
                .partial().safeParseAsync(input);
        return result;
    }

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    rolePermissionSchema
}