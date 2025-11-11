
// *********************************************************************
// *                        Email Validations                          *
// *********************************************************************

const isEmailValid = (text: string): boolean => {
    if (!text) return false;
    const value = text.trim();

    // sin espacios
    if (/\s/.test(value)) return false;

    // una sola @
    const atCount = (value.match(/@/g) || []).length;
    if (atCount !== 1) return false;

    const [local, domain] = value.split("@");
    if (!local || !domain) return false;

    // no empezar/terminar con punto
    if (local.startsWith(".") || local.endsWith(".")) return false;
    if (domain.startsWith(".") || domain.endsWith(".")) return false;

    // sin puntos consecutivos
    if (local.includes("..") || domain.includes("..")) return false;

    // caracteres permitidos en la parte local (alfanuméricos y símbolos comunes)
    // permite + _ . - y algunos símbolos seguros
    if (!/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return false;

    // dominio sencillo: etiquetas separadas por punto, sin guiones al inicio/fin
    const labels = domain.split(".");
    if (labels.length < 2) return false; // requiere al menos un punto
    if (!labels.every(l => /^[A-Za-z0-9-]+$/.test(l) && !l.startsWith("-") && !l.endsWith("-") && l.length > 0)) {
        return false;
    }

    // TLD de 2+ letras (pragmático)
    const tld = labels[labels.length - 1];
    if (!/^[A-Za-z]{2,}$/.test(tld)) return false;

    // longitud razonable (no oficial pero práctica)
    if (value.length > 320) return false;       // email total
    if (local.length > 64) return false;        // parte local

    return true;
}



// *********************************************************************
// *                        Phone Validations                          *
// *********************************************************************


/** Quita todo excepto dígitos; preserva un '+' inicial si existe */
const sanitizePhone = (raw: string): string => {
    const s = (raw ?? "").trim();
    if (!s) return "";
    const hasPlus = s.startsWith("+");
    const digits = s.replace(/\D+/g, "");
    return hasPlus ? `+${digits}` : digits;
}

/** Valida formato internacional E.164 (solo formato, no semántica por país) */
const isPhoneE164Intl = (raw: string): boolean => {
    const v = sanitizePhone(raw);
    // E.164: +[country][nsn], total 8 a 15 dígitos después de '+'
    return /^\+[1-9]\d{7,14}$/.test(v);
}

/** 
 * Valida número de México (pragmático):
 * - Acepta nacional de 10 dígitos (NSN)
 * - Acepta +52[NSN] y también +521[NSN] (legado) => lo considera válido y lo normaliza
 * - NSN debe iniciar 2-9 y tener 10 dígitos
 */
const isPhoneMX = (raw: string): boolean => {
    const v = sanitizePhone(raw);
    // normaliza a NSN (10 dígitos) si viene con +52 o +521
    const nsn = (() => {
        if (v.startsWith("+52")) {
            const rest = v.slice(3); // después de +52
            if (/^1\d{10}$/.test(rest)) return rest.slice(1); // +521 + 10 dígitos (legado)
            if (/^\d{10}$/.test(rest)) return rest;           // +52 + 10 dígitos
            return "";                                        // otras longitudes -> inválido
        }
        // Sin código país: solo dígitos
        if (/^\d{10}$/.test(v)) return v;
        // A veces el usuario pega "52" al inicio sin '+'
        if (/^52\d{10}$/.test(v)) return v.slice(2);
        // A veces pegan "521" (legado) sin '+'
        if (/^521\d{10}$/.test(v)) return v.slice(3);
        return "";
    })();

    if (!nsn) return false;

    // Regla sencilla: primer dígito 2-9 (áreas mexicanas no empiezan en 0/1) y 10 dígitos
    if (!/^[2-9]\d{9}$/.test(nsn)) return false;

    return true;
}

/** Intenta normalizar a E.164; por ahora solo MX si no viene con '+' */
const toE164 = (raw: string, defaultCountry: "MX" | "INTL" = "MX"): string | null => {
    const v = sanitizePhone(raw);

    // Ya viene en E.164 y es válido por formato
    if (v.startsWith("+")) {
        return isPhoneE164Intl(v) ? v : null;
    }

    // Si pedimos MX por omisión
    if (defaultCountry === "MX") {
        if (isPhoneMX(v)) {
            // Obtén el NSN limpio de 10 dígitos
            const nsn =
                /^\d{10}$/.test(v) ? v :
                    /^52\d{10}$/.test(v) ? v.slice(2) :
                        /^521\d{10}$/.test(v) ? v.slice(3) :
                            // Si no coincide, re-sanitiza vías anteriores
                            sanitizePhone(v).replace(/^52|^521/, "").slice(-10);

            return `+52${nsn}`;
        }
        return null;
    }

    // Si se quiere solo validar/normalizar internacional estricta
    return isPhoneE164Intl(v) ? v : null;
}

/** Valida teléfono de forma general:
 *  - Si empieza con '+': exige E.164
 *  - Si no: intenta MX por defecto (ajusta si quieres)
 */
const isPhone = (raw: string): boolean => {
    const v = sanitizePhone(raw);
    if (v.length < 0) return false;
    if (!v) return false;
    if (v.startsWith("+")) return isPhoneE164Intl(v);
    return isPhoneMX(v); // por omisión asumimos MX
}


export {
    isEmailValid,
    isPhone,
    toE164,
    isPhoneMX,
    isPhoneE164Intl,
    sanitizePhone
};
