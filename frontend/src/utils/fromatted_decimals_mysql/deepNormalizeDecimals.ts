const deepNormalizeDecimals = <T>(
    data: T,
    decimalKeys: string[]
): T => {
    if (typeof File !== "undefined" && data instanceof File) {
        return data;
    }
    if (data instanceof Date) {
        return data;
    }
    if (Array.isArray(data)) {
        return data.map(item => deepNormalizeDecimals(item, decimalKeys)) as any;
    }
    if (typeof data === "object" && data !== null) {
        const out: any = {};
        for (const key of Object.keys(data)) {
            const value = (data as any)[key];
            if (decimalKeys.includes(key) && value != null) {
                out[key] = value === "" ? null : Number(value);
            } else {
                out[key] = deepNormalizeDecimals(value, decimalKeys);
            }
        }
        return out as T;
    }
    return data;
}


const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    if (value === null) return false;
    if (typeof value !== "object") return false;

    // ⛔️ No consideres estos como "objetos planos"
    if (typeof File !== "undefined" && value instanceof File) return false;
    if (typeof Blob !== "undefined" && value instanceof Blob) return false;
    if (value instanceof Date) return false;

    // Solo objetos literales { ... }
    return Object.getPrototypeOf(value) === Object.prototype;
};

const cleanEmptyObjects = <T>(obj: T): T => {
    const recurse = (value: any): any => {
        // Arrays: solo mapeamos, sin eliminar elementos
        if (Array.isArray(value)) {
            return value.map(recurse);
        }

        // Si NO es objeto plano (File, Date, primitivos, etc.) → lo devolvemos tal cual
        if (!isPlainObject(value)) {
            return value;
        }

        // Objeto plano: limpiamos sus props
        const cleaned: Record<string, unknown> = {};
        for (const key in value as Record<string, unknown>) {
            if (!Object.prototype.hasOwnProperty.call(value, key)) continue;

            const raw = (value as Record<string, unknown>)[key];
            const val = recurse(raw);

            const isEmptyPlainObject =
                val !== null &&
                typeof val === "object" &&
                isPlainObject(val) &&
                Object.keys(val).length === 0;

            // 🔹 Misma lógica que antes:
            //   - si es objeto plano vacío -> lo saltamos
            //   - null/undefined se conservan (no entran al if)
            if (!isEmptyPlainObject) {
                cleaned[key] = val;
            }
        }

        return cleaned;
    };

    return recurse(obj) as T;
};



export {
    deepNormalizeDecimals,
    cleanEmptyObjects
}
