// ----------------------------
// ARCHIVO COMPLETO (TypeScript)
// ----------------------------

import React, {
    useMemo,
    useState,
    useCallback,
    type PropsWithChildren
} from "react";

import {
    DndContext,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";

import {
    restrictToParentElement,
    // restrictToFirstScrollableAncestor,
} from "@dnd-kit/modifiers";

import { closestCenter } from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
    type Table,
} from "@tanstack/react-table";

import { CSS } from "@dnd-kit/utilities";

// ----------------------------------------------------------------------
// Tipos globales
// ----------------------------------------------------------------------
interface Person {
    id: string;
    name: string;
    age: number;
    sort_order: number;
}

// ----------------------------------------------------------------------
// 1) Sensores DnD
// ----------------------------------------------------------------------
function useDndSensors() {
    return useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
}

// ----------------------------------------------------------------------
// 2) Hook DnD filas
// ----------------------------------------------------------------------
function useDndTableRows(
    rows: Person[],
    setRows: (rows: Person[]) => void
) {
    const items = useMemo(() => rows.map((r) => r.id), [rows]);

    const onDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over) return;
            if (active.id === over.id) return;

            const oldIndex = items.indexOf(active.id as string);
            const newIndex = items.indexOf(over.id as string);

            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove(rows, oldIndex, newIndex).map(
                (r, idx) => ({ ...r, sort_order: idx + 1 })
            );

            setRows(reordered);
        },
        [rows, items, setRows]
    );

    return { items, onDragEnd };
}

// ----------------------------------------------------------------------
// 3) Fila draggable con handle en una columna
// ----------------------------------------------------------------------
function DraggableRow({
    row,
    children,
}: PropsWithChildren<{ row: { id: string } }>) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
    } = useSortable({
        id: row.id,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <tr ref={setNodeRef} style={style}>
            {/* children contiene TODAS las celdas
          el handle solo se aplicará en la celda "drag" */}
            {React.Children.map(children, (child: any) => {
                if (!child) return child;

                // Detectamos la celda con data-type="drag"
                if (child.props["data-type"] === "drag") {
                    return React.cloneElement(child, {
                        ...child.props,
                        // solo esta celda tendrá listeners
                        ...attributes,
                        ...listeners,
                    });
                }

                return child;
            })}
        </tr>
    );
}

// ----------------------------------------------------------------------
// 4) Tabla completa
// ----------------------------------------------------------------------
function MyTable({
    table,
    rows,
    setRows,
}: {
    table: Table<Person>;
    rows: Person[];
    setRows: (rows: Person[]) => void;
}) {
    const sensors = useDndSensors();
    const { items, onDragEnd } = useDndTableRows(rows, setRows);

    /* 
        Esencialmente, si el contenedor donde ocurrirá el drag-and-drop 
        (table, tbody, o div) no tiene una propiedad de posicionamiento
        (`position: relative`, `position: absolute`, etc.), dnd-kit no puede 
        calcular correctamente los límites del área arrastrable.
    
        Esto sucede porque los modificadores de dnd-kit que restringen el 
        movimiento —como `restrictToParentElement` y 
        `restrictToFirstScrollableAncestor`— necesitan un "containing block"
        válido, es decir, un elemento padre que defina un contexto de 
        posicionamiento. Si este contexto no existe, dnd-kit usa el `<body>` 
        como referencia por defecto, permitiendo que el ítem se salga visualmente 
        del área de la tabla.
    
        ¿Por qué envolver una tabla en un <div>?
        ----------------------------------------
        Aunque técnicamente se podría aplicar `position: relative` directamente 
        en la tabla, HTML tiene un comportamiento particular:
    
        - Las tablas *no admiten* scroll directamente (HTML ignora overflow en <table>).
        - Los navegadores redirigen el scroll al contenedor padre, no a la tabla.
        - Por lo tanto, una tabla rara vez es un contenedor scrollable válido.
        - dnd-kit, al buscar el primer ancestro con overflow scrollable, no 
          encontrará al table, sino a su padre o incluso al body.
    
        Por este motivo, envolver la tabla en un <div> con 
            position: relative,
            overflow: auto,
            y un height limitado,
        establece un contenedor claro, scrollable y posicionado, 
        permitiendo que los modificadores de dnd-kit funcionen exactamente 
        como se espera.
    
        En resumen:
        ----------
        ✔ El <div> actúa como "bounding container" real del drag-and-drop
        ✔ Garantiza que los items nunca se salgan de la tabla
        ✔ Permite scroll vertical sin romper el cálculo de límites
        ✔ Cumple con la especificación de dnd-kit para contenedores restringidos
        ✔ Evita comportamientos inesperados causados por las limitaciones del <table>
    
    */

    /*
        IMPORTANTE: Si la tabla tiene scroll, solo debe utilizarse 
        `restrictToFirstScrollableAncestor` y NO `restrictToParentElement`.

        ¿Por qué?

        `restrictToParentElement` limita el drag al "bounding box" del padre 
        posicionado (el primer ancestor con `position: relative`, `absolute`, 
        `fixed` o `sticky`). Sin embargo, en una tabla con scroll, este padre 
        normalmente NO es el elemento que realmente controla el área visible. 

        En HTML, las tablas no manejan scroll directamente; el scroll 
        siempre lo administra un contenedor externo (generalmente un <div>). 
        Esto significa que el padre posicionado NO coincide con el contenedor 
        scrollable. Cuando se aplica `restrictToParentElement` en este caso, 
        dnd-kit restringe el movimiento al tamaño real de la tabla completa 
        y no al viewport visible. 

        Resultado:
        ----------
        - El item puede salirse de la zona visible del scroll.
        - Se mueve fuera de la ventana scrollable.
        - Se superpone a otros elementos de la página.
        - El comportamiento es inconsistente y rompe la UX.

        Por el contrario, `restrictToFirstScrollableAncestor` está diseñado 
        específicamente para escenarios con scroll. Este modificador busca 
        automáticamente el primer ancestro que tenga overflow scrollable 
        (`overflow: auto`, `overflow-y: scroll`, etc.) y limita el movimiento 
        dentro de ese rectángulo visible.

        Beneficios:
        -----------
        ✔ El item nunca sale del área visible del scroll.
        ✔ El comportamiento es fluido incluso con scroll dinámico.
        ✔ Respeta correctamente los límites del viewport del contenedor.
        ✔ Es compatible con tablas grandes y paneles con overflow.
        ✔ Coincide con el patrón usado por Notion, Jira, Linear, Trello, etc.

        En una tabla con scroll, `restrictToParentElement` introduce una 
        restricción incorrecta, mientras que `restrictToFirstScrollableAncestor` 
        proporciona la experiencia de usuario adecuada y el comportamiento 
        esperado del drag-and-drop.

        Por estas razones, cuando se trabaja con tablas scrollables, se debe 
        usar únicamente:

            modifiers={[restrictToFirstScrollableAncestor]}

        Y evitar `restrictToParentElement`, ya que no modela correctamente 
        el caso de uso de tablas con scroll.
    */

    /* 
    
        Los dos modificadores de dnd-kit no cumplen la misma función ni actúan sobre
        el mismo tipo de límite: restrictToParentElement impone un límite absoluto,
        restringiendo el movimiento del ítem al rectángulo completo del padre 
        posicionado, sin importar si existe scroll o no, creando un borde duro que
        no puede cruzarse. En cambio, restrictToFirstScrollableAncestor impone un
        límite relativo, restringiendo únicamente al viewport visible del primer contenedor
        que realmente tenga scroll (overflow: auto o scroll). Esto significa que solo
        limita el arrastre dentro del área visible de ese contenedor, no dentro del 
        tamaño total del padre. Y lo más importante: si no existe un ancestro scrollable
        —es decir, si el elemento no está dentro de un verdadero contenedor con overflow
        scrollable— entonces este modificador no aplica ninguna restricción en absoluto,
        lo que permite que el ítem se mueva libremente fuera del padre, incluso saliendo
        visualmente de la tabla o de su contenedor inmediato.
    
    */

    return (
        <DndContext
            sensors={sensors} onDragEnd={onDragEnd}
            // 
            collisionDetection={closestCenter}
            modifiers={[
                restrictToParentElement,              // <-- evita salir del padre
                // restrictToFirstScrollableAncestor,    // <-- evita salir del contenedor con scroll
            ]}
        >
            <SortableContext items={items}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        style={{
                                            padding: "8px",
                                            border: "1px solid #999",
                                            background: "#f1f1f1",
                                        }}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <DraggableRow key={row.id} row={{ id: row.id }}>
                                {row.getVisibleCells().map((cell) => {
                                    const isDragCell =
                                        cell.column.id === "drag";

                                    return (
                                        <td
                                            key={cell.id}
                                            data-type={isDragCell ? "drag" : undefined}
                                            style={{
                                                border: "1px solid #ddd",
                                                padding: "8px",
                                                cursor: isDragCell ? "grab" : "default",
                                                width: isDragCell ? 40 : undefined,
                                                textAlign: isDragCell ? "center" : "left",
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    );
                                })}
                            </DraggableRow>
                        ))}
                    </tbody>
                </table>
            </SortableContext>
        </DndContext>
    );
}

// ----------------------------------------------------------------------
// 5) Contenedor principal
// ----------------------------------------------------------------------
function AppTableContainer() {
    const [rows, setRows] = useState<Person[]>([
        { id: "1", name: "Juan", age: 28, sort_order: 1 },
        { id: "2", name: "Ana", age: 32, sort_order: 2 },
        { id: "3", name: "Luis", age: 25, sort_order: 3 },
    ]);

    const columns = useMemo<ColumnDef<Person>[]>(
        () => [
            {
                id: "drag",
                header: "",
                cell: () => <span style={{ fontSize: 20 }}>⋮⋮</span>,
            },
            {
                accessorKey: "sort_order",
                header: "Orden",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "name",
                header: "Nombre",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "age",
                header: "Edad",
                cell: (info) => info.getValue(),
            },
        ],
        []
    );

    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
    });

    return <MyTable table={table} rows={rows} setRows={setRows} />;
}

// ----------------------------------------------------------------------
// 6) Ejemplo final
// ----------------------------------------------------------------------
function App() {
    return (
        <div style={{ padding: 20 }}>
            <h2>Tabla con Drag Handle + sort_order</h2>
            <AppTableContainer />
        </div>
    );
}

export default App;


/* 

    1. Drag Overlay (Ghost Item visual)

    Implementar un overlay visual dedicado para evitar saltos, controlar opacidad, estilos, sombras y asegurar una experiencia estable mientras se arrastra.

    2. Auto-scroll durante el arrastre

    El sistema debe desplazar el contenedor automáticamente cuando el usuario arrastra hacia los bordes, especialmente en tablas largas o paneles con scroll.

    3. Collision detection optimizado

    El método de detección de colisiones debe ajustarse a estructuras tabulares; detectores como closestCorners o uno personalizado generan un comportamiento más preciso que el default.

    4. Press delay para evitar arrastres accidentales

    Debe establecerse un retraso mínimo o tolerancia antes de activar el drag para evitar que clics rápidos, selecciones de texto o taps cortos activen el arrastre involuntariamente.

    5. Deshabilitar arrastre durante edición

    Si una fila contiene inputs u otros elementos interactivos, el drag debe deshabilitarse automáticamente o ignorarse mientras hay un elemento editable enfocado.

    6. Manejo de variaciones en la altura de las filas

    Las filas con contenido dinámico, tooltips o textos multilínea pueden provocar saltos durante el arrastre; se deben usar animaciones de layout para mantener transiciones suaves.

    7. Accesibilidad con teclado

    El sistema debe soportar operaciones de arrastre mediante teclado: iniciar drag, confirmar, mover elementos con flechas y seguir las reglas de accesibilidad ARIA para listas reordenables.

    8. Compatibilidad con dispositivos móviles

    El drag handle debe adaptarse a interacciones táctiles: áreas más grandes, manejo adecuado de scroll táctil, y evitar conflictos mediante configuraciones como touch-action: none.

    9. Persistencia del orden en backend

    El reordenamiento debe sincronizarse con el servidor de manera eficiente: persistencia del orden, debounce para evitar múltiples requests y garantía de consistencia incluso si hay filtros activos.

    10. Sincronización del orden con filtros, paginación y estados

    Al modificar filtros, ordenamientos o paginación, el sistema debe garantizar que el sort_order siga siendo coherente en todos los contextos.

    11. Soporte para “sortable by groups”

    En tablas con secciones, agrupaciones o subniveles, se requiere gestionar múltiples contextos de orden, evitar saltos entre grupos y validar movimientos según reglas de negocio.

    12. Placeholders y visualización del drop target

    El usuario debe ver un indicador claro del lugar donde caerá el elemento: línea de inserción, highlight de fila, placeholder o sombreado, al estilo Trello o Notion.

*/