import winstonLogger from "../../utils/winston/winston.js";
const errorMiddleware = (err, req, res, next) => {
    let status = 500;
    const message = err.message || "Internal server error.";
    const stack = err.stack;
    // Registrar el error usando winston
    winstonLogger.error(`ERROR: ${message}`);
    if (stack) {
        winstonLogger.error(stack); // Registra la pila de errores solo en desarrollo
    }
    // Responder al cliente con el error
    res.status(status).json({
        status,
        message,
        stack, // Se envía solo en desarrollo
    });
    // No se llama a next() ya que este es el último middleware
};
export default errorMiddleware;
