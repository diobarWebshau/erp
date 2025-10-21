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

/**
 * Compara si un base64 y un File tienen el mismo contenido.
 * base64String debe ser un string en formato "data:[mime];base64,..."
 *
 * ⚠️ CAMBIO: ahora se normaliza quitando el encabezado "data:*;base64," para
 * comparar únicamente el contenido base64. Esto evita falsos negativos por
 * diferencias de mime o encabezado.
 */
async function isSameFile(base64String: string, path: File): Promise<boolean> {
  const strip = (s: string) => s.replace(/^data:.*;base64,/, '');
  const fileBase64 = await fileToBase64(path);
  return strip(base64String) === strip(fileBase64);
}

// ============================================================
//  IDS PARA FILES (SHA-256 por contenido) — NUEVO
//  Justificación: File no tiene 'id' y sus props no son enumerables;
//  para diffs de arrays de evidencias, usamos un id estable por contenido.
// ============================================================

/** Convierte ArrayBuffer → hex */
function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Cache en memoria para no re-hashear el mismo File repetidamente en la sesión */
const __fileIdCache = new WeakMap<File, string>();

/**
 * Genera un id estable por contenido para un File (SHA-256).
 * Mismo contenido ⇒ mismo id; distinto contenido ⇒ id distinto.
 */
async function getFileId(path: File): Promise<string> {
  const cached = __fileIdCache.get(path);
  if (cached) return cached;

  const buf = await path.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const id = toHex(digest);

  __fileIdCache.set(path, id);
  return id;
}

// ============================================================
//  NORMALIZACIÓN: evita falsos positivos (DECIMAL string vs number, fechas)
// ============================================================

/**
 * Normaliza valores "escalares" por clave antes de comparar:
 * - delivery_cost: compara como número (evita "2125.2500" vs "2125.25")
 * - fechas: compara como ISO string (evita Date vs string vs TZ)
 */
function normalizeScalar(key: string, value: any) {
  if (value == null) return value;

  if (key === 'delivery_cost') {
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
  }

  if (
    key === 'delivery_date' ||
    key === 'shipping_date' ||
    key === 'created_at' ||
    key === 'updated_at'
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
//  DIFF PRINCIPAL OBJETO A OBJETO
// ============================================================

/**
 * Compara dos objetos planos o anidados y devuelve un objeto con las diferencias.
 * Para cada propiedad, si el valor es distinto en obj1 y obj2, devuelve el valor de obj2.
 * En caso de objetos anidados, compara recursivamente y devuelve solo las diferencias.
 * 
 * @param obj1 - Primer objeto para comparación.
 * @param obj2 - Segundo objeto para comparación.
 * @returns Un objeto con las propiedades que difieren, tomando los valores de obj2.
 *
 * ⚠️ CAMBIOS:
 * - En comparación de primitivos, ahora se devuelve obj2 (antes devolvía obj1).
 * - Comparación de File: se usa `instanceof File` en ambos lados y `await` cuando aplica.
 * - Se aplica `normalizeScalar` a primitivos para evitar falsos positivos (ej. delivery_cost).
 */
async function diffObjects(obj1: any, obj2: any): Promise<Record<string, any>> {
  const result: Record<string, any> = {};

  // Si no son objetos válidos, comparar directamente
  if (
    typeof obj1 !== "object" || obj1 === null ||
    typeof obj2 !== "object" || obj2 === null
  ) {
    // CAMBIO: retornar el valor de obj2 cuando difiere (antes retornaba obj1)
    return obj1 !== obj2 ? (obj2 as any) : {};
  }

  // Arrays: política simple — si cambia length o algún elemento, devolver array completo de obj2
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2)) {
      return obj2; // tipo distinto (array vs no array)
    }
    if (obj1.length !== obj2.length) {
      return obj2;
    }
    for (let i = 0; i < obj1.length; i++) {
      const sub = await diffObjects(obj1[i], obj2[i]);
      if (Object.keys(sub).length > 0) {
        return obj2;
      }
    }
    return {}; // arrays iguales
  }

  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of keys) {
    if (key === "id") continue; // Ignorar id

    const val1 = obj1[key];
    const val2 = obj2[key];

    // Comparar Files (o objetos File-like) con isSameFile async
    // ⚠️ CAMBIO: la guarda ahora verifica ambos lados como File
    if (val1 instanceof File && val2 instanceof File) {
      const sameFile = await (async () => {
        const strip = (s: string) => s.replace(/^data:.*;base64,/, '');
        const [b64a, b64b] = await Promise.all([fileToBase64(val1), fileToBase64(val2)]);
        return strip(b64a) === strip(b64b);
      })();
      if (!sameFile) {
        result[key] = val2;
      }
      continue;
    }

    // Caso mixto: base64 string vs File
    if (typeof val1 === 'string' && val2 instanceof File && /^data:.*;base64,/.test(val1)) {
      const same = await isSameFile(val1, val2);
      if (!same) result[key] = val2;
      continue;
    }
    if (typeof val2 === 'string' && val1 instanceof File && /^data:.*;base64,/.test(val2)) {
      const same = await isSameFile(val2, val1);
      if (!same) result[key] = val2;
      continue;
    }

    const bothObjects =
      typeof val1 === "object" &&
      val1 !== null &&
      typeof val2 === "object" &&
      val2 !== null;

    if (bothObjects) {
      const nestedDiff = await diffObjects(val1, val2);
      if (Object.keys(nestedDiff).length > 0) {
        result[key] = nestedDiff;
      }
    } else {
      // CAMBIO: normalizar antes de comparar (evita "2125.2500" vs 2125.25)
      const n1 = normalizeScalar(key, val1);
      const n2 = normalizeScalar(key, val2);
      if (n1 !== n2) {
        result[key] = val2;
      }
    }
  }

  return result;
}


// ============================================================
//  DIFF DE ARREGLOS (por id) 
// ============================================================

/**
 * Compara dos arreglos de objetos que deben contener una propiedad 'id'.
 * Retorna los objetos que fueron añadidos, modificados o eliminados al pasar de arr1 a arr2.
 * 
 * - added: objetos nuevos en arr2 que no existían en arr1 (id undefined o inexistente en arr1).
 * - modified: objetos con mismo id pero con diferencias en sus propiedades (excepto 'id').
 * - deleted: objetos que existían en arr1 pero no están en arr2.
 * 
 * @param arr1 - Arreglo original de objetos con propiedad 'id'.
 * @param arr2 - Arreglo actualizado de objetos con propiedad 'id'.
 * @returns Un objeto con arreglos { added, modified, deleted }.
 *
 * ⚠️ CAMBIO: ahora es async porque `deepDiff`/`diffObjects` pueden requerir `await`
 * (comparación de File/base64).
 *
 * ⚠️ CAMBIO IMPORTANTE (para evidencias con File[]):
 * - Si el arreglo contiene Files, se usa un modo especializado:
 *    • Se genera un id por contenido (SHA-256) para cada File (mismo contenido ⇒ mismo id).
 *    • No se hace spread de File (sus props no son enumerables). Se guarda { id, file }.
 *    • Para Files, "modified" suele quedar vacío: si cambia contenido, cambia el id ⇒ deleted + added.
 *
 * ⚠️ CAMBIO DUPLICADOS:
 * - Ahora se comparan FRECUENCIAS (multiset). Si hay varias copias del mismo archivo,
 *   se reporta cuántas se agregaron o eliminaron (no solo presencia).
 */
async function diffObjectArrays(arr1: any[], arr2: any[]) {
  const modified: any[] = [];
  const added: any[] = [];
  const deleted: any[] = [];

  // ¿Hay Files en alguno de los dos arrays?
  const hasFiles = arr1.some(x => x instanceof File) || arr2.some(x => x instanceof File);

  if (hasFiles) {
    // ======== MODO FILES (evidencias) ========
    const ids1: string[] = [];
    const ids2: string[] = [];
    const map1 = new Map<string, File>();
    const map2 = new Map<string, File>();

    // Soporta tanto File directo como envoltorio { id?, path: File }
    for (const f of arr1) {
      if (f instanceof File) {
        const id = await getFileId(f);
        ids1.push(id);
        map1.set(id, f);
      } else if (f && typeof f === 'object' && f.path instanceof File) {
        const id = f.id ?? await getFileId(f.path);
        ids1.push(id);
        map1.set(id, f.path);
      }
    }
    for (const f of arr2) {
      if (f instanceof File) {
        const id = await getFileId(f);
        ids2.push(id);
        map2.set(id, f);
      } else if (f && typeof f === 'object' && f.path instanceof File) {
        const id = f.id ?? await getFileId(f.path);
        ids2.push(id);
        map2.set(id, f.path);
      }
    }

    // ⚠️ CAMBIO DUPLICADOS: comparar por FRECUENCIAS (multiset), no solo por presencia
    const freq1 = new Map<string, number>();
    const freq2 = new Map<string, number>();
    for (const id of ids1) freq1.set(id, (freq1.get(id) ?? 0) + 1);
    for (const id of ids2) freq2.set(id, (freq2.get(id) ?? 0) + 1);

    // added: para cada id, si freq2 > freq1, empujar (freq2 - freq1) veces
    for (const [id, c2] of freq2) {
      const c1 = freq1.get(id) ?? 0;
      const delta = c2 - c1;
      for (let i = 0; i < delta; i++) {
        if (delta > 0) added.push({ id, path: map2.get(id)! }); // ⚠️ no spread del File
      }
    }

    // deleted: para cada id, si freq1 > freq2, empujar (freq1 - freq2) veces
    for (const [id, c1] of freq1) {
      const c2 = freq2.get(id) ?? 0;
      const delta = c1 - c2;
      for (let i = 0; i < delta; i++) {
        if (delta > 0) deleted.push({ id, path: map1.get(id)! });
      }
    }

    // modified: normalmente vacío para Files (si cambia contenido ⇒ cambia id)
    return { added, modified, deleted };
  }

  // ======== MODO OBJETOS con id (comportamiento original) ========
  // Mapeo rápido de obj por id en arr1
  const mapOrig = new Map(arr1.map(obj => [obj?.id, obj]));
  // Conjunto con ids presentes en arr2
  const idsInUpdated = new Set(arr2.map(obj => obj?.id));

  for (const obj2 of arr2) {
    const id = obj2?.id;
    const obj1 = mapOrig.get(id);

    // Si no tiene id o no existe en arr1, es añadido
    if (!id || !obj1) {
      added.push({ id: id ?? undefined, ...obj2 });
      continue;
    }

    // Diferencias entre objeto original y actualizado
    // ⚠️ CAMBIO: usar diffObjects async (soporta Files)
    const diff = await diffObjects(obj1, obj2);
    if (Object.keys(diff).length > 0) {
      modified.push({ id, ...diff });
    }
  }

  // Detectar eliminados: en arr1 pero no en arr2
  for (const obj1 of arr1) {
    if (!idsInUpdated.has(obj1?.id)) {
      deleted.push(obj1); // o solo { id: obj1.id }
    }
  }

  return { added, modified, deleted };
}


// ============================================================
//  DEEP DIFF (OBJETO vs OBJETO SIN 'id')
// ============================================================

/**
 * Compara dos objetos (sin considerar la propiedad 'id') y devuelve las propiedades
 * que difieren tomando los valores del primer objeto (obj1).
 * Si hay propiedades anidadas y diferentes, incluye la propiedad completa (no solo la diferencia anidada).
 * 
 * Nota: puede modificarse para devolver cambios más precisos anidados si se desea.
 * 
 * @param obj1 - Objeto original.
 * @param obj2 - Objeto actualizado.
 * @returns Objeto con las propiedades que difieren, tomando valores de obj1.
 *
 * ⚠️ NOTA IMPORTANTE:
 * Mantengo tu firma y comentarios, pero para soportar Files correctamente esta
 * versión debería ser async (porque comparar Files requiere `await`). Si tu
 * flujo NECESITA síncrona, no podrás hacer comparación real de File aquí.
 * A continuación dejo una versión **async** coherente con `diffObjects`.
 */
async function deepDiff(obj1: any, obj2: any): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of keys) {
    if (key === "id") continue; // Ignorar id

    const val1 = obj1[key];
    const val2 = obj2[key];

    // Comparar archivos si ambos son del tipo File
    // ⚠️ CAMBIO: usa await para comparación real de contenido
    if (val1 instanceof File && val2 instanceof File) {
      const strip = (s: string) => s.replace(/^data:.*;base64,/, '');
      const [b64a, b64b] = await Promise.all([fileToBase64(val1), fileToBase64(val2)]);
      if (strip(b64a) !== strip(b64b)) {
        result[key] = val2; // Considera que el archivo cambió
      }
      continue;
    }

    // Caso mixto: base64 string vs File
    if (typeof val1 === 'string' && val2 instanceof File && /^data:.*;base64,/.test(val1)) {
      const same = await isSameFile(val1, val2);
      if (!same) result[key] = val2;
      continue;
    }
    if (typeof val2 === 'string' && val1 instanceof File && /^data:.*;base64,/.test(val2)) {
      const same = await isSameFile(val2, val1);
      if (!same) result[key] = val2;
      continue;
    }

    const bothObjects =
      typeof val1 === "object" &&
      val1 !== null &&
      typeof val2 === "object" &&
      val2 !== null;

    if (bothObjects) {
      // Arrays: política simple — si cambia algo, tomar obj2 completo
      if (Array.isArray(val1) || Array.isArray(val2)) {
        if (!Array.isArray(val1) || !Array.isArray(val2) || val1.length !== val2.length) {
          result[key] = val2;
        } else {
          let changed = false;
          for (let i = 0; i < val1.length; i++) {
            const d = await deepDiff(val1[i], val2[i]);
            if (Object.keys(d).length > 0) {
              changed = true;
              break;
            }
          }
          if (changed) result[key] = val2;
        }
      } else {
        const nested = await deepDiff(val1, val2);
        if (Object.keys(nested).length > 0) {
          result[key] = nested;
        }
      }
    } else {
      // CAMBIO: normalizar antes de comparar (evita falsos positivos)
      const n1 = normalizeScalar(key, val1);
      const n2 = normalizeScalar(key, val2);
      if (n1 !== n2) {
        // Aquí devolver el valor actualizado para aplicar el cambio
        result[key] = val2;
      }
    }
  }

  return result;
}

export {
  deepDiff,
  diffObjects,
  diffObjectArrays
}
