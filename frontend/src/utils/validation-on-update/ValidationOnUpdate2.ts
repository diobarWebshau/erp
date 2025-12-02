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


// **************************************************************************
// COMÚN A AMBAS VERSIONES
// **************************************************************************

// Diff genérico para cualquier array
export type ArrayDiff<T> = {
  added: T[];
  deleted: T[];
  modified: T[];
};

// Helper: extrae el tipo del hijo desde la propiedad del padre (si es array)
type ChildOfParent<TParent, TChildKey extends keyof TParent> =
  TParent[TChildKey] extends (infer U)[] ? U : never;

// --------------------------------------------------------------------------
// Normalizador local de ArrayDiff por id
// --------------------------------------------------------------------------
// Regla: si un id está en modified, ese mismo id NO debe estar en added ni deleted.
// No cambia el id, solo limpia buckets incoherentes.
// --------------------------------------------------------------------------

function normalizeArrayDiffById<T extends { id?: any }>(
  diff: ArrayDiff<T>
): ArrayDiff<T> {
  const getId = (item: T): string | null => {
    const id = (item as any)?.id;
    if (id === null || id === undefined) return null;
    return String(id);
  };

  const modifiedIds = new Set<string>();
  for (const m of diff.modified) {
    const id = getId(m);
    if (id != null) modifiedIds.add(id);
  }

  if (modifiedIds.size === 0) {
    return diff;
  }

  const keepIfNotModified = (item: T) => {
    const id = getId(item);
    if (id == null) return true;           // sin id → no lo tocamos
    return !modifiedIds.has(id);           // si el id está en modified → se quita del bucket
  };

  return {
    added: diff.added.filter(keepIfNotModified),
    modified: diff.modified,
    deleted: diff.deleted.filter(keepIfNotModified),
  };
}



// **************************************************************************
// 🔵 VERSIÓN A — MODELO "FULL vs PARTIAL"
// --------------------------------------------------------------------------
// - TFull  = tipo completo del padre (modelo de dominio, típicamente el de BD).
// - TPartial = versión parcial que quieres usar en added/modified.
// - `deleted` usa TFull (el modelo completo).
// - Úsala cuando quieras distinguir explícitamente "modelo completo" vs "DTO parcial".
// **************************************************************************

export type ParentWithChildDiffFull<
  TFull,                          // tipo completo del padre
  TPartial extends Partial<TFull>,// tipo parcial para added/modified
  TChild,                         // tipo del hijo
  ManagerKey extends string       // nombre de la propiedad del manager hijo
> = {
  added: (
    TPartial & {
      [K in ManagerKey]?: ArrayDiff<TChild>;
    }
  )[];
  deleted: TFull[];               // ⬅️ aquí se sigue usando el tipo "full"
  modified: (
    TPartial & {
      [K in ManagerKey]?: ArrayDiff<TChild>;
    }
  )[];
};

// ============================================================
//  DIFF DE ARREGLOS CON MANAGER HIJO — FULL vs PARTIAL
// ============================================================
// - Usa TParent como "full" (debe tener id obligatorio).
// - Requiere que existan en el archivo:
//     * diffObjectArrays
//     * DiffOpts
//     * defaultDiffOpts
// **************************************************************************

export async function diffObjectArraysWithChildFull<
  TParent extends { id: any },          // id obligatorio (modelo completo)
  TChildKey extends keyof TParent,
  TManagerKey extends string
>(
  arr1: TParent[],
  arr2: TParent[],
  options: {
    childKey: TChildKey;         // p.ej. "product_input_process"
    managerKey: TManagerKey;     // p.ej. "productInputProcessManager"
    parentDiffOpts?: DiffOpts;
    childDiffOpts?: DiffOpts;
  }
): Promise<
  ParentWithChildDiffFull<
    TParent,                         // TFull
    Partial<TParent>,                // TPartial (para added/modified)
    ChildOfParent<TParent, TChildKey>, // TChild
    TManagerKey
  >
> {
  const {
    childKey,
    managerKey,
    parentDiffOpts = defaultDiffOpts,
    childDiffOpts = defaultDiffOpts,
  } = options;

  const base = await diffObjectArrays(arr1, arr2, parentDiffOpts);

  if (!base) {
    return {
      added: [],
      deleted: [],
      modified: [],
    } as any;
  }

  const { added, deleted, modified } = base;

  const resultAdded: any[] = [];
  const resultModified: any[] = [];

  const toArray = (v: any) => (Array.isArray(v) ? v : []);

  // ADDED: padre nuevo ⇒ todos los hijos se consideran "added"
  for (const a of added as TParent[]) {
    const id = (a as any).id;
    const fullUpdated = arr2.find((p) => String((p as any).id) === String(id));

    const parentPartial: any = { ...a }; // se usa como "partial" en el manager

    if (fullUpdated) {
      const childArr = toArray((fullUpdated as any)[childKey]);

      if (childArr.length > 0) {
        parentPartial[managerKey] = {
          added: childArr,
          deleted: [],
          modified: [],
        } as ArrayDiff<ChildOfParent<TParent, TChildKey>>;
      }
    }

    resultAdded.push(parentPartial);
  }

  // MODIFIED: padre existente ⇒ diff de hijos
  for (const m of modified as any[]) {
    const id = m.id;
    const origFull = arr1.find((p) => String((p as any).id) === String(id));
    const updFull = arr2.find((p) => String((p as any).id) === String(id));

    const parentPartial: any = { ...m };

    if (origFull && updFull) {
      const childArr1 = toArray((origFull as any)[childKey]);
      const childArr2 = toArray((updFull as any)[childKey]);

      let childDiff = await diffObjectArrays(
        childArr1,
        childArr2,
        childDiffOpts
      );

      // 🔧 Aquí corregimos el caso:
      // si un hijo tiene el mismo id en added y modified, se queda SOLO en modified.
      childDiff = normalizeArrayDiffById(childDiff as ArrayDiff<any>);

      if (
        childDiff &&
        (childDiff.added.length > 0 ||
          childDiff.modified.length > 0 ||
          childDiff.deleted.length > 0)
      ) {
        parentPartial[managerKey] = childDiff;
      }
    }

    resultModified.push(parentPartial);
  }

  // DELETED: padres completos (TFull / TParent)
  return {
    added: resultAdded,
    deleted: deleted as TParent[],
    modified: resultModified,
  };
}



// **************************************************************************
// 🟢 VERSIÓN B — MODELO "UN SOLO TIPO DE PADRE" (NORMALMENTE PARTIAL)
// --------------------------------------------------------------------------
// - Solo hay un tipo de padre TParent (por ejemplo IPartialProductProcess).
// - `added`, `deleted` y `modified` usan SIEMPRE TParent.
// - TParent puede ser full o partial, tú decides al usarlo.
// - Esta es la que encaja con tu idea de trabajar todo con partials en el diff.
// **************************************************************************

export type ParentWithChildDiffSingle<
  TParent,                // tipo de padre (full o partial)
  TChild,                 // tipo del hijo
  ManagerKey extends string
> = {
  added: (
    TParent & {
      [K in ManagerKey]?: ArrayDiff<TChild>;
    }
  )[];
  deleted: TParent[];
  modified: (
    TParent & {
      [K in ManagerKey]?: ArrayDiff<TChild>;
    }
  )[];
};

// ============================================================
//  DIFF DE ARREGLOS CON MANAGER HIJO — SINGLE PARENT
// ============================================================
// - Aquí TParent puede ser Partial<Modelo>, por eso id se permite opcional.
// **************************************************************************

export async function diffObjectArraysWithChildSingle<
  TParent extends { id?: any },        // id opcional → compatible con Partial<>
  TChildKey extends keyof TParent,
  TManagerKey extends string
>(
  arr1: TParent[],
  arr2: TParent[],
  options: {
    childKey: TChildKey;
    managerKey: TManagerKey;
    parentDiffOpts?: DiffOpts;
    childDiffOpts?: DiffOpts;
  }
): Promise<
  ParentWithChildDiffSingle<
    TParent,
    ChildOfParent<TParent, TChildKey>,
    TManagerKey
  >
> {
  const {
    childKey,
    managerKey,
    parentDiffOpts = defaultDiffOpts,
    childDiffOpts = defaultDiffOpts,
  } = options;

  const base = await diffObjectArrays(arr1, arr2, parentDiffOpts);

  if (!base) {
    return {
      added: [],
      deleted: [],
      modified: [],
    } as any;
  }

  const { added, deleted, modified } = base;

  const resultAdded: any[] = [];
  const resultModified: any[] = [];

  const toArray = (v: any) => (Array.isArray(v) ? v : []);

  // ADDED: padre nuevo ⇒ todos los hijos actuales son "added"
  for (const a of added as TParent[]) {
    const id = (a as any).id;
    const fullUpdated = arr2.find((p) => String((p as any).id) === String(id));

    const parentCopy: any = { ...a }; // TParent (puede ser partial)

    if (fullUpdated) {
      const childArr = toArray((fullUpdated as any)[childKey]);

      if (childArr.length > 0) {
        parentCopy[managerKey] = {
          added: childArr,
          deleted: [],
          modified: [],
        } as ArrayDiff<ChildOfParent<TParent, TChildKey>>;
      }
    }

    resultAdded.push(parentCopy);
  }

  // MODIFIED: padre existente ⇒ diff de hijos
  for (const m of modified as any[]) {
    const id = m.id;
    const origFull = arr1.find((p) => String((p as any).id) === String(id));
    const updFull = arr2.find((p) => String((p as any).id) === String(id));

    const parentCopy: any = { ...m };

    if (origFull && updFull) {
      const childArr1 = toArray((origFull as any)[childKey]);
      const childArr2 = toArray((updFull as any)[childKey]);

      let childDiff = await diffObjectArrays(
        childArr1,
        childArr2,
        childDiffOpts
      );

      // 🔧 Misma corrección aquí para la versión "single"
      childDiff = normalizeArrayDiffById(childDiff as ArrayDiff<any>);

      if (
        childDiff &&
        (childDiff.added.length > 0 ||
          childDiff.modified.length > 0 ||
          childDiff.deleted.length > 0)
      ) {
        parentCopy[managerKey] = childDiff;
      }
    }

    resultModified.push(parentCopy);
  }

  // DELETED: mismos TParent que maneja diffObjectArrays
  return {
    added: resultAdded,
    deleted: deleted as TParent[],
    modified: resultModified,
  };
}


/* 





    Cómo usarlas sin confundirte

    Si quieres distinguir “modelo completo” vs “partial” y que deleted sea full:

    type ProductProcessManager = ParentWithChildDiffFull<
      IProductProcess,
      IPartialProductProcess,
      IPartialProductInputProcess,
      "productInputProcessManager"
    >;

    const diff = await diffObjectArraysWithChildFull<IProductProcess, "product_input_process", "productInputProcessManager">(
      original,
      updated,
      { childKey: "product_input_process", managerKey: "productInputProcessManager" }
    );


    Si quieres que todo (added/modified/deleted) sea IPartialProductProcess:

    type ProductProcessManager = ParentWithChildDiffSingle<
      IPartialProductProcess,
      IPartialProductInputProcess,
      "productInputProcessManager"
    >;

    const diff = await diffObjectArraysWithChildSingle<IPartialProductProcess, "product_input_process", "productInputProcessManager">(
      originalPartial,
      updatedPartial,
      { childKey: "product_input_process", managerKey: "productInputProcessManager" }
    );


*/










