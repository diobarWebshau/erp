// import { type FilterFn } from '@tanstack/react-table';

// const startsWithFilter: FilterFn<any> = (row, columnId, filterValue) => {
//     const rowValue = row.getValue<string>(columnId);

//     if (typeof rowValue !== 'string') return false;

//     // Compara si el valor de la fila empieza con el filtro, ignorando mayúsculas/minúsculas
//     return rowValue.toLowerCase().startsWith(String(filterValue).toLowerCase());
// };

// export default startsWithFilter;



import { type FilterFn } from '@tanstack/react-table';

const includesSomeFilter: FilterFn<any> = (row, columnId, filterValue) => {
    const rowValue = row.getValue<string>(columnId);

    // Asegura que filterValue es un array y rowValue es string
    if (!Array.isArray(filterValue) || typeof rowValue !== 'string') return false;

    // Verifica si al menos una opción del array está incluida (ignorando mayúsculas)
    return filterValue.some(
        (filterItem) => rowValue.toLowerCase() === filterItem.toLowerCase()
    );
};

export default includesSomeFilter;
