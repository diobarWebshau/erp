import argon2 from "argon2";
import winstonLogger from "../winston/winston.js";
const generateHash = async (password) => {
    if (typeof password !== "string" || password.length === 0) {
        const errorMsg = "Validation error: Password must be a non-empty string.";
        winstonLogger.warn(errorMsg, { input: password });
        return null;
    }
    try {
        const options = {
            type: argon2.argon2id,
            memoryCost: 2 ** 17,
            timeCost: 4,
            parallelism: 2,
        };
        return await argon2.hash(password, options);
    }
    catch (error) {
        winstonLogger.error(`Error generating hash with Argon2: ${error.message}`, { stack: error.stack });
        return null;
    }
};
const verifyPassword = async (hash, inputPassword) => {
    try {
        return await argon2.verify(hash, inputPassword);
    }
    catch (error) {
        winstonLogger.error(`Error verifying password: ${error.message}`, { stack: error.stack });
        return false;
    }
};
export { generateHash, verifyPassword };
