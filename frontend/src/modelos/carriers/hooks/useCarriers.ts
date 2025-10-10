import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchCarriersFromDB } from "../query/carriersQueries";
import type { ICarrier } from "../../../interfaces/carriers";
import type { AppDispatchRedux } from "../../../store/store";
import { setError, clearError } from "../../../store/slicer/errorSlicer";

type UseCarriersResult = {
    carriers: ICarrier[];
    loadingCarriers: boolean;
    refetchCarriers: () => Promise<void>;
};

/**
 * Custom hook para obtener y manejar la lista de transportistas (carriers).
 * Controla el estado de carga, errores y cancelación de peticiones.
 */
const useCarriers = (): UseCarriersResult => {
    const dispatch = useDispatch<AppDispatchRedux>();

    // Estado local con los carriers obtenidos desde el backend
    const [carriers, setCarriers] = useState<ICarrier[]>([]);

    // Estado que indica si se está cargando la información
    const [loadingCarriers, setLoadingCarriers] = useState<boolean>(true);

    // Referencia al AbortController actual para poder cancelar peticiones en curso
    const controllerRef = useRef<AbortController | null>(null);

    /**
     * Función para volver a obtener la lista de carriers desde la base de datos.
     * Se asegura de cancelar cualquier request previa antes de iniciar una nueva.
     */
    const refetchCarriers = useCallback(async () => {
        // Cancela una petición anterior si aún estaba activa
        controllerRef.current?.abort();

        // Crea un nuevo AbortController para esta petición
        const controller = new AbortController();
        controllerRef.current = controller;

        // Indica que la carga ha comenzado
        setLoadingCarriers(true);

        // Limpia cualquier error previo relacionado con carriers
        dispatch(clearError("Carriers"));

        try {
            // Ejecuta la consulta al backend
            const data = await fetchCarriersFromDB(dispatch, controller.signal);

            // Si la petición fue cancelada, no actualizamos el estado
            if (controller.signal.aborted) return;

            // Guarda los carriers obtenidos en el estado
            setCarriers(data);
        } catch (err: unknown) {
            // Ignora el error si la petición fue cancelada manualmente
            if (err instanceof DOMException && err.name === "AbortError") return;

            // En caso de error real, registra el mensaje en el store global
            const msg =
                err instanceof Error ? { validation: err.message } : { validation: "Unknown error" };

            dispatch(setError({ key: "Carriers", message: msg }));
        } finally {
            // Finaliza la carga solo si la petición no fue cancelada
            if (!controller.signal.aborted) setLoadingCarriers(false);
        }
    }, [dispatch]);

    /**
     * Efecto inicial:
     * - Ejecuta la primera carga de carriers al montar el componente.
     * - Cancela la petición en curso si el componente se desmonta.
     */
    useEffect(() => {
        refetchCarriers();

        // Cleanup: cancelar cualquier request activa al desmontar
        return () => {
            controllerRef.current?.abort();
        };
    }, [refetchCarriers]);

    // Retorna los datos, el estado de carga y la función para volver a cargar
    return {
        carriers,
        loadingCarriers,
        refetchCarriers,
    };
};

export default useCarriers;
