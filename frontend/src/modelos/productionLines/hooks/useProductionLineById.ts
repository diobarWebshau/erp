import {
    useEffect,
    useState
} from "react";
import {
    useDispatch
} from "react-redux";
import {
    fetchProductionLineById
} from "../query/productionLinesQueries";
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

const useProductionLineById = (id: number | undefined | null) => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [productionLineById, setProductionLineById] =
        useState<IProductionLine | null>(null);
    const [loadingProductionLineById, setLoadingProductionLineById] =
        useState<boolean>(true);

    console.log("id diobar", id);

    const fetchProductionLineByIdFunction = async () => {
        setLoadingProductionLineById(true);
        dispatch(
            clearError("productionLineByIdHook")
        );
        console.log("entro" );
        try {
            console.log("afuera del if" );
            if (id) {   
                console.log("entro if" );
                const data =
                    await fetchProductionLineById(
                        id,
                        dispatch
                    );
                setProductionLineById(data);
                console.log("data", data);
            } else {
                console.log("entro else" );
                setProductionLineById(null);
            }
            console.log("salgo" );
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "productionLineByIdHook",
                    message: msg
                }));
        } finally {
            setLoadingProductionLineById(false);
        }
    };

    useEffect(() => {
        console.log("useEffect");
        fetchProductionLineByIdFunction();
    }, [id]);

    return {
        productionLineById,
        loadingProductionLineById,
        refetchProductionLineById:
            fetchProductionLineByIdFunction,
    };
};

export default useProductionLineById;
