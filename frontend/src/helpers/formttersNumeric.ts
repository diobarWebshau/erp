// utils/formatters.ts

/**
 * Formatea un número normal con separadores de miles y decimales.
 * Ej: 1000 => "1,000.000"
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
        minimumFractionDigits = 2,
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
 * Ej: 1000 => "$1,000.00"
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
        minimumFractionDigits = 2,
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
 * Ej: 0.25 => "25%"
 */
export const formatPercentage = (
    value: number,
    options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        locale?: string;
    }
): string => {
    const {
        minimumFractionDigits = 2,
        maximumFractionDigits = 6,
        locale = 'es-MX',
    } = options || {};

    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value);
};

/**
 * Formatea un número de forma compacta.
 * Ej: 1500 => "1.5K"
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
        minimumFractionDigits = 2,
        maximumFractionDigits = 6,
    } = options || {};

    return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value);
};
