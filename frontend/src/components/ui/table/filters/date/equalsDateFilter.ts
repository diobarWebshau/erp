import type { FilterFn, Row } from '@tanstack/react-table';
import type { ObjectDateFilter } from "./../../types"

/**
 * Filtro personalizado para comparar si la fecha de una fila
 * es igual a la fecha seleccionada (ignorando la hora).
 */
const equalsDateFilter: FilterFn<any> = <T,>(row: Row<T>, columnId: string, filterValue: ObjectDateFilter) => {
  // Obtiene el valor de la columna como string ISO (por ejemplo: "2023-07-30T00:00:00.000Z")
  const rowValue = row.getValue<string>(columnId);

  // Muestra el valor del filtro (esperado: { from: Date })

  // Si el valor de la fila no existe, se excluye de los resultados
  if (!rowValue) return false;

  // Si el filtro es null o undefined, se muestran todas las filas
  if (filterValue == null) return true;

  // Se extrae la propiedad 'from' del filtro (esperado: un objeto Date)
  const { from } = filterValue as ObjectDateFilter;

  // Si 'from' no está definido, se muestra todo (no se aplica filtro)
  if (!from) return true;

  // Convierte el valor de la fila en objeto Date
  const rowDate = new Date(rowValue);

  // Si la fecha es inválida, se descarta la fila
  if (isNaN(rowDate.getTime())) return false;

  // Función para normalizar una fecha: remueve la hora (solo queda año, mes, día)
  const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  // Normaliza la fecha de la fila y la del filtro
  const rowNormalized = normalize(rowDate);
  const filterNormalized = normalize(from);

  // Devuelve true solo si ambas fechas normalizadas coinciden
  return rowNormalized.getTime() === filterNormalized.getTime();
};

export default equalsDateFilter;
