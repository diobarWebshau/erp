import useProductionLineById from "../../../../../../modelos/productionLines/hooks/useProductionLineById";
import { ArrowLeft, Check, ChevronsDown, ChevronsUp, Flag, Package2, Pause, Play, Plus, Settings, Settings2 } from "lucide-react";
import TransparentButtonCustom from "../../../../../../components/ui/table/components/gui/button/custom-button/transparent/TransparentButtonCustom";
import StyleModule from "./ProductionOperatorConsole.module.css";
import myImage from '../../../../../../assets/user.png';
import FadeButton from "../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { IAllStage, IPartialProductionOrder, IProductionBreakdown, IProductionOrder } from "../../../../../../interfaces/productionOrder";
import type { IPurchasedOrderProduct } from "../../../../../../interfaces/purchasedOrdersProducts";
import type { IInternalProductProductionOrder } from "../../../../../../interfaces/internalOrder";
import type { IPartialProductProcess } from "../../../../../../interfaces/productsProcesses";
import { Progress, Text, Group } from "@mantine/core";
import type { IProductionLineQueue } from "../../../../../../interfaces/productionLineQueue";
import NumericKeypad from "./panelCheckpoint/NumericKeyPad";
import { createProductionInDB } from "../../../../../../modelos/productions/query/productionQueries";
import { useDispatch } from "react-redux";
import type { AppDispatchRedux } from "../../../../../../store/store";
import type { IPartialProduction } from "../../../../../../interfaces/production";
import { updateProductionOrderInDB } from "../../../../../../queries/productionOrdersQueries";

interface IProductionOperatorConsole {
    onClose: () => void;
}

type SelectPayload = { processId: number; breakdown: IProductionBreakdown | null };

const ProductionOperatorConsole = ({ onClose }: IProductionOperatorConsole) => {

    const [isActiveKeypadPanel, setIsActiveKeypadPanel] = useState<boolean>(false);
    const [titleKeypadPanel, setTitleKeypadPanel] = useState<string>("");
    const [selectedProductionLineQueue, setSelectedProductionLineQueue] = useState<IProductionLineQueue | null>(null);
    const [selectedProductionBreakdown, setSelectedProductionBreakdown] = useState<IProductionBreakdown | null>(null);
    const [selectedProcess, setSelectedProcess] = useState<number | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const dispatch: AppDispatchRedux = useDispatch();

    const toggleKeypadPanelMermaSetup = (processId: number | null) => {
        setIsActiveKeypadPanel(!isActiveKeypadPanel);
        setTitleKeypadPanel("Agregar Merma");
        setSelectedProcess(processId)
    };

    const toggleKeypadPanelCheckpointSetup = (processId: number | null) => {
        setIsActiveKeypadPanel(!isActiveKeypadPanel);
        setTitleKeypadPanel("Agregar Checkpoint");
        setSelectedProcess(processId)
    };

    const toggleKeypadPanelMerma = () => {
        toggleKeypadPanelMermaSetup(selectedProcess)
    };

    const toggleKeypadPanelCheckpoint = () => {
        toggleKeypadPanelCheckpointSetup(selectedProcess)
    };



    // ╭─────────────────────────────────────────────────────────────────────╮
    // │  Canal imperativo: el Panel registra su setter en este ref          │
    // ╰─────────────────────────────────────────────────────────────────────╯

    const panelSetterRef = useRef<null | ((p: SelectPayload) => void)>(null);

    const registerPanelSetter = useCallback((fn: (p: SelectPayload) => void) => {
        panelSetterRef.current = fn;
    }, []);

    // El Aside llama esto; NO hay setState aquí (no re-render del Aside)
    const onSelectProcess = useCallback((payload: SelectPayload) => {
        panelSetterRef.current?.(payload);
    }, []);

    const {
        loadingProductionLineById,
        productionLineById,
        refetchProductionLineById,
    } = useProductionLineById(1);

    useEffect(() => {
        if (productionLineById) {
            const productionLineQueue = (productionLineById?.production_line_queue?.[0] as IProductionLineQueue) ?? null;
            let productionBreakdown: IProductionBreakdown | null = null;
            if (productionLineQueue) {
                productionBreakdown = productionLineQueue?.production_order?.order?.production_order?.production_breakdown ?? null;
            }
            const processId = productionBreakdown?.all_stages.find(
                (stage: IAllStage) => stage.done_at_stage < productionBreakdown.order_qty
            )?.process_id ?? productionBreakdown?.all_stages[productionBreakdown?.all_stages.length - 1]?.process_id ?? 0;
            setSelectedProductionLineQueue(productionLineQueue);
            setSelectedProductionBreakdown(productionBreakdown);
            onSelectProcess({
                processId: processId,
                breakdown: productionBreakdown,
            });
            onSelectProcess({
                processId: processId,
                breakdown: productionBreakdown,
            });
        }
    }, [productionLineById]);

    // Memoriza items para no recrear array en cada render
    const items = useMemo(
        () => (productionLineById?.production_line_queue as IProductionLineQueue[]) ?? [],
        [productionLineById?.production_line_queue]
    );

    /* ===================== FUNCIONES OPERATIVAS EN LA BASE DE DATOS ===================== */

    const handleOnClickSaveMerma = async (qty: number) => {
        try {
            setServerError(null);
        } catch (error: unknown) {
            if (error instanceof Error)
                setServerError(error.message);
        }
    }

    const handleOnClickSaveCheckpoint = async (qty: number) => {
        try {
            const production: IPartialProduction = {
                qty,
                process_id: selectedProcess,
                product_name: selectedProductionLineQueue?.production_order?.order?.product_name,
                product_id: selectedProductionLineQueue?.production_order?.order?.product_id,
                production_order_id: selectedProductionLineQueue?.production_order?.order?.id
            }
            const response = await createProductionInDB(
                production,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            await refetchProductionLineById();
            setIsActiveKeypadPanel(false);
        } catch (error: unknown) {
            if (error instanceof Error)
                setServerError(error.message);
        }
    }

    const handleOnClickFinish = async () => {
        try {
            if (!selectedProductionLineQueue?.production_order_id) {
                return;
            }

            const updateValues: IPartialProductionOrder = {
                status: "completed"
            }

            const response = await updateProductionOrderInDB(
                selectedProductionLineQueue?.production_order_id,
                updateValues,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            await refetchProductionLineById();
            setIsActiveKeypadPanel(false);
        } catch (error: unknown) {
            if (error instanceof Error)
                setServerError(error.message);
        }
    }

    return (
        <div className={StyleModule.containerProductionOperatorConsole}>
            <div className={StyleModule.headerContent}>
                <TransparentButtonCustom label="Regresar" onClick={onClose} icon={<ArrowLeft />} />
                <div className={StyleModule.dataOperatorContainer}>
                    <div className={StyleModule.dataOperatorImage}>
                        <img src={myImage} alt="" />
                    </div>
                    <dl className={`nunito-semibold ${StyleModule.dataOperatorContent}`}>
                        <dt>Operador:</dt>
                        <dd>Jorge Ramirez</dd>
                    </dl>
                </div>
            </div>

            {!loadingProductionLineById && (
                <div className={StyleModule.mainContent}>
                    <section className={StyleModule.lineQueueContainer}>
                        <h2 className="nunito-semibold">Linea de producción</h2>
                        <div className={StyleModule.contentContent}>
                            <div className={StyleModule.productionLineContent}>
                                <div className={`nunito-bold ${StyleModule.productionLineItemName}`}>
                                    <Settings2 className={StyleModule.productionLineItemIcon} />
                                    <p>{productionLineById?.name}</p>
                                </div>
                                <DraggableProductionOrderContainer
                                    items={items}
                                    onSelectProcess={onSelectProcess}
                                    productionBreakdown={selectedProductionBreakdown}
                                    selectedProductionLineQueue={selectedProductionLineQueue}
                                />
                            </div>
                        </div>
                    </section>

                    <ProductionConsole
                        productionOrder={selectedProductionLineQueue?.production_order as IProductionOrder}
                        registerPanelSetter={registerPanelSetter}
                        toggleKeypadPanelMerma={toggleKeypadPanelMermaSetup}
                        toggleKeypadPanelCheckpoint={toggleKeypadPanelCheckpointSetup}
                        handleOnClickFinish={handleOnClickFinish}
                    />
                </div>
            )}
            {
                isActiveKeypadPanel && (
                    <NumericKeypad
                        onClose={
                            titleKeypadPanel === "Agregar Merma"
                                ? toggleKeypadPanelMerma
                                : toggleKeypadPanelCheckpoint
                        }
                        title={titleKeypadPanel}
                        processId={selectedProcess}
                        breakdown={selectedProductionBreakdown}
                        onSave={
                            titleKeypadPanel === "Agregar Merma"
                                ? handleOnClickSaveMerma
                                : handleOnClickSaveCheckpoint
                        }
                    />
                )
            }
        </div>
    );
};

/* ===================== CardProcessGroup ===================== */

type PropsCardProcessGroup = {
    productionOrder: IProductionOrder;
    onSelectProcess: (p: SelectPayload) => void;
    productionBreakdown: IProductionBreakdown | null;
    isCurrentSelected?: boolean;
};

const CardProcessGroup = ({
    productionOrder,
    onSelectProcess,
    productionBreakdown,
    isCurrentSelected
}: PropsCardProcessGroup) => {
    const order: IPurchasedOrderProduct | IInternalProductProductionOrder =
        productionOrder?.order_type === "internal"
            ? (productionOrder?.order as IInternalProductProductionOrder)
            : (productionOrder?.order as IPurchasedOrderProduct);

    if (!order?.product?.product_processes) return null;

    const processWithSummary = order.product.product_processes.map((process: IPartialProductProcess) => {
        const qty_productions =
            (productionOrder?.productions ?? [])
                .filter((p: any) => Number(p.process_id) === Number(process.id))
                .reduce((acc: number, p: any) => acc + (Number(p?.qty) || 0), 0);

        return { ...process, qty: Number(qty_productions) };
    });

    return (
        <div className={`${StyleModule.groupCardProcess} ${isCurrentSelected ? StyleModule.groupCardProcessCurrentSelected : ""}`}>
            {processWithSummary.map((process) => {
                const varBackgroundColor =
                    process.qty >= order.qty
                        ? "var(--color-success-light)"
                        : process.qty > 0
                            ? "var(--color-warning-light)"
                            : "var(--color-theme-background)";
                const varColorText =
                    process.qty >= order.qty
                        ? "var(--color-success)"
                        : process.qty > 0
                            ? "var(--color-warning)"
                            : "var(--color-theme-neutral-primary)";

                return (
                    <div
                        key={process.id}
                        className={StyleModule.cardProcess}
                        style={{ backgroundColor: varBackgroundColor, color: varColorText, border: `1px solid ${varColorText}` }}
                        onClick={(e) => {
                            e.preventDefault();
                            onSelectProcess({ processId: Number(process.id), breakdown: productionBreakdown });
                        }}
                    >
                        <Settings />
                        <span>{process.process?.name}</span>
                        <span>{process.qty}/{order.qty}</span>
                    </div>
                );
            })}
        </div>
    );
};

/* ===================== SegmentedProgress ===================== */

interface PropsSegmentedProgress {
    productionOrder: IProductionOrder;
}

function SegmentedProgress({ productionOrder }: PropsSegmentedProgress) {
    const productions = productionOrder?.productions ?? [];
    const processes = productionOrder.product?.product_processes ?? [];
    const totalOrderQty = Number(productionOrder?.qty) || 0;

    const processSorted = [...processes].sort(
        (a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)
    );

    const summary = processSorted.map((process) => {
        const pid = Number(process.id);
        const qty = productions
            .filter((p) => Number(p.process_id) === pid)
            .reduce((acc, p) => acc + (Number(p.qty) || 0), 0);
        const ratio = totalOrderQty > 0 ? Math.min(qty / totalOrderQty, 1) : 0;
        const color =
            ratio >= 1 ? "var(--color-success)" :
                ratio > 0 ? "var(--color-warning)" :
                    "var(--color-theme-background)";
        return { id: pid, ratio, color };
    });

    const n = summary.length || 1;
    const base = 100 / n;
    const totalCompleted = summary.reduce((acc, s) => (s.ratio >= 1 ? acc + 1 : acc), 0);

    return (
        <Group className={StyleModule.groupSegmentedProgress}>
            <Progress.Root className={StyleModule.rootSegmentedProgress}>
                {summary.map((s, i) => (
                    <Progress.Section
                        key={s.id ?? i}
                        value={Number(base.toFixed(3))}
                        color={s.color}
                        {...(s.color !== "var(--color-theme-background)" && { animated: true })}
                        {...(s.color !== "var(--color-theme-background)" && { striped: true })}
                        className={StyleModule.sectionSegmentedProgress}
                    />
                ))}
            </Progress.Root>

            <Text className={StyleModule.textSegmentedProgress}>
                {totalCompleted}/{processSorted.length}
            </Text>
        </Group>
    );
}

/* ===================== Cola: Container ===================== */

interface DraggableProductionOrderContainerProps {
    items: IProductionLineQueue[];
    style?: CSSProperties;
    onSelectProcess: (p: SelectPayload) => void;
    productionBreakdown: IProductionBreakdown | null;
    selectedProductionLineQueue: IProductionLineQueue | null;
}

const DraggableProductionOrderContainer = memo(({
    items,
    style,
    onSelectProcess,
    productionBreakdown,
    selectedProductionLineQueue
}: DraggableProductionOrderContainerProps) => {
    return (
        <ul
            className={StyleModule.productionOrderContent}
            style={{ listStyle: "none", ...style }}
        >
            {items.map((item) => {
                return (
                    <DraggableProductionOrderItem
                        key={item.id}
                        productionLineQueue={item}
                        onSelectProcess={onSelectProcess}
                        productionBreakdown={productionBreakdown}
                        isCurrentSelected={item.id === selectedProductionLineQueue?.id}
                    />
                )
            })}
        </ul>
    );
});

/* ===================== Cola: Item ===================== */

interface DraggableProductionOrderItemProps {
    productionLineQueue: IProductionLineQueue;
    style?: CSSProperties;
    onSelectProcess: (p: SelectPayload) => void;
    productionBreakdown: IProductionBreakdown | null;
    isCurrentSelected?: boolean;
}

const DraggableProductionOrderItem = memo(({
    productionLineQueue,
    onSelectProcess,
    productionBreakdown,
    isCurrentSelected
}: DraggableProductionOrderItemProps) => {
    const [isPanelExpand, setIsPanelExpand] = useState(false);

    const handleOnClickToggle = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPanelExpand((v) => !v);
    };

    return (
        <li className={`${StyleModule.productionOrderItem} ${isCurrentSelected ? StyleModule.productionOrderItemCurrentSelected : ""}`}>
            <div className={StyleModule.productionOrderItemTitle}>
                <Package2 className={StyleModule.productionOrderItemIcon} />
                <div className={`nunito-bold ${StyleModule.productionOrderItemTag}`}>
                    {productionLineQueue.production_order?.id}
                </div>
            </div>

            <div className={StyleModule.productionOrderDescriptionContainer}>
                <div className={StyleModule.productionOrderItemDescription}>
                    <dl className="nunito-bold">
                        <dt>Cantidad:</dt>
                        <dd>{Number(productionLineQueue.production_order?.qty)}</dd>
                    </dl>
                    <dl className="nunito-bold">
                        <dt>Producto:</dt>
                        <dd>{productionLineQueue.production_order?.product?.name}</dd>
                    </dl>
                </div>
                <button
                    onClick={handleOnClickToggle}
                    type="button"
                    disabled={!isCurrentSelected}
                    className={
                        `nunito-bold ` +
                        `${StyleModule.productionOrderItemButton} ` +
                        `${isCurrentSelected
                            ? StyleModule.productionOrderItemButtonCurrentSelected
                            : StyleModule.productionOrderItemButtonNotSelected}`
                    }
                >
                    {isPanelExpand
                        ? <ChevronsUp className={StyleModule.productionOrderItemIcon} />
                        : <ChevronsDown className={StyleModule.productionOrderItemIcon} />
                    }
                </button>
            </div>

            <div className={StyleModule.productionOrderItemProcess}>
                <span className="nunito-bold">Procesos:</span>
                <SegmentedProgress productionOrder={productionLineQueue.production_order as IProductionOrder} />
                {isPanelExpand && (
                    <CardProcessGroup
                        productionOrder={productionLineQueue.production_order as IProductionOrder}
                        onSelectProcess={onSelectProcess}
                        productionBreakdown={productionBreakdown}
                        isCurrentSelected={isPanelExpand}
                    />
                )}
            </div>
        </li>
    );
});

/* ===================== Panel de controles ===================== */

interface PropsProductionConsole {
    productionOrder: IProductionOrder;
    registerPanelSetter: (fn: (p: SelectPayload) => void) => void;
    toggleKeypadPanelMerma: (processId: number | null) => void;
    toggleKeypadPanelCheckpoint: (processId: number | null) => void;
    handleOnClickFinish: () => void;
}

const ProductionConsole = ({
    productionOrder,
    registerPanelSetter,
    toggleKeypadPanelMerma,
    toggleKeypadPanelCheckpoint,
    handleOnClickFinish,
}: PropsProductionConsole) => {
    const [isProductionStarted, setIsProductionStarted] = useState<boolean>(false);

    // Estado LOCAL del panel para la selección (no afecta a Aside)
    const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);
    const [selectedBreakdown, setSelectedBreakdown] = useState<IProductionBreakdown | null>(null);

    // El Aside llamará esto a través del Padre (ref)
    const applySelection = useCallback(({ processId, breakdown }: SelectPayload) => {
        setSelectedProcessId(processId);
        setSelectedBreakdown(decodeNullableBreakdown(breakdown));
    }, []);

    useEffect(() => {
        registerPanelSetter(applySelection);
    }, [registerPanelSetter, applySelection]);

    const selectedProcessName = useMemo(() => {
        if (!productionOrder?.product?.product_processes || !selectedProcessId) return "N/A";
        const found = productionOrder.product.product_processes.find(p => Number(p.id) === Number(selectedProcessId));
        return found?.process?.name ?? "N/A";
    }, [productionOrder?.product?.product_processes, selectedProcessId]);

    const qtyPair = useMemo(() => {
        if (!selectedBreakdown || !selectedProcessId) return { done: "N/A", total: "N/A" };
        const stage = selectedBreakdown.all_stages.find((s: IAllStage) => Number(s.process_id) === Number(selectedProcessId));
        return {
            done: Number(stage?.done_at_stage ?? NaN) || 0,
            total: Number(selectedBreakdown.order_qty ?? NaN) || 0
        };
    }, [selectedBreakdown, selectedProcessId]);

    const finishProductionOrder = () => {
        console.log("handleOnClickFinish");
        if (Number(selectedBreakdown?.finished) >= Number(selectedBreakdown?.order_qty)) {
            handleOnClickFinish();
        }
    }

    const saveCheckpoint = () => {
        toggleKeypadPanelCheckpoint(selectedProcessId);
    }

    const saveMerma = () => {
        toggleKeypadPanelMerma(selectedProcessId);
    }

    return (
        <div className={StyleModule.consoleContainer}>
            <div className={StyleModule.consoleHeader}>
                <div className={`nunito-semibold ${StyleModule.consoleHeaderTitle}`}>
                    <dl>
                        <dt>Orden:</dt>
                        <dd>{Number(productionOrder?.id) || "N/A"}</dd>
                    </dl>
                    <dl>
                        <dt>Proceso:</dt>
                        <dd>{selectedProcessName}</dd>
                    </dl>
                    <dl>
                        <dt>Cantidad:</dt>
                        <dd>
                            <span>{qtyPair.done}</span>
                            <span>/</span>
                            <span>{qtyPair.total}</span>
                        </dd>
                    </dl>
                </div>
                <div className={StyleModule.separator} />
            </div>

            <div className={`nunito-semibold ${StyleModule.consoleBody}`}>
                <span>{productionOrder?.product?.name ?? "N/A"}</span>
                <span>{selectedBreakdown?.all_stages.find((s: IAllStage) => Number(s.process_id) === Number(selectedProcessId))?.done_at_stage ?? 0}</span>
            </div>

            <div className={StyleModule.consoleControls}>
                <FadeButton
                    type="button"
                    label={isProductionStarted ? "Pausar" : "Iniciar"}
                    icon={isProductionStarted ? <Pause className={StyleModule.iconButtonMain} /> : <Play className={StyleModule.iconButtonMain} />}
                    typeOrderIcon="first"
                    classNameButton={`${StyleModule.buttonBase} ${isProductionStarted ? StyleModule.buttonPause : StyleModule.buttonStart}`}
                    classNameSpan={StyleModule.buttonSpan}
                    classNameLabel={`nunito-bold ${isProductionStarted ? StyleModule.buttonLabelPause : StyleModule.buttonLabelStart}`}
                    onClick={() => setIsProductionStarted(!isProductionStarted)}
                />
                <div className={StyleModule.buttonContainerGroup}>
                    <FadeButton
                        label="Merma"
                        typeOrderIcon="first"
                        type="button"
                        icon={<Plus className={StyleModule.iconButton} />}
                        classNameButton={StyleModule.buttonMerma}
                        classNameSpan={StyleModule.buttonSpan}
                        classNameLabel={`nunito-bold ${StyleModule.buttonLabelMerma}`}
                        onClick={saveMerma}
                    />
                    <FadeButton
                        label="Checkpoint"
                        typeOrderIcon="first"
                        type="button"
                        disabled={Number(qtyPair.done) >= Number(qtyPair.total)}
                        icon={<Flag className={`${StyleModule.iconButton} ${Number(qtyPair.done) >= Number(qtyPair.total) ? StyleModule.buttonIconDisabled : StyleModule.buttonIcon}`} />}
                        classNameButton={ `${Number(qtyPair.done) >= Number(qtyPair.total) ? StyleModule.buttonDisabled : StyleModule.buttonCheckpoint}`}
                        classNameSpan={StyleModule.buttonSpan}
                        classNameLabel={`nunito-bold ${Number(qtyPair.done) >= Number(qtyPair.total) ? StyleModule.buttonLabelDisabled : StyleModule.buttonLabelCheckpoint}`}
                        onClick={saveCheckpoint}
                    />
                    <FadeButton
                        label="Finalizar"
                        type="button"
                        typeOrderIcon="first"
                        icon={<Check className={StyleModule.iconButtonFinish} />}
                        classNameButton={StyleModule.buttonFinish}
                        classNameSpan={StyleModule.buttonSpan}
                        classNameLabel={`nunito-bold ${StyleModule.buttonLabelFinish}`}
                        onClick={finishProductionOrder}
                    />
                </div>
            </div>
        </div>
    );
};

// Utilidad: asegura null o estructura válida
function decodeNullableBreakdown(b: IProductionBreakdown | null): IProductionBreakdown | null {
    if (!b) return null;
    try {
        return b;
    } catch {
        return null;
    }
}

export default ProductionOperatorConsole;
