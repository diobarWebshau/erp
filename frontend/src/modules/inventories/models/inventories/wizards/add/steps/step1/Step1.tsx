
import { Plus } from "lucide-react";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import StyleModule from "./Step1.module.css";
import MainActionButtonCustom from "../../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { useInventoriesState, useInventoriesDispatch } from "./../../../../context/InventoiresHooks";
import { add_items, next_step, remove_items, } from "./../../../../context/InvenrtoriesActions";
import MultiSelectSearchCheckCustom from "../../../../../../../../comp/primitives/select/multi-select/custom/MultiSelectSearchCheckCustom";
import type { IItemInventory, IPartialInventoryDetails } from "./../../../../../../../../interfaces/inventories";
import { useState } from "react";

interface IStep1 {
    onCancel: () => void;
}

const Step1 = ({
    onCancel
}: IStep1) => {
    const state = useInventoriesState();
    const dispatch = useInventoriesDispatch();

    const [selectedItem, setSelectedItem] =
        useState<IItemInventory[]>(state.data.map(item => item?.item as IItemInventory) ?? []);
    const [searchMulti, setSearchMulti] =
        useState<string>("");
    const [openMulti, setOpenMulti] =
        useState<boolean>(true);

    const fetchItemsLike = async (query: string): Promise<IItemInventory[]> => {
        if (!query || query.trim().length === 0) return [];

        const encodedQuery = encodeURIComponent(query);

        try {
            const response = await fetch(`http://localhost:3003/inventories/inventories/items/like/${encodedQuery}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    excludeProductIds: selectedItem.filter(p => p.item_type === "product").map(p => p.item_id),
                    excludeInputIds: selectedItem.filter(p => p.item_type === "input").map(p => p.item_id)
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

    const handleAddItems = () => {
        if (selectedItem.length > 0) {

            const newItems = selectedItem.filter(
                item =>
                    !state.data.some(
                        inv =>
                            inv.item?.id === item.id
                    )
            );

            const deleteItems = state.data.filter(
                inv => !selectedItem.some(
                    item =>
                        item.id === inv.item?.id   
                )
            );

            if (newItems.length > 0) {
                dispatch(add_items(
                    newItems.map((item) => {
                        const inventoryRecord: IPartialInventoryDetails = {
                            item_id: item.item_id,
                            item_name: item.item_name,
                            item_type: item.item_type,
                            item: item,
                            qty: 1,
                        }
                        return inventoryRecord;
                    })
                ));
            }

            if (deleteItems.length > 0) {
                dispatch(remove_items(
                    deleteItems.map(
                        inv => inv.item?.id?.toString()
                            ?? `${inv.item?.item_type}-${inv.item?.item_id}`
                    )
                ));
            }

            dispatch(next_step());
        }
    };

    return (
        <div className={StyleModule.containerStep1}>
            <div className={StyleModule.mainContent}>
                <span className={`nunito-semibold ${StyleModule.subtitle}`}>
                    Productos
                </span>
                <MultiSelectSearchCheckCustom
                    emptyMessage="No hay productos"
                    attribute="item_name"
                    search={searchMulti}
                    setSearch={setSearchMulti}
                    open={openMulti}
                    setOpen={setOpenMulti}
                    selected={selectedItem}
                    setSelected={setSelectedItem}
                    loadOptions={fetchItemsLike}
                />
            </div>
            <div className={StyleModule.footerContent}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onCancel}
                />
                <MainActionButtonCustom
                    label="Agregar productos"
                    onClick={handleAddItems}
                    icon={<Plus />}
                />
            </div>
        </div>
    );
}

export default Step1;