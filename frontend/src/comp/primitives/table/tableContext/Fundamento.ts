

// ! LOGICA PARA LA DECLARACION DE LA COLUMNAS DE LA TABLA
/**
 *
 * @types
 *  - @RowSelectionState
 *      representa el estado de selección de las filas. Es un objeto en el que las claves son
 *      los IDs de las filas seleccionadas y los valores son booleanos.
 *      Se usa generalmente con `useState` y se pasa a `useReactTable`.
 *
 *
 * @options
 *  - @enableRowSelection
 *      opción booleana o función que define si se puede seleccionar alguna o todas las filas.
 *      Se pasa a `useReactTable`. Si es `true`, habilita la selección en todas las filas.
 *
 *  - @onRowSelectionChange
 *      se ejecuta cada vez que el usuario selecciona o deselecciona una fila.
 *      Se utiliza para sincronizar el estado `rowSelection` con `setRowSelection`.
 *
 * @requirements @row
 *  - @getIsSelected
 *      método que devuelve `true` si la fila actual está seleccionada.
 *  - @toggleSelected
 *      método que alterna el estado de selección de la fila actual.
 *  - @getCanSelect
 *      método que indica si una fila puede ser seleccionada (por ejemplo, si se deshabilita).
 *  - @getToggleSelectedHandler
 *
 *
 * @requirements @table
 *  - @getSelectedRowModel
 *      método de la tabla para obtener todas las filas seleccionadas. Devuelve un modelo
 *      de filas que puede ser iterado o transformado según sea necesario.
 *  - @getIsAllPageRowsSelected
 *  - @getToggleAllPageRowsSelectedHandler
 *
 *
 * EJEMPLO DE CICLO:
 * - El usuario hace clic en la checkbox de una fila.
 * - Se dispara `onRowSelectionChange` → actualiza el estado `rowSelection`
 *   con `setRowSelection`.
 * - La tabla evalúa internamente el nuevo estado y `getSelectedRowModel`
 *   calcula las filas seleccionadas.
 * - La interfaz se re-renderiza con las filas seleccionadas actualizadas.
 */


// ! LOGICA PARA LA DECLARACION DE LA COLUMNAS DE LA TABLA
/**
 *
 * @params
 *     -- @id
 *          -- Define un identificador único de la columna. Es obligatorio si no
 *             usas accessorKey ni accessorFn. Útil para columnas virtuales (como
 *             checkboxes, acciones, etc.).
 *
 *     -- @accessKey
 *          -- Define la clave del objeto data que se va a mostrar en esta columna.
 *             Es la forma más simple y común de mapear datos reales.
 *
 *     -- @header
 *          -- renderizacion en el encabezado de la columna en la tabla
 *          -- se envia el contexto del header que tiene un objeto que referencia
 *             al objeto completo de la tabla, porque este checkbox controla la
 *             seleccion de todas las filas
 *          -- Puede ser una cadena, un componente JSX o una función con acceso al
 *             column y al table.
 *     -- @cell
 *          -- renderizacion en cada celda de la columna en la tabla
 *          -- se envia unicamente la row, porque solo controla la seleccion de esa row
 *          -- Define cómo se muestra el contenido de cada celda de la columna(Puede
 *             ser una cadena, un componente JSX o una función).
 *          -- puede recibir { row, getValue, column, table }.
 *     -- @footer
 *          -- (igual que header) Define lo que se renderiza como pie de columna.
 *     -- @enableSorting (boolean)
 *          -- Si la columna puede o no ordenarse. Por defecto: true.
 *     -- @enableHiding (boolean)
 *          -- Permite o impide ocultar la columna desde un control de columnas.
 *     -- @enableColumnFilter
 *          -- Controla si esta columna puede tener filtros aplicados.
 *          -- Por defecto: true.
 *
 */

// ! LÓGICA PARA PAGINACIÓN
/**
 *
 * @types
 *  - @PaginationState
 *      representa el estado actual de la paginación. Es un objeto con
 *      dos propiedades:
 *          `pageIndex` (índice de la página actual, comenzando desde 0) y
 *          `pageSize` (número de filas por página). Este estado debe ser
 *            controlado con `useState`.
 *
 * @functions
 *  - @getPaginationRowModel
 *      función que se pasa a `useReactTable` para obtener el modelo de filas
 *      correspondiente a la página actual, según el `PaginationState`.
 *
 * @options
 *  - @getPaginationRowModel
 *      opción que se proporciona al crear la tabla con `useReactTable`
 *      para habilitar el modelo de paginación. Sin esto, la tabla no sabrá
 *      cómo segmentar las filas.
 *  - @onPaginationChange
 *      función que se ejecuta cada vez que cambia la página o el tamaño de página.
 *      Se utiliza para actualizar el estado `pagination` con `setPagination`.
 *
 * @requirements @table
 *  - @getCanNextPage
 *      retorna `true` si se puede avanzar a la siguiente página.
 *  - @getCanPreviousPage
 *      retorna `true` si se puede retroceder a la página anterior.
 *  - @nextPage
 *      método que avanza el estado de paginación a la siguiente página.
 *  - @previousPage
 *      método que retrocede a la página anterior.
 *  - @setPageIndex
 *      establece manualmente el índice de la página actual.
 *  - @setPageSize
 *      establece cuántas filas se deben mostrar por página.
 *  - @getPageCount
 *      devuelve el número total de páginas calculadas según el total de filas
 *      y el tamaño de página.
 *
 * EJEMPLO DE CICLO:
 * - El usuario hace clic en el botón "Siguiente".
 * - Se ejecuta `nextPage`, lo que incrementa el `pageIndex`.
 * - Se dispara `onPaginationChange` → actualiza el estado `pagination`.
 * - `getPaginationRowModel` calcula las filas correspondientes a la nueva página.
 * - La tabla se re-renderiza mostrando solo las filas de esa página.
 */


// ! LÓGICA PARA ORDENAR (SORTEAR) COLUMNAS
/**
 *
 * @types
 *  - @SortingState
 *      representa el estado actual de ordenamiento de la tabla.
 *      Es un arreglo de objetos que indican qué columna está siendo
 *      ordenada y en qué dirección (ascendente o descendente).
 *  - @ColumnDef
 *      definición de las columnas, incluyendo la configuración que
 *      permite que una columna sea ordenable, como la propiedad
 *      `enableSorting`.
 *
 * @functions
 *  - @getSortedRowModel
 *      función que se utiliza para aplicar el ordenamiento a las filas
 *      de la tabla, basada en el estado de `sorting`. Esta función debe
 *      ser incluida en el constructor `useReactTable` para que la tabla
 *      pueda calcular y renderizar las filas ya ordenadas.
 *
 * @options
 *  - @getSortedRowModel
 *      se pasa como una opción en `useReactTable` para que la tabla sepa
 *      cómo obtener y manejar las filas ordenadas. Internamente, reordena
 *      las filas según la configuración actual de `sorting`.
 *  - @onSortingChange
 *      función que se ejecuta cada vez que se cambia el ordenamiento (por
 *      ejemplo, al hacer clic en un encabezado de columna). Generalmente se
 *      usa para actualizar el estado `sorting` con `setSorting`.
 *
 * @requirements @column
 *  - @getIsSorted
 *      método que indica si la columna está ordenada y en qué dirección
 *      ("asc", "desc" o false).
 *  - @toggleSorting
 *      método que permite alternar el estado de ordenamiento de una
 *      columna.
 *  - @setSorting
 *      función utilizada para modificar el estado global de ordenamiento
 *      (`sorting`) directamente.
 *
 * EJEMPLO DE CICLO:
 * - El usuario da clic en un encabezado de columna.
 * - Se dispara `onSortingChange` → actualiza el estado `sorting`.
 * - El nuevo estado activa `getSortedRowModel` → reorganiza las filas.
 * - La tabla se re-renderiza con las filas ordenadas.
 */


// ! LÓGICA PARA EL FILTRADO
/**
 *
 * @types
 *  - @ColumnFiltersState
 *      representa el estado del filtrado por columna. Es un arreglo de objetos,
 *      donde cada objeto contiene `id` (la columna) y `value` (el valor del filtro).
 *      Este estado se debe controlar con `useState` y pasarse a `useReactTable`.
 *      El orden en el arreglo columnFilters determina el orden en el que se aplican
 *      los filtros.
 *
 * @functions
 *  - @getFilteredRowModel
 *      función que genera un modelo de filas ya filtradas en base a los filtros activos.
 *      Es clave para que la tabla muestre los datos según los criterios de filtrado.
 *
 * @options
 *  - @onColumnFiltersChange
 *      se dispara cada vez que un filtro de columna cambia.
 *      Sirve para actualizar el estado `columnFilters` con `setColumnFilters`.
 *
 *  - @getFilteredRowModel
 *      opción que se pasa al crear la tabla con `useReactTable` para aplicar el filtrado.
 *
 * @requirements @table
 *  - @getCoreRowModel
 *      necesario para que `getFilteredRowModel` tenga acceso a todas las filas base antes
 *      de aplicar filtros.
 *  - @getFilteredRowModel
 *      retorna las filas que cumplen con los filtros activos.
 *
 * @requirements @column
 *  - @enableColumnFilter (opcional)
 *      se puede usar para habilitar o deshabilitar el filtrado por columna individual.
 *  - @filterFn (opcional)
 *      permite definir una función de filtrado personalizada para esa columna.
 *      Si no se proporciona, se usará la función por defecto (por ejemplo, incluye texto).
 *
 *
 * EJEMPLO DE USO:
 * - El usuario escribe texto en un input de filtro.
 * - Se ejecuta `onColumnFiltersChange` → actualiza `columnFilters` con `setColumnFilters`.
 * - La tabla evalúa `columnFilters` y aplica `filterFn` por cada columna filtrada.
 * - `getFilteredRowModel` produce un nuevo conjunto de filas filtradas.
 * - La tabla se re-renderiza mostrando solo las filas que cumplen con los filtros.
 */



// !  LÓGICA PARA OCULTAR COLUMNAS 
/** 
 *
 * @types
 *  - @VisibilityState  
 *      representa el estado actual de visibilidad de las columnas.
 *      Es un objeto donde las claves son los IDs de las columnas y
 *      los valores son booleanos que indican si la columna está visible (true) u oculta (false).
 *  - @ColumnDef  
 *      definición de las columnas, incluyendo la configuración que
 *      permite que una columna pueda ser ocultada, como `enableHiding`.
 *
 * @functions
 *  - @setColumnVisibility  
 *      función que permite establecer manualmente el estado de visibilidad
 *      de las columnas. Se puede usar para mostrar u ocultar columnas
 *      de forma programática.
 *
 * @options
 *  - @onColumnVisibilityChange  
 *      función que se ejecuta cuando se produce un cambio en la visibilidad
 *      de cualquier columna. Generalmente se usa para actualizar el estado
 *      `columnVisibility` con `setColumnVisibility`.
 *
 * @requirements @column  
 *  - @getIsVisible  
 *      método que devuelve un booleano indicando si la columna está actualmente visible.
 *  - @toggleVisibility  
 *      método que alterna (muestra u oculta) la visibilidad de una columna específica.
 *  - @setColumnVisibility  
 *      puede ser utilizado para establecer la visibilidad de múltiples columnas.
 *  - @getCanHide  
 *      Retorna un booleano que indica si la columna puede ocultarse, basado en `enableHiding`.
 *  - @getFacetedRowModel  
 *      Permite acceder a las filas visibles desde la perspectiva de esa columna,
 *      útil por ejemplo para obtener valores únicos o contar resultados de búsqueda.
 * 
 * @requirements @column 
 *  - @getAllColumns  
 *      Devuelve todas las columnas, visibles y no visibles. Ideal para listarlas con su visibilidad.
 *
 *  - @getVisibleLeafColumns 
 *      Devuelve solo las columnas visibles (hojas), útil para renderizado.
 *
 *  - @getState --> props -> @columnVisibility  
 *      Retorna el objeto actual de visibilidad (internamente manejado por TanStack).
 *      
 *  - @getFacetedRowModel
 *      Permite acceder a las filas visibles desde la perspectiva de esa columna,
 *      útil por ejemplo para obtener valores únicos o contar resultados de búsqueda.
 *       
 *      
 * EJEMPLO DE CICLO:
 * - El usuario interactúa con un input o checkbox para ocultar una columna.
 * - Se llama `column.toggleVisibility()` o se actualiza `setColumnVisibility`.
 * - Esto actualiza el estado `columnVisibility`.
 * - La tabla se re-renderiza ocultando o mostrando las columnas según el nuevo estado.
 */


/**
// ! LÓGICA DEL *UPDATER* (Patrón de actualización de estado)
/**
 *
 * @qué_es
 *  - `Updater<T>` es la forma en que TanStack (y React en general) te entrega
 *    una “instrucción” para calcular el **nuevo estado**.
 *  - Puede ser:
 *      1) Un **valor directo** de tipo `T` → “deja este estado tal cual”.
 *      2) Una **función** `(prev: T) => T` → “a partir del estado anterior,
 *         calcula el siguiente”.
 *
 *  - Tipo simplificado:
 *      `type Updater<T> = T | ((prev: T) => T)`
 *
 * @por_qué_existe
 *  - **Evitar condiciones de carrera / estados obsoletos**: si el nuevo estado depende
 *    del anterior (ej. toggles, merges), la forma función garantiza que uses la versión más
 *    reciente del estado.
 *  - **Composición segura** de múltiples cambios consecutivos.
 *
 *
 * @dónde_aparece
 *  - Cualquier callback controlado por la tabla que actualiza estado:
 *      - `onRowSelectionChange(updater: Updater<RowSelectionState>)`
 *      - `onSortingChange(updater: Updater<SortingState>)`
 *      - `onPaginationChange(updater: Updater<PaginationState>)`
 *      - `onColumnFiltersChange(updater: Updater<ColumnFiltersState>)`
 *      - `onColumnVisibilityChange(updater: Updater<VisibilityState>)`
 *  - En todos los casos, el patrón de uso es **idéntico**.
 *
 *
 * @patrón_de_uso
 *  - Siempre **normaliza** el updater para obtener el “next state” real:
 *
 *    const nextState =
 *      typeof updater === 'function'
 *        ? updater(prevState) // pasa el estado actual y recibe el nuevo
 *        : updater;           // ya te dieron el valor final
 *
 *    dispatch(setAlgo(nextState));
 *
 *
 * @ejemplos
 *  - **Reemplazo total** (valor directo):
 *
 *    // Seleccionamos dos filas exactas
 *    onRowSelectionChange({ 'r1': true, 'r3': true });
 *
 *  - **Cambio relativo** (función según el anterior):
 *
 *    // Toggle de una fila según el estado anterior
 *    onRowSelectionChange(prev => {
 *      const next = { ...prev };
 *      next[rowId] = !prev[rowId];
 *      return next;
 *    });
 *
 *  - **Paginación**:
 *
 *    onPaginationChange(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
 *
 *  - **Ordenamiento (push/replace)**:
 *
 *    onSortingChange(prev => {
 *      // si ya existe la columna, alterna; si no, agrégala
 *      const i = prev.findIndex(s => s.id === colId);
 *      if (i >= 0) {
 *        const next = [...prev];
 *        next[i] = { id: colId, desc: !prev[i].desc };
 *        return next;
 *      }
 *      return [...prev, { id: colId, desc: false }];
 *    });
 *
 *
 * @ciclo_general
 *  - El usuario interactúa (clic, input, etc.).
 *  - La tabla llama `onXChange(updater)`.
 *  - Tu handler convierte `updater` → `nextState` (valor directo o función).
 *  - Haces `dispatch(...)` o `setState(nextState)`.
 *  - La tabla recalcula (row models, sorting, filtering) y re-renderiza.
 *
 *
 * @anti_patrones
 *  - **Ignorar que puede ser función**:
 *      // ❌ Asumir siempre objeto
 *      dispatch(set_row_selection(updater as RowSelectionState));
 *      // Entra un updater-función y crashea o actualiza mal.
 *
 *  - **Mutar el prev directamente** en un updater-función:
 *      // ❌ mutación directa
 *      onRowSelectionChange(prev => {
 *        prev[rowId] = !prev[rowId]; // muta!
 *        return prev;                 // retorna la misma ref
 *      });
 *      // ✅ Haz copias inmutables: { ...prev }, prev.slice(), etc.
 *
 *
 * @resumen_rápido
 *  - `Updater` = **valor directo** o **función(prev) → next**.
 *  - Usa el **mismo patrón** para rowSelection, sorting, pagination, filters, visibility.
 *  - Si tu cambio **depende del anterior**, usa la variante **función**.
 *  - Siempre normaliza `updater` antes de `dispatch`/`setState`.
 */
