
import { Pencil } from "lucide-react";
import StyleModule from "./Step3.module.css";
import {
    useAddModalProductionOrderDispatch,
    useAddModalProductionOrderState
} from "../../../../context/AddModalProductionOrderHooks";
import {
    back_step,
    set_draft_production_order
} from "../../../../context/AddModalProductionOrderActions";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialProductionOrder } from "../../../../../../../../interfaces/productionOrder";
import { useMemo } from "react";
import GenericTable from "../../../../../../../../components/ui/table/tableContext/GenericTable";
import StandardTextArea from "../../../../../../../../components/ui/table/components/gui/text-area/StandarTextArea";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import TertiaryActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/tertiary-action/TertiaryActionButtonCustom";

interface IStep3Props {
    onDelete: () => void;
}

const Step3 = ({
    onDelete,
}: IStep3Props) => {

    const dispatch =
        useAddModalProductionOrderDispatch();
    const state =
        useAddModalProductionOrderState();

    const columnsPartialProductionOrder: ColumnDef<IPartialProductionOrder>[] = useMemo(
        () => [
            {
                header: "SKU",
                accessorFn: (row) => row.product?.sku
            },
            {
                header: "Producto",
                accessorFn: (row) => row.product?.name
            },
            {
                header: "Cantidad",
                accessorFn: (row) => row.qty
            },
            {
                header: "Planta de produccion",
                accessorFn: (row) => row.location?.name
            },
            {
                header: "Linea de produccion",
                accessorFn: (row) => row.production_line?.name
            },
            {
                header: "Entrega estimada",
                cell: () => new Date().toLocaleDateString()
            },
        ],
        []
    );

    const handlerOnClickEditButton = () => {
        dispatch(set_draft_production_order(state.data));
        dispatch(back_step());
    }

    return (
        <div className={StyleModule.container}>
            <section className={StyleModule.headerSection}>
                <h1 className='nunito-semibold'>Order 123</h1>
                <span className={StyleModule.containerDate}>
                    <p className='nunito-semibold'>Fecha de orden: </p>
                    <p className='nunito-semibold'>{new Date().toLocaleDateString()}</p>
                </span>
            </section>
            <section className={StyleModule.bodySection}>
                <div className={StyleModule.externalContainerGenericTable}>
                    <GenericTable
                        modelName="InventoryInputs"
                        columns={columnsPartialProductionOrder}
                        data={[{ ...state.data }]}
                        onDeleteSelected={() => console.log("Delete selected")}
                        getRowId={(_, idx) => `row-${idx}`}
                        enableFilters={false}
                        enablePagination={false}
                        enableRowSelection={false}
                        enableOptionsColumn={false}
                        enableSorting={false}
                        enableViews={false}
                        enableRowEditClick={false}
                        typeRowActions="icon"
                        classNameGenericTableContainer={StyleModule.containerGenericTableContainer}
                    />
                </div>
                <div className={StyleModule.containerTextArea}>
                    <StandardTextArea
                        ComponentLabel={({
                            id
                        }: { id: string }) => (
                            <label
                                className={StyleModule.labelTextArea} htmlFor={id}>
                                <p className='nunito-bold'>{`Comentarios`}</p>
                                <p className='nunito-semibold'>{`(Opcional):`}</p>
                            </label>
                        )}
                        classNameContainer={StyleModule.containerTextArea}
                        classNameTextArea={`nunito-regular ${StyleModule.textArea}`}
                        id="notes"
                        placeholder="comentarios"
                        maxLength={1000}
                        readOnly
                    />
                </div>
            </section>
            <section className={StyleModule.footerSection}>
                <CriticalActionButton
                    onClick={onDelete}
                    label="Eliminar"
                />
                <TertiaryActionButtonCustom
                    onClick={handlerOnClickEditButton}
                    label="Editar"
                    icon={<Pencil />}
                />
            </section>
        </div>
    );
};

export default Step3;
