import { useDispatch } from "react-redux";
import type { AppDispatchRedux } from "../../../store/store";
import { useEffect, useRef, useState } from "react";
import { clearError, setError } from "../../../store/slicer/errorSlicer";
import type { IItem } from "../../../interfaces/item";
import { fetchItemsByIdFromDB } from "../query/itemsQueries";

const useItemById = (id: number | null) => {

    const dispatch = useDispatch<AppDispatchRedux>();
    const [itemById, setItemById] = useState<IItem | null>(null);
    const [loadingItemById, setLoadingItemById] = useState<boolean>(true);
    const isMounted = useRef(true);
    const refetchAbortController = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!id) return;
        isMounted.current = true;
        const controller = new AbortController();
        const { signal } = controller;

        const fetchItemByIdFunction = async () => {
            setLoadingItemById(true);
            dispatch(clearError("itemByIdHook"));
            try {
                const data = await fetchItemsByIdFromDB({ id, signal });
                if (isMounted.current) setItemById(data || null);
            } catch (err: unknown) {
                if (!isMounted.current) return;
                if ((err as any).name === "AbortError") {
                    // petición abortada, silencioso
                    return;
                }
                const msg =
                    err instanceof Error
                        ? { validation: err.message }
                        : { validation: "Unknown error" };
                dispatch(setError({
                    key: "itemByIdHook",
                    message: msg
                }));
            } finally {
                if (isMounted.current)
                    setLoadingItemById(false);
            }
        };

        fetchItemByIdFunction();

        return () => {
            isMounted.current = false;
            controller.abort();
            // Abortamos cualquier fetch pendiente de refetch
            if (refetchAbortController.current) {
                refetchAbortController.current.abort();
                refetchAbortController.current = null;
            }
        };

    }, [id]);

    const refetchItemById = async () => {
        if (!id) return;
        const controller = new AbortController();
        refetchAbortController.current = controller;
        const signal = controller.signal;
        setLoadingItemById(true);
        dispatch(clearError("itemByIdHook"));
        try {
            const data = await fetchItemsByIdFromDB({ id, signal });
            if (isMounted.current) setItemById(data || null);
        } catch (err: unknown) {
            if (!isMounted.current) return;
            if ((err as any).name === "AbortError") {
                // petición abortada, silencioso
                return;
            }
            const msg =
                err instanceof Error
                    ? { validation: err.message }
                    : { validation: "Unknown error" };
            dispatch(setError({
                key: "itemByIdHook",
                message: msg
            }));
        } finally {
            if (isMounted.current)
                setLoadingItemById(false);
            refetchAbortController.current = null;
        }
    };

    return {
        itemById,
        loadingItemById,
        refetchItemById
    };

};

export default useItemById;
