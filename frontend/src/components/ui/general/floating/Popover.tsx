import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom"; // Para crear un portal React y renderizar fuera del DOM normal
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react-dom"; 
// useFloating: hook que calcula posición flotante inteligente para popovers/tooltips
// offset, flip, shift: middlewares para ajustar la posición (desplazamiento, volteo, desplazamiento dentro viewport)
// autoUpdate: función para actualizar la posición automáticamente al cambiar scroll o tamaño
import { useClickOutside } from "../../table/customHooks/useClickOutside"; 
// hook personalizado para detectar clicks fuera de elementos referenciados y disparar callback

export default function FloatingPopoverExample() {
    // Estado local que controla si el popover está abierto o cerrado
    const [open, setOpen] = useState(false);

    // useFloating devuelve las coordenadas x,y donde debe posicionarse el floating,
    // además del strategy CSS (fixed/absolute) y refs para el elemento flotante y referencia
    // Se configuran middlewares para que el popover:
    // - esté a 6px de offset
    // - se voltee si no hay espacio abajo
    // - se desplace para no salirse del viewport (con 8px padding)
    const { x, y, strategy, refs, update, floatingStyles } = useFloating({
        placement: "bottom-start", // posición preferida abajo a la izquierda del botón
        middleware: [
            offset(6),
            flip(),
            shift({ padding: 8 }),
        ],
    });

    // Refs para acceder a los nodos DOM del popover (flotante) y botón (referencia)
    const floatingRef = useRef<HTMLElement | null>(null);
    const referenceRef = useRef<HTMLElement | null>(null);

    // Setters para sincronizar los nodos DOM con useFloating (refs.setFloating, refs.setReference)
    // Se usan en los refs de los elementos JSX
    const setFloating = (node: HTMLElement | null) => {
        floatingRef.current = node;
        refs.setFloating(node);
    };

    const setReference = (node: HTMLElement | null) => {
        referenceRef.current = node;
        refs.setReference(node);
    };

    // Efecto para activar autoUpdate solo mientras el popover está abierto.
    // autoUpdate es una función que observa cambios en scroll o resize para recalcular posición
    useEffect(() => {
        if (!open) return; // solo activa si popover está abierto
        if (!referenceRef.current || !floatingRef.current) return;

        // autoUpdate devuelve una función cleanup para quitar el listener
        const cleanup = autoUpdate(referenceRef.current, floatingRef.current, update);

        // Cleanup para remover event listeners cuando el popover se cierra
        return () => {
            cleanup();
        };
    }, [open, update]);

    // Usamos un hook custom que detecta clicks fuera de los elementos referenciados
    // (el botón y el popover) para cerrar el popover cuando el usuario clickea fuera
    useClickOutside(
        [floatingRef, referenceRef],
        () => setOpen(false)
    );

    // Nodo del portal donde renderizamos el popover fuera del DOM padre normal
    // Esto evita problemas de overflow, z-index, y facilita posicionamiento absoluto/fijo
    const portalRoot = useRef<Element | null>(null);

    // Efecto para crear o reutilizar el nodo div del portal con id "floating-ui-portal-root"
    // Se ejecuta una sola vez al montar el componente
    useEffect(() => {
        if (typeof document !== "undefined") {
            let existingRoot = document.getElementById("floating-ui-portal-root");
            if (!existingRoot) {
                existingRoot = document.createElement("div");
                existingRoot.setAttribute("id", "floating-ui-portal-root");
                document.body.appendChild(existingRoot);
            }
            portalRoot.current = existingRoot;
        }
    }, []);

    return (
        <div style={{ padding: 100 }}>
            {/* Botón que abre/cierra el popover */}
            {/* Se le asigna el ref para que useFloating calcule posición relativa */}
            <button
                ref={setReference}
                onClick={() => setOpen((o) => !o)} // toggle open/close
                aria-expanded={open} // accesibilidad: indica estado desplegado
                aria-haspopup="true" // indica que abre un popover/dialogo
                type="button"
            >
                Toggle Popover
            </button>

            {/* Solo si está abierto y el portal existe */}
            {open && portalRoot.current && ReactDOM.createPortal(
                <div
                    ref={setFloating} // ref del popover para calcular posición
                    style={{
                        position: strategy, // posición calculada (normalmente "fixed")
                        top: y ?? 0,        // coordenada Y calculada
                        left: x ?? 0,       // coordenada X calculada
                        ...floatingStyles,  // estilos adicionales calculados por floating-ui
                        backgroundColor: "white",
                        border: "1px solid black",
                        borderRadius: 4,
                        padding: 10,
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        zIndex: 1000,
                        width: 200,
                    }}
                    role="dialog" // accesibilidad: rol dialogo/modal
                    aria-modal="true" // accesibilidad: es modal (bloquea fondo)
                >
                    <p>Este es el contenido del popover.</p>
                    <button onClick={() => setOpen(false)}>Cerrar</button>
                </div>,
                portalRoot.current // renderizamos dentro del portal
            )}
        </div>
    );
}
