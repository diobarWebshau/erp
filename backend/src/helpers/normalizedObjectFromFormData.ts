// src/utils/normalizeFormData.ts
import type { RequestHandler } from "express";

/**
 * Determina si una cadena "parece" JSON (objeto o arreglo).
 */
const looksLikeJson = (s: string) => {
  const t = s.trim();
  return (
    (t.startsWith("{") && t.endsWith("}")) ||
    (t.startsWith("[") && t.endsWith("]"))
  );
};

/**
 * ¿Es un número válido para coerción? Evita parsear "" u otras cosas.
 * Si quieres ser más estricto, usa regex: /^-?\d+(\.\d+)?$/
 */
const isNumeric = (s: string) => s !== "" && !isNaN(Number(s));

/**
 * Intenta coaccionar un valor string a boolean/number/JSON.
 * - Desempaqueta una sola capa de comillas exteriores (p.ej. '"foo"' → 'foo').
 * - Para arrays de strings, aplica recursivamente.
 */
export function coerceValue(value: unknown): any {
  if (Array.isArray(value)) {
    return value.map(coerceValue);
  }

  if (typeof value !== "string") return value;

  // 1) Quita una capa de comillas exteriores si existen (e.g. '"foo"' -> 'foo' / "'foo'" -> 'foo')
  let s = value.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }

  // 2) boolean
  if (s === "true") return true;
  if (s === "false") return false;

  // 3) number
  if (isNumeric(s)) return Number(s);

  // 4) (opcional) detectar ISO 8601 y devolver Date
  // Descomenta si deseas convertir automáticamente cadenas ISO a Date:
  // const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
  // if (ISO_DATE_RE.test(s)) {
  //   const d = new Date(s);
  //   if (!isNaN(d.getTime())) return d;
  // }

  // 5) JSON embebido (objeto o arreglo)
  if (looksLikeJson(s)) {
    try {
      const parsed = JSON.parse(s);
      return normalizeObjectFromFormData(parsed); // parseo recursivo
    } catch {
      // no era JSON válido → deja el string "desenvolvido"
      return s;
    }
  }

  // 6) string plano (ya sin comillas dobles externas)
  return s;
}

/**
 * Normaliza recursivamente un objeto/arreglo: coacciona tipos y parsea JSON stringificado.
 * Útil si recibes objetos desde FormData o payloads anidados.
 */
export function normalizeObjectFromFormData<T = any>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => normalizeObjectFromFormData(v)) as unknown as T;
  }
  if (obj && typeof obj === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      // Multer / form-data entregan strings o arrays de strings
      out[k] = coerceValue(v as any);
    }
    return out as T;
  }
  return coerceValue(obj) as T;
}

/**
 * Middleware para Express: normaliza req.body cuando la ruta usa multipart/form-data.
 * Debe ir DESPUÉS de multer(). Reemplaza req.body por su versión normalizada.
 *
 * Uso:
 *  app.post('/route',
 *    upload.any(),            // multer
 *    normalizeFormDataBody(), // este middleware
 *    controller
 *  );
 */
export function normalizeFormDataBody(): RequestHandler {
  return (req, _res, next) => {
    try {
      // Sólo normalizamos si hay body (en multipart siempre habrá aunque sean strings)
      if (req.body && typeof req.body === "object") {
        req.body = normalizeObjectFromFormData(req.body);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
