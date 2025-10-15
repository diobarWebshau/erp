// hooks/useDebounce.ts
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/**
 * Hook personalizado para realizar peticiones con debounce y cancelación.
 *
 * Ideal para búsquedas o autocompletados donde el usuario escribe rápido.
 * Espera cierto tiempo (delay) antes de ejecutar el fetch, y cancela las
 * peticiones anteriores si el usuario sigue escribiendo.
 *
 * @template T Tipo de datos esperados como respuesta.
 * @param query Cadena a observar (generalmente, el texto del input).
 * @param fetchFn Función que realiza la petición asíncrona. Recibe el query y un AbortSignal.
 * @param delay Tiempo de espera en milisegundos antes de ejecutar el fetch (por defecto: 400ms).
 * @returns Un objeto con { data, loading }.
 * 
 * // NUEVO: También retorna { refetch }, para ejecutar inmediatamente (o re-debouncear) la última búsqueda con los parámetros actuales.
 */

function stableStringify(obj: unknown): string {
    // stringify estable (llaves ordenadas)
    const seen = new WeakSet();
    const sorter = (x: any): any => {
        if (x && typeof x === "object") {
            if (seen.has(x)) return null; // evita ciclos
            seen.add(x);
            if (Array.isArray(x)) return x.map(sorter);
            return Object.keys(x).sort().reduce((o, k) => {
                o[k] = sorter((x as any)[k]);
                return o;
            }, {} as any);
        }
        return x;
    };
    return JSON.stringify(sorter(obj));
}

interface IUseDebouncedFetch<T, F> {
    query: string;
    fetchFn: (args: { query?: string; signal: AbortSignal; conditionalExclude?: Partial<F> }) => Promise<T>;
    delay?: number;
    conditionalExclude?: Partial<F>;
}

function useDebouncedFetch<T, F>({
    query,
    fetchFn,
    delay = 400,
    conditionalExclude
}: IUseDebouncedFetch<T, F>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);

    // Mantén fetchFn estable sin meterlo como dependencia del efecto:
    const fetchRef = useRef(fetchFn);
    useEffect(() => {
        fetchRef.current = fetchFn;
    }, [fetchFn]);

    // Claves estables para deps (no identidades)
    const queryKey = useMemo(() => (query ? query.trim() : ""), [query]);
    const excludeKey = useMemo(() => stableStringify(conditionalExclude ?? {}), [conditionalExclude]);

    // NUEVO: refs para gestionar timeout y el controlador de la petición activa
    const timeoutRef = useRef<number | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    // NUEVO: función que ejecuta la petición con los parámetros *actuales* (queryKey + conditionalExclude)
    const run = useCallback(async () => {
        // cancela cualquier petición anterior en vuelo
        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null;
        }

        setLoading(true);
        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            const result = await fetchRef.current({
                query: queryKey || undefined,
                signal: controller.signal,
                conditionalExclude
            });
            setData(result);
        } catch (err: any) {
            // Ignora aborts; deja pasar otros errores
            if (!(err instanceof DOMException && err.name === "AbortError")) {
                console.error("useDebouncedFetch error:", err);
                // si lo prefieres, podrías setear data = null aquí
            }
        } finally {
            // limpia el controlador si corresponde
            if (controllerRef.current === controller) {
                controllerRef.current = null;
            }
            setLoading(false);
        }
    }, [queryKey, excludeKey]); // <- depende solo de las "claves estables"

    useEffect(() => {
        // comportamiento original con debounce, pero usando las refs
        setLoading(true);

        // Limpia cualquier timeout previo
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        // Aborta la petición en curso si existe
        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null;
        }

        // Programa la nueva ejecución con debounce
        timeoutRef.current = window.setTimeout(() => {
            timeoutRef.current = null;
            // ejecuta con los valores actuales
            void run();
        }, delay);

        // cleanup: si cambian deps o al desmontar
        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (controllerRef.current) {
                controllerRef.current.abort();
                controllerRef.current = null;
            }
        };
    }, [queryKey, excludeKey, delay, run]); // <- sin fetchFn (lo maneja fetchRef)

    // NUEVO: API pública para re-ejecutar la última búsqueda
    const refetch = useCallback((opts?: { immediate?: boolean }) => {
        // siempre limpiamos el debounce y abortamos lo que esté en curso
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null;
        }

        const immediate = opts?.immediate ?? true;

        // 🔧 NUEVO: reflejar intención de refetch poniendo loading=true
        // - immediate=true: mostrará loading enseguida y luego run() lo mantendrá
        // - immediate=false: igualamos el comportamiento del useEffect (loading durante el debounce)
        setLoading(true);

        if (immediate) {
            void run(); // run() también setea loading=true internamente (idempotente)
        } else {
            timeoutRef.current = window.setTimeout(() => {
                timeoutRef.current = null;
                void run();
            }, delay);
        }
    }, [delay, run]);

    // NUEVO: Se retorna refetch además de { data, loading }
    return { data, loading, refetch };
}

export default useDebouncedFetch;
