

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Compara si un base64 y un File tienen el mismo contenido.
   * base64String debe ser un string en formato "data:[mime];base64,..."
   */
  async function isSameFile(base64String: string, file: File): Promise<boolean> {
    const fileBase64 = await fileToBase64(file);
    // Compara base64 directamente
    return base64String === fileBase64;
  }
  



/**
 * Compara dos objetos planos o anidados y devuelve un objeto con las diferencias.
 * Para cada propiedad, si el valor es distinto en obj1 y obj2, devuelve el valor de obj2.
 * En caso de objetos anidados, compara recursivamente y devuelve solo las diferencias.
 * 
 * @param obj1 - Primer objeto para comparación.
 * @param obj2 - Segundo objeto para comparación.
 * @returns Un objeto con las propiedades que difieren, tomando los valores de obj2.
 */
// function diffObjects(obj1: any, obj2: any): Record<string, any> {
//     const result: Record<string, any> = {};

//     if (
//         typeof obj1 !== "object" || obj1 === null ||
//         typeof obj2 !== "object" || obj2 === null
//     ) {
//         return obj1 !== obj2 ? obj1 : {};
//     }

//     const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

//     for (const key of keys) {
//         const val1 = obj1[key];
//         const val2 = obj2[key];

//         const bothObjects = typeof val1 === "object" && val1 !== null && typeof val2 === "object" && val2 !== null;

//         if (bothObjects) {
//             const nestedDiff = diffObjects(val1, val2);
//             if (Object.keys(nestedDiff).length > 0) {
//                 result[key] = nestedDiff;
//             }
//         } else if (val1 !== val2) {
//             result[key] = val2;
//         }
//     }

//     return result;
// }


async function diffObjects(obj1: any, obj2: any): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
  
    // Si no son objetos válidos, comparar directamente
    if (
      typeof obj1 !== "object" || obj1 === null ||
      typeof obj2 !== "object" || obj2 === null
    ) {
      return obj1 !== obj2 ? obj1 : {};
    }
  
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  
    for (const key of keys) {
      if (key === "id") continue; // Ignorar id
  
      const val1 = obj1[key];
      const val2 = obj2[key];
  
      // Comparar Files (o objetos File-like) con isSameFile async
      if (val1 && val2 instanceof File) {
        const sameFile = await isSameFile(val1, val2);
        if (!sameFile) {
          result[key] = val2;
        }
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
      } else if (val1 !== val2) {
        result[key] = val2;
      }
    }
  
    return result;
  }
  


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
 */
  function diffObjectArrays(arr1: any[], arr2: any[]) {
      const modified: any[] = [];
      const added: any[] = [];
      const deleted: any[] = [];

      // Mapeo rápido de obj por id en arr1
      const map1 = new Map(arr1.map(obj => [obj.id, obj]));
      // Conjunto con ids presentes en arr2
      const idsInUpdated = new Set(arr2.map(obj => obj.id));

      for (const obj2 of arr2) {
          const id = obj2.id;
          const obj1 = map1.get(id);

          // Si no tiene id o no existe en arr1, es añadido
          if (!id || !obj1) {
              added.push({ id: id ?? undefined, ...obj2 });
              continue;
          }

          // Diferencias entre objeto original y actualizado
          const diff = deepDiff(obj1, obj2);
          if (Object.keys(diff).length > 0) {
              modified.push({ id, ...diff });
          }
      }

      // Detectar eliminados: en arr1 pero no en arr2
      for (const obj1 of arr1) {
          if (!idsInUpdated.has(obj1.id)) {
              deleted.push(obj1); // o solo { id: obj1.id }
          }
      }

      return { added, modified, deleted };
  }

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
 */
// function deepDiff(obj1: any, obj2: any): Record<string, any> {
//     const result: Record<string, any> = {};
//     const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

//     for (const key of keys) {
//         if (key === "id") continue; // Ignorar id

//         const val1 = obj1[key];
//         const val2 = obj2[key];

//         const bothObjects =
//             typeof val1 === "object" &&
//             val1 !== null &&
//             typeof val2 === "object" &&
//             val2 !== null;

//         if (bothObjects) {
//             const nested = deepDiff(val1, val2);
//             if (Object.keys(nested).length > 0) {
//                 // Devuelve solo la diferencia anidada para actualizar solo lo que cambió
//                 result[key] = nested;
//             }
//         } else if (val1 !== val2) {
//             // Aquí devolver el valor actualizado para aplicar el cambio
//             result[key] = val2;
//         }
//     }

//     return result;
// }

function deepDiff(obj1: any, obj2: any): Record<string, any> {
    const result: Record<string, any> = {};
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    for (const key of keys) {
        if (key === "id") continue; // Ignorar id

        const val1 = obj1[key];
        const val2 = obj2[key];

        // Comparar archivos si ambos son del tipo File
        if (val1 && val2 instanceof File) {
            if (!isSameFile(val1, val2)) {
                result[key] = val2; // Considera que el archivo cambió
            }
            continue;
        }

        const bothObjects =
            typeof val1 === "object" &&
            val1 !== null &&
            typeof val2 === "object" &&
            val2 !== null;

        if (bothObjects) {
            const nested = deepDiff(val1, val2);
            if (Object.keys(nested).length > 0) {
                result[key] = nested;
            }
        } else if (val1 !== val2) {
            result[key] = val2;
        }
    }

    return result;
}


export {
    deepDiff,
    diffObjects,
    diffObjectArrays
}