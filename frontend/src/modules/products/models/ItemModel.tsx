
import SecundaryActionButtonCustom from "../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import MainActionButtonCustom from "../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import { useTableDispatch, useTableState } from "../../../comp/primitives/table/tableContext/tableHooks";
import { reset_column_filters } from "../../../comp/primitives/table/tableContext/tableActions";
import GeneratorBodyTableMemo from "../../../comp/primitives/table/tableContext/GenericTable";
import InputTextCustom from "../../../comp/primitives/input/text/custom/InputTextCustom";
import { Download, Eraser, PlusIcon, Search, Trash2 } from "lucide-react";
import type { RowAction } from "comp/primitives/table/types";
import useItems from "../../../modelos/item/hooks/useItem";
import { useCallback, useMemo, useState } from "react";
import ItemsColumns from "./columns/columns";
import type { IItem } from "interfaces/item";
import StyleModule from "./IttemModel.module.css";
import ItemModuleProvider from "./../context/itemModuleProvider"
import AddWizardItem from "./wizard/add/AddWizardItem";

const ItemModel = () => {

    const [search, setSearch] = useState<string | null>(null);
    const [isActiveAddModal, setIsActiveAddModal] = useState<boolean>(false);
    const toggleIsActiveAddModal = useCallback(() => setIsActiveAddModal(prev => !prev), []);
    const getRowId = useCallback((row: IItem, index: number) => row?.id.toString() ?? index.toString(), []);

    const { items, loadingItems } = useItems({ like: search ?? "", debounce: 300 });

    const actionsRow: RowAction<IItem>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: (row) => console.log("deleting", row),
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], []);

    const ExtraComponents = useCallback(() => {
        const state = useTableState();
        const dispatch = useTableDispatch();

        const handleClearFilters = useCallback(() => {
            dispatch(reset_column_filters());
        }, [dispatch]);

        const handleExportTable = useCallback(() => {
            console.log("exporting table")
        }, []);

        return (
            <div className={StyleModule.containerExtraComponents}>
                <div className={StyleModule.searchSection}>
                    <InputTextCustom
                        value={search ?? ""}
                        onChange={setSearch}
                        placeholder="Buscar"
                        icon={<Search />}
                        classNameInput={StyleModule.inputTextCustom}
                        classNameContainer={StyleModule.containerInputSearch}
                        withValidation={false}
                    />
                </div>
                <div className={StyleModule.containerButtons}>
                    <SecundaryActionButtonCustom
                        label="Limpiar filtros"
                        onClick={handleClearFilters}
                        icon={<Eraser />}
                        disabled={state.columnFiltersState.length === 0}
                    />
                    <SecundaryActionButtonCustom
                        label="Exportar tabla"
                        onClick={handleExportTable}
                        icon={<Download />}
                        disabled={Object.keys(state.rowSelectionState).length === 0}
                    />
                </div>
            </div>
        );
    }, [search]);


    const handleCreate = async () => {

    };

    return (
        <div className={StyleModule.itemModelContainer}>
            <div className={StyleModule.itemModelHeader}>
                <h1 className="nunito-bold">Productos</h1>
                <MainActionButtonCustom
                    icon={<PlusIcon />}
                    label="Producto"
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
                isLoadingData={loadingItems}

                // Funcionalidades
                enableFilters
                enablePagination
                enableSorting
                enableRowEditClick
                enableOptionsColumn

                // Actions row
                typeRowActions="icon"
                rowActions={actionsRow}

                // Extracomponents
                extraComponents={ExtraComponents}

                // classes
                classNameGenericTableContainer={StyleModule.containerTable}
            />
            {isActiveAddModal &&
                <ItemModuleProvider totalSteps={3} currentStep={0}>
                    <AddWizardItem onClose={toggleIsActiveAddModal} onCreate={handleCreate} />
                </ItemModuleProvider>
            }
        </div>
    );
}

export default ItemModel;