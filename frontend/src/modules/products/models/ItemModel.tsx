import { createCompleteProductInDB, updateCompleteProductInDB, deleteProductInDB } from "../../../modelos/products/queries/productsQueries";
import { diffObjectArrays, diffObjects, diffObjectArraysWithChildSingle } from "../../../utils/validation-on-update/ValidationOnUpdate2";
import SecundaryActionButtonCustom from "../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import { createCompleteInput, deleteInputInDB, updateCompleteInputInDB } from "../../../modelos/inputs/queries/inputsQueries";
import { deepNormalizeDecimals, cleanEmptyObjects } from "../../../utils/fromatted_decimals_mysql/deepNormalizeDecimals";
import MainActionButtonCustom from "../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import type { IPartialProductDiscountRange, ProductDiscountRangeManager } from "interfaces/product-discounts-ranges";
import { useTableDispatch, useTableState } from "../../../comp/primitives/table/tableContext/tableHooks";
import FeedBackModal from "../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";
import { reset_column_filters } from "../../../comp/primitives/table/tableContext/tableActions";
import GenericTableMemo from "../../../comp/primitives/table/tableContext/GenericTable";
import type { IPartialProductInput, ProductInputManager } from "interfaces/productsInputs";
import InputTextCustom from "../../../comp/primitives/input/text/custom/InputTextCustom";
import { CircleCheck, Download, Eraser, PlusIcon, Search, Trash2 } from "lucide-react";
import type { IPartialProductProcess } from "../../../interfaces/productsProcesses";
import type { ProductProcessManager } from "../../../interfaces/productsProcesses";
import ToastMantine from "../../../comp/external/mantine/toast/base/ToastMantine";
import DeleteModal from "./../../../comp/primitives/modal/deleteModal/DeleteModal"
import { clearAllErrors, setError } from "../../../store/slicer/errorSlicer";
import type { RowAction } from "../../../comp/primitives/table/types";
import type { IPartialProduct, } from "../../../interfaces/product";
import ItemModuleProvider from "./../context/itemModuleProvider";
import type { IPartialInput } from "../../../interfaces/inputs";
import type { IApiError } from "../../../interfaces/errorApi";
import { memo, useCallback, useMemo, useState } from "react";
import type { AppDispatchRedux } from "../../../store/store";
import type { IItem, IPartialItem } from "interfaces/item";
import useItems from "../../../modelos/item/hooks/useItem";
import EditWizardItem from "./wizard/edit/EditWizardItem";
import AddWizardItem from "./wizard/add/AddWizardItem";
import StyleModule from "./IttemModel.module.css";
import ItemsColumns from "./columns/columns";
import { useDispatch } from "react-redux";

const ItemModel = () => {

    const dispatchRedux: AppDispatchRedux = useDispatch();

    const [search, setSearch] = useState<string | null>(null);
    const [isActiveAddModal, setIsActiveAddModal] = useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] = useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] = useState<boolean>(false);
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<IPartialItem | null>(null);
    const { items, loadingItems, refetchItems } = useItems({ like: search ?? "", debounce: 300 });

    const toggleIsActiveAddModal = useCallback(() => setIsActiveAddModal(prev => !prev), []);
    const toggleIsActiveEditModal = useCallback(() => setIsActiveEditModal(prev => !prev), []);
    const toggleIsActiveDeleteModal = useCallback(() => setIsActiveDeleteModal(prev => !prev), []);
    const toggleIsActiveFeedBackModal = useCallback(() => setIsActiveFeedBackModal(prev => !prev), []);
    const getRowId = useCallback((row: IItem, index: number) => row?.id.toString() ?? index.toString(), []);

    const handleOnClickRowEdit = useCallback((row: IPartialItem) => {
        setSelectedItem(row);
        setIsActiveEditModal(prev => !prev);
    }, []);
    const handleOnClickRowDelete = useCallback((row: IPartialItem) => {
        setSelectedItem(row);
        setIsActiveDeleteModal(prev => !prev);
    }, []);

    const ExtraComponents = useCallback(() => (
        <ExtraComponentMemo search={search} setSearch={setSearch} />
    ), [search]);

    const handleCreate = useCallback(async (item: IPartialItem): Promise<boolean> => {
        dispatchRedux(clearAllErrors());
        try {
            if (item.item_type === "product") await createCompleteProductInDB({ product: item.item as IPartialProduct });
            else await createCompleteInput({ input: item.item as IPartialInput });
            refetchItems();
            return true;
        }
        catch (err: unknown) {
            const key = item.item_type === "product" ? "createCompleteProduct" : "createCompleteInput";
            if (err instanceof Error) {
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            } else {
                const error = err as IApiError;

                if (error.validation) {
                    error.validation.forEach((msg: string) => {
                        dispatchRedux(setError({ key, message: { validation: msg } }));
                        ToastMantine.error({ message: msg });
                    });
                }
            }

            return false;
        }
    }, [dispatchRedux, refetchItems]);

    const handleOnUpdate = useCallback(async ({ original, update }: { original: IPartialItem, update: IPartialItem }): Promise<boolean> => {
        dispatchRedux(clearAllErrors());
        const originalBase = deepNormalizeDecimals(structuredClone(original), ["equivalence", "production_cost", "sale_price", "qty", "unit_cost"]);
        const updateBase = deepNormalizeDecimals(structuredClone(update), ["equivalence", "production_cost", "sale_price", "qty", "unit_cost"]);
        try {
            const originalItem = originalBase.item;
            const updateItem = updateBase.item;

            delete originalBase.item;
            delete updateBase.item;
            const diffObjectBase = await
                cleanEmptyObjects(
                    diffObjects(originalBase, updateBase) as IPartialItem
                );

            if (Object.keys(diffObjectBase).length && (diffObjectBase.item_type)) {
                return false;
            } else {
                if (originalBase.item_type === "product") {

                    const originalProduct = (originalItem as IPartialProduct);
                    const updateProduct = (updateItem as IPartialProduct);

                    const originalProductDiscountRange: IPartialProductDiscountRange[] = originalProduct.product_discount_ranges ?? [];
                    const updateProductDiscountRange: IPartialProductDiscountRange[] = updateProduct.product_discount_ranges ?? [];
                    const originalProductProcess: IPartialProductProcess[] = originalProduct.product_processes ?? [];
                    const updateProductProcess: IPartialProductProcess[] = updateProduct.product_processes ?? [];
                    const originalProductInput: IPartialProductInput[] = originalProduct.products_inputs ?? [];
                    const updateProductInput: IPartialProductInput[] = updateProduct.products_inputs ?? [];

                    delete originalProduct.product_processes;
                    delete originalProduct.products_inputs;
                    delete originalProduct.product_discount_ranges;
                    delete updateProduct.product_processes;
                    delete updateProduct.products_inputs;
                    delete updateProduct.product_discount_ranges;

                    const diffProduct = await cleanEmptyObjects(diffObjects(originalProduct, updateProduct) as IPartialProduct);

                    const diffProductProcess: ProductProcessManager = await diffObjectArraysWithChildSingle(originalProductProcess, updateProductProcess, {
                        childKey: "product_input_process",
                        managerKey: "product_input_process_updated",
                    });
                    const diffProductInput: ProductInputManager = await diffObjectArrays(originalProductInput, updateProductInput) ?? [];
                    const diffProductDiscountRange: ProductDiscountRangeManager = await diffObjectArrays(originalProductDiscountRange, updateProductDiscountRange) ?? [];

                    const hasChangesProductProcess: boolean = [diffProductProcess.added, diffProductProcess.deleted, diffProductProcess.modified].some((arr: IPartialProductProcess[]) => arr.length > 0);
                    const hasChangesProductInput: boolean = [diffProductInput.added, diffProductInput.deleted, diffProductInput.modified].some((arr: IPartialProductInput[]) => arr.length > 0);
                    const hasChangesProductDiscountRange: boolean = [diffProductDiscountRange.added, diffProductDiscountRange.deleted, diffProductDiscountRange.modified].some((arr: IPartialProductDiscountRange[]) => arr.length > 0);

                    if (diffProduct || hasChangesProductProcess || hasChangesProductDiscountRange || hasChangesProductInput) {
                        const updateValues: IPartialProduct = {
                            ...diffProduct,
                            products_inputs_updated: diffProductInput,
                            product_processes_updated: diffProductProcess,
                            product_discount_ranges_updated: diffProductDiscountRange,
                        }
                        console.log(updateValues);
                        await updateCompleteProductInDB({ id: originalProduct.id, product: updateValues });
                    }
                } else {
                    const originalInput = (originalItem as IPartialInput);
                    const updateInput = (updateItem as IPartialInput);
                    const diffInput = await diffObjects(originalInput, updateInput) as IPartialInput;
                    if (Object.keys(diffInput).length) await updateCompleteInputInDB({ id: originalInput.id, input: diffInput });
                }
                refetchItems();
                return true;
            }
        } catch (err: any) {
            let key: string = "";
            if (originalBase.item_type === "product") key = "createCompleteProduct";
            else key = "createCompleteInput";
            if (err instanceof Error) {
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            } else {
                const error = err as IApiError;
                if (error.validation) {
                    error.validation.forEach((msg: string) => {
                        dispatchRedux(setError({ key: key, message: { validation: msg } }));
                        ToastMantine.error({ message: msg });
                    });
                }
            }
            return false;
        }
    }, [dispatchRedux, refetchItems]);

    const handleOnDelete = useCallback(async (): Promise<boolean> => {
        if (!selectedItem) return false;
        try {
            if (selectedItem.item_type === "product") await deleteProductInDB({ id: selectedItem.item?.id as number });
            else await deleteInputInDB({ id: selectedItem.item?.id as number });
            refetchItems();
            setIsActiveFeedBackModal(prev => !prev);
            return true;
        } catch (err: unknown) {
            let key: string = "";
            if (selectedItem.item_type === "product") key = "createCompleteProduct";
            else key = "createCompleteInput";
            if (err instanceof Error) {
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            } else {
                const error = err as IApiError;
                if (error.validation) {
                    error.validation.forEach((msg: string) => {
                        dispatchRedux(setError({ key: key, message: { validation: msg } }));
                        ToastMantine.error({ message: msg });
                    });
                }
            }
            return false;
        }
    }, [dispatchRedux, selectedItem, refetchItems]);

    const actionsRow: RowAction<IItem>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: handleOnClickRowDelete,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], [handleOnClickRowDelete]);


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
            <GenericTableMemo
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
                enableRowEditClickHandler={handleOnClickRowEdit}

                // Extracomponents
                extraComponents={ExtraComponents}
                noResultsMessage="No hay productos existentes."


                // classes
                classNameGenericTableContainer={StyleModule.containerTable}
            />
            {isActiveAddModal &&
                <ItemModuleProvider totalSteps={3} currentStep={0}>
                    <AddWizardItem onClose={toggleIsActiveAddModal} onCreate={handleCreate} />
                </ItemModuleProvider>
            }
            {isActiveEditModal &&
                <ItemModuleProvider totalSteps={3} currentStep={2} data={selectedItem ?? undefined}>
                    <EditWizardItem onClose={toggleIsActiveEditModal} onUpdate={handleOnUpdate} />
                </ItemModuleProvider>
            }
            {isActiveDeleteModal && <DeleteModal
                title={"¿Seguro que desea eliminar este producto?"}
                message={"Este proceso no se puede deshacer."}
                onClose={toggleIsActiveDeleteModal}
                onDelete={handleOnDelete}
            />}
            {isActiveFeedBackModal && <FeedBackModal
                onClose={toggleIsActiveFeedBackModal}
                title={"El producto se ha eliminado correctamente"}
                icon={<CircleCheck className={StyleModule.iconFeedBackModal} />}

            />}
        </div>
    );
}

export default ItemModel;


const ExtraComponent = ({ search, setSearch }: { search: string | null, setSearch: (v: string | null) => void }) => {

    const state = useTableState();
    const dispatch = useTableDispatch();

    const handleClearFilters = useCallback(() => {
        dispatch(reset_column_filters());
    }, [dispatch]);

    const handleExportTable = useCallback(() => {
        console.log("exporting table");
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
};


const ExtraComponentMemo = memo(ExtraComponent) as typeof ExtraComponent;