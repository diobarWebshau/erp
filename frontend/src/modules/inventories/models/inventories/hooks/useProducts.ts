import {
    useEffect, useState
} from "react";
import {
    useDispatch
} from "react-redux";
import type {
    AppDispatchRedux
} from "../../../../../store/store";
import {
    setError, clearError
} from "../../../../../store/slicer/errorSlicer";
import type {
    IProduct
} from "../../../../../interfaces/product";
import {
    fetchProductsFromDB
} from "../../../../../queries/productsQueries";

const useProducts = () => {
    const dispatch =
        useDispatch<AppDispatchRedux>();
    const [products, setProducts] =
        useState<IProduct[]>([]);
    const [loadingProducts, setLoadingProducts] =
        useState<boolean>(true);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        dispatch(clearError("products"));
        try {
            const data =
                await fetchProductsFromDB(dispatch);
            setProducts(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(setError({
                key: "products",
                message: msg
            }));
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        loadingProducts,
        refetchProducts:
            fetchProducts,
    };
};

export default useProducts;
