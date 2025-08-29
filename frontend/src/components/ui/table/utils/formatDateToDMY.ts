import { format, isValid, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const formatDateToDMY = (input: Date | string): string => {
    if (!input) return "";

    let date: Date;

    if (typeof input === "string") {
        date = parseISO(input);
    } else {
        date = input;
    }

    if (!isValid(date)) return "";

    const zonedDate = toZonedTime(date, Intl.DateTimeFormat().resolvedOptions().timeZone);

    return format(zonedDate, "MM/dd/yyyy");
};

export default formatDateToDMY;
