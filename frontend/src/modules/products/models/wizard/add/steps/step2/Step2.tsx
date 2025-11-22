import SecundaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import UnderlineLabelInputNumeric from "../../../../../../../comp/primitives/input/layouts/underline-label/numeric/UnderlineLabelInputNumeric";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import UnderlineLabelInputText from "../../../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import SingleImageLoaderCustom from "../../../../../../../comp/primitives/image-loader/single/custom/SingleImageLoaderCustom";
import AssignInputsToProcessModal from "../../../../../../../comp/features/modal-process-input/AssignInputsToProcessModal";
import type { IPartialProductDiscountRange } from "../../../../../../../interfaces/product-discounts-ranges";
import SelectObjectsModalMemo from "../../../../../../../comp/features/modal-product2/SelectProductsModal";
import { add_inputs_to_products, remove_inputs_from_products } from "./../../../../../context/itemActions"
import type { IPartialProductInputProcess } from "../../../../../../../interfaces/productInpustProcesses";
import type { RowAction } from "../../../../../../../comp/primitives/table/tableContext/tableTypes";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import type { IPartialProductInput } from "../../../../../../../interfaces/productsInputs";
import base64ToFileOrNull from "../../.../../../../../../../scripts/convertBase64ToFile";
import { clearError, setError } from "../../../../../../../store/slicer/errorSlicer";
import type { IInput, IPartialInput } from "../../../../../../../interfaces/inputs";
import { update_discount_from_products } from "../../../../../context/itemActions";
import { useCallback, useEffect, useMemo, useState, type Dispatch } from "react";
import type { IPartialProduct } from "../../../../../../../interfaces/product";
import type { ItemAction, ItemState } from "../../../../../context/itemTypes";
import { generateRandomIds } from "../../../../../../../helpers/nanoId";
import { back_step } from "../../../../../context/itemActions";
import { useDispatch as useDispatchRedux } from "react-redux";
import type { ColumnDef } from "@tanstack/react-table";
import { Bookmark, Plus, Trash2 } from "lucide-react";
import StyleModule from "./Step2.module.css"

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "production/inputs/exclude";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

interface Step2Props {
    state: ItemState,
    dispatch: Dispatch<ItemAction>,
    onCancel: () => void
}

const Step2 = ({ state, dispatch, onCancel }: Step2Props) => {

    const dispatchRedux = useDispatchRedux();

    const computeCostValue = useCallback((): number | null => {
        let value: number | null;
        if (state.data.item_type === "product") {
            const itemState = state.data.item as IPartialProduct;
            value = itemState.sale_price ?? null;
        } else {
            const itemState = state.data.item as IPartialInput;
            value = itemState.unit_cost ?? null
        }
        return value;
    }, [state.data]);

    const computeProductionCost = useCallback((): number | null => {
        let value: number | null;
        if (state.data.item_type === "product") {
            const itemState = state.data.item as IPartialProduct;
            value = itemState.production_cost ?? null;
        } else {
            value = null;
        }
        return value;
    }, [state.data]);

    const computePhotoFiles = useCallback((): File | null => {
        if (!state.data.item) return null;
        return base64ToFileOrNull(state.data.item.photo || null, "product-photo")
    }, [state.data.item?.photo]);

    const [photo, setPhoto] = useState<File | null>(computePhotoFiles());
    const [cost, setCost] = useState<number | null>(computeCostValue());
    const [presentation, setPresentation] = useState<string | null>(state.data.item?.presentation ?? null);
    const [storageConditions, setStorageConditions] = useState<string | null>(state.data.item?.storage_conditions ?? null);
    const [productionCost, setProductionCost] = useState<number | null>(computeProductionCost());
    const [isActiveProductInputAddModal, setIsActiveProductInputAddModal] = useState<boolean>(false);
    const [isActiveProductInputProcessAddModal, setIsActiveProductInputProcessAddModal] = useState<boolean>(false);
    const [isAvailableInputs, setIsAvailableInputs] = useState<boolean>(false);
    const [modeAssignProcess, setModeAssignProcess] = useState<"new" | "asingn" | null>("new");

    //  * ************ Components Table ProductInput ************ 

    const getRowAttr = useMemo(() => (row: IInput) => row.name, []);

    const excludeIds = useMemo((): number[] => {
        const item = state.data.item as IPartialProduct;
        return (item.products_inputs?.map(p => p.input_id).filter((id): id is number => id != null) ?? []);
    }, [state.data?.item]);

    const handleOnClickAddProductInput = useCallback((inputs: IInput[]) => {
        const inputPartialProductInputs: IPartialProductInput[] = inputs.map((input): IPartialProductInput => ({
            id: generateRandomIds(),
            input_id: input.id,
            inputs: input
        }));
        dispatch(add_inputs_to_products(inputPartialProductInputs));
        toggleIsActiveProductInputAddModal();
    }, [dispatch]);

    const handleOnClickDeleteProductInput = useCallback((row: IPartialProductInput) => {
        dispatch(remove_inputs_from_products([row.id as number]));
    }, [dispatch]);

    const fetchLoadInputs = useCallback(async (query: string | number): Promise<IInput[]> => {
        try {
            // Anexamos el query
            const params = new URLSearchParams();
            params.append("filter", query.toString());
            // Anexamos los ids a excluir
            excludeIds.forEach((id) => params.append("excludeIds", id.toString()));
            // Generamos la url
            const url = new URL(API_URL.toString());
            // Adjuntamos los params a la url
            url.search = params.toString();
            // Realizamos la peticion
            const response = await fetch(url.toString(), { method: "GET" });
            // Validamos la respuesta
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData?.message ?? "Error al cargar inputs";
                if (response.status >= 500) throw new Error(message);
                dispatchRedux(setError({ key: "likeWithExludeToInput", message }));
                return [];
            }
            dispatchRedux(clearError("likeWithExludeToInput"));
            const data: IInput[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    }, [state.data.item, dispatchRedux, excludeIds]);

    const toggleIsActiveProductInputAddModal = useCallback(() => {
        setIsActiveProductInputAddModal(prev => !prev);
    }, []);

    const columnsProductInput: ColumnDef<IPartialProductInput>[] = useMemo(() => [
        {
            id: "custom_id",
            header: "Id",
            accessorFn: (row: IPartialProductInput) => row.inputs?.custom_id,
            meta: {
                hidden: false,
                type: "number",
                mode: "range",
                autoGenerated: false,
            },
        },
        {
            id: "name",
            header: "Insumo",
            accessorFn: (row: IPartialProductInput) => row.inputs?.name,
            meta: {
                hidden: false,
                type: "string",
                typeText: "text",
                autoGenerated: false,
            },
        },
    ], []);

    const actionsRow: RowAction<IPartialProductInput>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: handleOnClickDeleteProductInput,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], []);

    //  * ************ Components Table ProductInputProcess ************ 

    const getRowIdProductInputProcess = useMemo(() => (row: IPartialProductInput, index: number) => (row?.id && row?.id.toString()) || index.toString(), []);

    const handleUpdateItemOrder = useCallback((items: IPartialProductInputProcess[]) => {
    }, []);

    const toggleIsActiveProductInputProcessAddModalAssing = useCallback(() => {
        setModeAssignProcess("asingn");
        setIsActiveProductInputProcessAddModal(prev => !prev);
    }, []);
    const toggleIsActiveProductInputProcessAddModalNew = useCallback(() => {
        setModeAssignProcess("new");
        setIsActiveProductInputProcessAddModal(prev => !prev);
    }, []);

    const columnsProductInputProcess: ColumnDef<IPartialProductInputProcess>[] = useMemo(() => [
        {
            id: "name",
            header: "Nombre",
            accessorFn: (row: IPartialProductInputProcess) => row.product_process?.process?.name,
            meta: {
                hidden: false,
                type: "string",
                typeText: "text",
                autoGenerated: false,
            },
        },
        {
            id: "sort_order",
            header: "Orden",
            accessorFn: (row: IPartialProductInputProcess) => row.product_process?.sort_order,
            meta: {
                hidden: false,
                type: "number",
                mode: "range",
                autoGenerated: false,
            },
        },
    ], []);

    const getSortFieldProductInputProcess = useCallback((row: IPartialProductInputProcess): number => {
        return row.product_process?.sort_order as number;
    }, []);

    const setSortFieldProductInputProcess = useCallback((row: IPartialProductInputProcess, value: number): IPartialProductInputProcess => {
        return {
            ...row,
            product_process: {
                ...row.product_process,
                sort_order: value,
            } as IPartialProductInputProcess,
        };
    }, []);

    //  * ************ Components Table ProductDiscountRange ************ 

    const getRowIdProductDiscountRange = useMemo(() => (row: IPartialProductDiscountRange, index: number) => (row?.id && row?.id.toString()) || index.toString(), []);
    const onHandleChangeValueMinQty = useCallback((id: number, value: number | null) => {
        const attributes: IPartialProductDiscountRange = { min_qty: value as number };
        dispatch(update_discount_from_products({ id, attributes: attributes }));
    }, [dispatch]);
    const onHandleChangeValueMaxQty = useCallback((id: number, value: number | null) => {
        const attributes: IPartialProductDiscountRange = { max_qty: value as number };
        dispatch(update_discount_from_products({ id, attributes: attributes }));
    }, [dispatch]);
    const onHandleChangeValueUnitPrice = useCallback((id: number, value: number | null) => {
        const attributes: IPartialProductDiscountRange = { unit_price: value as number };
        dispatch(update_discount_from_products({ id, attributes: attributes }));
    }, [dispatch]);

    const columnsProductDiscountRange: ColumnDef<IPartialProductDiscountRange>[] = useMemo(() => [
        {
            accessorKey: "min_qty",
            header: "Mínimo de piezas",
            meta: {
                hidden: false,
                type: "number",
                mode: "range",
                autoGenerated: false,
            },
            cell: ({ row }) => {
                const value = row.original.min_qty ?? null;

                const onChange = useCallback((value: number | null) => {
                    onHandleChangeValueMinQty(row.original.id as number, value);
                }, [row.original.id, onHandleChangeValueMinQty]);

                return (
                    <UnderlineLabelInputNumeric
                        value={value}
                        onChange={onChange}
                    />
                )
            }
        },
        {
            accessorKey: "max_qty",
            header: "Máximo de piezas",
            meta: {
                hidden: false,
                type: "number",
                mode: "range",
                autoGenerated: false,
            },
            cell: ({ row }) => {
                const value = row.original.max_qty ?? null;

                const onChange = useCallback((value: number | null) => {
                    onHandleChangeValueMaxQty(row.original.id as number, value);
                }, [row.original.id, onHandleChangeValueMaxQty]);

                return (
                    <UnderlineLabelInputNumeric
                        value={value}
                        onChange={onChange}
                    />
                )
            }
        },
        {
            accessorKey: "unit_price",
            header: "Precio",
            meta: {
                hidden: false,
                type: "number",
                mode: "range",
                autoGenerated: false,
            },
            cell: ({ row }) => {
                const value = row.original.unit_price ?? null;

                const onChange = useCallback((value: number | null) => {
                    onHandleChangeValueUnitPrice(row.original.id as number, value);
                }, [row.original.id, onHandleChangeValueUnitPrice]);

                return (
                    <UnderlineLabelInputNumeric
                        value={value}
                        onChange={onChange}
                    />
                )
            }
        },
    ], [state.data, dispatch, onHandleChangeValueMinQty, onHandleChangeValueMaxQty, onHandleChangeValueUnitPrice]);


    // * ************ Handlers ************ 

    const handleOnClickNextStep = useCallback(() => {

    }, [dispatch]);

    const handleOnClickBackStep = useCallback(() => {
        dispatch(back_step());
    }, [dispatch]);

    // * ************ Effects ************

    useEffect(() => {
        const load = async () => {
            const allInputs = await fetchLoadInputs("");
            setIsAvailableInputs(allInputs.length > 0);
        };
        load();
    }, [fetchLoadInputs]);


    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>
                <div className={StyleModule.firstBlock}>
                    <div className={StyleModule.imageContainer}>
                        <SingleImageLoaderCustom
                            value={photo}
                            onChange={setPhoto}
                        />
                    </div>
                    <div className={StyleModule.infoContainer}>
                        <div className={StyleModule.inputGroup}>
                            <UnderlineLabelInputText
                                label="Presentación"
                                value={presentation}
                                onChange={setPresentation}
                            />
                            <UnderlineLabelInputText
                                label="Condiciones de almacenamiento"
                                value={storageConditions}
                                onChange={setStorageConditions}
                            />
                        </div>
                        <div className={StyleModule.inputGroup}>

                            <UnderlineLabelInputNumeric
                                label={
                                    state.data.item_type === "product"
                                        ? "Precio de venta"
                                        : "Precio de compra"
                                }
                                value={cost}
                                onChange={setCost}
                                withValidation
                            />
                            {state.data.item_type === "product" &&
                                <UnderlineLabelInputNumeric
                                    label="Costo de producción"
                                    value={productionCost}
                                    onChange={setProductionCost}
                                    withValidation
                                />
                            }
                        </div>
                    </div>
                </div>
                {state.data.item_type === "product" &&
                    <div className={StyleModule.externalContainerTable}>
                        <div className={StyleModule.contentHeaderTable}>
                            <span className={`nunito-bold ${StyleModule.subTitle}`}>Insumos de producción</span>
                            <MainActionButtonCustom
                                label="Asignar insumo"
                                icon={<Plus />}
                                onClick={toggleIsActiveProductInputAddModal}
                                disabled={!isAvailableInputs}
                            />
                        </div>
                        <GenericTableMemo
                            modelName="Insumos de producción"
                            getRowId={getRowIdProductInputProcess}
                            data={(state.data.item as IPartialProduct).products_inputs || []}
                            columns={columnsProductInput}
                            typeRowActions="icon"
                            modeTable="content"
                            noResultsMessage="No hay insumos de producción asignados"
                            enableOptionsColumn
                            rowActions={actionsRow}
                        />
                    </div>
                }
                {state.data.item_type === "product" &&
                    <div className={StyleModule.externalContainerTable}>
                        <div className={StyleModule.contentHeaderTable}>
                            <span className={`nunito-bold ${StyleModule.subTitle}`}>Procesos de producción</span>
                            <div className={StyleModule.containerButtonsDiv}>
                                <SecundaryActionButtonCustom
                                    label="Nuevo proceso"
                                    icon={<Plus />}
                                    onClick={toggleIsActiveProductInputProcessAddModalNew}
                                />
                                <MainActionButtonCustom
                                    label="Asignar procesos"
                                    icon={<Plus />}
                                    onClick={toggleIsActiveProductInputProcessAddModalAssing}
                                />
                            </div>
                        </div>
                        <GenericTableMemo
                            modelName="Procesos de producción"
                            getRowId={getRowIdProductInputProcess}
                            getSortField={getSortFieldProductInputProcess}
                            setSortField={setSortFieldProductInputProcess}
                            enableSortableRows
                            setOnReorderRows={handleUpdateItemOrder}
                            data={(state.data.item as IPartialProduct).product_inputs_processes || []}
                            columns={columnsProductInputProcess}
                            modeTable="content"
                            noResultsMessage="No hay procesos de producción asignados"
                        />
                    </div>
                }
                {state.data.item_type === "product" &&
                    <div className={StyleModule.externalContainerTable}>
                        <div className={StyleModule.contentHeaderTable}>
                            <span className={`nunito-bold ${StyleModule.subTitle}`}>Descuentos de rangos</span>
                            <MainActionButtonCustom
                                label="Agregar rango"
                                icon={<Plus />}
                                onClick={() => console.log("Agregar rango")}
                            />
                        </div>
                        <GenericTableMemo
                            modelName="Descuentos de rangos"
                            getRowId={getRowIdProductDiscountRange}
                            data={(state.data.item as IPartialProduct).product_discount_ranges || []}
                            columns={columnsProductDiscountRange}
                            modeTable="content"
                            noResultsMessage="No hay descuentos de rangos asignados"
                        />
                    </div>
                }
            </div>
            <div className={StyleModule.containerButtons}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onCancel}
                />
                <CriticalActionButton
                    label="Regresar"
                    onClick={handleOnClickBackStep}
                />
                <TertiaryActionButtonCustom
                    label="Guardar y salir"
                    onClick={() => console.log("guardar y salir")}
                    icon={<Bookmark />}
                />
                <MainActionButtonCustom
                    label="Guardar y continuar"
                    onClick={handleOnClickNextStep}
                    icon={<Bookmark />}
                />
            </div>
            {
                isActiveProductInputAddModal && state.data.item_type === "product" &&
                <SelectObjectsModalMemo
                    loadOptions={fetchLoadInputs}
                    emptyMessage="No se encontraron insumos"
                    getRowAttr={getRowAttr}
                    headerTitle="Asignar insumos"
                    labelOnClick="Agregar insumos"
                    placeholder="Buscar"
                    maxHeight="400px"
                    onClose={toggleIsActiveProductInputAddModal}
                    onClick={handleOnClickAddProductInput}
                />
            }
            {
                (isActiveProductInputProcessAddModal && state.data.item_type === "product" && modeAssignProcess) &&
                <AssignInputsToProcessModal
                    validInputs={(state.data.item as IPartialProduct).products_inputs}
                    selectedProcessBase={(state.data.item as IPartialProduct).product_inputs_processes || []}
                    mode={modeAssignProcess}
                    onClick={(inputs: IPartialProductInputProcess[]) => { }}
                    onClose={toggleIsActiveProductInputProcessAddModalAssing}
                />
            }
        </div>
    )
}

export default Step2;