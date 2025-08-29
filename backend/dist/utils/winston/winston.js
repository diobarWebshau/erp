import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { transports } = winston;
// Tipado de las opciones de configuración para la rotación de archivos
const fileRotationOptions = {
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    filename: path.join(__dirname, '../../logs/generals/app-%DATE%.log'),
};
const exceptionRotationOptions = {
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    filename: path.join(__dirname, '../../logs/exceptions/exceptions-%DATE%.log'),
};
// Crear transportes de archivo con rotación
const rotatingFileTransport = new DailyRotateFile(fileRotationOptions);
// Crear el logger de winston
const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)),
    transports: [
        new transports.Console(),
        rotatingFileTransport,
    ],
    exceptionHandlers: [
        new DailyRotateFile(exceptionRotationOptions),
    ],
});
export default winstonLogger;
