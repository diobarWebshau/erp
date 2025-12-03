import CriticalActionButton from "./../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton"
import MainActionButtonCustom from "./../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom"
import SingleSelectCheckSearchCustom from "./../../../../../../../comp/features/select-check-search/single/custom/SingleSelectCheckSearchCustom"
import type { IPartialPurchasedOrder } from "../../../../../../../interfaces/purchasedOrder"
import type { IClient, IPartialClient } from "../../../../../../../interfaces/clients"
import { clearError, setError } from "./../../../../../../../store/slicer/errorSlicer"
import { useModalEditState, useModalEditDispatch } from "../../context/modalEditHooks"
import { next_step, update_purchase_order, set_step } from "../../context/modalEditActions"
import type { AppDispatchRedux } from "../../../../../../../store/store";
import { useCallback, useMemo, useState } from "react"
import { ChevronRight } from "lucide-react"
import StyleModule from "./Step1.module.css"
import { useDispatch } from "react-redux"

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "clients/clients";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

const Step1 = () => {

    // ? ************ Hooks ************/

    const dispatchRedux: AppDispatchRedux = useDispatch<AppDispatchRedux>();

    const state = useModalEditState();
    const dispatch = useModalEditDispatch();

    // ? ************ Estados ************/

    const [selectedSingle, setSelectedSingle] = useState<IPartialClient | null>(state.updated.client ?? null);

    const handleOnClickBack = () => {
        dispatch(set_step(3));
    }
    // ? ************ Funciones ************/

    const handleNextStep = useCallback(() => {
        if (!selectedSingle) {
            return;
        } else {
            const purchasedOrder: IPartialPurchasedOrder = {
                client_id: selectedSingle.id,
                company_name: selectedSingle.company_name,
                tax_id: selectedSingle.tax_id,
                email: selectedSingle.email,
                phone: selectedSingle.phone,
                city: selectedSingle.city,
                state: selectedSingle.state,
                country: selectedSingle.country,
                street: selectedSingle.street,
                street_number: selectedSingle.street_number,
                neighborhood: selectedSingle.neighborhood,
                payment_terms: selectedSingle.payment_terms,
                zip_code: selectedSingle.zip_code,
                tax_regimen: selectedSingle.tax_regimen,
                cfdi: selectedSingle.cfdi,
                payment_method: selectedSingle.payment_method,
                client: selectedSingle
            }
            dispatch(update_purchase_order(purchasedOrder));
            dispatch(next_step());
        }
    }, [selectedSingle, dispatch])


    const fetchLoadProducts = useCallback(async (query: string | number, signal?: AbortSignal): Promise<IClient[]> => {
        try {
            const params = new URLSearchParams();
            params.append("filter", String(query));

            // Repite el param por cada id: ?excludeIds=1&excludeIds=2...

            const url = new URL(API_URL.toString());
            url.search = params.toString();

            const response = await fetch(url.toString(), { method: "GET", signal });

            if (!response.ok) {
                // intenta leer json, pero no lo asumas
                const errorData = await response.json().catch(() => ({}));
                const message = errorData?.message ?? "Error al cargar productos";

                if (response.status >= 500) throw new Error(message);

                dispatchRedux(setError({ key: "likeWithExcludeToClients", message }));
                return [];
            }

            dispatchRedux(clearError("likeWithExcludeToClients"));
            const data: IClient[] = await response.json();
            return data;
        } catch (error) {
            // Si fue aborto, simplemente ignora o retorna []
            if ((error as any)?.name === "AbortError") return [];
            console.error("Error fetching products:", error);
            return [];
        }
    },
        [dispatchRedux] // elimina deps que no se usan
    );

    const getRowAttr = useMemo(() => (row: IPartialClient) => row?.company_name ?? "", []);

    return (
        <div className={StyleModule.container}>
            <section className={StyleModule.headerSection}>
                <h2 className={`nunito-bold`}>Clientes</h2>
                <MainActionButtonCustom
                    onClick={handleNextStep}
                    label="Siguiente"
                    icon={<ChevronRight />}
                />
            </section>
            <div className={StyleModule.formSection}>
                <div className={StyleModule.bodySection}>
                    <SingleSelectCheckSearchCustom
                        loadOptions={fetchLoadProducts}
                        rowId={getRowAttr}
                        selected={selectedSingle}
                        setSelected={setSelectedSingle}
                        emptyMessage={"No hay clientes por mostrar"}
                        maxHeight="300px"
                    />
                </div>
                <div className={StyleModule.footerSection}>
                    <CriticalActionButton
                        label="Cancelar"
                        onClick={handleOnClickBack}
                    />
                    <MainActionButtonCustom
                        onClick={handleNextStep}
                        label="Siguiente"
                        icon={<ChevronRight />}
                    />
                </div>
            </div>
        </div>
    )
}

export default Step1