import SingleSelectCheckSearchCustomMemo from "../select-check-search/single/custom/SingleSelectCheckSearchCustom";
import MultiSelectCheckSearchCustomMemo from "../select-check-search/multiple/base/MultiSelectCheckSearchTag";
import CriticalActionButton from "../../primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../primitives/button/custom-button/main-action/MainActionButtonCustom";
import type { IPartialProductInputProcess } from "../../../interfaces/productInpustProcesses";
import DialogModal from "../../primitives/modal2/dialog-modal/base/DialogModal";
import type { IPartialProductInput } from "../../../interfaces/productsInputs";
import { clearError, setError } from "../../../store/slicer/errorSlicer";
import type { IPartialProcess, IProcess } from "../../../interfaces/processes";
import { useDispatch as useDispatchRedux } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import StyleModule from "./AssignInputsToProcessModal.module.css"

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "production/processes/exclude";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

interface IAssignInputsToProcessModalProps {
    mode: "new" | "asingn",
    selectedProcessBase: IPartialProductInputProcess[],
    validInputs?: IPartialProductInput[],
    onClose: () => void,
    onClick: (values: IPartialProductInputProcess[]) => void
}

const AssignInputsToProcessModal = ({
    onClose,
    onClick,
    selectedProcessBase,
    validInputs,
    mode
}: IAssignInputsToProcessModalProps) => {

    const dispatchRedux = useDispatchRedux();

    const selectedProcessInputProcessBase: IPartialProductInputProcess[] = useMemo(() => {
        const spip: IPartialProductInputProcess[] = validInputs?.map(
            (item): IPartialProductInputProcess => ({
                product_input: {
                    input_id: item.inputs?.id,
                    inputs: item.inputs
                }
            })
        ) || [];
        return spip;
    }, [validInputs]);

    const excludeIdsProcess: number[] = useMemo(() => {
        return selectedProcessBase.map((item)=> item.product_process?.process_id as number);
    }, [selectedProcessBase]);

    const [selectedProcessAux, setSelectedProcessAux] = useState<IPartialProductInputProcess | null>(null);

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

    const handleOnClickAddButton = useCallback(() => { }, []);
    const getRowAttrProcceses = useMemo(() => (item: IPartialProcess) => item.name ?? "", []);
    const getRowAttr = useMemo(() => (item: IPartialProductInputProcess) => item.product_input?.inputs?.name ?? "", []);


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
                <MultiSelectCheckSearchCustomMemo
                    options={selectedProcessInputProcessBase}
                    colorMain="var(--color-theme-primary)"
                    placeholder="Buscar"
                    maxHeight="150px"
                    emptyMessage="No hay insumos disponibles"
                    selected={selectedProductInputProcess}
                    setSelected={setSelectedProductInputProcess}
                    rowId={getRowAttr}
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