import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ENV from "../../env/config.js";

const secretKey: Secret = ENV.KEY_JWK ?? "diobar";

if (!secretKey) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables");
}

const generateToken = (payload: object): string => {
    try {
        return jwt.sign(payload, secretKey, { expiresIn: "1h" });
    } catch (error) {
        throw new Error("Error generating token: " + (error as Error).message);
    }
};

const verifyToken = (token: string): JwtPayload | string => {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        throw new Error("Invalid or expired token: " + (error as Error).message);
    }
};

const decodeToken = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt.decode(token) as JwtPayload | null;
        if (!decoded) {
            throw new Error("Failed to decode token");
        }
        return decoded;
    } catch (error) {
        throw new Error("Invalid token: " + (error as Error).message);
    }
};

export { generateToken, verifyToken, decodeToken };
