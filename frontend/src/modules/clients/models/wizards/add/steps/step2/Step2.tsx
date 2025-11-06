import type { ClientState, ClientAction } from "../../../../../context/clientTypes"
import { memo, useCallback, useEffect, useMemo, useState, type Dispatch } from "react";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { Bookmark, Plus, Text, Trash2 } from "lucide-react";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import StyleModule from "./Step2.module.css";
import { useCountryStateCitySeparated } from "../../../../../../../hooks/useCountryStateCity";
import StandardSelectCustomMemo from "./../../../../../../../comp/features/select/StandardSelectCustom";
import InputTextCustom from "../../../../../../../comp/primitives/input/text/custom/InputTextCustom";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialClientAddress } from "../../../../../../../interfaces/clientAddress";
import type { IPartialProductDiscountClient } from "../../../../../../../interfaces/product-discounts-clients";
import AddressModal from "../../../../modals/address/AddressModal";
import {
    add_client_addresses, remove_client_addresses, add_client_product_discounts,
    remove_client_product_discounts, update_client_product_discounts
} from "./../../../../../context/clientActions"
import type { RowAction } from "interfaces/tableTypes";
import { generateRandomIds } from "./../../../../../../../helpers/nanoId";
import { formatCurrency } from "./../../../../../../../helpers/formttersNumeric";
import SelectProductsModal from "./../../../../../../../comp/features/modal-product2/SelectProductsModal"
import type { IProduct } from "interfaces/product";
import type { AppDispatchRedux } from "store/store";
import { useDispatch } from "react-redux";
import { clearError, setError } from "../../../../../../../store/slicer/errorSlicer";
import NumericInputCustom from "../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";

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

    const [countryName, setCountryName] = useState<string>(state?.data?.country ?? "México");
    const [stateName, setStateName] = useState<string>(state?.data?.state ?? "Baja California");
    const [cityName, setCityName] = useState<string>(state.data?.city ?? "Mexicali");
    const [zipCode, setZipCode] = useState<string>(state.data?.zip_code ?? "");
    const [street, setStreet] = useState<string>(state.data?.street ?? "");
    const [streetNumber, setStreetNumber] = useState<string>(state.data?.street_number ?? "");
    const [neighborhood, setNeighborhood] = useState<string>(state.data?.neighborhood ?? "");

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
    }, [dispatch, state]);

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
            state.data?.pruduct_discounts_client
                ?.map(p => p.product_id)
                .filter((id): id is number => id != null) ?? [],
        [state.data?.pruduct_discounts_client]
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
    }, [state.data?.pruduct_discounts_client, dispatchRedux, excludeIds]);

    // * *********** Funciones memoizadas para las tablas ************ 

    const getRowIdAddresses = useMemo(() => (row: IPartialClientAddress, index: number) => row.id?.toString() ?? index.toString(), []);
    const getRowIdDiscounts = useMemo(() => (row: IPartialProductDiscountClient, index: number) => row.id?.toString() ?? index.toString(), []);

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
                const onChange = (value: number) => {
                    if (!row.original.id) return;
                    dispatch(update_client_product_discounts({
                        id: row.original.id,
                        attributes: {
                            discount_percentage: value,
                        }
                    }));
                };

                return <NumericInputCustom
                    value={row.original.discount_percentage}
                    onChange={onChange}
                    min={1}
                    max={100}
                    placeholder="%"
                />;
            },
        },
    ], [dispatch]);

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


    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>
                <div className={StyleModule.taxAddressContainer}>
                    <span className={`nunito-bold ${StyleModule.subTitle}`}> Dirección fiscal *</span>
                    <div className={StyleModule.fieldBlock}>
                        <InputTextCustom
                            value={street}
                            onChange={setStreet}
                            placeholder="Calle"
                            withValidation
                            icon={<Text />}
                        />
                        <InputTextCustom
                            value={streetNumber}
                            onChange={setStreetNumber}
                            placeholder="Numero"
                            withValidation
                            icon={<Text />}
                        />
                        <InputTextCustom
                            value={neighborhood}
                            onChange={setNeighborhood}
                            placeholder="Colonia"
                            withValidation
                            icon={<Text />}
                        />
                    </div>
                    <div className={StyleModule.fieldBlock}>
                        <StandardSelectCustomMemo
                            options={csc.countryNames}
                            value={countryName}
                            onChange={setCountryName}
                            placeholder="Selecciona un pais"
                            withValidation
                            disabled={csc.countryNames.length === 0}
                            maxHeight="200px"
                        />
                        <StandardSelectCustomMemo
                            options={csc.stateNames}
                            value={stateName}
                            onChange={setStateName}
                            placeholder="Selecciona un estado"
                            withValidation
                            disabled={csc.stateNames.length === 0}
                            maxHeight="200px"
                        />
                        <StandardSelectCustomMemo
                            options={csc.cityNames}
                            value={cityName}
                            onChange={setCityName}
                            placeholder="Selecciona una ciudad"
                            withValidation
                            disabled={csc.cityNames.length === 0}
                            maxHeight="200px"
                        />
                        <InputTextCustom
                            value={zipCode}
                            onChange={setZipCode}
                            placeholder="Codigo postal"
                            withValidation
                            icon={<Text />}
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
                    />
                </div>
                <div className={StyleModule.discountsContainer}>
                    <GenericTableMemo
                        modelName="clientDiscount"
                        getRowId={getRowIdDiscounts}
                        columns={columnsDiscounts}
                        data={state.data?.pruduct_discounts_client ?? []}
                        extraComponents={ExtraComponentDiscountsFunc}
                        rowActions={rowActionsDiscounts}
                        typeRowActions="icon"
                        enableOptionsColumn
                    />
                </div>
            </div>
            <div className={StyleModule.containerButtons}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onCancel}
                />
                <TertiaryActionButtonCustom
                    label="Guardar y salir"
                    onClick={() => console.log("guardar y salir")}
                    icon={<Bookmark />}
                />
                <MainActionButtonCustom
                    label="Guardar y continuar"
                    onClick={() => console.log("guardar y continuar")}
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