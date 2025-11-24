import MultiSelectCheckSearchTagCustomMemo from "../select-check-search/multiple/custom/MultiSelectCheckSearchTagCustom";
import SingleSelectCheckSearchCustomMemo from "../select-check-search/single/custom/SingleSelectCheckSearchCustom";
import CriticalActionButton from "../../primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../primitives/button/custom-button/main-action/MainActionButtonCustom";
import NumericInputCustomMemo from "../../primitives/input/numeric/custom/NumericInputCustom";
import type { IPartialProductInputProcess } from "../../../interfaces/productInpustProcesses";
import GenericTableMemo from "../../primitives/table/tableContext/GenericTable";
import DialogModal from "../../primitives/modal2/dialog-modal/base/DialogModal";
import type { IPartialProcess, IProcess } from "../../../interfaces/processes";
import type { IPartialProductInput } from "../../../interfaces/productsInputs";
import { clearError, setError } from "../../../store/slicer/errorSlicer";
import StyleModule from "./AssignInputsToProcessModal.module.css"
import { useDispatch as useDispatchRedux } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import type { IPartialProductProcess} from "interfaces/productsProcesses";

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
    // mode
}: IAssignInputsToProcessModalProps) => {


    const dispatchRedux = useDispatchRedux();

    const selectedProcessBase: IPartialProcess[] = useMemo(() => {
        return selectedProcessProductBase.map((item) => item.process as IPartialProcess);
    }, [selectedProcessProductBase]);

    const excludeIdsProcess: number[] = useMemo(() => {
        return selectedProcessBase.map((item) => item.id as number);
    }, [selectedProcessBase]);

    const productInputProcess: IPartialProductInputProcess[] = useMemo(() => {
        return validInputs?.map((item: IPartialProductInput): IPartialProductInputProcess => ({
            product_input: item,
        }) ) ?? [];
    }, [validInputs]);

    const [selectedProcessAux, setSelectedProcessAux] = useState<IPartialProcess | null>(null);

    const fetchLoadInputs = useCallback(async (query: string | number): Promise<IProcess[]> => {
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

    const [selectedProductInputProcess, setSelectedProductInputProcess] = useState<IPartialProductInputProcess[]>([]);

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
        const selectedProductInputProcessWithProcess: IPartialProductProcess = {
            process: {
                ...selectedProcessAux,
                product_input_processes: selectedProductInputProcess,
            } as IProcess,
            process_id: selectedProcessAux?.id,
        };
        console.log(`valores a actualziar`, selectedProductInputProcessWithProcess);
        onClick([selectedProductInputProcessWithProcess]);
        onClose();
    }, [selectedProductInputProcess, onClick, onClose, selectedProcessAux]);
    const getRowAttrProcceses = useMemo(() => (item: IPartialProcess) => item.name ?? "", []);
    const getRowAttrProductInputProcess = useMemo(() => (item: IPartialProductInputProcess) => item.product_input?.inputs?.name ?? "", []);
    const getRowAttrProductInputProcessTable = useMemo(() => (item: IPartialProductInputProcess) => item.product_input?.id?.toString() ?? "", []);

    const updateQtyIPartialProductInputProcess = useCallback(
        ({ id, value }: { id: string; value: number }) => {
            setSelectedProductInputProcess(prev => {
                const index = prev.findIndex(i => i.product_input?.id === id);
                if (index === -1) return prev; // no existe -> no cambies nada
                // copia superficial
                const newArr = [...prev];
                // copia profunda del item
                const newItem = { ...newArr[index] };
                if (newItem.product_input) {
                    newItem.product_input = {
                        ...newItem.product_input,
                        equivalence: value,
                    };
                }
                newArr[index] = newItem;
                return newArr;
            });
        },
        []
    );

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
                const onChange = (value: number) => {
                    updateQtyIPartialProductInputProcess({ id: row.original.id?.toString() ?? "", value: value });
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

    return (
        <DialogModal
            onClose={onClose}
            className={StyleModule.containerDialogModal}
            classNameCustomContainer={StyleModule.containerDialogModalCustomContainer}
        >
            <section className={StyleModule.bodySection}>
                <SingleSelectCheckSearchCustomMemo
                    loadOptions={fetchLoadInputs}
                    rowId={getRowAttrProcceses}
                    selected={selectedProcessAux}
                    setSelected={setSelectedProcessAux}
                    emptyMessage="No hay procesos disponibles"
                    colorMain="var(--color-theme-primary)"
                    maxHeight="150px"
                    placeholder="Buscar"
                />
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
                    modelName="Diobar"
                    getRowId={getRowAttrProductInputProcessTable}
                    data={selectedProductInputProcess}
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