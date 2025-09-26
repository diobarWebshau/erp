import type { FilterFn, Row } from '@tanstack/react-table';

/**
 * Filtro booleano para TanStack Table.
 * Compara el valor de la celda con el valor del filtro usando igualdad estricta (===).
 * 
 * @template T - Tipo de datos de la fila.
 * @param {Row<T>} row - Objeto fila que contiene los valores.
 * @param {string} columnId - Id de la columna que se está filtrando.
 * @param {unknown} filterValue - Valor del filtro (debe ser booleano o compatible).
 * @returns {boolean} true si el valor de la celda es igual al filtro, false en caso contrario.
 *
 * Uso típico: filtrar filas que tienen el valor booleano exacto (true o false).
 */
const equalsBooleanFilter: FilterFn<any> =
  <T,>(row: Row<T>, columnId: string, filterValue: unknown) =>
    row.getValue(columnId) === filterValue;

export default equalsBooleanFilter;
