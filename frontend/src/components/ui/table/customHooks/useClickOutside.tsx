import {
  useEffect,
  useRef,
  type RefObject
} from "react";

// Tipo personalizado que representa los eventos que escucharemos:
// Puede ser un evento de Mouse (clicks, etc.) o Touch (pantallas táctiles).
type EventType = MouseEvent | TouchEvent;

/**
 * Tipo para las referencias que recibirá el hook useClickOutside.
 * Puede ser:
 * - Un RefObject típico de React que apunta a un HTMLElement o null,
 * - Un objeto con la propiedad `current` apuntando a HTMLElement o null (similar a RefObject),
 * - O incluso null (por seguridad).
 */
type RefInput =
  | RefObject<HTMLElement | null>
  | { current: HTMLElement | null }
  | null;

/**
 * Hook personalizado para detectar clicks o toques fuera de uno o varios elementos referenciados.
 * 
 * @param refs - Array de referencias (RefInput[]), que son los elementos dentro de los cuales no queremos que el click sea detectado como "fuera".
 * @param handler - Función que se ejecutará cuando se detecte un click o toque fuera de esos elementos referenciados.
 */
export function useClickOutside(
  refs: RefInput[],
  handler: (event: EventType) => void
) {
  // useRef para guardar la función handler más reciente.
  // Esto previene problemas con cierres (closures) en listeners registrados.
  const savedHandler = useRef(handler);

  // Cada vez que cambie el handler, actualizamos savedHandler para siempre usar la versión más reciente
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  // useEffect para añadir los event listeners "mousedown" y "touchstart"
  // Solo se ejecuta cuando cambia el array refs.
  useEffect(() => {
    // Función listener para manejar los eventos de click o toque.
    const listener = (event: EventType) => {
      // Revisamos si el evento ocurrió dentro de alguno de los elementos referenciados.
      // Se usa some para comprobar si algún ref apunta a un nodo que contiene el target del evento.
      const isInside = refs.some((ref) =>
        ref?.current?.contains(event.target as Node)
      );

      // Si el click o toque NO fue dentro de ninguno de los refs,
      // entonces llamamos al handler guardado.
      if (!isInside) {
        savedHandler.current(event);
      }
    };

    // Añadimos los listeners para mouse y touch al documento entero.
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    // Cleanup: removemos los listeners cuando el componente se desmonte o cambien refs.
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs]); // React solo vuelve a ejecutar este useEffect si cambia el array refs.
}


/*


import { useEffect, useRef, type RefObject } from "react";

type EventType = MouseEvent | TouchEvent;

export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: (event: EventType) => void
) {
  const savedHandler = useRef(handler);

  // Actualiza el ref con el último handler para que listener use siempre el actual
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: EventType) => {
      const isInside = refs.some(ref => ref.current?.contains(event.target as Node));
      if (!isInside) {
        savedHandler.current(event); // Usar el handler más reciente
      }
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs]); // Sólo depende de refs, no del handler
}



*/



/*
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsVisibleHidePopover(false);
            }
        };

        if (isVisibleHidePopover) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isVisibleHidePopover]);


*/