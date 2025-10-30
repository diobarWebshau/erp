import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import type { ProductionLineAction, ProductionLineState } from "../../../../../context/productionLineTypes";
import { back_step, update_production_line } from "../../../../../context/productionLineActions";
import { Bookmark, Check, ChevronLeft, Plus, Trash2, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch } from "react";
import StyleModule from "./Step2.module.css"
import type { ColumnDef } from "@tanstack/react-table";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import type { IPartialProductionLineProduct } from "../../../../../../../interfaces/productionLinesProducts";
import type { RowAction } from "./../../../../../../../comp/primitives/table/tableContext/tableTypes"
import SwitchMantineCustom from "../../../../../../../comp/external/mantine/switch/custom/SwitchMantineCustom";
import SelectObjectsModal from "../../../../../../../comp/features/modal-product2/SelectProductsModal";
import { Divider } from "@mantine/core";
import type { IProduct } from "interfaces/product";
import { add_production_line_products, remove_production_line_products, next_step } from "../../../../../context/productionLineActions";
import { generateRandomIds } from "../../../../../../../helpers/nanoId";
import { clearError } from "../../../../../../../store/slicer/errorSlicer";
import { setError } from "../../../../../../../store/slicer/errorSlicer";
import type { AppDispatchRedux } from "../../../../../../../store/store";
import { useDispatch } from "react-redux";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "products/products/exclude/";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

interface IStep2 {
    onCancel: () => void;
    state: ProductionLineState,
    dispatch: Dispatch<ProductionLineAction>
}

const Step2 = memo(({
    onCancel,
    state,
    dispatch
}: IStep2) => {

    const dispatchRedux: AppDispatchRedux = useDispatch<AppDispatchRedux>();
    const getRowId = useMemo(() => (row: IPartialProductionLineProduct) => row.id?.toString()!, []);
    const [isActiveModalAddProduct, setIsActiveModalAddProduct] = useState<boolean>(false);

    const columns: ColumnDef<IPartialProductionLineProduct>[] = useMemo(() => [
        {
            accessorFn: (row) => row.products?.sku,
            header: "SKU",
        },
        {
            accessorFn: (row) => row.products?.name,
            header: "Producto",
        },
        {
            accessorFn: (row) => row.products?.description,
            header: "Descripción",
        }
    ], []);

    const handleOnClickBack = useCallback(() => {
        dispatch(back_step());
    }, [dispatch]);

    const toggleIsActiveModalAddProduct = useCallback(() => {
        setIsActiveModalAddProduct(v => !v);
    }, []);

    const handleOnChangeActive = useCallback((value: boolean) => {
        dispatch(update_production_line({
            is_active: value
        }))
    }, [dispatch]);

    const excludeIds = useMemo<number[]>(
        () =>
            state.data?.production_lines_products
                ?.map(p => p.product_id)
                .filter((id): id is number => id != null) ?? [],
        [state.data?.production_lines_products]
    );

    const handleOnClickAddProduct = useCallback((products: IProduct[]) => {
        const productionLinesProducts: IPartialProductionLineProduct[] = products.map(
            (p) => {
                const productionLineProduct: IPartialProductionLineProduct = {
                    id: generateRandomIds(),
                    product_id: p.id,
                    products: p
                }
                return productionLineProduct;
            }
        )

        dispatch(add_production_line_products(productionLinesProducts));
        toggleIsActiveModalAddProduct();
    }, [state.data.production_lines_products, toggleIsActiveModalAddProduct, dispatch]);

    const handleOnClickDeleteProduct = useCallback((product: IPartialProductionLineProduct) => {
        if (!product.id) return;
        dispatch(remove_production_line_products([product.id]));
    }, [dispatch]);

    const optionsRow: RowAction<IPartialProductionLineProduct>[] = useMemo(() => [
        {
            id: "edit",
            label: "Eliminar",
            onClick: handleOnClickDeleteProduct,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], []);

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
    }, [state.data?.production_lines_products, dispatchRedux, excludeIds]);


    const handleOnClickSaveAndNext = useCallback(() => {
        if (state.data?.production_lines_products?.length === 0) {
            ToastMantine.feedBackForm({
                message: "Debes asignar por lo menos un producto",
            });
            return;
        }
        dispatch(next_step());
    }, [state.data, dispatch]);


    const ExtraComponent = useCallback(() => {
        return (
            <ExtraComponents
                fetchLoadProducts={fetchLoadProducts}
                toggleIsActiveModalAddProduct={toggleIsActiveModalAddProduct}
            />
        );
    }, [fetchLoadProducts, toggleIsActiveModalAddProduct]);

    return <div className={StyleModule.containerStep} >
        <div className={StyleModule.containerContent}>
            <GenericTableMemo

                /* modelo e identificador */
                modelName="products"
                getRowId={getRowId}
                noResultsMessage="No hay productos asignados"

                /* data y columnas */
                columns={columns}
                data={state.data?.production_lines_products || []}
                extraComponents={ExtraComponent}

                /* funcionalidades */
                enableOptionsColumn
                typeRowActions="icon"
                rowActions={optionsRow}

            />
            <div className={StyleModule.containerSwitch}>
                <span className={`nunito-bold ${StyleModule.labelSwitch}`}>Activar línea</span>
                <SwitchMantineCustom
                    value={state.data?.is_active ?? false}
                    onChange={handleOnChangeActive}
                    size="lg"
                    labelOff="Inactiva"
                    labelOn="Activa"
                    iconActive={<Check />}
                    iconInactive={<X />}
                    color="var(--color-theme-primary)"
                />
            </div>
            <Divider color="var(--color-theme-primary-light)" />
        </div>
        <div className={StyleModule.containerButtons}>
            <CriticalActionButton
                onClick={onCancel}
                label="Cancelar"
            />
            <TertiaryActionButtonCustom
                onClick={handleOnClickBack}
                label="Regresar"
                icon={<ChevronLeft />}
            />
            <TertiaryActionButtonCustom
                onClick={() => console.log("Guardar y salir")}
                label="Guardar y salir"
                icon={<Bookmark />}
            />
            <MainActionButtonCustom
                onClick={handleOnClickSaveAndNext}
                label="Guardar y continuar"
                icon={<Bookmark />}
            />
        </div>
        {
            isActiveModalAddProduct && (
                <SelectObjectsModal
                    onClose={toggleIsActiveModalAddProduct}
                    onClick={handleOnClickAddProduct}
                    placeholder="Buscar productos"
                    labelOnClick="Asignar productos"
                    headerTitle="Asignar productos"
                    emptyMessage="No hay productos que coincidan con la búsqueda"
                    attribute="name"
                    loadOptions={fetchLoadProducts}
                />
            )
        }
    </div >
})

export default Step2;


interface ExtraComponentsProps {
    fetchLoadProducts: (query: string | number) => Promise<IProduct[]>;
    toggleIsActiveModalAddProduct: () => void;
}

function ExtraComponentsBase({
    fetchLoadProducts,
    toggleIsActiveModalAddProduct,
}: ExtraComponentsProps) {
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
        <div className={StyleModule?.componentHeader}>
            <span className="nunito-bold">Productos asociados</span>
            <MainActionButtonCustom
                label="Asignar productos"
                icon={<Plus />}
                onClick={toggleIsActiveModalAddProduct}
                disabled={loading || items.length === 0}
            />
        </div>
    );
}

const ExtraComponents = memo(ExtraComponentsBase);
