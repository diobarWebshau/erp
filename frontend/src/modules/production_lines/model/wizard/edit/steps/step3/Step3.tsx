import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import type { ProductionLineAction, ProductionLineState } from "../../../../../context/productionLineTypes";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import { set_step, set_draft_production_line } from "../../../../../context/productionLineActions";
import type { IPartialProductionLineProduct } from "interfaces/productionLinesProducts";
import Tag from "../../../../../../../comp/primitives/tag/Tag";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, Pencil } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import StyleModule from "./Step3.module.css"
import { Divider } from "@mantine/core";
import type { Dispatch } from "react";

interface IStep3 {
    onClose: () => void;
    state: ProductionLineState,
    dispatch: Dispatch<ProductionLineAction>
}

const Step3 = memo(({ onClose, state, dispatch }: IStep3) => {

    const getRowId = useMemo(() => (row: IPartialProductionLineProduct, index: number) => row.id?.toString() ?? index.toString(), []);

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

    const handleOnClickEdit = useCallback(() => {
        dispatch(set_draft_production_line(state.data));
        dispatch(set_step(0));
    }, [dispatch, state.data]);

    return <div className={StyleModule.containerStep}>
        <div className={StyleModule.containerContent}>
            <div className={StyleModule.firstBlock}>
                <h2 className={`nunito-bold ${StyleModule.subTitle}`}>Información en línea</h2>
                <dl className={StyleModule.dl}>
                    <dt className={`nunito-regular`}>Nombre la línea de producción:</dt>
                    <dd>{state.data?.name}</dd>
                </dl>
                <dl className={StyleModule.dl}>
                    <dt className={`nunito-regular`}>ID único:</dt>
                    <dd>{state.data?.custom_id}</dd>
                </dl>
                <dl className={StyleModule.dl}>
                    <dt className={`nunito-regular`}>Ubicación:</dt>
                    <dd>{state.data?.location_production_line?.location?.name}</dd>
                </dl>
            </div>
            <div className={StyleModule.secondBlock}>
                <h2 className={`nunito-bold ${StyleModule.subTitle}`}>Configuración</h2>
                <span className={`nunito-bold ${StyleModule.label}`}>Productos asociados</span>
                <GenericTableMemo
                    /* modelo e identificador */
                    modelName="products"
                    getRowId={getRowId}
                    /* data y columnas */
                    columns={columns}
                    data={state.data?.production_lines_products || []}
                />
                <div className={StyleModule.statusBlock}>
                    <dl className={StyleModule.dlStatus}>
                        <dt className={`nunito-bold`}>Estado de la línea:</dt>
                        <dd>
                            <Tag
                                label={state.data?.is_active ? "Activa" : "Inactiva"}
                                className={state.data?.is_active ? StyleModule.tagActive : StyleModule.tagInactive}
                            />
                        </dd>
                    </dl>
                </div>
                <Divider color="var(--color-theme-primary-light)" />
            </div>
        </div>
        <div className={StyleModule.containerButtons}>
            <CriticalActionButton
                onClick={() => console.log("Eliminar")}
                label="Eliminar"
            />
            <TertiaryActionButtonCustom
                onClick={onClose}
                label="Regresar"
                icon={<ChevronLeft />}
            />
            <MainActionButtonCustom
                onClick={handleOnClickEdit}
                label="Editar"
                icon={<Pencil />}
            />
        </div>
    </div>;
})

export default Step3;