import ENV from "../env/config.js"
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  ENV.DB_NAME as string,
  ENV.DB_USER as string,
  ENV.DB_PASS as string,
  {
    host: ENV.DB_HOST,
    port: Number(ENV.DB_PORT),
    dialect: "mysql",
    logging: false
  }
);

export default sequelize;
