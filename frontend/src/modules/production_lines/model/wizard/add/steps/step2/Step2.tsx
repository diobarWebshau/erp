import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import type { ProductionLineAction, ProductionLineState } from "../../../../../context/productionLineTypes";
import { back_step, update_production_line } from "../../../../../context/productionLineActions";
import { Bookmark, Check, ChevronLeft, Plus, Trash2, X } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import type { Dispatch } from "react";
import StyleModule from "./Step2.module.css"
import type { ColumnDef } from "@tanstack/react-table";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import type { IPartialProductionLineProduct } from "../../../../../../../interfaces/productionLinesProducts";
import type { RowAction } from "./../../../../../../../comp/primitives/table/tableContext/tableTypes"
import SwitchMantineCustom from "../../../../../../../comp/external/mantine/switch/custom/SwitchMantineCustom";
import SelectObjectsModal from "../../../../../../../comp/features/modal-product2/SelectProductsModal";
import { Divider } from "@mantine/core";
import useProductsByExcludeIds from "../../../../../../../modelos/products/react-hooks/useProductByExcludeIds";
import MultiSelectCheckSearch from "../../../../../../../comp/features/select-check-search/multiple/base/MultiSelectCheckSearch";
import type { IProduct } from "interfaces/product";


interface IStep2 {
    onClose: () => void;
    state: ProductionLineState,
    dispatch: Dispatch<ProductionLineAction>
}

const Step2 = memo(({
    onClose,
    state,
    dispatch
}: IStep2) => {

    const getRowId = useMemo(() => (row: IPartialProductionLineProduct) => row.id?.toString()!, []);
    const [isActiveModalAddProduct, setIsActiveModalAddProduct] = useState<boolean>(false);


    const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);


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


    const ExtraComponents = useCallback(() => {
        return <div className={StyleModule?.componentHeader}>
            <span className={"nunito-bold"}>Productos asociados</span>
            <MainActionButtonCustom
                label="Asignar productos"
                icon={<Plus />}
                onClick={toggleIsActiveModalAddProduct}
            />
        </div>
    }, []);


    const { productsByExcludeIds } = useProductsByExcludeIds(excludeIds);

    const optionsRow: RowAction<IPartialProductionLineProduct>[] = useMemo(() => [
        {
            id: "edit",
            label: "Editar",
            onClick: toggleIsActiveModalAddProduct,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], []);

    return <div className={StyleModule.containerStep} >
        <div className={StyleModule.containerContent}>
            <GenericTableMemo

                /* modelo e identificador */
                modelName="products"
                getRowId={getRowId}

                /* data y columnas */
                columns={columns}
                data={state.data?.production_lines_products || []}
                extraComponents={ExtraComponents}

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
            <MultiSelectCheckSearch
                rowId={"id"}
                options={productsByExcludeIds}
                selected={selectedProducts}
                setSelected={setSelectedProducts}
                open={false}
                setOpen={() => { }}
            />
        </div>
        <div className={StyleModule.containerButtons}>
            <CriticalActionButton
                onClick={onClose}
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
                onClick={() => { }}
                label="Guardar y continuar"
                icon={<Bookmark />}
            />
        </div>
        {
            isActiveModalAddProduct && (
                <SelectObjectsModal
                    onClose={toggleIsActiveModalAddProduct}
                    onClick={() => console.log("asignar productos")}
                    labelOnClick="Asignar productos"
                    headerTitle="Asignar productos"
                    emptyMessage="No hay productos"
                    attribute="name"
                    options={productsByExcludeIds}
                />
            )
        }
    </div >
})

export default Step2;
