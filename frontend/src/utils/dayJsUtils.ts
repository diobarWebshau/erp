// =========================================================
// 📅 dateUtils.ts — Utilidades centralizadas para manejar fechas con Day.js
// =========================================================
// Este módulo unifica el uso de Day.js en todo el sistema ERP, garantizando
// consistencia de formato, zona horaria, parseo y manipulación de fechas.
// =========================================================

import dayjs from "dayjs";

// =========================================================
// 🔌 PLUGINS ACTIVADOS Y SU PROPÓSITO
// =========================================================

import customParseFormat from "dayjs/plugin/customParseFormat";
// ➤ Permite parsear strings con formatos personalizados, ej: "DD/MM/YYYY"
//    Sin este plugin, solo se aceptan formatos ISO.

import utc from "dayjs/plugin/utc";
// ➤ Permite convertir y manipular fechas en formato UTC (coordinado universal).
//    Ideal para guardar fechas en base de datos sin depender de la zona local.

import timezone from "dayjs/plugin/timezone";
// ➤ Permite trabajar con zonas horarias específicas (ej: "America/Mexico_City").
//    Útil para mostrar al usuario horas locales distintas a la del servidor.

import localizedFormat from "dayjs/plugin/localizedFormat";
// ➤ Habilita formatos localizados según idioma (ej: "LLL" -> "9 de octubre de 2025 14:00").
//    Usa la configuración de `dayjs.locale("es")`.

import relativeTime from "dayjs/plugin/relativeTime";
// ➤ Permite mostrar tiempos relativos como "hace 3 horas" o "en 2 días".
//    Muy usado en dashboards, notificaciones y logs.

import advancedFormat from "dayjs/plugin/advancedFormat";
// ➤ Agrega tokens avanzados a los formatos (ej: "Qo", "Do", "gggg").
//    Permite formatos más expresivos, como "1º trimestre de 2025".

import isBetween from "dayjs/plugin/isBetween";
// ➤ Añade `.isBetween()` para verificar si una fecha está entre otras dos.
//    Perfecto para validaciones de rangos, como periodos contables o vigencias.

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
// ➤ Añade `.isSameOrAfter()` para comparar >= (mayor o igual).

import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// ➤ Añade `.isSameOrBefore()` para comparar <= (menor o igual).

import weekOfYear from "dayjs/plugin/weekOfYear";
// ➤ Calcula el número de semana ISO del año (1–53).
//    Ideal para reportes semanales, KPIs o gráficas.

import quarterOfYear from "dayjs/plugin/quarterOfYear";
// ➤ Calcula el trimestre actual (1–4).
//    Útil para reportes financieros o fiscales.

import dayOfYear from "dayjs/plugin/dayOfYear";
// ➤ Devuelve el número de día en el año (1–365 o 366).
//    Útil para cálculos estadísticos o productivos.

import durationPlugin from "dayjs/plugin/duration";
// ➤ Permite crear y manipular duraciones (ej: 3 horas, 2 días, etc.).
//    Muy útil para medir tiempos entre eventos, o ETA en logística.

import "dayjs/locale/es"; // Idioma español para nombres de meses, días, etc.

// =========================================================
// 🔧 REGISTRO DE PLUGINS EN DAYJS
// =========================================================

// Activación de plugins
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);
dayjs.extend(dayOfYear);
dayjs.extend(durationPlugin);

// Idioma global
dayjs.locale("es");

// =========================================================
/** 🧩 Augmentación de tipos para métodos añadidos por plugins.
 *  Esto permite llamar .week(), .quarter(), .dayOfYear() sin usar "as any".
 */
declare module "dayjs" {
  interface Dayjs {
    week(): number;
    quarter(): number;
    dayOfYear(): number;
  }
}
// =========================================================
// 🔹 TIPOS Y EXPORTS
// =========================================================

// Tipado estable de Duration (sin depender de exports internos de dayjs/plugin/duration)
type Duration = ReturnType<typeof dayjs.duration>;

// -----------------------------
// Tipos auxiliares (definirlos encima de DateUtils)
// -----------------------------
type DurationInputObject = {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

/**
 * Tipos que acepta dayjs.duration()
 * - número + unidad
 * - string ISO ("P1DT2H")
 * - objeto con unidades
 * - instancia Duration
 */
type DurationInputArg1 =
  | number
  | string
  | Duration
  | DurationInputObject
  | null
  | undefined;

/**
 * Unidades válidas para duraciones
 */
type DurationUnit =
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

/**
 * Tipo de entrada admitido por Day.js (string, number, Date, Dayjs, etc.).
 * Usa este tipo para aceptar cualquier forma de fecha válida.
 */
export type DateInput = dayjs.ConfigType;

// =========================================================
// 📘 UTILIDADES DE FECHAS
// =========================================================

export const DateUtils = {
  // ===========================
  // CREAR Y PARSEAR FECHAS
  // ===========================

  /**
   * Devuelve una instancia Dayjs de la fecha y hora actual (según la zona local del proceso).
   * @example
   * const now = DateUtils.now(); // Dayjs
   */
  now: (): dayjs.Dayjs => dayjs(),

  /**
   * Crea una instancia Dayjs desde un objeto Date nativo.
   * Útil cuando recibes Date de APIs del navegador o Node.
   * @example
   * const d = new Date();
   * const dj = DateUtils.fromDate(d);
   */
  fromDate: (date: Date): dayjs.Dayjs => dayjs(date),

  /**
   * Crea una instancia Dayjs desde un timestamp en milisegundos (Epoch ms).
   * @example
   * const dj = DateUtils.fromTimestamp(Date.now());
   */
  fromTimestamp: (ts: number): dayjs.Dayjs => dayjs(ts),

  /**
   * Parsea un string a Dayjs. Si pasas `format`, usa parseo con formato (p. ej. "DD/MM/YYYY").
   * Usa `strict=true` para validar que el string calce EXACTO con el formato.
   * @example
   * DateUtils.parse("2025-10-09"); // ISO flexible
   * DateUtils.parse("31/12/2025", "DD/MM/YYYY", true); // estricto
   */
  parse: (value: string, format?: string, strict = false): dayjs.Dayjs =>
    format ? dayjs(value, format, strict) : dayjs(value),

  // ===========================
  // FORMATEO
  // ===========================

  /**
   * Formatea una fecha al patrón indicado (por defecto "YYYY-MM-DD").
   * Nota: el formateo respeta la zona de la instancia (local/utc/tz si la configuraste).
   * @example
   * DateUtils.format(new Date(), "DD/MM/YYYY HH:mm");
   */
  format: (date: DateInput, format = "YYYY-MM-DD"): string =>
    dayjs(date).format(format),

  /**
   * Convierte a string ISO 8601 completo. Si la instancia está en UTC, incluirá "Z".
   * @example
   * DateUtils.toISOString(DateUtils.toUTC(new Date()));
   */
  toISOString: (date: DateInput): string => dayjs(date).toISOString(),

  /**
   * Convierte a `Date` nativo. Útil para integrarte con APIs que exigen Date.
   * @example
   * const n: Date = DateUtils.toDate(dayjs());
   */
  toDate: (date: DateInput): Date => dayjs(date).toDate(),

  /**
   * Devuelve el timestamp en milisegundos desde Unix Epoch.
   * @example
   * const ms = DateUtils.toTimestamp("2025-01-01");
   */
  toTimestamp: (date: DateInput): number => dayjs(date).valueOf(),

  // ===========================
  // MANIPULACIÓN
  // ===========================

  /**
   * Suma una cantidad de unidades a una fecha.
   * Unidades válidas: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
   * @example
   * DateUtils.add("2025-01-01", 2, "day"); // -> 2025-01-03
   */
  add: (date: DateInput, value: number, unit: dayjs.ManipulateType): dayjs.Dayjs =>
    dayjs(date).add(value, unit),

  /**
   * Resta una cantidad de unidades a una fecha.
   * @example
   * DateUtils.subtract("2025-01-10", 1, "month"); // -> 2024-12-10
   */
  subtract: (
    date: DateInput,
    value: number,
    unit: dayjs.ManipulateType
  ): dayjs.Dayjs => dayjs(date).subtract(value, unit),

  // ===========================
  // COMPARACIONES
  // ===========================

  /**
   * ¿`a` es estrictamente anterior a `b`?
   * @example
   * DateUtils.isBefore("2025-01-01", "2025-01-02"); // true
   */
  isBefore: (a: DateInput, b: DateInput): boolean => dayjs(a).isBefore(dayjs(b)),

  /**
   * ¿`a` es estrictamente posterior a `b`?
   * @example
   * DateUtils.isAfter("2025-01-03", "2025-01-02"); // true
   */
  isAfter: (a: DateInput, b: DateInput): boolean => dayjs(a).isAfter(dayjs(b)),

  /**
   * ¿`a` y `b` son iguales? Puedes indicar una unidad para comparar (p. ej. por 'day').
   * @example
   * DateUtils.isSame("2025-01-01T10:00", "2025-01-01T23:59", "day"); // true
   */
  isSame: (a: DateInput, b: DateInput, unit?: dayjs.OpUnitType): boolean =>
    dayjs(a).isSame(dayjs(b), unit),

  /**
   * ¿La fecha es válida? Útil tras parseos condicionales.
   * @example
   * DateUtils.isValid(DateUtils.parse("31/02/2025", "DD/MM/YYYY", true)); // false
   */
  isValid: (date: DateInput): boolean => dayjs(date).isValid(),

  // ===========================
  // PARTES
  // ===========================

  /**
   * Año (YYYY).
   * @example
   * DateUtils.getYear("2025-10-09"); // 2025
   */
  getYear: (date: DateInput): number => dayjs(date).year(),

  /**
   * Mes (0-11). Enero = 0.
   * @example
   * DateUtils.getMonth("2025-01-15"); // 0
   */
  getMonth: (date: DateInput): number => dayjs(date).month(),

  /**
   * Día del mes (1-31).
   * @example
   * DateUtils.getDate("2025-01-15"); // 15
   */
  getDate: (date: DateInput): number => dayjs(date).date(),

  /**
   * Día de la semana (0-6). Domingo = 0.
   * @example
   * DateUtils.getDay("2025-01-05"); // 0 (domingo)
   */
  getDay: (date: DateInput): number => dayjs(date).day(),

  /**
   * Hora (0-23).
   */
  getHour: (date: DateInput): number => dayjs(date).hour(),

  /**
   * Minuto (0-59).
   */
  getMinute: (date: DateInput): number => dayjs(date).minute(),

  /**
   * Segundo (0-59).
   */
  getSecond: (date: DateInput): number => dayjs(date).second(),

  // ===========================
  // ZONAS HORARIAS / UTC
  // ===========================

  /**
   * Devuelve una copia en UTC (misma marca temporal, zona UTC).
   * Útil antes de persistir en DB que espera "Z".
   * @example
   * DateUtils.toUTC("2025-01-01T12:00-08:00").toISOString().endsWith("Z"); // true
   */
  toUTC: (date: DateInput): dayjs.Dayjs => dayjs(date).utc(),

  /**
   * Devuelve una copia en hora local del entorno actual.
   * @example
   * DateUtils.toLocal("2025-01-01T20:00Z");
   */
  toLocal: (date: DateInput): dayjs.Dayjs => dayjs(date).local(),

  /**
   * Formatea en UTC con patrón dado (por defecto ISO sin milisegundos y con 'Z').
   * Útil para guardar en MySQL como texto o enviar a APIs.
   * @example
   * DateUtils.formatUTC(new Date()); // "YYYY-MM-DDTHH:mm:ssZ"
   */
  formatUTC: (date: DateInput, format = "YYYY-MM-DDTHH:mm:ss[Z]"): string =>
    dayjs(date).utc().format(format),

  /**
   * Cambia la zona horaria (requiere plugin timezone).
   * Pasa un IANA TZ, p. ej. "America/Tijuana".
   * @example
   * DateUtils.setTimezone("2025-01-01T12:00Z", "America/Mexico_City");
   */
  setTimezone: (date: DateInput, tz: string): dayjs.Dayjs => dayjs(date).tz(tz),

  // ===========================
  // RELATIVO
  // ===========================

  /**
   * Texto relativo desde la fecha a ahora. Ej.: "hace 3 horas".
   * `withoutSuffix=true` elimina "hace/en".
   * @example
   * DateUtils.fromNow(DateUtils.subtract(new Date(), 3, "hour")); // "hace 3 horas"
   */
  fromNow: (date: DateInput, withoutSuffix = false): string =>
    dayjs(date).fromNow(withoutSuffix),

  /**
   * Texto relativo desde ahora hasta la fecha. Ej.: "en 2 días".
   * @example
   * DateUtils.toNow(DateUtils.add(new Date(), 2, "day")); // "en 2 días"
   */
  toNow: (date: DateInput): string => dayjs().to(dayjs(date)),

  // ===========================
  // COMPARACIONES AVANZADAS
  // ===========================

  /**
   * ¿`a` es la misma o posterior que `b`? (opcionalmente por unidad)
   * @example
   * DateUtils.isSameOrAfter("2025-01-01", "2025-01-01", "day"); // true
   */
  isSameOrAfter: (a: DateInput, b: DateInput, unit?: dayjs.OpUnitType): boolean =>
    dayjs(a).isSameOrAfter(dayjs(b), unit),

  /**
   * ¿`a` es la misma o anterior que `b`? (opcionalmente por unidad)
   * @example
   * DateUtils.isSameOrBefore("2025-01-01", "2025-01-02", "day"); // true
   */
  isSameOrBefore: (a: DateInput, b: DateInput, unit?: dayjs.OpUnitType): boolean =>
    dayjs(a).isSameOrBefore(dayjs(b), unit),

  /**
   * ¿`date` está entre `start` y `end`?
   * Inclusividad: '()' exclusivo, '[)' incluye inicio, '(]' incluye fin, '[]' incluye ambos.
   * @example
   * DateUtils.isBetween("2025-01-02", "2025-01-01", "2025-01-03"); // true
   * DateUtils.isBetween("2025-01-01", "2025-01-01", "2025-01-03", "day", "[)"); // true
   */
  isBetween: (
    date: DateInput,
    start: DateInput,
    end: DateInput,
    unit?: dayjs.OpUnitType,
    inclusivity: "()" | "[)" | "(]" | "[]" = "()"
  ): boolean => dayjs(date).isBetween(dayjs(start), dayjs(end), unit, inclusivity),

  // ===========================
  // DURACIONES
  // ===========================

  /**
   * Crea una duración.
   * Soporta:
   *  - número + unidad ('minute' | 'hour' | 'day' | etc.)
   *  - objeto con unidades plurales ({ days: 1, hours: 2 })
   *  - string ISO 8601 ('P1DT2H') o aspNet
   *  - otra Duration
   *
   * @example
   * DateUtils.duration(90, "minute");               // 90 minutos
   * DateUtils.duration({ hours: 1, minutes: 30 });  // 1h 30m
   * DateUtils.duration("P2DT12H");                  // 2 días 12 horas
   *
   * @returns Duration
   */
  duration: (value?: DurationInputArg1, unit?: DurationUnit): Duration =>
    dayjs.duration(value as any, unit as any),
  

  // ===========================
  // SEMANA / TRIMESTRE / DÍA DEL AÑO
  // ===========================

  /**
   * Número de semana del año (1-53).
   * Nota: depende de cómo el plugin define el inicio de semana.
   * @example
   * DateUtils.getWeek("2025-01-05"); // p. ej. 1
   */
  getWeek: (date: DateInput): number => dayjs(date).week(),

  /**
   * Trimestre del año (1-4).
   * @example
   * DateUtils.getQuarter("2025-10-09"); // 4
   */
  getQuarter: (date: DateInput): number => dayjs(date).quarter(),

  /**
   * Día del año (1-365/366).
   * @example
   * DateUtils.getDayOfYear("2025-01-01"); // 1
   */
  getDayOfYear: (date: DateInput): number => dayjs(date).dayOfYear(),
};

/**
 * Devuelve el inicio de la unidad indicada (día, mes, año, etc.).
 * Útil para filtros por rangos (inicio de mes, inicio de día).
 * @example
 * startOf("2025-10-09T10:15", "day"); // 2025-10-09T00:00
 */
export const startOf = (date: DateInput, unit: dayjs.OpUnitType): dayjs.Dayjs =>
  dayjs(date).startOf(unit);

/**
 * Devuelve el fin de la unidad indicada (día, mes, año, etc.).
 * Útil para filtros por rangos (fin de mes, fin de día).
 * @example
 * endOf("2025-10-09T10:15", "day"); // 2025-10-09T23:59:59.999
 */
export const endOf = (date: DateInput, unit: dayjs.OpUnitType): dayjs.Dayjs =>
  dayjs(date).endOf(unit);
