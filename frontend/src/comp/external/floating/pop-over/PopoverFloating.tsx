// import { useState, type ReactNode } from "react";
// import StyleModule from "./PopoverFloating.module.css";
// import {
//   useFloating,          // Hook principal: calcula posición del elemento flotante (dropdown, tooltip, etc.)
//   offset,               // Middleware: agrega espacio entre el botón (reference) y el menú (floating).
//   flip,                 // Middleware: invierte el lado si no cabe (ej. de abajo a arriba).
//   shift,                // Middleware: ajusta la posición para que no se salga de la pantalla.
//   size,                 // Middleware: controla ancho/alto del floating (ej. mismo ancho que el botón).
//   autoUpdate,           // Función: recalcula posición automáticamente al cambiar tamaño/scroll/resize.
//   useRole,              // Hook: añade atributos ARIA (ej. role="listbox") para accesibilidad.
//   useClick,             // Hook: abre/cierra el floating al hacer click en el reference.
//   useDismiss,           // Hook: permite cerrar al hacer click fuera o con la tecla Esc.
//   useInteractions,      // Hook: combina varios comportamientos de interacción (click, dismiss, role, etc.).
//   FloatingPortal,       // Componente: renderiza el floating en un portal (fuera del DOM normal).
//   FloatingFocusManager, // Componente: gestiona el foco al abrir (muy útil en menús y selects).
//   autoPlacement,  //
//   hide, 
// } from "@floating-ui/react";


// type Placement =
//   "bottom-start" | "bottom-end" | "bottom" |
//   "top-start" | "top-end" | "top" |
//   "left-start" | "left-end" | "left" |
//   "right-start" | "right-end" | "right";

// interface PopoverFloatingProps {
//   childrenTrigger: ReactNode;
//   childrenFloating: ReactNode | ((args: { onClose: () => void }) => ReactNode);
//   placement?: Placement;
//   matchWidth?: boolean; // 👈 nueva bandera
//   classNameContainerPopover?: string;
// }

// const PopoverFloating = ({
//   childrenTrigger,
//   childrenFloating,
//   placement = "bottom-start",
//   matchWidth = false,
// }: PopoverFloatingProps) => {

//   const [isOpenFloating, setIsOpenFloating] = useState(false);

//   const toggleIsOpenFloating = () => {
//     setIsOpenFloating(!isOpenFloating);
//   };

//   // * Configuración de Floating UI
//   const { refs, floatingStyles, context } = useFloating({
//     // ? Estado controlado: el floating se abre/cierra según isOpen
//     open: isOpenFloating,                       // Booleano: si está abierto o cerrado
//     onOpenChange: setIsOpenFloating,            // Función que actualiza ese estado

//     // ? Posición preferida del floating
//     placement: placement,          // Abajo y alineado al inicio (izquierda)

//     // ? Hace que la posición se recalcule automáticamente
//     // cuando hay scroll, resize, cambios de layout, etc.
//     whileElementsMounted: autoUpdate,

//     // NEW: Estrategia fija para evitar problemas con contenedores con transform/overflow
//     strategy: "fixed", // NEW

//     // ? Lista de middlewares que ajustan la posición y el tamaño
//     middleware: [
//       offset(4),                      // Deja 4px de separación entre el botón y el menú
//       flip({ padding: 8 }),           // Si no cabe abajo, lo voltea (arriba, derecha, etc.)
//       // con un margen de seguridad de 8px
//       // NEW: evita correcciones horizontales cuando anclas en "bottom-end"
//       shift({ padding: 8, crossAxis: false }),  // NEW
//       // Ajusta el menú para que no se salga de la pantalla, corrigiendo bordes con 8px de padding

//       size({
//         // ? size → controla el ancho/alto del floating
//         apply({ rects, elements }) {
//           // Object.assign(elements.floating.style, {
//           //     // Igualar el ancho del floating con el ancho del botón de referencia
//           //     width: `${rects.reference.width}px`,
//           //     // Asegura que nunca sea más angosto que el reference
//           //     minWidth: `${rects.reference.width}px`,
//           //     // Forzar que quede siempre encima de otros elementos
//           //     zIndex: 9999,
//           // });
//           if (matchWidth) {
//             Object.assign(elements.floating.style, {
//               width: `${rects.reference.width}px`,
//               minWidth: `${rects.reference.width}px`,
//             });
//           } else {
//             Object.assign(elements.floating.style, {
//               minWidth: `${rects.reference.width}px`,
//             });
//           }
//           elements.floating.style.zIndex = "9999";
//         }
//       }),
//       // Oculta/cierra cuando el trigger queda fuera de vista por el contenedor con scroll
//       hide({ strategy: "referenceHidden" }),
//     ],
//   });


//   // * Interacciones Floating UI
//   const role = useRole(context, { role: "dialog" });
//   // ? Añade atributos de accesibilidad (ARIA) al floating.
//   //    En este caso le dice a lectores de pantalla que el floating
//   //    es una "listbox" (como un menú de opciones).

//   const click = useClick(context, { event: "mousedown" });
//   // ? Controla la apertura/cierre del floating con click (mousedown).
//   //    - Si haces click en el "reference" (ej. el botón), abre o cierra.
//   //    - Usa "mousedown" en vez de "click" para que responda más rápido.

//   const dismiss = useDismiss(context, { outsidePress: true, escapeKey: true, ancestorScroll: true });
//   // ? Permite cerrar el floating de forma natural:
//   //    - outsidePress: true → si haces click fuera, se cierra.
//   //    - escapeKey: true → si presionas Escape, se cierra.

//   const { getReferenceProps, getFloatingProps } = useInteractions([
//     role,
//     click,
//     dismiss,
//   ]);
//   // ? Combina todas las interacciones anteriores en un solo lugar.
//   //    - getReferenceProps → props que debes pasar al elemento de referencia (botón o trigger).
//   //    - getFloatingProps → props que debes pasar al floating (menú o dropdown).
//   // Así se aplican automáticamente los eventos, atributos ARIA, etc.


import { useState, type ReactNode, useEffect } from "react"; // Se importa useEffect para reaccionar a cambios de visibilidad del trigger y cerrar el popover cuando deje de ser visible.
import StyleModule from "./PopoverFloating.module.css";
import {
  useFloating,          // Hook principal: calcula posición del elemento flotante (dropdown, tooltip, etc.)
  offset,               // Middleware: agrega espacio entre el botón (reference) y el menú (floating).
  flip,                 // Middleware: invierte el lado si no cabe (ej. de abajo a arriba).
  shift,                // Middleware: ajusta la posición para que no se salga de la pantalla.
  size,                 // Middleware: controla ancho/alto del floating (ej. mismo ancho que el botón).
  autoUpdate,           // Función: recalcula posición automáticamente al cambiar tamaño/scroll/resize.
  useRole,              // Hook: añade atributos ARIA (ej. role="listbox") para accesibilidad.
  useClick,             // Hook: abre/cierra el floating al hacer click en el reference.
  useDismiss,           // Hook: permite cerrar al hacer click fuera o con la tecla Esc.
  useInteractions,      // Hook: combina varios comportamientos de interacción (click, dismiss, role, etc.).
  FloatingPortal,       // Componente: renderiza el floating en un portal (fuera del DOM normal).
  FloatingFocusManager, // Componente: gestiona el foco al abrir (muy útil en menús y selects).
  autoPlacement,        // (Reservado) Middleware alternativo para elegir placement automáticamente si lo necesitas en el futuro.
  hide,                 // Middleware: detecta cuando el elemento de referencia queda oculto (por scroll/clip) para poder actuar en consecuencia.
} from "@floating-ui/react";
import { type UseRoleProps } from '@floating-ui/react';

type roleOptions =
  "dialog" | "combobox" | "listbox" | "menu" |
  "tooltip" | "alert" | "alertdialog" | "grid" | "label" | "select" | "tooltip" | "tree"; // Nota: listado ilustrativo; en práctica usamos RoleOption de UseRoleProps.

type RoleOption = NonNullable<UseRoleProps['role']>;

type Placement =
  "bottom-start" | "bottom-end" | "bottom" |
  "top-start" | "top-end" | "top" |
  "left-start" | "left-end" | "left" |
  "right-start" | "right-end" | "right";

interface PopoverFloatingProps {
  childrenTrigger: ReactNode;
  childrenFloating: ReactNode | ((args: { onClose: () => void }) => ReactNode);
  typeRole?: RoleOption;                // Rol ARIA del contenedor flotante (ej. "listbox", "menu", "dialog")
  placement?: Placement;
  matchWidth?: boolean;                 // 👈 nueva bandera
  classNameContainerPopover?: string;
  initialOpen?: boolean;                // Estado inicial si lo usas de forma NO controlada
  open?: boolean;                       // Si se provee, el componente entra en MODO CONTROLADO (sin importar si es true/false)
  setOpen?: (value: boolean) => void;   // Setter externo para MODO CONTROLADO
  minHeight?: number | string;          // Altura mínima visual opcional (p.ej. 100 o "8rem")
  maxHeight?: number | string;          // Altura máxima antes de scroll (p.ej. 250 o "20rem")
  classNamePopoverFloating?: string;
  disabled?: boolean;
}

const PopoverFloating = ({
  childrenTrigger,
  childrenFloating,
  typeRole = "dialog",
  placement = "bottom-start",
  matchWidth = false,
  initialOpen = false,
  open,                 // 🔴 IMPORTANTE: la presencia de esta prop define modo controlado (no su valor)
  setOpen,              // 🔴 Setter externo si es controlado
  minHeight,
  maxHeight,            // 🔴 NUEVO: controla el punto a partir del cual aparece scroll
  classNamePopoverFloating,
  disabled = false,
}: PopoverFloatingProps) => {

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTROL: modo controlado por PRESENCIA de props (open/setOpen), no por su valor
  // Si 'open' está definido y hay 'setOpen', usamos esas referencias (CONTROLADO).
  // Si no, usamos estado interno (NO controlado), inicializado con initialOpen.
  // ─────────────────────────────────────────────────────────────────────────────
  const isControlled = typeof open !== 'undefined' && typeof setOpen === 'function';

  const [internalOpen, setInternalOpen] = useState<boolean>(initialOpen); // Estado interno para modo NO controlado
  const actualOpen = isControlled ? (open as boolean) : internalOpen;     // Estado efectivo abierto/cerrado
  const setActualOpen = isControlled ? (setOpen as (v: boolean) => void) : setInternalOpen; // Setter efectivo

  // Sincroniza el estado interno si estás en modo controlado (permite reflejar false)
  useEffect(() => {
    // Se mantiene para debugging/consistencia: cuando te controlan, copiamos el valor
    if (isControlled) setInternalOpen(open as boolean);
  }, [isControlled, open]);

  // Helpers para normalizar valores numéricos/string a CSS
  const toCss = (v?: number | string) => (typeof v === 'number' ? `${v}px` : v);


  const handleOpenChange = (next: boolean) => {
    if (disabled && next) return;   // no permitir abrir si está disabled
    setActualOpen(next);
  };

  // * Configuración de Floating UI
  const {
    refs,
    floatingStyles,
    context,
    middlewareData, // Se extrae middlewareData para poder leer datos de middlewares (ej. hide → referenceHidden) y reaccionar a ello.
  } = useFloating({
    // ? Estado controlado: el floating se abre/cierra según actualOpen
    open: actualOpen,                // Booleano: si está abierto o cerrado
    onOpenChange: setActualOpen,     // Función que actualiza ese estado (respeta controlado/no controlado)

    // ? Posición preferida del floating
    placement: placement,            // Abajo y alineado al inicio (izquierda)

    // ? Hace que la posición se recalcule automáticamente
    // cuando hay scroll, resize, cambios de layout, etc.
    // whileElementsMounted: autoUpdate,
    whileElementsMounted(reference, floating, update) {
      // Versión extendida de autoUpdate:
      // - ancestorScroll: escucha scroll de todos los ancestros (p. ej. el body scrolleable de una tabla dentro de un modal).
      // - ancestorResize: reacciona a cambios de tamaño de ancestros (layouts responsivos).
      // - elementResize: reacciona a cambios del propio floating/reference (contenido dinámico).
      return autoUpdate(reference, floating, update, {
        ancestorScroll: true,
        ancestorResize: true,
        elementResize: true,
      });
    },

    // NEW: Estrategia fija para evitar problemas con contenedores con transform/overflow
    strategy: "fixed", // Se usa 'fixed' para evitar “saltos” cuando el modal o ancestros tienen transform/filters/position que crean stacking contexts.

    // ? Lista de middlewares que ajustan la posición y el tamaño
    middleware: [
      offset(4),                      // Deja 4px de separación entre el botón y el menú
      flip({ padding: 8 }),           // Si no cabe abajo, lo voltea (arriba, derecha, etc.)
      // con un margen de seguridad de 8px

      // NEW: evita correcciones horizontales cuando anclas en "bottom-end"
      shift({ padding: 8, crossAxis: false }),  // Mantiene el ajuste contra bordes, pero sin desplazar en el eje cruzado innecesariamente.

      size({
        // ? size → controla el ancho/alto del floating
        // Además de ajustar el ancho relativo al reference, aquí podemos limitar el tamaño según el espacio visible disponible.
        apply({ rects, elements, availableWidth, availableHeight }) {
          // Igualar (o al menos no ser menor que) el ancho del reference
          if (matchWidth) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
              minWidth: `${rects.reference.width}px`,
            });
          } else {
            Object.assign(elements.floating.style, {
              minWidth: `${rects.reference.width}px`,
            });
          }

          // ─────────────────────────────────────────────────────────────
          // 🔹 Control de alturas y scroll interno
          // - maxHeight: límite superior antes de que aparezca scroll interno.
          //   Si se provee número → se expresa en px y se recorta por el espacio disponible (availableHeight).
          //   Si se provee string (ej. "20rem") → se usa literal (no se recorta con availableHeight).
          // - minHeight: altura mínima visual opcional (número→px o string CSS).
          // - overflowY: auto para mostrar scrollbar solo cuando sea necesario.
          // ─────────────────────────────────────────────────────────────
          let computedMaxHeight: string | undefined;

          if (typeof maxHeight === 'number') {
            // Combina tu tope con el espacio realmente disponible
            computedMaxHeight = `${Math.min(availableHeight, maxHeight)}px`;
          } else if (typeof maxHeight === 'string') {
            // Si das una unidad CSS, se respeta tal cual
            computedMaxHeight = maxHeight;
          } else {
            // Valor por defecto si no das maxHeight: usa todo el espacio disponible
            computedMaxHeight = `${availableHeight}px`;
          }

          Object.assign(elements.floating.style, {
            maxWidth: `${availableWidth}px`,
            maxHeight: maxHeight || computedMaxHeight,
            ...(minHeight && { minHeight: toCss(minHeight) }),
            overflowY: "auto",           // 👈 activa scroll vertical interno cuando se supera maxHeight
            // overflowX: "hidden",
            zIndex: "9999",
          });
        }
      }),

      // Oculta/cierra cuando el trigger queda fuera de vista por el contenedor con scroll
      // hide expone en middlewareData.hide.referenceHidden un booleano indicando que la referencia ya no es visible (por clipping/scroll).
      hide({ strategy: "referenceHidden" }),
    ],
  });

  // * Interacciones Floating UI
  const role = useRole(context, { role: typeRole });
  // ? Añade atributos de accesibilidad (ARIA) al floating.
  //    En este caso le dice a lectores de pantalla qué tipo de patrón es (listbox, menu, dialog, etc.).

  const click = useClick(context, { event: "click", enabled: !disabled });
  // ? Controla la apertura/cierre del floating con click (click).
  //    - Usar "click" (en vez de "mousedown") evita carreras con outsidePress que también dispara en mousedown.

  const dismiss = useDismiss(context, { outsidePress: true, outsidePressEvent: "click", escapeKey: true, ancestorScroll: true });
  // ? Permite cerrar el floating de forma natural:
  //    - outsidePress: true → si haces click fuera, se cierra (configurado en "click" para evitar colisiones con onMouseDown).
  //    - outsidePressEvent: "click" → hace el cierre consistente con el hook useClick.
  //    - escapeKey: true → si presionas Escape, se cierra.
  //    - ancestorScroll: true → si hay scrolls de ancestros relevantes (p. ej. desplazamiento fuerte), ayuda a mantener un cierre coherente.

  const { getReferenceProps, getFloatingProps } = useInteractions([
    role,
    click,
    dismiss,
  ]);
  // ? Combina todas las interacciones anteriores en un solo lugar.
  //    - getReferenceProps → props que debes pasar al elemento de referencia (botón o trigger).
  //    - getFloatingProps → props que debes pasar al floating (menú o dropdown).
  // Así se aplican automáticamente los eventos, atributos ARIA, etc.

  // Cierre reactivo cuando la referencia (trigger) queda oculta por scroll/clip:
  // - Gracias al middleware hide(), podemos leer middlewareData.hide.referenceHidden.
  // - Si es true mientras está abierto, cerramos el popover para evitar que “quede flotando” fuera de contexto.
  useEffect(() => {
    if (!actualOpen) return;
    if (middlewareData?.hide?.referenceHidden) {
      setActualOpen(false);
    }
  }, [actualOpen, middlewareData?.hide?.referenceHidden, setActualOpen]);

  // Helper para onClose desde children como función
  const handleCloseFromChildren = () => setActualOpen(false);

  return (
    <div className={StyleModule.popoverFloatingIUContainer}>
      <div
        className={StyleModule.popoverFloatingTrigger}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        {childrenTrigger}
      </div>
      {
        (actualOpen && !disabled) && (
          <FloatingPortal>
            <FloatingFocusManager
              context={context}
              modal={false}
              initialFocus={-1}
            >
              <div
                ref={refs.setFloating}
                {...getFloatingProps()}
                style={{
                  ...floatingStyles,
                }}
                className={`${classNamePopoverFloating} ${StyleModule.popoverFloatingFloating}`}
              >
                {
                  typeof childrenFloating === "function"
                    ? childrenFloating({ onClose: handleCloseFromChildren }) // Actualizado: onClose respeta modo controlado/no controlado
                    : childrenFloating
                }
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )
      }
    </div>
  );
};

export default PopoverFloating;




//   return (
//     <div className={StyleModule.popoverFloatingIUContainer}>
//       <div
//         className={StyleModule.popoverFloatingTrigger}
//         ref={refs.setReference}
//         {...getReferenceProps()}
//       >
//         {childrenTrigger}
//       </div>
//       {
//         isOpenFloating && (
//           <FloatingPortal>
//             <FloatingFocusManager
//               context={context}
//               modal={false}
//               initialFocus={-1}
//             >
//               <div
//                 ref={refs.setFloating}
//                 {...getFloatingProps()}
//                 style={{
//                   ...floatingStyles,
//                 }}
//                 className={StyleModule.popoverFloatingFloating}
//               >
//                 {
//                   typeof childrenFloating === "function"
//                     ? childrenFloating({ onClose: toggleIsOpenFloating })
//                     : childrenFloating
//                 }
//               </div>
//             </FloatingFocusManager>
//           </FloatingPortal>
//         )
//       }
//     </div>
//   );
// };


// export default PopoverFloating;


/*
    🔹 context={context}

        Es el contexto que devuelve useFloating.

        Le permite a FloatingFocusManager saber qué es el reference y qué es el floating 
        para manejar correctamente el foco.

        Siempre debes pasarlo cuando usas FloatingFocusManager.

    🔹 modal={false}

        Controla si el floating se comporta como un "modal de foco".

        modal={true}

            Hace que el foco quede atrapado dentro del floating (focus trap).

            Marca el resto de la página con aria-hidden para que los lectores de pantalla
            no puedan acceder al contenido externo mientras esté abierto.

            Útil en diálogos, popovers grandes o menús que bloquean interacción.

        modal={false}

            No atrapa el foco completamente.

            Permite que todavía puedas tabular fuera del floating.

            Útil para menús ligeros (selects, tooltips interactivos) donde no quieres 
            “bloquear” todo lo demás.

    🔹 initialFocus={-1}

        Define dónde se coloca el foco automáticamente al abrir el floating.

        Valores posibles:

            0 → Foca el primer elemento enfocable dentro del floating.

            un índice (1, 2, etc.) → Foca el N-ésimo elemento enfocable.

            -1 → No mueve el foco automáticamente al abrir (mantiene el foco en el 
            reference, o donde estuviera).

            "reference" → Devuelve el foco al elemento reference.

            HTMLElement → Puedes pasar directamente un nodo al que quieras enfocar.

        En tu caso:

            initialFocus={-1} significa “no hagas auto-focus en nada al abrir”.

            Es útil cuando no quieres que el floating robe el foco (por ejemplo, un
            menú que se abre pero prefieres que el foco siga en el botón).

    ✅ Resumen rápido:

    context: conecta con Floating UI.

    modal: controla si el floating atrapa el foco (como modal) o no.

    initialFocus: decide qué pasa con el foco al abrir (primer item, reference, nada, etc.).

*/




/*
========================================================
Guía profunda de @floating-ui/react
========================================================

Este bloque documenta, con detalle y ejemplos, cada pieza que importaste:
- Hooks principales: useFloating, useInteractions
- Middlewares de posicionamiento: offset, flip, shift, size
- Utilidades de recálculo: autoUpdate
- Accesibilidad e interacción: useRole, useClick, useDismiss
- Infraestructura de render y foco: FloatingPortal, FloatingFocusManager

La idea es que puedas dominar CUÁNDO usarlos, CÓMO configurarlos,
CÓMO combinarlos y QUÉ problemas comunes resuelven.

----------------------------------------------------------------------
1) useFloating (hook base: posicionamiento, refs, estado derivado)
----------------------------------------------------------------------
QUÉ ES:
- El cerebro del posicionamiento. Calcula dónde dibujar el "floating"
  (dropdown/tooltip) relativo a un "reference" (botón, input, etc).

QUÉ TE DA:
- x, y: coordenadas calculadas (números o null hasta que mide).
- strategy: "absolute" (por defecto) o "fixed" (ignora scroll-ancestors).
- placement: posición preferida (p.ej. "bottom-start").
- refs: { reference, floating, setReference, setFloating } para enlazar elementos.
- middlewareData: datos extra que exponen los middlewares (ej. flecha, size).
- update(): función para forzar recalcular (normalmente no la necesitas si usas autoUpdate).
- context: objeto interno que comparten middlewares y hooks de interacción.

CUÁNDO USARLO:
- Siempre que tengas un elemento dependiente de otro (selects, popovers, menús).

CONFIG CLAVE (ejemplo):
  const {refs, x, y, strategy, context, placement, middlewareData} = useFloating({
    placement: "bottom-start",   // top, right, bottom, left + -start/-end
    strategy: "absolute",         // "fixed" si tu contenedor tiene transforms complejos
    middleware: [offset(8), flip(), shift({padding: 8})],
    whileElementsMounted: autoUpdate, // recálculo reactivo
  });

PATRONES:
- set refs en tus nodes:
    <button ref={refs.setReference} />
    <div ref={refs.setFloating} style={{position: strategy, left: x, top: y}} />

- "fixed" evita bugs si el ancestro tiene transform/overflow: hidden que corta.
- Usa "placement" con sufijos (-start/-end) para alinear bordes.

PROBLEMAS COMUNES:
- Se te mueve al hacer scroll: usa whileElementsMounted: autoUpdate.
- Se corta bajo padres con overflow escondido: usa Portal y/o strategy:"fixed".
- Se descuadra cuando el contenido cambia: size() + autoUpdate.

----------------------------------------------------------------------
2) offset (middleware: separación/superposición entre reference y floating)
----------------------------------------------------------------------
QUÉ HACE:
- Controla la distancia entre reference y floating.

FORMAS DE USO:
- offset(número): p.ej. offset(8) = 8px de separación "externa".
- offset({ mainAxis: 8, crossAxis: 0, alignmentAxis: null })
  - mainAxis: distancia en el eje principal (p.ej. arriba/abajo).
  - crossAxis: desplazamiento lateral (p.ej. a la izquierda/derecha).
  - alignmentAxis: afina la alineación cuando usas -start/-end.

CUÁNDO USAR:
- Para que el menú no quede pegado al botón (espaciado visual).
- Para crear "superposición negativa" (offset(-4)) cuando quieres que se monten.

TIPS:
- Para menus anclados a inputs, un mainAxis 4–8 generalmente se ve bien.
- crossAxis es útil si tu flecha necesita un ajuste fino.

----------------------------------------------------------------------
3) flip (middleware: invierte la posición si no cabe)
----------------------------------------------------------------------
QUÉ HACE:
- Si tu placement preferido no cabe (por viewport o contenedor),
  intenta el opuesto (p.ej. bottom -> top), y también variaciones.

OPCIONES:
- fallbackPlacements: ["right", "left"] orden de prueba alternativo.
- padding: margen interno para no pegarse al viewport.

CUÁNDO USAR:
- Siempre que el contenido pueda no caber en el primer placement.
- Acordeones, menús contextuales, tooltips responsivos.

PATRONES:
- flip + shift trabajan juntos: flip cambia el lado; shift corrige contra bordes.

----------------------------------------------------------------------
4) shift (middleware: desplaza para evitar recorte contra viewport/contenedor)
----------------------------------------------------------------------
QUÉ HACE:
- Si el floating queda parcialmente fuera de los límites (viewport o boundary),
  lo desplaza para que quede lo más visible posible.

OPCIONES:
- padding: margen de seguridad contra los bordes (ej. 8px).
- limiter: estrategia de recorte (útil en tooltips largos).

CUÁNDO USAR:
- Siempre que quieras evitar recortes visuales.
- Menús largos, listas con scroll, tooltips en bordes.

PATRONES:
- shift no cambia el lado (eso lo hace flip), solo lo desplaza en el mismo lado.

----------------------------------------------------------------------
5) size (middleware: controla el ancho/alto del floating en función del espacio)
----------------------------------------------------------------------
QUÉ HACE:
- Permite calcular y fijar dimensiones del floating según el espacio disponible,
  o igualar el ancho del reference (menús select tipo "ancho del input").

OPCIONES:
- apply({ rects, availableWidth, availableHeight, elements, ... }):
  callback donde setear styles:
    - elements.floating.style.width = `${rects.reference.width}px`
    - elements.floating.style.maxHeight = `${Math.min(300, availableHeight)}px`
- padding: margen respecto a los límites al medir availableHeight/Width.

CUÁNDO USAR:
- Selects donde el dropdown debe igualar el ancho del botón/input.
- Menús con altura max limitada y scroll interno.

PATRÓN CLÁSICO:
  size({
    apply({ rects, availableHeight, elements }) {
      elements.floating.style.width = `${rects.reference.width}px`;
      elements.floating.style.maxHeight = `${Math.min(availableHeight, 320)}px`;
    },
  })

----------------------------------------------------------------------
6) autoUpdate (utilidad: recálculo reactivo al montar elementos)
----------------------------------------------------------------------
QUÉ HACE:
- Observa cambios de layout: resize, scroll, cambio de fonts, contenido dinámico,
  y dispara update() automáticamente.

CÓMO SE USA:
- Pásalo a useFloating como whileElementsMounted: autoUpdate.
  Esto adjunta observers al montar los refs y limpia al desmontar.

CUÁNDO USAR:
- Casi siempre. Evita tener que llamar update() manualmente.
- Indispensable si cambian opciones/longitud de la lista al vuelo.

TIPS:
- Si tu dropdown está dentro de contenedores con scroll, autoUpdate escucha todo.

----------------------------------------------------------------------
7) useRole (hook: atributos ARIA y semántica accesible)
----------------------------------------------------------------------
QUÉ HACE:
- Devuelve props para asignar role correcto al floating (y a veces al reference).
- Ejemplos:
  - Select/listbox: role="listbox" al contenedor, role="option" a ítems.
  - Menu: role="menu" + role="menuitem".
  - Tooltip: role="tooltip".

USO:
  const role = useRole(context, { role: "listbox" });
  const { getFloatingProps } = useInteractions([role]);
  <div {...getFloatingProps()} />

CUÁNDO USAR:
- Siempre que el componente tenga semántica/teclado específica.
- Mejora lectores de pantalla y navegación por teclado.

----------------------------------------------------------------------
8) useClick (hook: abrir/cerrar con click/toggle)
----------------------------------------------------------------------
QUÉ HACE:
- Maneja el estado de visibilidad según click del reference.
- Opcionalmente focus/blur, y closeOnPressOutside (aunque esto lo cubre useDismiss).

OPCIONES:
- enabled: boolean (activar/desactivar).
- event: "click" | "mousedown" | "pointerdown" según tu UX.
- toggle: si true alterna abierto/cerrado en cada click.

USO:
  const click = useClick(context, { event: "click", toggle: true });

CUÁNDO USAR:
- Dropdowns, selects, menús con botón activador.

PITFALLS:
- En combos avanzados con teclado, combina con useDismiss y FocusManager.

----------------------------------------------------------------------
9) useDismiss (hook: cerrar al hacer click fuera, Esc, blur)
----------------------------------------------------------------------
QUÉ HACE:
- Cierra el floating cuando:
  - se hace click/press fuera,
  - se presiona Escape,
  - se pierde el foco (configurable con `outsidePressEvent`, `escapeKey`, etc).

OPCIONES ÚTILES:
- outsidePress: true | (event) => boolean (para condicionar qué es “afuera”).
- outsidePressEvent: "pointerdown" | "mousedown" | "click".
- escapeKey: boolean (cerrar con Esc).
- bubbles: controla propagación según tu árbol.

USO:
  const dismiss = useDismiss(context, { outsidePress: true, escapeKey: true });

CUÁNDO USAR:
- Prácticamente siempre en popovers/menus, para UX consistente.

TIPS:
- Si usas un Portal, outsidePress funciona mejor (no queda “dentro” del mismo stacking).

----------------------------------------------------------------------
10) useInteractions (hook: combina props de interacción)
----------------------------------------------------------------------
QUÉ HACE:
- Junta varios “interactions hooks” (click, dismiss, role, hover, focus, etc)
  y te devuelve getters de props para reference y floating.

USO:
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(...),
    useDismiss(...),
    useRole(...),
    // otros como useHover, useFocus si los usaras
  ]);

APLICACIÓN:
  <button ref={refs.setReference} {...getReferenceProps()} />
  <div ref={refs.setFloating} {...getFloatingProps()} />

VENTAJA:
- Centraliza lógica de eventos/ARIA sin repetir onClick/onKeyDown manuales.

----------------------------------------------------------------------
11) FloatingPortal (componente: renderizar fuera del flujo DOM actual)
----------------------------------------------------------------------
QUÉ HACE:
- Renderiza el floating en un Portal (al final del body por defecto), evitando:
  - clipping por overflow: hidden de contenedores ancestrales,
  - z-index stacking issues.

USO:
  <FloatingPortal>
    {open && (
      <div ref={refs.setFloating} style={{position: strategy, left: x, top: y}}>
        ...
      </div>
    )}
  </FloatingPortal>

CUÁNDO USAR:
- Casi siempre para dropdowns/menus en apps complejas con contenedores scroll.
- Si tu menú “desaparece” o se recorta, muévelo a un Portal.

----------------------------------------------------------------------
12) FloatingFocusManager (componente: gestionar foco y navegación)
----------------------------------------------------------------------
QUÉ HACE:
- Encierra el floating y gestiona el foco de forma accesible:
  - Tras abrir: mueve foco dentro del panel (opcional).
  - Al cerrar: devuelve el foco al reference (botón).
  - Atrapa el foco dentro (focus trap) si lo configuras.
  - Administra tab/shift+tab, aria-hidden en siblings, etc.

OPCIONES:
- initialFocus: "reference" | 0 | elemento | null
- returnFocus: boolean (devolver foco al cerrarse)
- modal: boolean (si true, hace aria-hidden a siblings → experiencia “modal”)
- guards: boolean (añade nodos invisibles para trap limpio)

USO:
  <FloatingPortal>
    {open && (
      <FloatingFocusManager context={context} modal={false} initialFocus={0} returnFocus>
        <div ref={refs.setFloating} ...> ... </div>
      </FloatingFocusManager>
    )}
  </FloatingPortal>

CUÁNDO USAR:
- Selects, menús y popovers interactivos (inputs dentro, navegación por teclado).
- Evita “pérdida” de foco y mejora screen readers.

TIPS:
- Si el dropdown es “ligero” (solo clicks), modal={false} suele ir bien.
- Para menús complejos tipo combobox, modal={true} asegura enfoque total.

----------------------------------------------------------------------
COMBINACIÓN TÍPICA PARA UN CUSTOM SELECT
----------------------------------------------------------------------
  const [open, setOpen] = useState(false);

  const {refs, x, y, strategy, context} = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, availableHeight, elements }) {
          elements.floating.style.width = `${rects.reference.width}px`;
          elements.floating.style.maxHeight = `${Math.min(availableHeight, 320)}px`;
          elements.floating.style.overflow = "auto";
        }
      })
    ]
  });

  const click = useClick(context, { toggle: true });
  const dismiss = useDismiss(context, { outsidePress: true, escapeKey: true });
  const role = useRole(context, { role: "listbox" });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  // JSX (referencia + floating con Portal y FocusManager):
  // <button ref={refs.setReference} {...getReferenceProps()} />
  // <FloatingPortal>
  //   {open && (
  //     <FloatingFocusManager context={context} modal={false} returnFocus>
  //       <div
  //         ref={refs.setFloating}
  //         {...getFloatingProps()}
  //         style={{ position: strategy, left: x ?? 0, top: y ?? 0 }}
  //         role="listbox"
  //       >
  //         {options.map(...)}
  //       </div>
  //     </FloatingFocusManager>
  //   )}
  // </FloatingPortal>

----------------------------------------------------------------------
ANTI-PATRONES Y ERRORES FRECUENTES
----------------------------------------------------------------------
- Olvidar whileElementsMounted: autoUpdate → posición desincronizada al cambiar contenido.
- No usar Portal y chocar con overflow: hidden / z-index → menú cortado o invisible.
- No añadir role/ARIA → navegación por teclado pobre, mal soporte lector de pantalla.
- Mezclar handlers manuales (onClick, onKeyDown) con useInteractions mal integrados → duplicación de eventos.
- No sincronizar "open" con onOpenChange → estados “desacoplados” (el menú no cierra/abre como esperas).
- Fijar height/width en CSS sin respetar size() → desalineación o scroll no deseado.

----------------------------------------------------------------------
REGLAS DE ORO
----------------------------------------------------------------------
- useFloating + (offset, flip, shift, size) + autoUpdate es el “stack” base ganador.
- useInteractions es el pegamento para click/dismiss/role sin boilerplate.
- FloatingPortal casi siempre; FloatingFocusManager cuando el menú es interactivo.
- Pon atención a accesibilidad desde el inicio (role correcto + focus controlado).

Con esto tienes una referencia detallada para dominar cada pieza y saber cuándo aplicarla.
*/



/*
============================================================
Guía general y detallada de @floating-ui/react (no específica a un componente)
============================================================

Este documento explica cada API importada —para cualquier patrón UI flotante—:
tooltips, popovers, menús contextuales, dropdowns, color pickers, autocompletes,
comboboxes, etc. Incluye: qué hace, cuándo usarla, configuración, patrones,
y errores comunes.

────────────────────────────────────────────────────────────
HOOKS DE POSICIONAMIENTO
────────────────────────────────────────────────────────────

1) useFloating
--------------
QUÉ ES:
- Hook base que calcula la posición de un "elemento flotante" (floating)
  relativo a un "elemento de referencia" (reference).

QUÉ DEVUELVE (parcial):
- x, y: coordenadas calculadas del floating (pueden ser null hasta que mide).
- placement: posición preferida ("top" | "right" | "bottom" | "left" + "-start/-end").
- strategy: "absolute" (default) o "fixed" (ignora scroll-ancestors).
- refs: { reference, floating, setReference, setFloating } para conectar nodos DOM/React.
- middlewareData: datos adicionales generados por middlewares (p.ej. size, arrow).
- context: objeto compartido con otros hooks (interactions) y componentes.

CUÁNDO USARLO:
- Siempre que un elemento deba posicionarse relativo a otro (tooltip, popover, menú…).

CONFIG TÍPICA:
- placement: define lado/alineación preferidos.
- strategy: usa "fixed" si hay transforms/overflows que rompen "absolute".
- middleware: array de middlewares (offset, flip, shift, size, arrow…).
- whileElementsMounted: autoUpdate para recálculo reactivo.

PATRONES GENERALES:
- Enlaza refs: setReference al trigger y setFloating al panel flotante.
- Aplica style inline al floating: { position: strategy, left: x, top: y }.

ERRORES COMUNES:
- Sin autoUpdate: posición desincronizada en scroll/resize/cambios de contenido.
- Sin Portal: clipping por overflow: hidden y stacking context confusos.
- Olvidar "-start/-end": alineaciones inesperadas.

────────────────────────────────────────────────────────────
MIDDLEWARES DE POSICIONAMIENTO
────────────────────────────────────────────────────────────

2) offset
---------
QUÉ HACE:
- Ajusta la distancia entre el reference y el floating.

USO:
- offset(8) → separa 8px.
- offset({ mainAxis, crossAxis, alignmentAxis }) para ajustes finos.

CUÁNDO:
- Casi siempre, para evitar que el floating “pegue” al reference.
- Valores 4–12px suelen verse naturales en tooltips/popovers.

ANTIPATRÓN:
- offset negativo sin intención: puede causar superposición difícil de clicar.

3) flip
-------
QUÉ HACE:
- Cambia el placement al opuesto/alternativo si no hay espacio en el lado preferido.

OPCIONES:
- fallbackPlacements: orden alternativo (p.ej. ["top", "right"]).
- padding: margen de seguridad con respecto a los límites.

CUÁNDO:
- Casi siempre que el floating pueda no caber (páginas responsivas, layouts complejos).

NOTA:
- flip cambia el LADO; no corrige “desbordes” finos (eso lo hace shift).

4) shift
--------
QUÉ HACE:
- Desplaza el floating dentro de los límites (viewport/contenedor) para evitar cortes.

OPCIONES:
- padding: espacio mínimo a bordes.
- limiter: estrategias para limitar el corrimiento.

CUÁNDO:
- Siempre que quieras mantener el floating visible, incluso en bordes/extremos.

NOTA:
- shift no cambia el lado (flip), solo reposiciona en el mismo lado elegido.

5) size
-------
QUÉ HACE:
- Permite establecer dimensiones en función del espacio disponible o del reference.

USO HABITUAL:
- Igualar ancho del floating al reference.
- Imponer maxHeight con scroll interno según availableHeight.

EJEMPLO MENTAL:
- apply({ rects, availableHeight, elements }) {
    elements.floating.style.width = `${rects.reference.width}px`;
    elements.floating.style.maxHeight = `${Math.min(availableHeight, 320)}px`;
    elements.floating.style.overflow = "auto";
  }

CUÁNDO:
- Menús desplegables, listas largas, pickers, autocompletes.

ANTIPATRÓN:
- Fijar tamaños rígidos en CSS que ignoren la medición dinámica de size().

────────────────────────────────────────────────────────────
ACTUALIZACIÓN REACTIVA
────────────────────────────────────────────────────────────

6) autoUpdate
-------------
QUÉ HACE:
- Observa scroll, resize, cambios de layout/contenido y recalcula la posición.

USO:
- Pásalo como whileElementsMounted a useFloating.
- Se encarga de registrar/limpiar observers al montar/desmontar.

CUÁNDO:
- Prácticamente siempre, salvo UIs 100% estáticas.

ANTIPATRÓN:
- Llamar update() manual todo el tiempo en lugar de delegar a autoUpdate.

────────────────────────────────────────────────────────────
ACCESIBILIDAD E INTERACCIÓN
────────────────────────────────────────────────────────────

7) useRole
----------
QUÉ HACE:
- Devuelve props con ARIA roles/atributos apropiados según el tipo de floating.

EJEMPLOS:
- role="tooltip" para tooltips.
- role="dialog" para popovers modales.
- role="menu"/"menuitem", "listbox"/"option" para menús y selects.

CUÁNDO:
- Siempre: ayuda a lectores de pantalla y navegación con teclado.

NOTA:
- Combínalo con useInteractions para inyectar props sin boilerplate.

8) useClick
-----------
QUÉ HACE:
- Gestiona apertura/cierre por interacción de click (o pointerdown/mousedown).

OPCIONES:
- toggle (true por defecto para dropdown-like).
- event: "click" | "mousedown" | "pointerdown".
- enabled: habilitar/deshabilitar sin desmontar lógica.

CUÁNDO:
- Popovers, menús, dropdowns, tooltips con click (en vez de hover).

ANTIPATRONES:
- Con tooltips “hover”, usa useHover (no importado aquí) en lugar de useClick.
- Duplicar handlers manuales onClick + useClick puede crear dobles toggles.

9) useDismiss
-------------
QUÉ HACE:
- Cierra el floating al:
  - click/press fuera (outsidePress),
  - pulsar Escape (escapeKey),
  - blur/gestos según config.

OPCIONES COMUNES:
- outsidePress: true | (event) => boolean (filtra zonas excepcionales).
- outsidePressEvent: "pointerdown" | "mousedown" | "click".
- escapeKey: boolean.

CUÁNDO:
- Casi siempre en popovers/menús para UX consistente y predecible.

TIPS:
- Si renderizas en Portal, outsidePress funciona mejor evitando falsos “dentro”.

10) useInteractions
-------------------
QUÉ HACE:
- Combina varios “interaction hooks” (click, dismiss, role, hover, focus…)
  y devuelve getters de props: getReferenceProps, getFloatingProps.

VENTAJA:
- Centraliza eventos/ARIA, evita repetir onClick/onKeyDown en cada componente.

CUÁNDO:
- Siempre que apliques 2+ interacciones/roles al mismo floating/reference.

ANTIPATRÓN:
- Pasar props manuales y además los de useInteractions sin cuidado → eventos duplicados.

────────────────────────────────────────────────────────────
RENDERIZADO Y FOCO
────────────────────────────────────────────────────────────

11) FloatingPortal
------------------
QUÉ HACE:
- Renderiza el floating en un portal (p.ej. al final de <body>).

BENEFICIOS:
- Evita clipping por overflow: hidden de contenedores ancestrales.
- Simplifica stacking context/z-index.

CUÁNDO:
- Layouts complejos, contenedores con scroll, modales anidados, toolbars fijas.

ANTIPATRÓN:
- No usar Portal y luego “parchear” con z-index enormes sin resolver clipping.

12) FloatingFocusManager
------------------------
QUÉ HACE:
- Gestiona el foco cuando el floating está abierto:
  - Puede mover el foco al floating,
  - atrapar el foco (modal) y devolverlo al reference al cerrar,
  - administrar tab/shift+tab, aria-hidden en siblings (si modal).

OPCIONES:
- modal: boolean — si true, comportamiento tipo diálogo modal (oculta resto para SR).
- initialFocus: índice/elemento/“reference”.
- returnFocus: boolean — devuelve foco al elemento disparador al cerrar.
- guards: boolean — añade nodos sentinela invisibles para trap suave.

CUÁNDO:
- Popovers interactivos (formularios, menús navegables, combobox).
- Requisito para accesibilidad sólida con teclado/lectores de pantalla.

ANTIPATRÓN:
- No manejar foco: usuarios de teclado “pierden” la posición al abrir/cerrar.

────────────────────────────────────────────────────────────
PATRONES DE COMBINACIÓN (GENERALES)
────────────────────────────────────────────────────────────

- Posicionamiento robusto:
  useFloating({
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip({padding: 8}), shift({padding: 8})]
  })

- Dimensiones reactivas:
  + size(...) para igualar ancho al reference y limitar altura según espacio.

- Interacción accesible:
  const i = useInteractions([useClick(context), useDismiss(context), useRole(context, {role: "dialog" | "menu" | "tooltip" | "listbox"})])

- Infraestructura:
  <FloatingPortal> para escapar de overflow.
  <FloatingFocusManager> para foco y navegación.

────────────────────────────────────────────────────────────
DECISIONES RÁPIDAS
────────────────────────────────────────────────────────────
- ¿Hay posibilidad de que no quepa? → flip + shift.
- ¿Se recorta por contenedores/stacking? → FloatingPortal.
- ¿Contenido cambia/tiene scroll/resize? → autoUpdate + size.
- ¿Interacción con teclado/lectores? → useRole + FloatingFocusManager.
- ¿Click fuera/Escape para cerrar? → useDismiss.
- ¿Quieres evitar bugs con elementos “fixed”/transforms? → strategy:"fixed".

────────────────────────────────────────────────────────────
CHECKLIST DE ERRORES FRECUENTES
────────────────────────────────────────────────────────────
- No usar whileElementsMounted: autoUpdate → desalineaciones en scroll/resize.
- Ignorar Portal → el floating “desaparece” bajo overflow: hidden.
- No establecer role correcto → accesibilidad deficiente.
- Duplicar handlers (manual + useInteractions) → eventos duplicados.
- Fijar width/height en CSS y olvidar size() → desbordes o cortes.
- No manejar foco en UIs complejas → mala UX con teclado.

Con esta guía puedes combinar las piezas para cualquier patrón general:
tooltip (hover + role="tooltip"), popover (click + dismiss + focus manager),
menú contextual (contextmenu + role="menu"), combobox (focus/keyboard + size),
etc. La clave es: useFloating (+middlewares) posiciona; useInteractions gestiona
eventos/ARIA; Portal evita clipping; FocusManager asegura accesibilidad y foco.
*/
