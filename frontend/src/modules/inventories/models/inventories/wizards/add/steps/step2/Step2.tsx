
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import StyleModule from "./Step2.module.css";
import MainActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { useInventoriesDispatch, useInventoriesState } from "../../../../context/InventoiresHooks";
import { back_step, next_step, update_item, remove_items, add_items } from "../../../../context/InvenrtoriesActions";
import GenericTable from "../../../../../../../../components/ui/table/tableContext/GenericTable";
import type { ColumnDef, Table } from "@tanstack/react-table";
import type { IItemInventory, IPartialInventoryDetails } from "../../../../../../../../interfaces/inventories";
import type { ILocation } from "../../../../../../../../interfaces/locations";
import ObjectSelectCustom from "../../../../../../../../comp/primitives/select/object-select/custom/ObjectSelectCustom";
import NumericInputCustom from "../../../../../../../../comp/primitives/input/numeric/custom/NumericInputCustom";
import type { RowAction } from "../../../../../../../../components/ui/table/types";
import { useState } from "react";
import SelectObjectsModal from "../../../../../../../../comp/features/modal-product/SelectProductsModal";
import useAllLocations from "../../../../../../../../modelos/locations/hooks/useAllLocations";


interface IStep2 {
    onCancel: () => void;
}

const Step2 = ({
    onCancel
}: IStep2) => {

    const dispatch = useInventoriesDispatch();
    const state = useInventoriesState();

    const [isActiveSelectProductModal, setIsActiveSelectProductModal] = useState<boolean>(false);
    const handleOnBackButton = () => dispatch(back_step());
    const handleOnNextButton = () => {
        const validation = state.data.every(
            (object) =>
                (object.qty && object?.qty > 0) &&
                (object.location && object?.location?.id)
        )

        if (validation) {
            dispatch(next_step());
        }
    };
    const toggleSelectProductModal = () => setIsActiveSelectProductModal(!isActiveSelectProductModal);

    const {
        locations,
        loadingLocations,
    } = useAllLocations({
        like: ""
    });

    const handleOnClickButtonAddProduct = (selectedItems: IItemInventory[]) => {
        const items: IPartialInventoryDetails[] = selectedItems.map(item => {
            return {
                item_id: item.item_id,
                item_name: item.item_name,
                item_type: item.item_type,
                item: item,
                qty: 1,
            }
        });
        dispatch(add_items(items));
        setIsActiveSelectProductModal(false);
    }

    const fetchItemsLike = async (query: string | number): Promise<IItemInventory[]> => {
        if (!query || typeof query !== "string") return [];

        const encodedQuery = encodeURIComponent(query);

        const stateItems: IItemInventory[] = state.data.map(
            item => item?.item as IItemInventory 
        ) ?? [];

        try {
            const response = await fetch(`http://localhost:3003/inventories/inventories/items/like/${encodedQuery}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    excludeProductIds: stateItems.filter(p => p.item_type === "product").map(p => p.item_id),
                    excludeInputIds: stateItems.filter(p => p.item_type === "input").map(p => p.item_id)
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const items: IItemInventory[] = await response.json();
            return items;
        } catch (error) {
            console.error("Error fetching items:", error);
            return [];
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
            cell: ({ row }) => {
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
                        options={locations}
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
                    <NumericInputCustom
                        value={value ?? null}
                        onChange={handleOnChangeQty}
                        min={1}
                        onlyCommitOnBlur={true}
                    />
                );
            }
        }
    ];

    const ExtraComponent = (table: Table<IPartialInventoryDetails>) => {
        return (
            <div className={StyleModule.containerExtraComponent}>
                <MainActionButtonCustom
                    label="Agregar inventario"
                    icon={<Plus />}
                    onClick={toggleSelectProductModal}
                />
            </div>
        );
    }

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
                {!loadingLocations &&
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

                        extraComponents={ExtraComponent}
                        typeRowActions="icon"
                        rowActions={rowActions}
                    />
                }
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
                    label="Agregar inventario"
                    onClick={handleOnNextButton}
                    icon={<Plus />}
                />
            </div>
            {
                isActiveSelectProductModal && (
                    <SelectObjectsModal
                        onClose={() => setIsActiveSelectProductModal(false)}
                        onClick={handleOnClickButtonAddProduct}
                        labelOnClick="Agregar productos"
                        headerTitle="Productos"
                        emptyMessage="No hay productos"
                        attribute="item_name"
                        loadOptions={fetchItemsLike}
                    />
                )
            }
        </div>
    );
}

export default Step2;