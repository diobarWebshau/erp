import useProductionLineById from "../../../../../../modelos/productionLines/hooks/useProductionLineById";
import { ArrowLeft, Check, ChevronsDown, ChevronsUp, Flag, Package2, Pause, Play, Plus, Settings2 } from "lucide-react"
import TransparentButtonCustom from "../../../../../../components/ui/table/components/gui/button/custom-button/transparent/TransparentButtonCustom"
import StyleModule from "./ProductionOperatorConsole.module.css"
import myImage from '../../../../../../assets/user.png';
import FadeButton from "../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import { useState, type CSSProperties, type MouseEvent } from "react";
import type { IProductionOrder } from "../../../../../../interfaces/productionOrder";
import type { IPurchasedOrderProduct } from "../../../../../../interfaces/purchasedOrdersProducts";
import type { IInternalProductProductionOrder } from "../../../../../../interfaces/internalOrder";
import type { IPartialProductProcess } from "../../../../../../interfaces/productsProcesses";
import { Progress, Text, Group } from "@mantine/core";
import type { IProductionLineQueue } from "../../../../../../interfaces/productionLineQueue";


interface IProductionOperatorConsole {
    onClose: () => void
}

const ProductionOperatorConsole = ({
    onClose
}: IProductionOperatorConsole) => {

    const [isProductionStarted, setIsProductionStarted] = useState<boolean>(false);

    type PropsGroupProgress = {
        productionOrder: IProductionOrder;
    };

    const GroupProgress = ({ productionOrder }: PropsGroupProgress) => {
        // Determinar el tipo de orden
        const order: IPurchasedOrderProduct | IInternalProductProductionOrder =
            productionOrder?.order_type === 'internal'
                ? (productionOrder?.order as IInternalProductProductionOrder)
                : (productionOrder?.order as IPurchasedOrderProduct);

        // Evitar error si no hay datos
        if (!order?.product?.product_processes) return null;

        // Calcular el progreso de cada proceso
        const processWithSummary = order.product.product_processes.map(
            (process: IPartialProductProcess) => {
                // Buscar producciones para este proceso (comparando como número)
                const qty_productions =
                    (productionOrder?.productions ?? [])
                        .filter((p: any) => Number(p.process_id) === Number(process.id))
                        .reduce((acc: number, p: any) => acc + (Number(p?.qty) || 0), 0);

                // Calcular porcentaje con denominador seguro
                const totalQty = Number(productionOrder?.qty) || 0;
                const percentage = totalQty > 0 ? (qty_productions / totalQty) * 100 : 0;

                // Definir color dinámico
                const color =
                    percentage === 100
                        ? 'teal' // completado
                        : percentage > 0
                            ? 'yellow' // en curso
                            : 'gray.3'; // pendiente

                return {
                    ...process,
                    qty: Number(qty_productions),
                    percentage: Number(percentage),
                    color,
                };
            }
        );

        return (
            <ul className={StyleModule.productionOrderItemProcessList}>
                {processWithSummary.map((p) => (
                    <li
                        key={p.id}
                        className={`nunito-bold ${StyleModule.containerProgressListItem}`}
                    >
                        <span>{p.process?.name}</span>

                        <span className={StyleModule.containerProgress}>
                            <Progress
                                radius="lg"
                                size="md"
                                value={p.percentage}
                                color={p.color}
                                animated
                                striped
                                classNames={{
                                    root: StyleModule.progressBar,
                                    label: StyleModule.labelProgressBar,
                                    section: StyleModule.sectionProgressBar,
                                }}
                            />
                        </span>

                        <span className={StyleModule.containerProgressText}>
                            {p.qty}/{Number(productionOrder.qty)}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };



    interface PropsSingleProgress {
        value: number;
        total: number;
    }

    const SingleProgress = (
        {
            value,
            total
        }: PropsSingleProgress
    ) => {
        return (
            <div
                className={`nunito-bold ${StyleModule.containerProgressSingleMain}`}
            >
                <span className={StyleModule.containerProgressSingle}>
                    <Progress
                        radius="lg"
                        size="md"
                        value={value}
                        striped
                        animated
                        classNames={{
                            root: StyleModule.progressBarSingle,
                            label: StyleModule.labelProgressBarSingle,
                            section: StyleModule.sectionProgressBarSingle,
                        }}
                    />
                </span>
                <span className={StyleModule.containerProgressTextSingle}>
                    {value}/{total}
                </span>
            </div>
        )
    }

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
            // ⚠️ Coerciones de tipo para evitar que falle el match
            const pid = Number(process.id);
            const qty = productions
                .filter((p) => Number(p.process_id) === pid) // 👈 compara como número
                .reduce((acc, p) => acc + (Number(p.qty) || 0), 0); // 👈 qty numérico
            const ratio =
                totalOrderQty > 0 ? Math.min(qty / totalOrderQty, 1) : 0;

            const color = ratio >= 1 ? "teal" : ratio > 0 ? "yellow" : "gray.3";

            return { id: pid, ratio, color };
        });

        const n = summary.length || 1;
        const base = 100 / n;
        const totalCompleted = summary.reduce((acc, s) => (s.ratio >= 1 ? acc + 1 : acc), 0);

        return (
            <Group className={StyleModule.containerProgressMain}>
                <Progress.Root
                    w={280}
                    classNames={{ root: StyleModule.root, section: StyleModule.section }}
                >
                    {summary.map((s, i) => (
                        <Progress.Section
                            key={s.id ?? i}
                            value={Number(base.toFixed(3))}
                            color={s.color}
                            animated
                            striped
                        />
                    ))}
                </Progress.Root>

                <Text className={StyleModule.containerProgressTextMain}>
                    {totalCompleted}/{processSorted.length}
                </Text>
            </Group>
        );
    }


    /* ===================== Drag & Drop: Container ===================== */

    interface DraggableProductionOrderContainerProps {
        items: IProductionLineQueue[];
        style?: CSSProperties;
        // onClick: (productionOrder: IProductionOrder) => void;
    }

    const DraggableProductionOrderContainer = ({
        items,
        style,
        // onClick
    }: DraggableProductionOrderContainerProps) => {
        return (
            <ul
                className={StyleModule.productionOrderContent}
                style={{
                    listStyle: "none",
                    ...style,
                }}
            >
                {items.map((item) => (
                    <DraggableProductionOrderItem
                        key={item.id}
                        productionLineQueue={item}
                        // onClick={() => onClick(item.production_order as IProductionOrder)}
                    />
                ))}
            </ul>
        );
    };

    /* ===================== Drag & Drop: Item ===================== */

    interface DraggableProductionOrderItemProps {
        productionLineQueue: IProductionLineQueue;
        style?: CSSProperties;
        // onClick: (productionOrder: IProductionOrder) => void;
    }

    const DraggableProductionOrderItem = ({
        productionLineQueue,
        style,
        // onClick
    }: DraggableProductionOrderItemProps) => {


        const [isPanelExpand, setIsPanelExpand] = useState(false);

        const handleOnClickToggle = (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            setIsPanelExpand(!isPanelExpand);
        };

        return (
            <li
                className={StyleModule.productionOrderItem}
            >
                <div
                    className={StyleModule.productionOrderItemTitle}
                >
                    <Package2 className={StyleModule.productionOrderItemIcon} />
                    <div className={`nunito-bold ${StyleModule.productionOrderItemTag}`}>123456</div>
                </div>

                <div className={StyleModule.productionOrderDescriptionContainer}>
                    <div className={StyleModule.productionOrderItemDescription}>
                        <dl className="nunito-bold">
                            <dt>Cantidad:</dt>
                            <dd>10</dd>
                        </dl>
                        <dl className="nunito-bold">
                            <dt>Producto:</dt>
                            <dd>SeaAgri Corse 1lb</dd>
                        </dl>
                    </div>
                    <button
                        onClick={(e) => handleOnClickToggle(e)}
                        type="button"
                    >
                        {
                            isPanelExpand
                                ? <ChevronsUp className={StyleModule.productionOrderItemIcon} />
                                : <ChevronsDown className={StyleModule.productionOrderItemIcon} />
                        }
                    </button>
                </div>
                <div className={StyleModule.productionOrderItemProcess}>
                    <span className="nunito-bold">Procesos:</span>
                    <SegmentedProgress
                        productionOrder={productionLineQueue.production_order as IProductionOrder}
                    />
                    {
                        isPanelExpand && (
                            <GroupProgress
                                productionOrder={productionLineQueue.production_order as IProductionOrder}
                            />
                        )
                    }
                </div>
            </li>
        );
    };

    const {
        loadingProductionLineById,
        productionLineById,
        refetchProductionLineById
    } = useProductionLineById(1);

    console.log("productionLineById", productionLineById);

    return (
        <div className={StyleModule.containerProductionOperatorConsole}>
            <div className={StyleModule.headerContent}>
                <TransparentButtonCustom
                    label="Regresar"
                    onClick={onClose}
                    icon={<ArrowLeft />}
                />
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
            <div className={StyleModule.mainContent}>
                <section className={StyleModule.lineQueueContainer}>
                    <h2 className="nunito-semibold">Linea de producción</h2>
                    <div className={StyleModule.contentContent}>
                        <div className={StyleModule.productionLineContent}>
                            <div className={`nunito-bold ${StyleModule.productionLineItemName}`}>
                                <Settings2 className={StyleModule.productionLineItemIcon} />
                                <p>Linea de producción</p>
                            </div>
                            {
                                !loadingProductionLineById &&
                                    <DraggableProductionOrderContainer
                                        items={productionLineById?.production_line_queue as IProductionLineQueue[]}
                                        // onClick={(productionOrder) => toggleOrderViewSetup(productionOrder)}
                                    />
                            }
                            
                        </div>
                    </div>
                </section>
                <div className={StyleModule.consoleContainer}>
                    <div className={StyleModule.consoleHeader}>
                        <div className={`nunito-semibold ${StyleModule.consoleHeaderTitle}`}>
                            <dl>
                                <dt>Orden:</dt>
                                <dd>123456</dd>
                            </dl>
                            <dl>
                                <dt>Cantidad:</dt>
                                <dd>
                                    <span>{10}</span>
                                    <span>/</span>
                                    <span>{20}</span>
                                </dd>
                            </dl>
                        </div>
                        <div className={StyleModule.separator}></div>
                    </div>
                    <div className={`nunito-semibold ${StyleModule.consoleBody}`}>
                        <span>SeaAgri Corse 1lb</span>
                        <span>10,000</span>
                    </div>
                    <div className={StyleModule.consoleControls}>
                        <FadeButton
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
                                icon={<Plus className={StyleModule.iconButton} />}
                                classNameButton={StyleModule.buttonMerma}
                                classNameSpan={StyleModule.buttonSpan}
                                classNameLabel={`nunito-bold ${StyleModule.buttonLabelMerma}`}
                            />
                            <FadeButton
                                label="Checkpoint"
                                typeOrderIcon="first"
                                icon={<Flag className={StyleModule.iconButton} />}
                                classNameButton={StyleModule.buttonCheckpoint}
                                classNameSpan={StyleModule.buttonSpan}
                                classNameLabel={`nunito-bold ${StyleModule.buttonLabelCheckpoint}`}
                            />
                            <FadeButton
                                label="Finalizar"
                                typeOrderIcon="first"
                                icon={<Check className={StyleModule.iconButtonFinish} />}
                                classNameButton={StyleModule.buttonFinish}
                                classNameSpan={StyleModule.buttonSpan}
                                classNameLabel={`nunito-bold ${StyleModule.buttonLabelFinish}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductionOperatorConsole
