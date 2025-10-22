// ============================================================
//  UTILIDADES: File → base64 y comparación base64 vs File
// ============================================================

function fileToBase64(path: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(path);
  });
}

async function isSameFile(base64String: string, path: File): Promise<boolean> {
  const strip = (s: string) => s.replace(/^data:.*;base64,/, "");
  const fileBase64 = await fileToBase64(path);
  return strip(base64String) === strip(fileBase64);
}

// ============================================================
//  IDS PARA FILES (SHA-256 por contenido)
// ============================================================

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const __fileIdCache = new WeakMap<File, string>();

async function getFileId(path: File): Promise<string> {
  const cached = __fileIdCache.get(path);
  if (cached) return cached;
  const buf = await path.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const id = toHex(digest);
  __fileIdCache.set(path, id);
  return id;
}

// ============================================================
//  NORMALIZACIÓN (evita falsos positivos comunes)
// ============================================================

function normalizeScalar(key: string, value: any) {
  if (value == null) return value;

  if (key === "delivery_cost") {
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
  }

  if (
    key === "delivery_date" ||
    key === "shipping_date" ||
    key === "created_at" ||
    key === "updated_at"
  ) {
    try {
      return new Date(value).toISOString();
    } catch {
      return value;
    }
  }

  return value;
}

// ============================================================
//  OPCIONES
// ============================================================

export type DiffOpts = {
  keys?: string[];
  ignore?: string[];
  nullUndefEqual?: boolean;
  coerceNumberStrings?: boolean;
  objectKeyById?: string[]; // ej: ['location', 'product']
};

export const defaultDiffOpts: DiffOpts = {
  nullUndefEqual: true,
  coerceNumberStrings: true,
  objectKeyById: [],
};

const keyOf = (o: any): string | null => {
  const id = o?.id;
  return id === undefined || id === null ? null : String(id);
};

// (Se conserva por si después lo quieres reutilizar, pero YA NO se usa para aplastar antes de comparar)
function stripObjectKeysById<T extends Record<string, any>>(
  obj: T,
  keys: string[] = []
): T {
  if (!obj || !keys.length) return obj;
  const out: any = { ...obj };
  for (const k of keys) {
    if (k in out && out[k] && typeof out[k] === "object") {
      const id = out[k]?.id ?? null;
      out[k] = id == null ? out[k] : { id };
    }
  }
  return out;
}

// ============================================================
//  DIFF OBJETO A OBJETO
// ============================================================

async function diffObjects(
  obj1: any,
  obj2: any,
  opts: DiffOpts = defaultDiffOpts
): Promise<Record<string, any>> {
  const result: Record<string, any> = {};

  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    return obj1 !== obj2 ? (obj2 as any) : {};
  }

  // Arrays: si cambia algo, devuelve obj2 completo
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2)) return obj2;
    if (obj1.length !== obj2.length) return obj2;
    for (let i = 0; i < obj1.length; i++) {
      const sub = await diffObjects(obj1[i], obj2[i], opts);
      if (Object.keys(sub).length > 0) return obj2;
    }
    return {};
  }

  // ❌ Antes aplastabas aquí ⇒ eso te dejaba { id } y perdías campos
  // obj1 = stripObjectKeysById(obj1, opts.objectKeyById);
  // obj2 = stripObjectKeysById(obj2, opts.objectKeyById);

  let keys = Array.from(new Set([...Object.keys(obj1 ?? {}), ...Object.keys(obj2 ?? {})]));
  if (opts.keys?.length) keys = keys.filter((k) => opts.keys!.includes(k));
  if (opts.ignore?.length) keys = keys.filter((k) => !opts.ignore!.includes(k));

  for (const key of keys) {
    if (key === "id") continue;

    const val1 = (obj1 as any)[key];
    const val2 = (obj2 as any)[key];

    // ✅ Tratamiento especial para claves "byId":
    // si cambia el id ⇒ reemplaza TODO el objeto por val2
    // si NO cambia ⇒ deep-diff de sus campos internos
    if (opts.objectKeyById?.includes(key)) {
      const id1 = keyOf(val1);
      const id2 = keyOf(val2);

      // Uno es null y el otro no, o ambos existen pero distintos
      if (id1 !== id2) {
        result[key] = val2;
        continue;
      }

      // Si ambos son objetos y el id coincide, diff profundo
      const bothObjects =
        typeof val1 === "object" && val1 !== null && typeof val2 === "object" && val2 !== null;
      if (bothObjects) {
        const nested = await diffObjects(val1, val2, opts);
        if (Object.keys(nested).length > 0) result[key] = nested;
      } else {
        // Si alguno no es objeto (o ambos son null), aplica comparación normal
        const _n = (v: any) =>
          opts.nullUndefEqual && (v === null || v === undefined) ? null : normalizeScalar(key, v);

        const coerce = (v: any) => {
          if (!opts.coerceNumberStrings) return v;
          if (typeof v === "string" || typeof v === "number") {
            const n = Number(v);
            if (!Number.isNaN(n) && String(n) === String(v)) return n;
          }
          return v;
        };

        const n1 = coerce(_n(val1));
        const n2 = coerce(_n(val2));
        if (n1 !== n2) result[key] = val2;
      }
      continue;
    }

    // Files en ambos lados
    if (val1 instanceof File && val2 instanceof File) {
      const strip = (s: string) => s.replace(/^data:.*;base64,/, "");
      const [b64a, b64b] = await Promise.all([fileToBase64(val1), fileToBase64(val2)]);
      if (strip(b64a) !== strip(b64b)) result[key] = val2;
      continue;
    }

    // base64 vs File
    if (typeof val1 === "string" && val2 instanceof File && /^data:.*;base64,/.test(val1)) {
      if (!(await isSameFile(val1, val2))) result[key] = val2;
      continue;
    }
    if (typeof val2 === "string" && val1 instanceof File && /^data:.*;base64,/.test(val2)) {
      if (!(await isSameFile(val2, val1))) result[key] = val2;
      continue;
    }

    const bothObjects =
      typeof val1 === "object" && val1 !== null && typeof val2 === "object" && val2 !== null;

    if (bothObjects) {
      const nestedDiff = await diffObjects(val1, val2, opts);
      if (Object.keys(nestedDiff).length > 0) result[key] = nestedDiff;
    } else {
      const _n = (v: any) =>
        opts.nullUndefEqual && (v === null || v === undefined) ? null : normalizeScalar(key, v);

      const coerce = (v: any) => {
        if (!opts.coerceNumberStrings) return v;
        if (typeof v === "string" || typeof v === "number") {
          const n = Number(v);
          if (!Number.isNaN(n) && String(n) === String(v)) return n;
        }
        return v;
      };

      const n1 = coerce(_n(val1));
      const n2 = coerce(_n(val2));
      if (n1 !== n2) result[key] = val2;
    }
  }

  return result;
}

// ============================================================
//  DIFF DE ARREGLOS (por id) — CONFIGURABLE
// ============================================================

async function diffObjectArrays(
  arr1: any[],
  arr2: any[],
  opts: DiffOpts = defaultDiffOpts
) {
  const modified: any[] = [];
  const added: any[] = [];
  const deleted: any[] = [];

  const hasFiles =
    arr1.some((x) => x instanceof File) || arr2.some((x) => x instanceof File);
  if (hasFiles) {
    const ids1: string[] = [];
    const ids2: string[] = [];
    const map1 = new Map<string, File>();
    const map2 = new Map<string, File>();

    for (const f of arr1) {
      if (f instanceof File) {
        const id = await getFileId(f);
        ids1.push(id);
        map1.set(id, f);
      } else if (f && typeof f === "object" && f.path instanceof File) {
        const id = f.id ?? (await getFileId(f.path));
        ids1.push(id);
        map1.set(id, f.path);
      }
    }
    for (const f of arr2) {
      if (f instanceof File) {
        const id = await getFileId(f);
        ids2.push(id);
        map2.set(id, f);
      } else if (f && typeof f === "object" && f.path instanceof File) {
        const id = f.id ?? (await getFileId(f.path));
        ids2.push(id);
        map2.set(id, f.path);
      }
    }

    const freq1 = new Map<string, number>();
    const freq2 = new Map<string, number>();
    for (const id of ids1) freq1.set(id, (freq1.get(id) ?? 0) + 1);
    for (const id of ids2) freq2.set(id, (freq2.get(id) ?? 0) + 1);

    for (const [id, c2] of freq2) {
      const c1 = freq1.get(id) ?? 0;
      for (let i = 0; i < c2 - c1; i++) if (c2 > c1) added.push({ id, path: map2.get(id)! });
    }
    for (const [id, c1] of freq1) {
      const c2 = freq2.get(id) ?? 0;
      for (let i = 0; i < c1 - c2; i++) if (c1 > c2) deleted.push({ id, path: map1.get(id)! });
    }

    return { added, modified, deleted };
  }

  const map1 = new Map<string, any>();
  for (const o of arr1) {
    const k = keyOf(o);
    if (k != null && !map1.has(k)) map1.set(k, o);
  }

  const map2 = new Map<string, any>();
  for (const o of arr2) {
    const k = keyOf(o);
    if (k != null && !map2.has(k)) map2.set(k, o);
  }

  for (const [k, obj2] of map2) {
    if (!map1.has(k)) added.push({ id: obj2.id, ...obj2 });
  }

  for (const [k, obj1] of map1) {
    if (!map2.has(k)) deleted.push(obj1);
  }

  for (const [k, obj2] of map2) {
    const obj1 = map1.get(k);
    if (!obj1) continue;

    // ❌ Antes "aplastabas" aquí
    // const a = stripObjectKeysById(obj1, opts.objectKeyById);
    // const b = stripObjectKeysById(obj2, opts.objectKeyById);

    // ✅ Deja que diffObjects maneje objectKeyById con la rama especializada
    const diff = await diffObjects(obj1, obj2, opts);
    if (diff && Object.keys(diff).length > 0) {
      modified.push({ id: obj2.id, ...diff });
    }
  }

  for (const o of arr2) {
    if (keyOf(o) == null) added.push({ ...o });
  }

  return { added, modified, deleted };
}

// ============================================================
//  DEEP DIFF (alias)
// ============================================================

async function deepDiff(obj1: any, obj2: any): Promise<Record<string, any>> {
  return diffObjects(obj1, obj2, defaultDiffOpts);
}

export { diffObjects, diffObjectArrays, deepDiff };
