import morgan from "morgan";
import winstonLogger from "../winston/winston.js";
// Tipado del stream para que la función `write` reciba un mensaje de tipo string
const stream = {
    write: (message) => {
        winstonLogger.info(message.trim());
    },
};
// Definir el entorno para el formato de morgan
// const environment: string = process.env.NODE_ENV === "production" ? "combined" : "dev";
const environment = "combined";
// Crear la configuración de morgan
const morganUtil = morgan(environment, { stream });
export default morganUtil;
