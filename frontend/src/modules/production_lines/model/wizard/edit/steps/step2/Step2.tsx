import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import FeedBackModal from "./../../../../../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal"
import SwitchMantineCustom from "../../../../../../../comp/external/mantine/switch/custom/SwitchMantineCustom";
import type { IPartialProductionLineProduct } from "../../../../../../../interfaces/productionLinesProducts";
import type { ProductionLineAction, ProductionLineState } from "../../../../../context/productionLineTypes";
import SelectObjectsModal from "../../../../../../../comp/features/modal-product2/SelectProductsModal";
import type { RowAction } from "./../../../../../../../comp/primitives/table/tableContext/tableTypes"
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import type { IPartialProductionLine } from "../../../../../../../interfaces/productionLines";
import type { AppDispatchRedux, RootState } from "../../../../../../../store/store";
import { Bookmark, Check, ChevronLeft, Plus, Trash2, X } from "lucide-react";
import { clearError } from "../../../../../../../store/slicer/errorSlicer";
import { setError } from "../../../../../../../store/slicer/errorSlicer";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { IProduct } from "../../../../../../../interfaces/product";
import { generateRandomIds } from "../../../../../../../helpers/nanoId";
import type { ColumnDef } from "@tanstack/react-table";
import { useDispatch, useSelector } from "react-redux";
import StyleModule from "./Step2.module.css"
import { Divider } from "@mantine/core";
import type { Dispatch } from "react";
import {
    back_step, add_draft_production_line_products,
    remove_draft_production_line_products,
    update_draft_production_line, next_step
} from "../../../../../context/productionLineActions";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "products/products/exclude/";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

interface IStep2 {
    onCancel: () => void,
    onUpdate: ({ original, update }: { original: IPartialProductionLine, update: IPartialProductionLine }) => (Promise<boolean> | boolean),
    state: ProductionLineState,
    dispatch: Dispatch<ProductionLineAction>,
    onRefetch: () => Promise<void>
}

const Step2 = memo(({
    onCancel,
    onUpdate,
    state,
    onRefetch,
    dispatch
}: IStep2) => {

    const dispatchRedux: AppDispatchRedux = useDispatch<AppDispatchRedux>();
    const [isActiveModalAddProduct, setIsActiveModalAddProduct] = useState<boolean>(false);
    const errorRedux = useSelector((state: RootState) => state.error);

    const getRowId = useMemo(() => (row: IPartialProductionLineProduct, index: number) => row.id?.toString() ?? index.toString(), []);
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] = useState<boolean>(false);

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

    const handleOnChangeActive = useCallback((value: boolean) => dispatch(update_draft_production_line({ is_active: value })), [dispatch]);
    const toggleIsActiveModalAddProduct = useCallback(() => setIsActiveModalAddProduct(v => !v), []);
    const toggleIsActiveFeedBackModal = useCallback(() => setIsActiveFeedBackModal(v => !v), []);
    const handleOnClickBack = useCallback(() => dispatch(back_step()), [dispatch]);

    const getRowAttr = useMemo(() => (data: IProduct) => data.name || "", []);
    const excludeIds = useMemo<number[]>(() => {
        return state.draft?.production_lines_products?.map(
            p => p.product_id).filter((id): id is number => id != null) ?? []
    }, [state.draft?.production_lines_products]);

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
        dispatch(add_draft_production_line_products(productionLinesProducts));
        toggleIsActiveModalAddProduct();
    }, [toggleIsActiveModalAddProduct, dispatch]);

    const handleOnClickDeleteProduct = useCallback((product: IPartialProductionLineProduct) => {
        if (!product.id) return;
        dispatch(remove_draft_production_line_products([product.id]));
    }, [dispatch]);

    const optionsRow: RowAction<IPartialProductionLineProduct>[] = useMemo(() => [
        {
            id: "edit",
            label: "Eliminar",
            onClick: handleOnClickDeleteProduct,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], [handleOnClickDeleteProduct]);

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
    }, [dispatchRedux, excludeIds]);

    const handleOnClickSave = useCallback(async () => {
        if (state.draft?.production_lines_products?.length === 0) {
            ToastMantine.feedBackForm({
                message: "Debes asignar por lo menos un producto",
            });
            return;
        }
        await onUpdate({ original: state.data, update: state.draft });
        if (Object.keys(errorRedux).length > 0) {
            Object.entries(errorRedux).forEach(([value]) => {
                ToastMantine.feedBackForm({
                    message: value,
                });
            });
            return;
        }
        toggleIsActiveFeedBackModal();
    }, [state.draft, state.data, onUpdate, errorRedux, toggleIsActiveFeedBackModal]);

    const handleOnClickConfirm = useCallback(() => {
        onRefetch();
        dispatch(next_step());
    }, [dispatch, onRefetch]);

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
                data={state.draft?.production_lines_products || []}
                extraComponents={ExtraComponent}

                /* funcionalidades */
                enableOptionsColumn
                typeRowActions="icon"
                rowActions={optionsRow}

            />
            <div className={StyleModule.containerSwitch}>
                <span className={`nunito-bold ${StyleModule.labelSwitch}`}>Activar línea</span>
                <SwitchMantineCustom
                    value={state.draft?.is_active ?? false}
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
            <MainActionButtonCustom
                onClick={handleOnClickSave}
                label="Guardar"
                icon={<Bookmark />}
            />
        </div>
        {isActiveModalAddProduct && (
            <SelectObjectsModal
                onClose={toggleIsActiveModalAddProduct}
                onClick={handleOnClickAddProduct}
                placeholder="Buscar productos"
                labelOnClick="Asignar productos"
                headerTitle="Asignar productos"
                emptyMessage="No hay productos que coincidan con la búsqueda"
                getRowAttr={getRowAttr}
                loadOptions={fetchLoadProducts}
            />
        )}
        {isActiveFeedBackModal && (
            <FeedBackModal
                onClose={handleOnClickConfirm}
                title="Línea de producción actualizada correctamente"
                icon={<Check />}
            />
        )}
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
