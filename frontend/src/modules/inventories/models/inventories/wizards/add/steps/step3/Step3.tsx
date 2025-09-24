
import { ChevronLeft, CircleCheck, Plus, Trash2 } from "lucide-react";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import StyleModule from "./Step3.module.css";
import MainActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { useInventoriesDispatch, useInventoriesState } from "../../../../context/InventoiresHooks";
import { back_step, remove_items } from "../../../../context/InvenrtoriesActions";
import GenericTable from "../../../../../../../../components/ui/table/tableContext/GenericTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialInventoryDetails } from "../../../../../../../../interfaces/inventories";
import type { RowAction } from "../../../../../../../../components/ui/table/types";
import { useState } from "react";
import FeedBackModal from "../../../../../../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";
import type { RootState } from "../../../../../../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { clearAllErrors } from "../../../../../../../../store/slicer/errorSlicer";
interface IStep3 {
    onLeave: () => void,
    onCancel: () => void,
    onCreate: (inventories: IPartialInventoryDetails[]) => void,
}

const Step3 = ({
    onLeave,
    onCancel,
    onCreate
}: IStep3) => {

    const errorState = useSelector((state: RootState)=>state.error);
    const dispatchRedux = useDispatch();
    
    const dispatch = useInventoriesDispatch();
    const state = useInventoriesState();
    
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] =
        useState(false);
    const handleOnBackButton = () => dispatch(back_step());

    const handleOnClickConfirmButton = () => {
        onCreate(state.data);
        dispatchRedux(clearAllErrors());
        if (!(Object.keys(errorState).length > 0)){
            setIsActiveFeedBackModal(true);
        }
    };

    const columns: ColumnDef<IPartialInventoryDetails>[] = [
        {
            header: "SKU",
            cell: ({ row }) => {
                return (
                    <div>
                        {row.original.item?.sku ?? row.original.item?.item_id}
                    </div>
                );
            }
        },
        {
            header: "Producto",
            id: "item_name",
            accessorFn: (row) => row.item?.item_name
        },
        {
            header: "Ubicacion",
            id: "location_name",
            accessorFn: (row) => row.location_name,
        },
        {
            header: "Cantidad",
            id: "qty",
            accessorFn: (row) => row.qty
        }
    ];

    const rowActions: RowAction<IPartialInventoryDetails>[] = [
        {
            label: "Eliminar",
            onClick: (row) => {
                const ids = row.item?.id?.toString()
                    ?? (`${row.item?.item_type}-${row.item?.item_id?.toString()}`);
                const idsArray: string[] = [ids];
                dispatch(
                    remove_items(idsArray)
                );
            },
            icon: <Trash2 className={StyleModule.iconRowAction} />
        }
    ]

    return (
        <div className={StyleModule.containerStep1}>
            <div className={StyleModule.containerHeader}>

                <h2 className={`nunito-bold ${StyleModule.subtitle}`}>
                    Movimiento #123
                </h2>
                <div className={StyleModule.containerData}>
                    <dl className={`nunito-semibold ${StyleModule.definitionList}`}>
                        <dt>Fecha de inventario:</dt>
                        <dd>{new Date().toLocaleDateString()}</dd>
                    </dl>
                    <dl className={`nunito-semibold ${StyleModule.definitionList}`}>
                        <dt>Encargado:</dt>
                        <dd>{"Roberto Mireles"}</dd>
                    </dl>
                </div>
            </div>
            <div className={StyleModule.mainContent}>
                <GenericTable
                    modelName="items"
                    columns={columns}
                    data={state.data}
                    getRowId={
                        (row) =>
                            row.item?.id?.toString()
                            ?? (`${row.item?.item_type}-${row.item?.item_id?.toString()}`)
                    }
                    onDeleteSelected={() => { }}
                    enableFilters={false}
                    enableSorting={false}
                    enablePagination={false}
                    enableRowSelection={false}

                    typeRowActions="icon"
                    rowActions={rowActions}
                />
            </div>
            <div className={StyleModule.footerContent}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onCancel}
                />
                <TertiaryActionButtonCustom
                    label="Regresar"
                    icon={<ChevronLeft />}
                    onClick={handleOnBackButton}
                />
                <MainActionButtonCustom
                    label="Confirmar inventario"
                    onClick={handleOnClickConfirmButton}
                    icon={<Plus />}
                />
            </div>
            {
                isActiveFeedBackModal &&
                <FeedBackModal
                    onClose={onLeave}
                    icon={<CircleCheck />}
                    title="Se han agregado los productos a tu inventario correctamente."
                />
            }
        </div>
    );
}

export default Step3;