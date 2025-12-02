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
import StyleModule from "./AssignInputsToProcessModal.module.css"
import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { generateRandomIds } from "../../../helpers/nanoId";
import { Plus, Trash2 } from "lucide-react";

interface IAssignInputsToProcessModalProps {
    mode: "new" | "asingn",
    fetchLoadProcess: (query: string | number) => Promise<IPartialProcess[]>,
    validInputs?: IPartialProductInput[],
    onClose: () => void,
    onClick: (values: IPartialProductProcess[]) => void
}

const AssignInputsToProcessModal = ({
    onClose,
    onClick,
    validInputs,
    mode,
    fetchLoadProcess
}: IAssignInputsToProcessModalProps) => {

    // ***************  States ***************

    const [nameProcess, setNameProcess] = useState<string | null>(null);
    const [descriptionProcess, setDescriptionProcess] = useState<string | null>(null);
    const [selectedProcessAux, setSelectedProcessAux] = useState<IPartialProcess | null>(null);
    const [selectedProductInputProcess, setSelectedProductInputProcess] = useState<IPartialProductInputProcess[]>([]);

    // ***************  Variables memoizadas ***************

    const productInputProcess: IPartialProductInputProcess[] = useMemo(() => {
        return validInputs?.map((item: IPartialProductInput): IPartialProductInputProcess => ({
            product_input: item,
            product_input_id: Number(item.id)
        })) ?? [];
    }, [validInputs]);

    const getRowAttrProcceses = useMemo(() => (item: IPartialProcess) => item.name ?? "", []);
    const getRowAttrProductInputProcess = useMemo(() => (item: IPartialProductInputProcess) => item.product_input?.inputs?.name ?? "", []);
    const getRowAttrProductInputProcessTable = useMemo(() => (item: IPartialProductInputProcess) => item.product_input?.id?.toString() ?? "", []);

    // *************** Fetches ***************

    // *************** Funciones ***************

    const handleOnSelectProductInputProcess = useCallback((value: IPartialProductInputProcess[]) => {
        const valueFinal: IPartialProductInputProcess[] = value.map((item) => ({
            ...item,
            product_input: {
                ...item.product_input,
            },
            qty: 1
        }));
        setSelectedProductInputProcess(valueFinal);
    }, []);

    const handleOnClickAddButton = useCallback(() => {
        let selectedProductInputProcessWithProcess: IPartialProductProcess = {}
        if (mode === "asingn") {
            if (productInputProcess && productInputProcess.length > 0) {
                const productInputProcessValidation = selectedProductInputProcess.every(
                    (item) => ((item.qty) && Number(item.qty) > 0)
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
                id: generateRandomIds(),
                ...(selectedProcessAux.id && { process_id: selectedProcessAux.id as number }),
                process: {
                    ...selectedProcessAux,
                } as IProcess,
                product_input_process: selectedProductInputProcess,
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
                    (item) => Number(item.qty) > 0
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
                id: generateRandomIds(),
                process: {
                    name: nameProcess,
                    description: descriptionProcess,
                } as IPartialProcess,
                product_input_process: selectedProductInputProcess,
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

                // si no existe, regresamos el estado previo tal cual
                if (index === -1) return prev;

                // clon superficial del array
                const newArr = [...prev];

                // clon del elemento modificado
                const item = { ...newArr[index] };

                // 🔹 aquí actualizas qty en lugar de equivalence
                item.qty = value ?? item.qty; // o value ?? 0, según quieras

                newArr[index] = item;
                return newArr;
            });
        },
        []
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
                const value = Number(rowOriginal.qty);
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
    }, [])

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