
import { Plus } from "lucide-react";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import StyleModule from "./Step1.module.css";
import MainActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/main-action/MainActionButtonCustom";
import { useInventoriesState, useInventoriesDispatch } from "./../../../../context/InventoiresHooks";
import { add_items, next_step,  } from "./../../../../context/InvenrtoriesActions";
import MultiSelectSearchCheckCustom from "../../../../../../../../comp/primitives/select/multi-select/custom/MultiSelectSearchCheckCustom";
import type { IInventoryDetails, IItem, IPartialInventoryDetails } from "./../../../../../../../../interfaces/inventories";
import { useState } from "react";


const Step1 = () => {
    const state = useInventoriesState();
    const dispatch = useInventoriesDispatch();

    const [selectedItem, setSelectedItem] =
        useState<IItem[]>(state.data.map(item => item?.item as IItem) ?? []);
    const [searchMulti, setSearchMulti] =
        useState<string>("");
    const [openMulti, setOpenMulti] =
        useState<boolean>(true);

    const fetchItemsLike = async (query: string): Promise<IItem[]> => {
        if (!query || query.trim().length === 0) return [];

        const encodedQuery = encodeURIComponent(query);

        try {
            const response = await fetch(`http://localhost:3003/inventories/inventories/items/like/${encodedQuery}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    excludeProductIds: selectedItem.filter(p => p.item_type === "product").map(p => p.id),
                    excludeInputIds: selectedItem.filter(p => p.item_type === "input").map(p => p.id)
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const items: IItem[] = await response.json();
            console.log(items);
            return items;
        } catch (error) {
            console.error("Error fetching items:", error);
            return [];
        }
    };

    const handleAddItems = () => {
        if (selectedItem.length > 0) {
            dispatch(add_items(
                [
                    ...selectedItem.map((item) => {
                        const inventoryRecord: IPartialInventoryDetails = {
                            item_id: item.item_id,
                            item_name: item.item_name,
                            item_type: item.item_type,
                            item: item,
                        }
                        return inventoryRecord;
                    })
                ]
            ));
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
                    onClick={() => { }}
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