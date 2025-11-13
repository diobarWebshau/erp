import UnderlineLabelInputNumeric from "../../../../../../../comp/primitives/input/layouts/underline-label/numeric/UnderlineLabelInputNumeric";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import UnderlineLabelInputText from "../../../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import StandarTextAreaCustom from "../../../../../../../comp/primitives/text-area/custom/StandarTextAreaCustom";
import type { IPartialProductDiscountClient } from "../../../../../../../interfaces/product-discounts-clients";
import NumericInputCustom from "../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import SelectProductsModal from "./../../../../../../../comp/features/modal-product2/SelectProductsModal"
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import { useCountryStateCitySeparated } from "../../../../../../../hooks/useCountryStateCity";
import type { IPartialClientAddress } from "../../../../../../../interfaces/clientAddress";
import { memo, useCallback, useEffect, useMemo, useState, type Dispatch } from "react";
import { clearError, setError } from "../../../../../../../store/slicer/errorSlicer";
import type { ClientState, ClientAction } from "../../../../../context/clientTypes"
import { formatCurrency } from "./../../../../../../../helpers/formttersNumeric";
import { generateRandomIds } from "./../../../../../../../helpers/nanoId";
import { Bookmark, ChevronLeft, Plus, Trash2 } from "lucide-react";
import AddressModal from "../../../../modals/address/AddressModal";
import type { ColumnDef } from "@tanstack/react-table";
import type { RowAction } from "interfaces/tableTypes";
import type { AppDispatchRedux } from "store/store";
import type { IProduct } from "interfaces/product";
import {
    add_client_addresses, remove_client_addresses, add_client_product_discounts, next_step,
    remove_client_product_discounts, update_client_product_discounts, update_client,
    back_step
} from "./../../../../../context/clientActions"
import StyleModule from "./Step2.module.css";
import { useDispatch } from "react-redux";
import UnderlineStandardSelectCustomMemo from "../../../../../../../comp/features/select/underline/UnderlineStandardSelectCustom";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "products/products/exclude/";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

interface IStep2 {
    state: ClientState;
    dispatch: Dispatch<ClientAction>;
    onCancel: () => void;
}

const Step2 = ({
    state,
    dispatch,
    onCancel
}: IStep2) => {

    // * *********** Estados globales ************ 

    const dispatchRedux: AppDispatchRedux = useDispatch<AppDispatchRedux>();

    // * *********** Estados logicos locales ************ 

    const [countryName, setCountryName] = useState<string | null>(state?.data?.country ?? "México");
    const [stateName, setStateName] = useState<string | null>(state?.data?.state ?? "Baja California");
    const [cityName, setCityName] = useState<string | null>(state.data?.city ?? "Mexicali");
    const [zipCode, setZipCode] = useState<number | null>(state.data?.zip_code ?? null);
    const [street, setStreet] = useState<string | null>(state.data?.street ?? null);
    const [streetNumber, setStreetNumber] = useState<number | null>(state.data?.street_number ?? null);
    const [neighborhood, setNeighborhood] = useState<string | null>(state.data?.neighborhood ?? null);
    const [paymentTerms, setPaymentTerms] = useState<string | null>(state.data?.payment_terms ?? null);
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
        dispatch(remove_client_addresses([id]));
    }, [dispatch, state]);

    const handleAddDiscount = useCallback((products: IProduct[]) => {
        const newDiscount: IPartialProductDiscountClient[] = products.map((p) => ({
            id: generateRandomIds(),
            product_id: p.id,
            product: p,
            discount_percentage: 0,
        }));
        dispatch(add_client_product_discounts(newDiscount));
        toggleIsActiveDiscountModal();
    }, [dispatch, toggleIsActiveDiscountModal]);

    const handleDeleteDiscount = useCallback((discount: IPartialProductDiscountClient) => {
        const id = discount.id;
        if (!id) return;
        dispatch(remove_client_product_discounts([id]));
    }, [dispatch, state]);

    const handleAddAddress = useCallback((address: IPartialClientAddress) => {
        const newAddress = {
            id: generateRandomIds(),
            ...address,
        };
        dispatch(add_client_addresses([newAddress]));
        toggleIsActiveAddressModal();
    }, [dispatch, toggleIsActiveAddressModal]);

    const excludeIds = useMemo<number[]>(
        () =>
            state.data?.product_discounts_client
                ?.map(p => p.product_id)
                .filter((id): id is number => id != null) ?? [],
        [state.data?.product_discounts_client]
    );

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
    }, [state.data?.product_discounts_client, dispatchRedux, excludeIds]);

    // * *********** Funciones memoizadas para las tablas ************ 

    const getRowIdAddresses = useMemo(() => (row: IPartialClientAddress, index: number) => row.id?.toString() ?? index.toString(), []);
    const getRowIdDiscounts = useMemo(() => (row: IPartialProductDiscountClient, index: number) => row.id?.toString() ?? index.toString(), []);

    const handleChangeDiscount = useCallback((id: string, value: number) => {
        dispatch(update_client_product_discounts({
            id,
            attributes: {
                discount_percentage: value,
            }
        }));
    }, [dispatch, state]);


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

                const onChange = useCallback((value: number) => handleChangeDiscount(row.original.id?.toString() ?? "", value), [handleChangeDiscount, row]);

                return <NumericInputCustom
                    value={row.original.discount_percentage ?? null}
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


    const handleOnClickSaveContinue = useCallback(() => {
        if (
            street === null || street === undefined || street === '' ||
            streetNumber === null || streetNumber === undefined || streetNumber === null ||
            neighborhood === '' || neighborhood === null || neighborhood === undefined ||
            countryName === '' || countryName === null || countryName === undefined ||
            stateName === '' || stateName === null || stateName === undefined ||
            cityName === '' || cityName === null || cityName === undefined ||
            zipCode === null || zipCode === undefined
        ) {
            ToastMantine.feedBackForm({
                message: "Debe completar todos los campos",
            });
            return;
        }

        const isDiscountsValid = (state.data?.product_discounts_client?.length || 0) > 0 ? state.data?.product_discounts_client?.every((discount) => discount?.discount_percentage !== undefined && discount?.discount_percentage > 0 && discount?.discount_percentage < 100) : true;

        if (!isDiscountsValid) {
            ToastMantine.feedBackForm({
                message: "Los porcentajes de descuento deben ser mayores a 0 y menores a 100",
            });
            return;
        }

        if ((state.data?.addresses?.length || 0) === 0) {
            ToastMantine.feedBackForm({
                message: "Debe agregar al menos una direccion",
            });
            return;
        }

        dispatch(update_client({
            street,
            street_number: streetNumber,
            neighborhood,
            country: countryName,
            state: stateName,
            city: cityName,
            zip_code: zipCode,
            ...{ ...(paymentTerms && paymentTerms !== "" ? { payment_terms: paymentTerms } : {}) }
        }));

        dispatch(next_step());

    }, [street, streetNumber, neighborhood, countryName, stateName, cityName, zipCode, dispatch, paymentTerms, state.data]);

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
                            label="Numero exterior"
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
                        <UnderlineStandardSelectCustomMemo
                            label="País"
                            options={csc.countryNames}
                            value={countryName}
                            onChange={setCountryName}
                            withValidation
                            disabled={csc.countryNames.length === 0}
                            maxHeight="200px"
                        />
                        <UnderlineStandardSelectCustomMemo
                            label="Estado"
                            options={csc.stateNames}
                            value={stateName}
                            onChange={setStateName}
                            withValidation
                            disabled={csc.stateNames.length === 0}
                            maxHeight="200px"
                        />
                        <UnderlineStandardSelectCustomMemo
                            label="Ciudad"
                            options={csc.cityNames}
                            value={cityName}
                            onChange={setCityName}
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
                        data={state.data?.addresses ?? []}
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
                        data={state.data?.product_discounts_client ?? []}
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
                    onClick={onCancel}
                />
                <TertiaryActionButtonCustom
                    label="Regresar"
                    icon={<ChevronLeft />}
                    onClick={handleOnClickBackStep}
                />
                <TertiaryActionButtonCustom
                    label="Guardar y salir"
                    onClick={() => console.log("guardar y salir")}
                    icon={<Bookmark />}
                />
                <MainActionButtonCustom
                    label="Guardar y continuar"
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
                    attribute="name"
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