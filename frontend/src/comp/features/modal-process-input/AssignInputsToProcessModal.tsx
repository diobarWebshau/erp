import MultiSelectCheckSearchTagCustomMemo from "../select-check-search/multiple/custom/MultiSelectCheckSearchTagCustom";
import UnderlineLabelInputText from "./../../primitives/input/layouts/underline-label/text/UnderlineLabelInputText";
import SingleSelectCheckSearchCustomMemo from "../select-check-search/single/custom/SingleSelectCheckSearchCustom";
import CriticalActionButton from "../../primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../primitives/button/custom-button/main-action/MainActionButtonCustom";
import NumericInputCustomMemo from "../../primitives/input/numeric/custom/NumericInputCustom";
import type { IPartialProductInputProcess } from "../../../interfaces/productInpustProcesses";
import type { RowAction } from "../../../comp/primitives/table/tableContext/tableTypes";
import GenericTableMemo from "../../primitives/table/tableContext/GenericTable";
import DialogModal from "../../primitives/modal2/dialog-modal/base/DialogModal";
import type { IPartialProcess, IProcess } from "../../../interfaces/processes";
import type { IPartialProductInput } from "../../../interfaces/productsInputs";
import type { IPartialProductProcess } from "interfaces/productsProcesses";
import ToastMantine from "../../external/mantine/toast/base/ToastMantine";
import { clearError, setError } from "../../../store/slicer/errorSlicer";
import StyleModule from "./AssignInputsToProcessModal.module.css"
import { useDispatch as useDispatchRedux } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { generateRandomIds } from "../../../helpers/nanoId";
import { Plus, Trash2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "production/processes/exclude";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

interface IAssignInputsToProcessModalProps {
    mode: "new" | "asingn",
    selectedProcessProductBase: IPartialProductProcess[],
    validInputs?: IPartialProductInput[],
    onClose: () => void,
    onClick: (values: IPartialProductProcess[]) => void
}

const AssignInputsToProcessModal = ({
    onClose,
    onClick,
    selectedProcessProductBase,
    validInputs,
    mode
}: IAssignInputsToProcessModalProps) => {

    // ***************  Hook redux ***************

    const dispatchRedux = useDispatchRedux();

    // ***************  States ***************

    const [nameProcess, setNameProcess] = useState<string | null>(null);
    const [descriptionProcess, setDescriptionProcess] = useState<string | null>(null);
    const [selectedProcessAux, setSelectedProcessAux] = useState<IPartialProcess | null>(null);
    const [selectedProductInputProcess, setSelectedProductInputProcess] = useState<IPartialProductInputProcess[]>([]);

    // ***************  Variables memoizadas ***************

    const selectedProcessBase: IPartialProcess[] = useMemo(() => {
        return selectedProcessProductBase.map((item) => item.process as IPartialProcess);
    }, [selectedProcessProductBase]);

    const excludeIdsProcess: number[] = useMemo(() => {
        return selectedProcessBase.map((item) => item.id as number);
    }, [selectedProcessBase]);

    const productInputProcess: IPartialProductInputProcess[] = useMemo(() => {
        return validInputs?.map((item: IPartialProductInput): IPartialProductInputProcess => ({
            product_input: item,
        })) ?? [];
    }, [validInputs]);

    const getRowAttrProcceses = useMemo(() => (item: IPartialProcess) => item.name ?? "", []);
    const getRowAttrProductInputProcess = useMemo(() => (item: IPartialProductInputProcess) => item.product_input?.inputs?.name ?? "", []);
    const getRowAttrProductInputProcessTable = useMemo(() => (item: IPartialProductInputProcess) => item.product_input?.id?.toString() ?? "", []);

    // *************** Fetches ***************

    const fetchLoadProcess = useCallback(async (query: string | number): Promise<IProcess[]> => {
        try {
            // Anexamos el query
            const params = new URLSearchParams();
            params.append("filter", query.toString());
            // Anexamos los ids a excluir
            excludeIdsProcess.forEach((id) => params.append("excludeIds", id.toString()));
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
            const data: IProcess[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    }, [dispatchRedux, excludeIdsProcess]);

    // *************** Funciones ***************

    const handleOnSelectProductInputProcess = useCallback((value: IPartialProductInputProcess[]) => {
        const valueFinal: IPartialProductInputProcess[] = value.map((item) => ({
            ...item,
            product_input: {
                ...item.product_input,
                equivalence: 1,
            },
        }));
        setSelectedProductInputProcess(valueFinal);
    }, []);

    const handleOnClickAddButton = useCallback(() => {
        let selectedProductInputProcessWithProcess: IPartialProductProcess = {}
        if (mode === "asingn") {
            if (productInputProcess && productInputProcess.length > 0) {
                const productInputProcessValidation = selectedProductInputProcess.every(
                    (item) => ((item.product_input?.equivalence) && Number(item.product_input?.equivalence) > 0)
                );
                if (!productInputProcessValidation) {
                    ToastMantine.feedBackForm({
                        message:
                            `Los insumos consumibles en cada proceso deben` +
                            ` tener una cantidad mayor a 0`,
                    });
                    return;
                }
            }
            if (!selectedProcessAux) {
                ToastMantine.feedBackForm({
                    message: "Debe seleccionar un proceso",
                });
                return;
            }
            selectedProductInputProcessWithProcess = {
                process: {
                    ...selectedProcessAux,
                    product_input_processes: selectedProductInputProcess,
                } as IProcess,
            };
        } else {
            if (!nameProcess || nameProcess.trim() === "") {
                ToastMantine.feedBackForm({
                    message: "El nombre y descripción del proceso son obligatorios",
                });
                return;
            }
            if (productInputProcess && productInputProcess.length > 0) {
                const productInputProcessValidation = selectedProductInputProcess.every(
                    (item) => Number(item.product_input?.equivalence) > 0
                );
                if (!productInputProcessValidation) {
                    ToastMantine.feedBackForm({
                        message:
                            `Los insumos consumibles en cada proceso ` +
                            `deben tener una cantidad mayor a 0`
                    });
                    return;
                }
            }
            selectedProductInputProcessWithProcess = {
                process: {
                    id: generateRandomIds(),
                    name: nameProcess,
                    description: descriptionProcess,
                    product_input_processes: selectedProductInputProcess,
                } as IProcess,
            };
        }
        onClick([selectedProductInputProcessWithProcess]);
        onClose();
    }, [
        mode, selectedProductInputProcess, onClick,
        onClose, selectedProcessAux, nameProcess,
        descriptionProcess, productInputProcess
    ]);

    const updateQtyIPartialProductInputProcess = useCallback(
        ({ id, value }: { id: string; value: number | undefined }) => {
            setSelectedProductInputProcess(prev => {
                const index = prev.findIndex(
                    i => i.product_input?.inputs?.id.toString() === id
                );
                // si no existe, regresamos el estado previo tal cual (no disparará re-render)
                if (index === -1) return prev;
                // clon superficial del array
                const newArr = [...prev];
                // clon profundo del elemento modificado
                const item = { ...newArr[index] };
                if (item.product_input) {
                    item.product_input = {
                        ...item.product_input,
                        equivalence: value,
                    };
                }
                newArr[index] = item;
                return newArr;
            });
        }, []
    );

    // *************** Table Components ***************

    const columns: ColumnDef<IPartialProductInputProcess>[] = useMemo(() => [
        {
            id: "id",
            header: "id",
            accessorFn: (row) => row.product_input?.inputs?.id,
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
            accessorFn: (row) => row.product_input?.inputs?.name,
            meta: {
                hidden: false,
                type: "string",
                typeText: "text",
                autoGenerated: false,
            },
        },
        {
            id: "qty",
            header: "Cantidad",
            accessorFn: (row) => row.product_input?.inputs?.name,
            meta: {
                hidden: false,
                type: "number",
                mode: "range",
                autoGenerated: false,
            },
            cell: ({ row }) => {
                const rowOriginal = row.original;
                const value = rowOriginal.product_input?.equivalence;
                const onChange = (value: number | null) => {
                    updateQtyIPartialProductInputProcess({
                        id: row.original.product_input?.inputs?.id.toString() as string,
                        value: value ?? undefined
                    });
                }
                return (
                    <NumericInputCustomMemo
                        value={value ?? null}
                        onChange={onChange}
                        min={1}
                    />
                );
            }
        }
    ], [updateQtyIPartialProductInputProcess]);


    const handleOnClickDeleteProductInputProcess = useCallback((row: IPartialProductInputProcess) => {
        setSelectedProductInputProcess((prev) => prev.filter(item => item.product_input?.inputs?.id !== row.product_input?.inputs?.id));
    },[])

    const actionsRowProductInputProcess: RowAction<IPartialProductInputProcess>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: handleOnClickDeleteProductInputProcess,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], [handleOnClickDeleteProductInputProcess]);

    return (
        <DialogModal
            onClose={onClose}
            className={StyleModule.containerDialogModal}
            classNameCustomContainer={StyleModule.containerDialogModalCustomContainer}
        >
            <section className={StyleModule.bodySection}>
                {
                    mode === "asingn"
                        ? <SingleSelectCheckSearchCustomMemo
                            loadOptions={fetchLoadProcess}
                            rowId={getRowAttrProcceses}
                            selected={selectedProcessAux}
                            setSelected={setSelectedProcessAux}
                            emptyMessage="No hay procesos disponibles"
                            colorMain="var(--color-theme-primary)"
                            maxHeight="150px"
                            placeholder="Buscar"
                        />
                        : null
                }
                {
                    mode === "new"
                        ? <div className={StyleModule.newProcessContainer}>
                            <UnderlineLabelInputText
                                label="Nombre del proceso"
                                onChange={setNameProcess}
                                value={nameProcess}
                                withValidation
                            />
                            <UnderlineLabelInputText
                                label="Descripcion del proceso"
                                onChange={setDescriptionProcess}
                                value={descriptionProcess}
                                withValidation
                            />
                        </div>
                        : null
                }
                <MultiSelectCheckSearchTagCustomMemo
                    options={productInputProcess}
                    colorMain="var(--color-theme-primary)"
                    placeholder="Buscar"
                    maxHeight="150px"
                    emptyMessage="No hay insumos disponibles"
                    selected={selectedProductInputProcess}
                    setSelected={handleOnSelectProductInputProcess}
                    rowId={getRowAttrProductInputProcess}
                    label="Insumos"
                />
                <GenericTableMemo
                    columns={columns}
                    modelName="productInputProcess"
                    getRowId={getRowAttrProductInputProcessTable}
                    data={selectedProductInputProcess}
                    classNameFooter={StyleModule.tableProductInputProcess}
                    enableOptionsColumn
                    rowActions={actionsRowProductInputProcess}
                    typeRowActions="icon"
                />
            </section>
            <section className={StyleModule.footerSection}>
                <CriticalActionButton
                    onClick={onClose}
                    label="Cancelar"
                />
                <MainActionButtonCustom
                    onClick={handleOnClickAddButton}
                    label={"Agregar proceso"}
                    icon={<Plus />}
                />
            </section>
        </DialogModal>
    );
}

export default AssignInputsToProcessModal;