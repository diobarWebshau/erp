import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });
const ENV = {
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    KEY_JWK: process.env.KEY_JWK
};
export default ENV;
