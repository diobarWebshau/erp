// utils/formatters.ts

/**
 * Detecta si un número tiene parte decimal.
 */
const hasDecimals = (value: number): boolean => {
    return value % 1 !== 0;
};

/**
 * Formatea un número normal con separadores de miles y decimales.
 * Ej: 1000 => "1,000" | 1000.5 => "1,000.5"
 */
export const formatNumber = (
    value: number,
    options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        locale?: string;
    }
): string => {
    const {
        minimumFractionDigits = hasDecimals(value) ? 2 : 0,
        maximumFractionDigits = 6,
        locale = 'es-MX',
    } = options || {};

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value);
};

/**
 * Formatea un número como moneda.
 * Ej: 1000 => "$1,000" | 1000.5 => "$1,000.50"
 */
export const formatCurrency = (
    value: number,
    currency: string = 'MXN',
    options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        locale?: string;
    }
): string => {
    const {
        minimumFractionDigits = hasDecimals(value) ? 2 : 0,
        maximumFractionDigits = 6,
        locale = 'es-MX',
    } = options || {};

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value);
};

/**
 * Formatea un número como porcentaje.
 * Ej: 0.25 => "25%" | 0.253 => "25.3%"
 */
export const formatPercentage0_1 = (
    value: number,
    options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        locale?: string;
    }
): string => {
    const {
        minimumFractionDigits = hasDecimals(value) ? 2 : 0,
        maximumFractionDigits = 6,
        locale = 'es-MX',
    } = options || {};

    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value);
};

export const formatPercentage1_100 = (
    value: number,
    options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        locale?: string;
    }
): string => {
    const {
        minimumFractionDigits = Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits = 6,
        locale = 'es-MX',
    } = options || {};

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value) + '%';
};


/**
 * Formatea un número de forma compacta.
 * Ej: 1500 => "1.5 K" | 1000 => "1 K"
 */
export const formatCompact = (
    value: number,
    options?: {
        locale?: string;
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
    }
): string => {
    const {
        locale = 'es-MX',
        minimumFractionDigits = hasDecimals(value) ? 2 : 0,
        maximumFractionDigits = 6,
    } = options || {};

    return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value);
};
