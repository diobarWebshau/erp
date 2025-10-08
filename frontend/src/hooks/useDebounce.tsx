import { useState, useEffect } from "react";

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
 */
const useDebouncedFetch = <T,>(
    query: string,
    fetchFn: (query: string, signal: AbortSignal) => Promise<T>,
    delay = 400
) => {
    // Estado para almacenar los resultados del fetch
    const [data, setData] = useState<T | null>(null);

    // Estado para indicar si hay una petición en curso
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Limpiamos espacios al inicio y final del query
        const searchTerm = query.trim();

        // Controlador para poder cancelar la petición si el usuario escribe más
        const controller = new AbortController();

        // Temporizador del debounce: espera antes de lanzar la petición
        const handler = setTimeout(async () => {
            try {
                // Marca que se está cargando
                setLoading(true);

                // Ejecuta la función fetch pasada por el usuario, con señal de cancelación
                const result = await fetchFn(searchTerm, controller.signal);

                // Almacena los datos obtenidos
                setData(result);
            } finally {
                // Al finalizar (éxito o error), desactiva el loading
                setLoading(false);
            }
        }, delay);

        // Cleanup: si el query cambia antes de que pase el delay,
        // se limpia el timeout y se aborta la petición anterior
        return () => {
            clearTimeout(handler);
            controller.abort();
        };
    }, [query, delay, fetchFn]);

    // Devuelve los estados necesarios al componente que use el hook
    return { data, loading };
};

export default useDebouncedFetch;

