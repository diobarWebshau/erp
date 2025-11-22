import type { ClientState, ClientAction } from "../../../../../context/clientTypes"
import { memo, useCallback, useEffect, useMemo, useState, type Dispatch } from "react";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { Bookmark, ChevronLeft, Plus, Trash2 } from "lucide-react";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import StyleModule from "./Step2.module.css";
import { useCountryStateCitySeparated } from "../../../../../../../hooks/useCountryStateCity";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialClientAddress } from "../../../../../../../interfaces/clientAddress";
import type { IPartialProductDiscountClient } from "../../../../../../../interfaces/product-discounts-clients";
import AddressModal from "../../../../modals/address/AddressModal";
import {
    add_draft_client_addresses, remove_draft_client_addresses, add_draft_client_product_discounts, next_step,
    remove_draft_client_product_discounts, update_draft_client_product_discounts, back_step
} from "./../../../../../context/clientActions"
import type { RowAction } from "interfaces/tableTypes";
import { generateRandomIds } from "./../../../../../../../helpers/nanoId";
import { formatCurrency } from "./../../../../../../../helpers/formttersNumeric";
import SelectProductsModal from "./../../../../../../../comp/features/modal-product2/SelectProductsModal"
import type { IProduct } from "interfaces/product";
import type { AppDispatchRedux, RootState } from "store/store";
import { useDispatch, useSelector } from "react-redux";
import { clearError, setError } from "../../../../../../../store/slicer/errorSlicer";
import NumericInputCustom from "../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import StandarTextAreaCustom from "../../../../../../../comp/primitives/text-area/custom/StandarTextAreaCustom";
import type { IPartialClient } from "../../../../../../../interfaces/clients";
import UnderlineLabelInputText from "../../../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import UnderlineLabelInputNumeric from "../../../../../../../comp/primitives/input/layouts/underline-label/numeric/UnderlineLabelInputNumeric";
import UnderlineStandardSelectCustom from "../../../../../../../comp/features/select/underline/UnderlineStandardSelectCustom";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "products/products/exclude/";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

interface IStep2 {
    state: ClientState;
    dispatch: Dispatch<ClientAction>;
    onDiscard: () => void;
    onUpdate: ({ original, updated }: { original: IPartialClient, updated: IPartialClient }) => Promise<void>
    refetch: () => void;
}

const Step2 = ({ state, dispatch, onDiscard, onUpdate, refetch }: IStep2) => {


    // * *********** Estados globales ************ 

    const dispatchRedux: AppDispatchRedux = useDispatch<AppDispatchRedux>();
    const errorRedux = useSelector((state: RootState) => state.error);

    // * *********** Estado contextual del cliente ************ 


    // * *********** Estados logicos locales ************ 

    const [countryName, setCountryName] = useState<string | null>(state?.draft?.country ?? null);
    const [stateName, setStateName] = useState<string | null>(state?.draft?.state ?? null);
    const [cityName, setCityName] = useState<string | null>(state?.draft?.city ?? null);
    const [zipCode, setZipCode] = useState<number | null>(state?.draft?.zip_code || null);
    const [street, setStreet] = useState<string | null>(state?.draft?.street ?? null);
    const [streetNumber, setStreetNumber] = useState<number | null>(state?.draft?.street_number || null);
    const [neighborhood, setNeighborhood] = useState<string | null>(state?.draft?.neighborhood ?? null);
    const [paymentTerms, setPaymentTerms] = useState<string | null>(state?.draft?.payment_terms ?? null);

    // * *********** Estados gui locales ************ 

    const [isActiveAddressModal, setIsActiveAddressModal] = useState<boolean>(false);
    const [isActiveDiscountModal, setIsActiveDiscountModal] = useState<boolean>(false);
    const toggleIsActiveAddressModal = useCallback(() => setIsActiveAddressModal(prev => !prev), []);
    const toggleIsActiveDiscountModal = useCallback(() => setIsActiveDiscountModal(prev => !prev), []);

    // * *********** Hook para el manejo de los selectores de pais, estado y ciudad ************ */

    const csc = useCountryStateCitySeparated({
        countryName, onCountryNameChange: setCountryName,
        stateName, onStateNameChange: setStateName,
        cityName, onCityNameChange: setCityName,
        allowedCountries: ["Mexico", "US", "Canada"],
        countryOrderIso: ["MX", "US", "CA"],
    });

    // *  *********** Funciones ************ 

    const handleDeleteAddress = useCallback((address: IPartialClientAddress) => {
        const id = address.id;
        if (!id) return;
        dispatch(remove_draft_client_addresses([id]));
    }, [dispatch, state]);

    const handleAddDiscount = useCallback((products: IProduct[]) => {
        const newDiscount: IPartialProductDiscountClient[] = products.map((p) => ({
            id: generateRandomIds(),
            product_id: p.id,
            product: p,
            discount_percentage: 0,
        }));
        dispatch(add_draft_client_product_discounts(newDiscount));
        toggleIsActiveDiscountModal();
    }, [dispatch, toggleIsActiveDiscountModal]);

    const handleDeleteDiscount = useCallback((discount: IPartialProductDiscountClient) => {
        const id = discount.id;
        if (!id) return;
        dispatch(remove_draft_client_product_discounts([id]));
    }, [dispatch, state]);

    const handleAddAddress = useCallback((address: IPartialClientAddress) => {
        const newAddress = {
            id: generateRandomIds(),
            ...address,
        };
        dispatch(add_draft_client_addresses([newAddress]));
        toggleIsActiveAddressModal();
    }, [dispatch, toggleIsActiveAddressModal, generateRandomIds]);

    const excludeIds = useMemo<number[]>(
        () =>
            state.draft?.product_discounts_client
                ?.map(p => p.product_id)
                .filter((id): id is number => id != null) ?? [],
        [state.draft?.product_discounts_client]
    );

    const getRowAttr = useMemo(() => (data: IProduct) => data.name || "", []);

    const fetchLoadProducts = useCallback(async (query: string | number): Promise<IProduct[]> => {
        try {

            // Anexamos el query
            const params = new URLSearchParams();
            params.append("filter", query.toString());

            // Anexamos los ids a excluir
            excludeIds.forEach((id) => params.append("excludeIds", id.toString()));

            // Generamos la url
            const url = new URL(API_URL.toString());
            // Adjuntamos los params a la url
            url.search = params.toString();

            // Realizamos la peticion
            const response = await fetch(url.toString(), { method: "GET" });

            // Validamos la respuesta
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData?.message ?? "Error al cargar productos";
                if (response.status >= 500) throw new Error(message);

                dispatchRedux(setError({ key: "likeWithExludeToProducts", message }));
                return [];
            }

            dispatchRedux(clearError("likeWithExludeToProducts"));
            const data: IProduct[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    }, [state.draft?.product_discounts_client, dispatchRedux, excludeIds]);

    // * *********** Funciones memoizadas para las tablas ************ 

    const getRowIdAddresses = useMemo(() => (row: IPartialClientAddress, index: number) => row.id?.toString() ?? index.toString(), []);
    const getRowIdDiscounts = useMemo(() => (row: IPartialProductDiscountClient, index: number) => row.id?.toString() ?? index.toString(), []);

    const handleChangeDiscount = useCallback((id: string, value: number) => {
        dispatch(update_draft_client_product_discounts({ id: id, attributes: { discount_percentage: value } }));
    }, [dispatch]);

    const columnsAddresses: ColumnDef<IPartialClientAddress>[] = useMemo(() => [
        {
            accessorKey: "street",
            header: "Calle",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        },
        {
            accessorKey: "street_number",
            header: "Numero",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        },
        {
            accessorKey: "neighborhood",
            header: "Colonia",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        },
        {
            accessorKey: "city",
            header: "Ciudad",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        },
        {
            accessorKey: "state",
            header: "Estado",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        },
        {
            accessorKey: "country",
            header: "Pais",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        },
        {
            accessorKey: "zip_code",
            header: "CP",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        },
    ], []);

    const columnsDiscounts: ColumnDef<IPartialProductDiscountClient>[] = useMemo(() => [
        {
            accessorFn: (row: IPartialProductDiscountClient) => row?.product?.name,
            header: "Producto",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        },
        {
            accessorFn: (row: IPartialProductDiscountClient) => row?.product?.sale_price,
            header: "Precio de venta",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "number",
                mode: "range",
            },
            cell: ({ row }) => {
                return formatCurrency(row.original.product?.sale_price ?? 0);
            },
        },
        {
            accessorKey: "discount_percentage",
            header: "Descuento porcentual (%)",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "number",
                mode: "range",
            },
            cell: ({ row }) => {

                const value = Number(row.original.discount_percentage) ?? 0;

                const onChange = useCallback((value: number) => handleChangeDiscount(row.original.id?.toString() ?? "", value), [handleChangeDiscount, row]);

                return <NumericInputCustom
                    value={value}
                    onChange={onChange}
                    min={1}
                    max={100}
                    placeholder="%"
                    onlyCommitOnBlur
                />;
            },
        },
    ], [dispatch, handleChangeDiscount]);

    const rowActionsAddresses: RowAction<IPartialClientAddress>[] = useMemo(() => [
        {
            label: "Eliminar",
            onClick: handleDeleteAddress,
            icon: <Trash2 className={StyleModule.iconRowDeleteAction} />
        },
    ], [handleDeleteAddress]);

    const rowActionsDiscounts: RowAction<IPartialProductDiscountClient>[] = useMemo(() => [
        {
            label: "Eliminar",
            onClick: handleDeleteDiscount,
            icon: <Trash2 className={StyleModule.iconRowDeleteAction} />
        },
    ], [handleDeleteDiscount]);

    const ExtraComponentAddresses = useCallback(() => {
        return (
            <div className={StyleModule.containerExtraComponents}>
                <span className={`nunito-bold ${StyleModule.subTitle}`}> Direcciones de envio *</span>
                <MainActionButtonCustom
                    label="Agregar direccion"
                    onClick={toggleIsActiveAddressModal}
                    icon={<Plus />}
                />
            </div>
        );
    }, [toggleIsActiveAddressModal]);


    const ExtraComponentDiscountsFunc = useCallback(() => {
        return (
            <ExtraComponentDiscounts
                fetchLoadProducts={fetchLoadProducts}
                toggleIsActiveDiscountModal={toggleIsActiveDiscountModal}
            />
        );
    }, [fetchLoadProducts, toggleIsActiveDiscountModal]);


    const handleOnClickSaveContinue = useCallback(async () => {
        if (
            street === '' || street === null ||
            streetNumber === 0 || streetNumber === null ||
            neighborhood === '' || neighborhood === null ||
            countryName === '' || countryName === null ||
            stateName === '' || stateName === null ||
            cityName === '' || cityName === null ||
            zipCode === null || zipCode === 0
        ) {
            ToastMantine.feedBackForm({ message: "Debe completar todos los campos" });
            return;
        }

        const isDiscountsValid = (state.draft?.product_discounts_client?.length || 0) > 0 ?
            state.draft?.product_discounts_client?.every(
                (d) => d?.discount_percentage !== undefined && d.discount_percentage > 0 && d.discount_percentage < 100
            ) : true;

        if (!isDiscountsValid) {
            ToastMantine.feedBackForm({
                message: "Los porcentajes de descuento deben ser mayores a 0 y menores a 100",
            });
            return;
        }

        if ((state.draft?.addresses?.length || 0) === 0) {
            ToastMantine.feedBackForm({
                message: "Debe agregar al menos una direccion",
            });
            return;
        }

        const updatedData: IPartialClient = {
            ...state.draft,
            street,
            street_number: streetNumber,
            neighborhood,
            country: countryName,
            state: stateName,
            city: cityName,
            zip_code: zipCode,
            ...(paymentTerms !== null && paymentTerms !== "" ? { payment_terms: paymentTerms } : {})
        };

        try {
            // 1) Persistir
            await onUpdate({ original: state.data, updated: updatedData });

            //  Nota: leer errorRedux aquí puede no reflejar el último dispatch.
            if (Object.keys(errorRedux).length > 0) {
                Object.entries(errorRedux).forEach(([_, value]) => {
                    ToastMantine.feedBackForm({ message: value as string });
                });
                return;
            }

            // 2) Refrescar y esperar a que el contexto quede actualizado por el Provider
            await refetch();

            // 3) Avanzar con datos ya refrescados
            dispatch(next_step());
        } catch (e: any) {
            ToastMantine.feedBackForm({ message: e?.message ?? "No se pudo guardar los cambios" });
            return;
        }
    }, [
        street, streetNumber, neighborhood, countryName, stateName, cityName, zipCode,
        paymentTerms, state, onUpdate, refetch, dispatch, errorRedux
    ]);


    const handleOnChangePaymentTerms = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => (() => setPaymentTerms(e.target.value))(), []);

    const handleOnClickBackStep = useCallback(() => {
        dispatch(back_step());
    }, [dispatch]);

    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>
                <div className={StyleModule.taxAddressContainer}>
                    <span className={`nunito-bold ${StyleModule.subTitle}`}> Dirección fiscal *</span>
                    <div className={StyleModule.fieldBlock}>
                        <UnderlineLabelInputText
                            value={street}
                            onChange={setStreet}
                            label="Calle"
                            withValidation
                        />

                        <UnderlineLabelInputNumeric
                            value={streetNumber}
                            onChange={setStreetNumber}
                            label="Numero"
                            withValidation
                        />
                        <UnderlineLabelInputText
                            value={neighborhood}
                            onChange={setNeighborhood}
                            label="Colonia"
                            withValidation
                        />
                    </div>
                    <div className={StyleModule.fieldBlock}>
                        <UnderlineStandardSelectCustom
                            options={csc.countryNames}
                            value={countryName}
                            onChange={setCountryName}
                            label="Pais"
                            withValidation
                            disabled={csc.countryNames.length === 0}
                            maxHeight="200px"
                        />
                        <UnderlineStandardSelectCustom
                            options={csc.stateNames}
                            value={stateName}
                            onChange={setStateName}
                            label="Estado"
                            withValidation
                            disabled={csc.stateNames.length === 0}
                            maxHeight="200px"
                        />
                        <UnderlineStandardSelectCustom
                            options={csc.cityNames}
                            value={cityName}
                            onChange={setCityName}
                            label="Ciudad"
                            withValidation
                            disabled={csc.cityNames.length === 0}
                            maxHeight="200px"
                        />
                        <UnderlineLabelInputNumeric
                            value={zipCode}
                            onChange={setZipCode}
                            label="Codigo postal"
                            withValidation
                        />
                    </div>
                </div>
                <div className={StyleModule.addressesContainer}>
                    <GenericTableMemo
                        modelName="clientAddress"
                        getRowId={getRowIdAddresses}
                        columns={columnsAddresses}
                        data={state.draft?.addresses ?? []}
                        extraComponents={ExtraComponentAddresses}
                        rowActions={rowActionsAddresses}
                        typeRowActions="icon"
                        enableOptionsColumn
                        noResultsMessage="No hay direcciones asignadas"
                    />
                </div>
                <div className={StyleModule.discountsContainer}>
                    <GenericTableMemo
                        modelName="clientDiscount"
                        getRowId={getRowIdDiscounts}
                        columns={columnsDiscounts}
                        data={state.draft?.product_discounts_client ?? []}
                        extraComponents={ExtraComponentDiscountsFunc}
                        rowActions={rowActionsDiscounts}
                        typeRowActions="icon"
                        enableOptionsColumn
                        noResultsMessage="No hay descuentos asignados"
                    />
                </div>
                <div className={StyleModule.paymentTermsContainer}>
                    <span className="nunito-bold">{`Terminos de pago (Opcional)`}</span>
                    <StandarTextAreaCustom
                        value={paymentTerms ?? ""}
                        onChange={handleOnChangePaymentTerms}
                        placeholder="Terminos de pago"
                        maxLength={500}
                    />
                </div>
            </div>
            <div className={StyleModule.containerButtons}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onDiscard}
                />
                <TertiaryActionButtonCustom
                    label="Regresar"
                    icon={<ChevronLeft />}
                    onClick={handleOnClickBackStep}
                />
                <MainActionButtonCustom
                    label="Guardar"
                    onClick={handleOnClickSaveContinue}
                    icon={<Bookmark />}
                />
            </div>
            {isActiveAddressModal && (
                <AddressModal
                    onClose={toggleIsActiveAddressModal}
                    onAdd={handleAddAddress}
                />
            )}
            {isActiveDiscountModal && (
                <SelectProductsModal
                    onClose={toggleIsActiveDiscountModal}
                    onClick={handleAddDiscount}
                    placeholder="Selecciona los productos"
                    labelOnClick="Agregar productos"
                    headerTitle="Selecciona los productos"
                    emptyMessage="No hay productos o no coinciden con la busqueda"
                    getRowAttr={getRowAttr}
                    loadOptions={fetchLoadProducts}
                />
            )}
        </div>
    );
};

export default Step2;

// * ************* ExtraComponentsDiscounts *************  *

interface IExtraComponentDiscounts {
    fetchLoadProducts: (query: string | number) => Promise<IProduct[]>;
    toggleIsActiveDiscountModal: () => void;
}

const ExtraComponentDiscounts = memo(({
    fetchLoadProducts, toggleIsActiveDiscountModal
}: IExtraComponentDiscounts) => {

    const [items, setItems] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await fetchLoadProducts("");
                if (!cancelled) setItems(Array.isArray(res) ? res : []);
            } catch {
                if (!cancelled) setItems([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [fetchLoadProducts]);

    return (
        <div className={StyleModule.containerExtraComponents}>
            <span className={`nunito-bold ${StyleModule.subTitle}`}> Descuentos de productos *</span>
            <MainActionButtonCustom
                label="Asignar productos"
                onClick={toggleIsActiveDiscountModal}
                icon={<Plus />}
                disabled={loading || items.length === 0}
            />
        </div>
    );
});