import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchProductionLineDetails
} from "./../../../queries/productionLines";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    setError,
    clearError
} from "../../../store/slicer/errorSlicer";
import type {
    IProductionLine
} from "../../../interfaces/productionLines";

const useProductionLineById = (id: number | undefined) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [productionLinesById, setProductionLinesById] =
        useState<IProductionLine | null>(null);
    const [loadingProductionLinesById, setLoadingProductionLinesById] =
        useState<boolean>(true);

    const fetchProductionLineDetailsById = async () => {
        setLoadingProductionLinesById(true);
        dispatch(
            clearError("productionLinesDetails")
        );
        try {
            if (id) {
                const data =
                    await fetchProductionLineDetails(
                        id,
                        dispatch
                    );
                setProductionLinesById(data);
            } else {
                setProductionLinesById(null);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "productionLinesDetails",
                    message: msg
                }));
        } finally {
            setLoadingProductionLinesById(false);
        }
    };

    useEffect(() => {
        fetchProductionLineDetailsById();
    }, [id]);

    return {
        productionLinesById,
        loadingProductionLinesById,
        refetchProductionLinesById:
            fetchProductionLineDetailsById,
    };
};

export default useProductionLineById;
