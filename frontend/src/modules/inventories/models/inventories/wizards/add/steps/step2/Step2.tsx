
import { ChevronLeft, Plus } from "lucide-react";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import StyleModule from "./Step2.module.css";
import MainActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { useInventoriesDispatch, useInventoriesState } from "../../../../context/InventoiresHooks";
import { back_step, next_step, update_item } from "../../../../context/InvenrtoriesActions";
import GenericTable from "../../../../../../../../components/ui/table/tableContext/GenericTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialInventoryDetails } from "../../../../../../../../interfaces/inventories";
import type { ILocation } from "../../../../../../../../interfaces/locations";
import InputToggle from "../../../../../../../../components/ui/table/components/gui/inputss/inputToggle/InputToggle";
import ObjectSelectCustom from "../../../../../../../../comp/primitives/select/object-select/base/ObjectSelect";



const Step2 = () => {

    const dispatch = useInventoriesDispatch();
    const state = useInventoriesState();

    const handleOnBackButton = () => {
        dispatch(back_step());
    }
    const handleOnNextButton = () => {
        dispatch(next_step());
    }

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
            cell: ({ row }) => {
                return (
                    <div>
                        {row.original.item?.item_name}
                    </div>
                );
            }
        },
        {
            header: "Ubicacion",
            cell: ({ row }) => {
                const options: ILocation[] = row.original.item?.locations || [];

                const handleOnChangeLocation = (location: ILocation | null | undefined) => {
                    const attributes: IPartialInventoryDetails = {
                        location_id: location?.id,
                        location_name: location?.name,
                        location: location
                    }
                    dispatch(
                        update_item({
                            id: `${row.original.item?.item_type}-${row.original.item?.item_id}`,
                            attributes: attributes
                        })
                    );
                }
                return (
                    <ObjectSelectCustom
                        labelKey="name"
                        options={options}
                        autoOpen={false}
                        onChange={handleOnChangeLocation}
                        value={row.original.location}
                    />
                );
            }
        },
        {
            header: "Cantidad",
            cell: ({ row }) => {
                const value = row.original.qty;

                const handleOnChangeQty = (value: number) => {
                    const attributes: IPartialInventoryDetails = {
                        qty: value
                    }
                    dispatch(
                        update_item({
                            id: `${row.original.item?.item_type}-${row.original.item?.item_id}`,
                            attributes: attributes
                        })
                    );
                }
                return (
                     <InputToggle
                        value={value}
                        onChange={handleOnChangeQty}
                     />
                );
            }
        }
    ];

    return (
        <div className={StyleModule.containerStep1}>
            <div className={StyleModule.containerHeader}>

                <h2 className={`nunito-bold ${StyleModule.subtitle}`}>
                    Movimiento 1
                </h2>
                <div className={StyleModule.containerData}>
                    <dl className={`nunito-bold ${StyleModule.definitionList}`}>
                        <dt>Fecha de inventario:</dt>
                        <dd>{new Date().toLocaleDateString()}</dd>
                    </dl>
                    <dl className={`nunito-bold ${StyleModule.definitionList}`}>
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
                    getRowId={(row) => row.item?.id?.toString() ?? (`${row.item?.item_type}-${row.item?.item_id?.toString()}`)}
                    onDeleteSelected={() => { }}
                    enableFilters={false}
                    enableSorting={false}
                    enablePagination={false}
                    enableRowSelection={false}
                />
            </div>
            <div className={StyleModule.footerContent}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={() => { }}
                />
                <TertiaryActionButtonCustom
                    label="Regresar"
                    icon={<ChevronLeft />}
                    onClick={handleOnBackButton}
                />
                <MainActionButtonCustom
                    label="Agregar inventario"
                    onClick={handleOnNextButton}
                    icon={<Plus />}
                />
            </div>
        </div>
    );
}

export default Step2;