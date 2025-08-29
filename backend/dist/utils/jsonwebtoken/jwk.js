import jwt from "jsonwebtoken";
import ENV from "../../env/config.js";
const secretKey = ENV.KEY_JWK ?? "diobar";
if (!secretKey) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables");
}
const generateToken = (payload) => {
    try {
        return jwt.sign(payload, secretKey, { expiresIn: "1h" });
    }
    catch (error) {
        throw new Error("Error generating token: " + error.message);
    }
};
const verifyToken = (token) => {
    try {
        return jwt.verify(token, secretKey);
    }
    catch (error) {
        throw new Error("Invalid or expired token: " + error.message);
    }
};
const decodeToken = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded) {
            throw new Error("Failed to decode token");
        }
        return decoded;
    }
    catch (error) {
        throw new Error("Invalid token: " + error.message);
    }
};
export { generateToken, verifyToken, decodeToken };
