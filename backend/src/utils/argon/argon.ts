import argon2, { Options } from "argon2";
import winstonLogger from "../winston/winston.js";

interface ValidationError {
    input: unknown;
}

const generateHash = async (password: string): Promise<string | null> => {
    if (typeof password !== "string" || password.length === 0) {
        const errorMsg = "Validation error: Password must be a non-empty string.";
        winstonLogger.warn(errorMsg, { input: password } as ValidationError);
        return null;
    }

    try {
        const options: Options = {
            type: argon2.argon2id,
            memoryCost: 2 ** 17,
            timeCost: 4,
            parallelism: 2,
        };
        return await argon2.hash(password, options);
    } catch (error) {
        winstonLogger.error(`Error generating hash with Argon2: ${(error as Error).message}`, { stack: (error as Error).stack });
        return null;
    }
};

const verifyPassword = async (hash: string, inputPassword: string): Promise<boolean> => {
    try {
        return await argon2.verify(hash, inputPassword);
    } catch (error) {
        winstonLogger.error(`Error verifying password: ${(error as Error).message}`, { stack: (error as Error).stack });
        return false;
    }
};

export { generateHash, verifyPassword };
