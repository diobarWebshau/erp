import {
    useDispatch
} from "react-redux";
import {
    useEffect,
    useState
} from "react";
import type {
    AppDispatchRedux
} from "../../../store/store";
import {
    getInventoryInputsOfProductInOneLocation
} from "../queries/locationsQueries";
import {
    setError,
    clearError
} from "../../../store/slicer/errorSlicer";
import type {
    IInventoryInput
} from "../../../interfaces/inventoryInputs";

const useProductInventoryInput = (
    product_id: number | undefined | null,
    location_id: number | undefined | null
) => {
    const dispatch = useDispatch<AppDispatchRedux>();
    const [inventoryInputsProduct, setInventoryInputsProduct] =
        useState<IInventoryInput[]>([]);
    const [loadingInventoryInputsProduct, setLoadingInventoryInputsProduct] =
        useState<boolean>(true);


    const fetchInventoryInputsProductFunction = async () => {
        setLoadingInventoryInputsProduct(true);
        dispatch(
            clearError("inventoryInputsProductHook")
        );
        try {
            const data =
                await getInventoryInputsOfProductInOneLocation(
                    product_id,
                    location_id,
                    dispatch
                );
            setInventoryInputsProduct(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(
                setError({
                    key: "inventoryInputsProductHook",
                    message: msg
                })
            );
            return [];
        } finally {
            setLoadingInventoryInputsProduct(false);
        }
    };

    useEffect(() => {
        fetchInventoryInputsProductFunction();
    }, [product_id, location_id]);

    return {
        inventoryInputsProduct,
        loadingInventoryInputsProduct,
        refetchInventoryInputsProduct:
            fetchInventoryInputsProductFunction,
    };
};

export default useProductInventoryInput;
