import SecundaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import UnderlineLabelInputNumeric from "../../../../../../../comp/primitives/input/layouts/underline-label/numeric/UnderlineLabelInputNumeric";
import UnderlineLabelInputText from "../../../../../../../comp/primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import DobleIconInputNumeric from "../../../../../../../comp/primitives/input/layouts/doble-icon/numeric/base/DobleIconInputNumeric";
import EditAssingnInputsToProcessModal from "../../../../../../../comp/features/modal-process-input/EditAssingnInputsToProcessModal";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import SingleImageLoaderCustom from "../../../../../../../comp/primitives/image-loader/single/custom/SingleImageLoaderCustom";
import AssignInputsToProcessModal from "../../../../../../../comp/features/modal-process-input/AssignInputsToProcessModal";
import type { IPartialProductDiscountRange } from "../../../../../../../interfaces/product-discounts-ranges";
import SelectObjectsModalMemo from "../../../../../../../comp/features/modal-product2/SelectProductsModal";
import type { IPartialProductInputProcess } from "../../../../../../../interfaces/productInpustProcesses";
import type { RowAction } from "../../../../../../../comp/primitives/table/tableContext/tableTypes";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import type { IPartialProductProcess } from "../../../../../../../interfaces/productsProcesses";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import type { IPartialProductInput } from "../../../../../../../interfaces/productsInputs";
import {
    add_discount_to_draft_products, add_draft_product_process,
    add_inputs_to_draft_products, back_step, update_draft_product_process_id,
    remove_discount_from_draft_products, remove_draft_product_process,
    remove_inputs_from_draft_products, update_discount_from_draft_products,
    update_draft_input, update_draft_product, update_draft_product_process, next_step
} from "../../../../../context/itemActions";
import FeedBackModal from "../../../../../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";
import base64ToFileOrNull from "../../.../../../../../../../scripts/convertBase64ToFile";
import { clearError, setError } from "../../../../../../../store/slicer/errorSlicer";
import type { IInput, IPartialInput } from "../../../../../../../interfaces/inputs";
import { useCallback, useEffect, useMemo, useState, type Dispatch, type ReactNode } from "react";
import type { IPartialProduct } from "../../../../../../../interfaces/product";
import type { ItemAction, ItemState } from "../../../../../context/itemTypes";
import type { IProcess } from "../../../../../../../interfaces/processes";
import { generateRandomIds } from "../../../../../../../helpers/nanoId";
import { Bookmark, CircleCheck, DollarSign, Plus, Trash2 } from "lucide-react";
import { useDispatch as useDispatchRedux, useSelector } from "react-redux";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialItem } from "interfaces/item";
import StyleModule from "./Step2.module.css"
import type { RootState } from "../../../../../../../store/store";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH_INPUT = "production/inputs/exclude";
const RELATIVE_PATH_PROCESS = "production/processes/exclude";
const API_URL_INPUT = new URL(RELATIVE_PATH_INPUT, API_BASE_URL);
const API_URL_PROCESS = new URL(RELATIVE_PATH_PROCESS, API_BASE_URL);


interface Step2Props {
    state: ItemState,
    dispatch: Dispatch<ItemAction>,
    onCancel: () => void,
    onRefetch: () => Promise<void>,
    onUpdate: ({ original, update }: { original: IPartialItem, update: IPartialItem }) => (Promise<boolean> | boolean)
}

const Step2 = ({ state, dispatch, onCancel, onUpdate, onRefetch }: Step2Props) => {

    const dispatchRedux = useDispatchRedux();

    const errorRedux = useSelector((state: RootState) => state.error);


    const computeCostValue = useCallback((): number | null => {
        let value: number | null;
        if (state.draft.item_type === "product") {
            const itemState = state.draft.item as IPartialProduct;
            value = itemState.sale_price ?? null;
        } else {
            const itemState = state.draft.item as IPartialInput;
            value = itemState.unit_cost ?? null
        }
        return value;
    }, [state.draft]);

    const computeProductionCost = useCallback((): number | null => {
        let value: number | null;
        if (state.draft.item_type === "product") {
            const itemState = state.draft.item as IPartialProduct;
            value = itemState.production_cost ?? null;
        } else {
            value = null;
        }
        return value;
    }, [state.draft]);

    const computePhotoFiles = useCallback((): File | null => {
        if (!state.draft.item) return null;
        return base64ToFileOrNull(state.draft.item?.photo || null, "photo")
    }, [state.draft.item]);

    const [photo, setPhoto] = useState<File | null>(computePhotoFiles());
    const [cost, setCost] = useState<number | null>(computeCostValue());
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

    const toggleShowConfirmModal = useCallback(() => setShowConfirmModal(prev => !prev), [])
    const [customMessageConfirmModal, setCustomMessageConfirmModal] = useState<ReactNode | null>(null);


    const handleOnCloseConfirmModal = useCallback(() => {
        toggleShowConfirmModal();
        dispatch(next_step());
    }, [toggleShowConfirmModal, dispatch]);

    const [presentation, setPresentation] = useState<string | null>(state.draft.item?.presentation ?? null);
    const [storageConditions, setStorageConditions] = useState<string | null>(state.draft.item?.storage_conditions ?? null);
    const [productionCost, setProductionCost] = useState<number | null>(computeProductionCost());
    const [isActiveProductInputAddModal, setIsActiveProductInputAddModal] = useState<boolean>(false);
    const [isActiveProductProcessAddModal, setIsActiveProductProcessAddModal] = useState<boolean>(false);
    const [selectedProductProcessEdit, setSelectedProductProcessEdit] = useState<IPartialProductProcess>();
    const [isAvailableInputs, setIsAvailableInputs] = useState<boolean>(false);
    const [isAvailableProcess, setIsAvailableProcess] = useState<boolean>(false);
    const [isActiveProductProcessEditModal, setIsActiveProductProcessEditModal] = useState<boolean>(false);
    const [modeAssignProcess, setModeAssignProcess] = useState<"new" | "asingn" | null>("new");

    const toggleIsActiveProductInputAddModal = useCallback(() => setIsActiveProductInputAddModal(prev => !prev), []);

    const toggleIsActiveProductProcessEditModal = useCallback(() => setIsActiveProductProcessEditModal(prev => !prev), []);

    const handleOnClickRowProductProcess = useCallback((row: IPartialProductProcess) => {
        setSelectedProductProcessEdit(row);
        setIsActiveProductProcessEditModal(prev => !prev);
    }, [])


    //  * ************ Components Table ProductInput ************ 

    const getRowAttrProductInput = useMemo(() => (row: IInput) => row.name, []);
    const getRowIdProductInput = useMemo(() => (row: IPartialProductInput, index: number) => row.inputs?.id && row.inputs.id?.toString() || index.toString(), []);

    const excludeIds = useMemo((): number[] => {
        const item = state.draft.item as IPartialProduct;
        return (item.products_inputs?.map(p => p.input_id).filter((id): id is number => id != null) ?? []);
    }, [state.draft?.item]);

    const handleOnClickAddProductInput = useCallback((inputs: IInput[]) => {
        const inputPartialProductInputs: IPartialProductInput[] = inputs.map((input): IPartialProductInput => ({
            id: generateRandomIds(),
            input_id: input.id,
            inputs: input
        }));
        dispatch(add_inputs_to_draft_products(inputPartialProductInputs));
        toggleIsActiveProductInputAddModal();
    }, [dispatch, toggleIsActiveProductInputAddModal]);

    const handleOnClickDeleteProductInput = useCallback((row: IPartialProductInput) => {
        if (!row?.id) return;
        dispatch(remove_inputs_from_draft_products([row.id]));
    }, [dispatch]);

    const handleOnClickDeleteProductProcess = useCallback((row: IPartialProductProcess) => {
        if (!row?.id) return;
        dispatch(remove_draft_product_process([row?.id]));
    }, [dispatch]);

    const fetchLoadInputs = useCallback(async (query: string | number): Promise<IInput[]> => {
        try {
            // Anexamos el query
            const params = new URLSearchParams();
            params.append("filter", query.toString());
            // Anexamos los ids a excluir
            excludeIds.forEach((id) => params.append("excludeIds", id.toString()));
            // Generamos la url
            const url = new URL(API_URL_INPUT.toString());
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
    }, [dispatchRedux, excludeIds]);


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

    const actionsRowProductInput: RowAction<IPartialProductInput>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: handleOnClickDeleteProductInput,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], [handleOnClickDeleteProductInput]);

    //  * ************ Components Table ProductProcess ************ 

    const handleUpdateItemOrder = useCallback((items: IPartialProductProcess[]) => {
        dispatch(update_draft_product_process(items));
    }, [dispatch]);

    const getRowIdProductProcess = useMemo(() => (row: IPartialProductProcess, index: number) => (row?.id?.toString()) || index.toString(), []);

    const toggleIsActiveProductProcessAddModalAssing = useCallback(() => {
        setModeAssignProcess("asingn");
        setIsActiveProductProcessAddModal(prev => !prev);
    }, []);
    const toggleIsActiveProductProcessAddModalNew = useCallback(() => {
        setModeAssignProcess("new");
        setIsActiveProductProcessAddModal(prev => !prev);
    }, []);

    const excludeIdsProcess = useMemo(() => {
        const item = state.draft.item as IPartialProduct;
        return (item.product_processes?.map(p => p.process?.id).filter((id): id is number => typeof id === "number") ?? []);
    }, [state.draft.item]);

    const fetchLoadProcess = useCallback(async (query: string | number): Promise<IProcess[]> => {
        try {
            // Anexamos el query
            const params = new URLSearchParams();
            params.append("filter", query.toString());
            // Anexamos los ids a excluir
            excludeIdsProcess.forEach((id) => params.append("excludeIds", id.toString()));
            // Generamos la url
            const url = new URL(API_URL_PROCESS.toString());
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
            const data: IProcess[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    }, [dispatchRedux, excludeIdsProcess]);

    const columnsProductProcess: ColumnDef<IPartialProductProcess>[] = useMemo(() => [
        {
            id: "name",
            header: "Nombre",
            accessorFn: (row: IPartialProductProcess) => row.process?.name,
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
            accessorFn: (row: IPartialProductProcess) => row.sort_order,
            meta: {
                hidden: false,
                type: "number",
                mode: "range",
                autoGenerated: false,
            },
        },
        {
            id: "inputs",
            header: "Insumos",
            accessorFn: (row: IPartialProductProcess) => row.product_input_process,
            meta: {
                hidden: false,
                type: "number",
                mode: "range",
                autoGenerated: false,
            },
            cell: ({ row }) => {
                const value = row.original.product_input_process;
                return (
                    <div className={StyleModule.containerInputs}>
                        {
                            value?.map((input: IPartialProductInputProcess, index: number) => {
                                return (
                                    <div key={index} className={StyleModule.inputRowCell}>
                                        <span>{`${index + 1}. ${input.product_input?.inputs?.name}`}</span>
                                        <span>{`Cantidad: ${Number(input.qty)}`}</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }
        }
    ], []);

    const getSortFieldProductProcess = useCallback((row: IPartialProductProcess): number => {
        return row.sort_order as number;
    }, []);

    const setSortFieldProductProcess = useCallback((row: IPartialProductProcess, value: number): IPartialProductProcess => {
        return ({ ...row, sort_order: value });
    }, []);

    const actionsRowProductProcess: RowAction<IPartialProductProcess>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: handleOnClickDeleteProductProcess,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], [handleOnClickDeleteProductProcess]);

    const handleOnClickAddProductProcess = useCallback((values: IPartialProductProcess[]) => {
        dispatch(add_draft_product_process(values));
    }, [dispatch]);

    const handleOnClickEditProductProcess = useCallback((values: IPartialProductProcess[]) => {
        const item = values.shift();
        if (!item || !item?.id) return;
        dispatch(update_draft_product_process_id({
            attributes: item,
            id: item.id
        }));
    }, [dispatch]);

    //  * ************ Components Table ProductDiscountRange ************ 

    const getRowIdProductDiscountRange = useMemo(() => (row: IPartialProductDiscountRange, index: number) => (row?.id && row?.id.toString()) || index.toString(), []);
    const onHandleChangeValueMinQty = useCallback((id: number, value: number | null) => {
        const attributes: IPartialProductDiscountRange = { min_qty: value ?? undefined };
        dispatch(update_discount_from_draft_products({ id, attributes: attributes }));
    }, [dispatch]);
    const onHandleChangeValueMaxQty = useCallback((id: number, value: number | null) => {
        const attributes: IPartialProductDiscountRange = { max_qty: value ?? undefined };
        dispatch(update_discount_from_draft_products({ id, attributes: attributes }));
    }, [dispatch]);
    const onHandleChangeValueUnitPrice = useCallback((id: number, value: number | null) => {
        const attributes: IPartialProductDiscountRange = { unit_price: value ?? undefined };
        dispatch(update_discount_from_draft_products({ id, attributes: attributes }));
    }, [dispatch]);

    const handleOnClickDeleteProductDiscountRange = useCallback((row: IPartialProductDiscountRange) => {
        dispatch(remove_discount_from_draft_products([row.id as string]));
    }, [dispatch])


    type RangeConflict = "duplicate" | "overlap" | null;

    const checkRangeConflicts = useCallback((ranges: IPartialProductDiscountRange[]): RangeConflict => {

        if (ranges.length < 2) return null;

        // Normalizar rangos (asegurar números válidos)
        const cleaned = ranges.map(r => ({
            min: Number(r.min_qty ?? 0),
            max: Number(r.max_qty ?? 0)
        }));

        // Ordenar por inicio
        const sorted = cleaned.sort((a, b) => a.min - b.min);

        for (let i = 0; i < sorted.length - 1; i++) {
            const a = sorted[i];
            const b = sorted[i + 1];

            // 1. Duplicado exacto
            if (a.min === b.min && a.max === b.max) {
                return "duplicate";
            }

            // 2. Traslape
            if (b.min <= a.max) {
                return "overlap";
            }
        }

        return null;
    }, []);

    const hasInvalidRangeValues = useCallback((ranges: IPartialProductDiscountRange[]): boolean => {

        for (const r of ranges) {
            const min = Number(r.min_qty);
            const max = Number(r.max_qty);
            const price = Number(r.unit_price);

            // valores obligatorios y > 0
            if (Number.isNaN(min) || min <= 0) return true;
            if (Number.isNaN(max) || max <= 0) return true;
            if (Number.isNaN(price) || price <= 0) return true;

            // rango mínimo debe ser menor al máximo
            if (min >= max) return true;
        }

        return false;
    }, []);


    const actionsRowProductDiscountRanges: RowAction<IPartialProductDiscountRange>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: handleOnClickDeleteProductDiscountRange,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], [handleOnClickDeleteProductDiscountRange]);

    const handleOnClickAddDiscountRange = useCallback(() => {
        const newProductDiscountRanges: IPartialProductDiscountRange = {
            min_qty: undefined, max_qty: undefined, unit_price: undefined, id: generateRandomIds()
        }
        dispatch(add_discount_to_draft_products([newProductDiscountRanges]))
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

                const onChange = (value: number | null) => {
                    onHandleChangeValueMinQty(row.original.id as number, value);
                }

                return (
                    <UnderlineLabelInputNumeric
                        value={Number(value)}
                        onChange={onChange}
                        withValidation
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

                const onChange = (value: number | null) => {
                    onHandleChangeValueMaxQty(row.original.id as number, value);
                };

                return (
                    <UnderlineLabelInputNumeric
                        value={Number(value)}
                        onChange={onChange}
                        withValidation
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

                const onChange = (value: number | null) => {
                    onHandleChangeValueUnitPrice(row.original.id as number, value);
                };

                return (
                    <DobleIconInputNumeric
                        value={Number(value)}
                        onChange={onChange}
                        withValidation
                        firstIcon={<DollarSign />}
                    />
                )
            }
        },
    ], [onHandleChangeValueMinQty, onHandleChangeValueMaxQty, onHandleChangeValueUnitPrice]);

    // * ************ Handlers ************ 

    const handleOnClickNextStep = useCallback(async () => {
        const rawItem = state.draft.item;
        if (!rawItem) return;

        const itemType = state.draft.item_type;
        const itemBase = structuredClone(rawItem);
        let item: IPartialProduct | IPartialInput = itemBase as IPartialProduct | IPartialInput;

        // =============================
        // PRODUCT
        // =============================
        if (itemType === "product") {
            item = itemBase as IPartialProduct;

            // -------- VALIDACIONES BÁSICAS --------
            if (!cost || !productionCost || cost === 0 || productionCost === 0) {
                ToastMantine.feedBackForm({ message: "Debes completar todos los campos." });
                return;
            }

            // -------- SI HAY INSUMOS, DEBE HABER PROCESOS --------
            if ((item as IPartialProduct).products_inputs?.length) {

                if (!((item as IPartialProduct).product_processes?.length)) {
                    ToastMantine.feedBackForm({
                        message: "Al asignar insumos, se debe asignar procesos."
                    });
                    return;
                }

                // -------- CALCULAR EQUIVALENCE EN EL CLON --------
                (item as IPartialProduct).products_inputs = ((item as IPartialProduct).products_inputs ?? []).map((pi) => {
                    const product = item as IPartialProduct;

                    // Tomamos TODOS los pips de TODOS los procesos
                    const allPipsForInput = (product.product_processes ?? []).flatMap(pp => pp.product_input_process ?? [])
                        .filter(pip => pip.product_input?.inputs?.id === pi.inputs?.id);

                    // ⚠️ Si NO hay ningún pip para ese insumo, NO toques equivalence
                    if (allPipsForInput.length === 0) {
                        return pi; // conserva equivalence = "2.00" que venía de la BD
                    }

                    // Si SÍ hay pips, entonces sí recalculamos equivalence
                    const equivalence = allPipsForInput.reduce((acc, pip) => acc + Number(pip.qty ?? 0), 0);

                    return { ...pi, equivalence };
                });
            }

            // -------- VALIDAR RANGOS --------
            const ranges = (item as IPartialProduct).product_discount_ranges ?? [];

            if (ranges.length > 0) {
                if (hasInvalidRangeValues(ranges)) {
                    ToastMantine.feedBackForm({
                        message: "Los rangos de precios deben tener valores validos."
                    });
                    return;
                }

                const conflict = checkRangeConflicts(ranges);
                if (conflict) {
                    ToastMantine.feedBackForm({
                        message:
                            conflict === "duplicate"
                                ? "Los rangos de precios no deben duplicarse."
                                : "Los rangos de precios no deben traslaparse."
                    });
                    return;
                }
            }

            // -------- CAMPOS PLANOS --------
            if (presentation) (item as IPartialProduct).presentation = presentation;
            if (storageConditions) (item as IPartialProduct).storage_conditions = storageConditions;
            if (photo) (item as IPartialProduct).photo = photo;

            (item as IPartialProduct).production_cost = productionCost;
            (item as IPartialProduct).sale_price = cost;

            dispatch(update_draft_product(item as IPartialProduct));
        }

        // =============================
        // INPUT
        // =============================
        else if (itemType === "input") {
            item = itemBase as IPartialInput;

            if (!cost || cost === 0) {
                ToastMantine.feedBackForm({ message: "Debes completar todos los campos." });
                return;
            }

            if (presentation) (item as IPartialInput).presentation = presentation;
            if (storageConditions) (item as IPartialInput).storage_conditions = storageConditions;
            if (photo) (item as IPartialInput).photo = photo;

            (item as IPartialInput).unit_cost = cost;

            dispatch(update_draft_input(item as IPartialInput));
        }

        const update: IPartialItem = {
            ...state.draft,
            item: {
                ...state.draft.item,
                ...item,
            }
        }
        const ok = await onUpdate({ original: state.data, update: update });
        if (!ok) {
            const errorsEntries = Object.entries(errorRedux);
            const errors = errorsEntries.map(([value]) => value);
            errors.forEach(error => ToastMantine.error({ message: error as string }));
            return;
        }
        const customMessage: ReactNode = (
            <span className={`nunito-bold ${StyleModule.customMessageConfirmModal}`}>
                El producto se ha actualizado correctamente.
            </span>
        );
        setCustomMessageConfirmModal(customMessage);
        onRefetch();
        toggleShowConfirmModal();
    }, [
        state.draft, state.data, onUpdate, errorRedux, toggleShowConfirmModal, onRefetch,
        productionCost, cost, presentation, storageConditions,
        photo, checkRangeConflicts, hasInvalidRangeValues, dispatch
    ]);

    const handleOnClickBackStep = useCallback(() => {
        dispatch(back_step());
    }, [dispatch]);

    // * ************ Effects ************

    useEffect(() => {
        const isAvailableInputsFunction = async () => {
            const allInputs = await fetchLoadInputs("");
            setIsAvailableInputs(allInputs.length > 0);
        };
        const isAvailableProcessFunction = async () => {
            const allProcess = await fetchLoadProcess("");
            setIsAvailableProcess(allProcess.length > 0);
        };
        isAvailableInputsFunction();
        isAvailableProcessFunction();
    }, [fetchLoadInputs, fetchLoadProcess]);

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
                                    state.draft.item_type === "product"
                                        ? "Precio de venta"
                                        : "Precio de compra"
                                }
                                value={Number(cost)}
                                onChange={setCost}
                                withValidation
                            />
                            {state.draft.item_type === "product" &&
                                <UnderlineLabelInputNumeric
                                    label="Costo de producción"
                                    value={Number(productionCost)}
                                    onChange={setProductionCost}
                                    withValidation
                                />
                            }
                        </div>
                    </div>
                </div>
                {state.draft.item_type === "product" &&
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
                            getRowId={getRowIdProductInput}
                            data={(state.draft.item as IPartialProduct).products_inputs || []}
                            columns={columnsProductInput}
                            typeRowActions="icon"
                            modeTable="content"
                            noResultsMessage="No hay insumos de producción asignados"
                            enableOptionsColumn
                            rowActions={actionsRowProductInput}
                        />
                    </div>
                }
                {state.draft.item_type === "product" &&
                    <div className={StyleModule.externalContainerTable}>
                        <div className={StyleModule.contentHeaderTable}>
                            <span className={`nunito-bold ${StyleModule.subTitle}`}>Procesos de producción</span>
                            <div className={StyleModule.containerButtonsDiv}>
                                <SecundaryActionButtonCustom
                                    label="Nuevo proceso"
                                    icon={<Plus />}
                                    onClick={toggleIsActiveProductProcessAddModalNew}
                                />
                                <MainActionButtonCustom
                                    label="Asignar procesos"
                                    icon={<Plus />}
                                    onClick={toggleIsActiveProductProcessAddModalAssing}
                                    disabled={!isAvailableProcess}
                                />
                            </div>
                        </div>
                        <GenericTableMemo
                            modelName="Procesos de producción"
                            getRowId={getRowIdProductProcess}
                            getSortField={getSortFieldProductProcess}
                            setSortField={setSortFieldProductProcess}
                            enableSortableRows
                            enableRowEditClickHandler={handleOnClickRowProductProcess}
                            enableRowEditClick
                            setOnReorderRows={handleUpdateItemOrder}
                            data={(state.draft.item as IPartialProduct).product_processes || []}
                            columns={columnsProductProcess}
                            modeTable="content"
                            enableOptionsColumn
                            rowActions={actionsRowProductProcess}
                            typeRowActions="icon"
                            noResultsMessage="No hay procesos de producción asignados"
                        />
                    </div>
                }
                {state.draft.item_type === "product" &&
                    <div className={StyleModule.externalContainerTable}>
                        <div className={StyleModule.contentHeaderTable}>
                            <span className={`nunito-bold ${StyleModule.subTitle}`}>Descuentos de rangos</span>
                            <MainActionButtonCustom
                                label="Agregar rango"
                                icon={<Plus />}
                                onClick={handleOnClickAddDiscountRange}
                            />
                        </div>
                        <GenericTableMemo
                            modelName="Descuentos de rangos"
                            getRowId={getRowIdProductDiscountRange}
                            data={(state.draft.item as IPartialProduct).product_discount_ranges || []}
                            columns={columnsProductDiscountRange}
                            modeTable="content"
                            typeRowActions="icon"
                            enableOptionsColumn
                            rowActions={actionsRowProductDiscountRanges}
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
                <MainActionButtonCustom
                    label="Guardar cambios"
                    onClick={handleOnClickNextStep}
                    icon={<Bookmark />}
                />
            </div>
            {
                isActiveProductInputAddModal && state.draft.item_type === "product" &&
                <SelectObjectsModalMemo
                    loadOptions={fetchLoadInputs}
                    emptyMessage="No se encontraron insumos"
                    getRowAttr={getRowAttrProductInput}
                    headerTitle="Asignar insumos"
                    labelOnClick="Agregar insumos"
                    placeholder="Buscar"
                    maxHeight="400px"
                    onClose={toggleIsActiveProductInputAddModal}
                    onClick={handleOnClickAddProductInput}
                />
            }
            {
                (isActiveProductProcessAddModal && state.draft.item_type === "product" && modeAssignProcess) &&
                <AssignInputsToProcessModal
                    validInputs={(state.draft.item as IPartialProduct).products_inputs}
                    fetchLoadProcess={fetchLoadProcess}
                    mode={modeAssignProcess}
                    onClick={handleOnClickAddProductProcess}
                    onClose={toggleIsActiveProductProcessAddModalAssing}
                />
            }
            {
                (isActiveProductProcessEditModal && state.draft.item_type === "product" && modeAssignProcess && selectedProductProcessEdit) &&
                <EditAssingnInputsToProcessModal
                    mode={typeof (selectedProductProcessEdit as IPartialProductProcess).process_id === "string" ? "new" : "asingn"}
                    validInputs={(state.draft.item as IPartialProduct).products_inputs}
                    fetchLoadProcess={fetchLoadProcess}
                    value={selectedProductProcessEdit}
                    onClick={handleOnClickEditProductProcess}
                    onClose={toggleIsActiveProductProcessEditModal}
                />
            }
            {showConfirmModal && (<FeedBackModal
                message="Ya lo puedes visualizar en panel principal de productos."
                onClose={handleOnCloseConfirmModal}
                messageCustom={customMessageConfirmModal}
                icon={<CircleCheck className={StyleModule.iconConfirmModal} />}
            />)}
        </div>
    )
}

export default Step2;