import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchClientAddressesFromDB } from "./fetchs";
import type { IClientAddress } from "../../../../interfaces/clientAddress";
import type { AppDispatchRedux } from "../../../../store/store";
import { setError, clearError } from "../../../../store/slicer/errorSlicer";

const useClientAddresses = (clientId: number | undefined) => {
    const dispatch = useDispatch<AppDispatchRedux>();
    const [addresses, setAddresses] = useState<IClientAddress[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);

    const fetchAddresses = async () => {
        if (typeof clientId !== "number") return;
        setLoadingAddresses(true);
        dispatch(clearError("clientAddresses"));
        try {
            const data = await fetchClientAddressesFromDB(clientId, dispatch);
            setAddresses(data);
        } catch (err: unknown) {
            const msg = err instanceof Error
                ? { validation: err.message }
                : { validation: "Unknown error" };
            dispatch(setError({ key: "clientAddresses", message: msg }));
        } finally {
            setLoadingAddresses(false);
        }
    };

    useEffect(() => {
        if (typeof clientId !== "number") {
            setAddresses([]);
            return;
        }
        fetchAddresses();
    }, [clientId]);


    return {
        addresses,
        loadingAddresses,
        refetchAddresses: fetchAddresses,
    };
};

export default useClientAddresses;
