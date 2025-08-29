function toBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
        const val = value.toLowerCase().trim();
        if (val === "true" || val === "1" || val === "yes" || val === "on") return true;
        if (val === "false" || val === "0" || val === "no" || val === "off") return false;
        return false; // valor no reconocido, asumimos false
    }

    if (typeof value === "number") {
        return value === 1;
    }

    // Para otros tipos (null, undefined, objetos, etc), devolvemos false
    return false;
}


export default toBoolean;