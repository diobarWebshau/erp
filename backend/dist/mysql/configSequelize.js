import ENV from "../env/config.js";
import { Sequelize } from "sequelize";
const sequelize = new Sequelize(ENV.DB_NAME, ENV.DB_USER, ENV.DB_PASS, {
    host: ENV.DB_HOST,
    port: Number(ENV.DB_PORT),
    dialect: "mysql",
    logging: false
});
export default sequelize;
