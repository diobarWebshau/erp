import {
    format, parse, isValid
} from "date-fns";
import {
    toZonedTime
} from "date-fns-tz";

const DB_TIMEZONE = "America/Tijuana";

// Formatea Date a "YYYY-MM-DD" para MySQL DATE
function formatDateForMySQL(date: Date): string {
    return format(date, "yyyy-MM-dd");
}

// Formatea Date a "YYYY-MM-DD HH:mm:ss" para MySQL DATETIME
function formatDateTimeForMySQL(date: Date): string {
    return format(date, "yyyy-MM-dd HH:mm:ss");
}

// Valida que un string sea fecha válida en formato "YYYY-MM-DD"
function isValidDate(dateString: string): boolean {
    // Parsea el string según formato esperado
    const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
    // Valida si la fecha parseada es válida y el string coincide con el formato esperado
    return isValid(parsedDate) && format(parsedDate, "yyyy-MM-dd") === dateString;
}

/**
 * Convierte un string MySQL TIMESTAMP (YYYY-MM-DD HH:mm:ss)
 * a Date con zona horaria correcta.
 * time_zone = SYSTEM → MySQL usa la zona horaria del sistema operativo donde está instalado.
 * system_time_zone = Hora de ver. Pac → La zona del sistema operativo es "Hora de verano Pacífico" (probablemente "America/Los_Angeles" o similar).
 */
function parseMySQLTimestampToDate(timestamp: string): Date | null {
    if (!timestamp) return null;

    // Si viene en formato ISO, lo convertimos a formato MySQL
    const mysqlFormat = timestamp.replace("T", " ").replace("Z", "").split(".")[0];

    const parsedDate = parse(mysqlFormat, "yyyy-MM-dd HH:mm:ss", new Date());

    if (!isValid(parsedDate)) return null;

    return toZonedTime(parsedDate, DB_TIMEZONE);
}


export {
    formatDateForMySQL,
    formatDateTimeForMySQL,
    isValidDate,
    parseMySQLTimestampToDate
};
