import { useState, useEffect, useRef, useMemo } from "react";

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

    useEffect(() => {
        setLoading(true);
        const controller = new AbortController();
        const run = async () => {
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
                setLoading(false);
            }
        };
        const t = window.setTimeout(run, delay);

        return () => {
            window.clearTimeout(t);
            controller.abort();
        };
    }, [queryKey, excludeKey, delay]); // <- sin fetchFn (lo maneja fetchRef)

    return { data, loading };
}

export default useDebouncedFetch;

