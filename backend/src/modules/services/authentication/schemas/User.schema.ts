import zod from "zod";

const passwordRegEx =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const userSchema = zod.object({
    username: zod.string()
        .email("Username must be a valid email"),
    password: zod.string().regex(
        passwordRegEx,
        "Password must contain at least one uppercase "
        + "letter, one lowercase letter, one number, and" +
        " one special character"),
    role_id: zod.number().int().min(1)
});

const validateSafeParse = (input: object) => {
    const result =
        userSchema.safeParse(input);
    return result;
}

const validateSafeParseAsync = async (input: object) => {
    const result =
        await userSchema.safeParseAsync(input);
    return result;
}

const validatePartialSafeParse = (input: object) => {
    const result =
        userSchema.partial().safeParse(input);
    return result;
}

const validatePartialSafeParseAsync = async (input: object) => {
    const result = await
        userSchema.partial().safeParseAsync(input);
    return result;
}

export {
    validateSafeParse,
    validateSafeParseAsync,
    validatePartialSafeParse,
    validatePartialSafeParseAsync,
    userSchema
}