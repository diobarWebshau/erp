
import GeneratorBodyTableMemo from "../../../comp/primitives/table/tableContext/GenericTable";
import MainActionButtonCustom from "../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import ItemsColumns from "./columns/columns";
import { useCallback, useState } from "react";
import type { IItem } from "interfaces/item";
import { PlusIcon } from "lucide-react";
import StyleModule from "./ProductModel.module.css";

const ItemModel = () => {

    const [isActiveAddModal, setIsActiveAddModal] = useState<boolean>(false);
    const toggleIsActiveAddModal = useCallback(() => setIsActiveAddModal(prev => !prev), []);
    const getRowId = useCallback((row: IItem, index: number) => row?.id.toString() ?? index.toString(), []);

    return (
        <div className={StyleModule.productModelContainer}>
            <div>
                <h1 className="nunito-bold">Productos</h1>
                <MainActionButtonCustom
                    icon={<PlusIcon />}
                    label="Ubicación"
                    onClick={toggleIsActiveAddModal}
                />
            </div>
            <GeneratorBodyTableMemo
                // modelo e indentificador 
                modelName="Productos"
                getRowId={getRowId}

                // data y columnas
                columns={ItemsColumns}
                data={items}

            />
        </div>
    );
}

export default ItemModel;