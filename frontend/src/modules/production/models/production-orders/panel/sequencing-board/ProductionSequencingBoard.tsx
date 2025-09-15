import {
    ArrowLeft, ChevronsLeft, ChevronsRight, CircleDot,
    Factory, Package2, Settings2, User, TrendingDown,
    MapPin, ChevronsDown, ChevronsUp } from "lucide-react";
import TransparentButtonCustom from "../../../../../../components/ui/table/components/gui/button/custom-button/transparent/TransparentButtonCustom";
import StyleModule from "./ProductionSequencingBoard.module.css";
import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Progress } from "@mantine/core";
import { Group, Text } from '@mantine/core';
import BaseModal from "../../../../../../components/ui/modal/baseGenericModal/BaseModal";
import PopoverFloatingIUBase from "../../../../../../components/ui/popover_floatingIU/PopoverFloatingIUBase";
import GenericTable from "../../../../../../components/ui/table/tableContext/GenericTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { IProductionOrder } from "../../../../../../interfaces/productionOrder";
import useLocationWithAllInformation from "../../../../../../modelos/locations/hooks/useLocationsWithAllInformation";
import type { ILocation } from "../../../../../../interfaces/locations";
import { fetchLocationsWithTypesFromDB } from "../../../../../../queries/locationsQueries";
import type { AppDispatchRedux } from "../../../../../../store/store";
import { useDispatch } from "react-redux";
import type { IPurchasedOrderProduct } from "../../../../../../interfaces/purchasedOrdersProducts";
import type { IInternalProductProductionOrder } from "../../../../../../interfaces/internalOrder";
import type { IPartialProductProcess } from "../../../../../../interfaces/productsProcesses";
import type { IProductionLineQueue } from "../../../../../../interfaces/productionLineQueue";
import { updateProductionLineQueue } from "../../../../../../modelos/productionLineQueue/query/ProductionLineQueue";

interface IProductionSequencingBoard {
    onClose: () => void
    productionOrder: IProductionOrder;
}

/* ===================== Componente ===================== */

const ProductionSequencingBoard = ({
    onClose,
    productionOrder
}: IProductionSequencingBoard) => {

    const dispatch: AppDispatchRedux = useDispatch();

    const [locations, setLocations] = useState<ILocation[]>();
    const [isPanelExpand, setIsPanelExpand] = useState<boolean>(false);
    const [locationSelected, setLocationSelected] = useState<ILocation | null>(productionOrder?.extra_data?.location || null);
    const [selectedProductionOrder, setSelectedProductionOrder] = useState<IProductionOrder | null>(null);
    const [isActiveOrderView, setIsActiveOrderView] = useState(false);

    const handleOnClickToggle = () => {
        setIsPanelExpand((prev) => !prev);
    };

    const toggleOrderViewSetup = (productionOrder: IProductionOrder) => {
        setIsActiveOrderView((prev) => !prev);
        setSelectedProductionOrder(productionOrder);
    };

    const toggleOrderView = () => {
        setIsActiveOrderView((prev) => !prev);
    };

    const columnsClient: ColumnDef<IPurchasedOrderProduct>[] = [
        {
            accessorFn: (row) => row.product?.sku,
            header: "SKU",
        },
        {
            accessorFn: (row) => row.product_name,
            header: "Producto",
        },
        {
            accessorFn: (row) => row.qty,
            header: "Cantidad",
        },
        {
            id: "production",
            header: "Producción",
            cell: (row) => {
                const productionOrder = row.row.original;

                const order = productionOrder as IPurchasedOrderProduct;

                return (
                    <SingleProgress
                        value={order.production_summary?.production_qty || 0}
                        total={order.production_summary?.production_order_qty || 0}
                    />
                );
            },
        }
    ]

    const columnsInternal: ColumnDef<IInternalProductProductionOrder>[] = [
        {
            accessorFn: (row) => row.product?.sku,
            header: "SKU"
        },
        {
            accessorFn: (row) => row.product_name,
            header: "Producto"
        },
        {
            accessorFn: (row) => row.qty,
            header: "Cantidad"
        },
        {
            id: "production",
            header: "Producción",
            cell: (row) => {
                const productionOrder = row.row.original;

                const order = productionOrder as IInternalProductProductionOrder;

                return (
                    <SingleProgress
                        value={order.production_summary?.production_qty || 0}
                        total={order.production_summary?.production_order_qty || 0}
                    />
                );
            },
        }

    ]


    useEffect(() => {
        const loadLocations = async () => {
            const response = await fetchLocationsWithTypesFromDB(dispatch);
            setLocations(response.length > 0 ? response : []);
        };
        loadLocations();
    }, [dispatch]);

    const {
        locationWithAllInformation,
        loadingLocationWithAllInformation,
        refetchLocationWithAllInformation
    } = useLocationWithAllInformation(locationSelected?.id || null);


    function extractProductionOrderId(item: IProductionLineQueue): number {
        // Usa el campo que tengas disponible; deja estos fallbacks por si cambian las shapes
        return Number(
            (item as any).production_order_id ??
            (item as any).production_order?.id ??
            (item as any).production_order?.order_id // si así lo nombras en tu modelo/DTO
        );
    }

    const reorderLineQueueBackend = async (
        lineId: number,
        productionOrders: Array<{ production_order_id: number }>,
    ) => {
        try {
            const response = await updateProductionLineQueue(lineId, productionOrders, dispatch);
            console.log("productionOrdersOrdenado", response);
        } catch (error) {
            console.error("Error al ordenar la fila:", error);
        }
    }

    return (
        <div className={StyleModule.containerProductionPanel}>
            <div className={StyleModule.headerSection}>
                <TransparentButtonCustom label="Regresar" onClick={onClose} icon={<ArrowLeft />} />
                <h1 className="nunito-bold">Producción</h1>
            </div>

            <div className={StyleModule.mainSection}>
                <div className={StyleModule.panelSection}>
                    {locations && locations.map((location) => {
                        const isSelected = locationSelected?.id === location.id;
                        return (
                            <div
                                key={location.id}
                                className={`${StyleModule.tabPanelSection} ${isSelected ? StyleModule.tabPanelSectionSelected : ""}`}
                                onClick={() => setLocationSelected(location)}
                            >
                                <p>{location.name}</p>
                            </div>
                        );
                    })}
                </div>

                <div className={StyleModule.dataSection}>
                    <aside className={`${StyleModule.asideSection} ${isPanelExpand ? StyleModule.asideSectionExpand : StyleModule.asideSectionCollapse}`}>
                        <section className={`${StyleModule.asideContent} ${isPanelExpand ? StyleModule.asideContentExpand : StyleModule.asideContentCollapse}`}>
                            <h3 className={`${StyleModule.headerH3} nunito-bold`}>Planta de producción</h3>
                            <div className={`nunito-bold ${StyleModule.asideContentItems}`}>
                                <span>{locationSelected?.name}</span>
                                <span className={`${StyleModule.asideContentItem}`}>
                                    <Factory className={StyleModule.asideContentIcon} />
                                    <p>{locationSelected?.name}</p>
                                </span>
                                <span className={`${StyleModule.asideContentItem}`}>
                                    <MapPin className={StyleModule.asideContentIcon} />
                                    <p>Mexicali, Baja California</p>
                                </span>
                                <span className={`${StyleModule.asideContentItem}`}>
                                    <CircleDot className={StyleModule.asideContentIcon} />
                                    <p>Activa</p>
                                </span>
                                <span className={`${StyleModule.asideContentItem}`}>
                                    <Settings2 className={StyleModule.asideContentIcon} />
                                    <p>Lineas activas: 5 de 7</p>
                                </span>
                                <span className={`${StyleModule.asideContentItem}`}>
                                    <Package2 className={StyleModule.asideContentIcon} />
                                    <p>Produccion total de hoy: 12,400 unidades</p>
                                </span>
                                <span className={`${StyleModule.asideContentItem}`}>
                                    <TrendingDown className={StyleModule.asideContentIcon} />
                                    <p>Scrap promedio: 1.8% </p>
                                </span>
                                <span className={`${StyleModule.asideContentItem}`}>
                                    <User className={StyleModule.asideContentIcon} />
                                    <span>
                                        <p>Responsable:</p> <p>Jose Ramirez</p>
                                    </span>
                                </span>
                            </div>
                        </section>

                        <div className={`${StyleModule.asideToggle} ${isPanelExpand ? StyleModule.asideToggleExpand : StyleModule.asideToggleCollapse}`} onClick={handleOnClickToggle}>
                            {isPanelExpand ? <ChevronsLeft className={StyleModule.asideToggleIcon} /> : <ChevronsRight className={StyleModule.asideToggleIcon} />}
                        </div>
                    </aside>

                    <section className={StyleModule.contentSection}>
                        <h3 className={`${StyleModule.headerH3} nunito-bold`}>Lineas de producción</h3>
                        {loadingLocationWithAllInformation && <div>{`Lineas activas: ${!locationWithAllInformation?.location_production_line?.length}`}</div>}
                        <div className={StyleModule.contentContent}>
                            { !loadingLocationWithAllInformation && locationWithAllInformation?.location_production_line?.map((lpl) => {
                                return (
                                    <div key={lpl.production_line?.name} className={StyleModule.productionLineContent}>
                                        <PopoverFloatingIUBase
                                            placement="bottom-end"
                                            childrenTrigger={
                                                // Aplica getReferenceProps en ESTE MISMO nodo (ver componente abajo)
                                                <div className={`nunito-bold ${StyleModule.productionLineItemName}`}>
                                                    <Settings2 className={StyleModule.productionLineItemIcon} />
                                                    <p>{lpl.production_line?.name}</p>
                                                </div>
                                            }
                                            childrenFloating={
                                                <div className={StyleModule.popoverFloating}>
                                                    <div className={StyleModule.popoverFloatingContent}>
                                                        <span>
                                                            <Settings2 className={StyleModule.popoverFloatingIcon} />
                                                            <p className="nunito-bold">{lpl.production_line?.name}</p>
                                                        </span>
                                                        <span>
                                                            <CircleDot className={StyleModule.popoverFloatingIcon} />
                                                            <p className="nunito-bold">Activa</p>
                                                        </span>
                                                        <span>
                                                            <Package2 className={StyleModule.popoverFloatingIcon} />
                                                            <p className="nunito-bold">
                                                                {
                                                                    lpl.production_line?.production_lines_products?.[0]?.products?.name
                                                                }
                                                            </p>
                                                        </span>
                                                        <span>
                                                            <TrendingDown className={StyleModule.popoverFloatingIcon} />
                                                            <p className="nunito-bold">Scrap promedio: 1.8% </p>
                                                        </span>
                                                    </div>
                                                </div>
                                            }
                                        />
                                        <DraggableProductionOrderContainer
                                            lineId={lpl.production_line?.id || 0}
                                            items={(lpl.production_line?.production_line_queue as IProductionLineQueue[]) || []}
                                            onItemsChange={async (lineId, moved) => {
                                                try {
                                                    // 1) Mapea el nuevo orden a { production_order_id }
                                                    const productionOrders = moved
                                                        .map((item) => ({ production_order_id: extractProductionOrderId(item) }))
                                                        .filter((x) => Number.isFinite(x.production_order_id));

                                                    if (!productionOrders.length) return;

                                                    // 2) Llama a tu endpoint (sin tocar posiciones)
                                                    await reorderLineQueueBackend(lineId, productionOrders);
                                                    
                                                    // 3) Refetch para traer ya ordenado desde el server
                                                    // await refetchLocationWithAllInformation();
                                                } catch (err) {
                                                    console.error("Error reordenando cola:", err);
                                                    // aquí puedes disparar tu toast/notificación
                                                }
                                            }}
                                            onClick={(productionOrder: IProductionOrder) => toggleOrderViewSetup(productionOrder)}
                                        />

                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
            {isActiveOrderView && selectedProductionOrder &&
                <BaseModal
                    onClose={toggleOrderView}
                >
                    <div className={StyleModule.modalOrderView}>
                        <div className={StyleModule.modalOrderViewHeader}>
                            {selectedProductionOrder.order_type === "internal"
                                ? <h3>Orden Interna</h3>
                                : <h3>Orden de venta</h3>
                            }
                            <dl className="nunito-bold">
                                <dt>Fecha de orden: </dt>
                                <dd>{new Date().toLocaleDateString()}</dd>
                            </dl>
                        </div>
                        {
                            selectedProductionOrder.order_type === "internal"
                                ? (
                                    <GenericTable
                                        modelName="order"
                                        columns={columnsInternal}
                                        data={[selectedProductionOrder.order] as IInternalProductProductionOrder[]}
                                        onDeleteSelected={() => { }}
                                        enableFilters={false}
                                        enableSorting={false}
                                        enableViews={false}
                                        enablePagination={false}
                                        enableRowSelection={false}
                                        enableOptionsColumn={false}
                                        getRowId={(row) => row.id.toString()}
                                    />
                                )
                                : (
                                    <GenericTable
                                        modelName="order"
                                        columns={columnsClient}
                                        data={(
                                            selectedProductionOrder.order as IPurchasedOrderProduct)
                                            .purchase_order?.purchase_order_products as IPurchasedOrderProduct[]
                                        }
                                        onDeleteSelected={() => { }}
                                        enableFilters={false}
                                        enableSorting={false}
                                        enableViews={false}
                                        enablePagination={false}
                                        enableRowSelection={false}
                                        enableOptionsColumn={false}
                                        getRowId={(row) => row.id.toString()}
                                    />
                                )
                        }

                    </div>
                </BaseModal>
            }
        </div>
    );
};

/* ===================== Drag & Drop: Container ===================== */

interface DraggableProductionOrderContainerProps {
    lineId: number;
    items: IProductionLineQueue[];
    onItemsChange: (id: number, production_order: IProductionLineQueue[]) => Promise<void> | void;
    className?: string;
    style?: CSSProperties;
    onClick: (productionOrder: IProductionOrder) => void;
  }
  
  const DraggableProductionOrderContainer = ({
    lineId,
    items,
    onItemsChange,
    style,
    onClick,
  }: DraggableProductionOrderContainerProps) => {
    // Estado local controlando el orden mostrado en UI
    const [localItems, setLocalItems] = useState<IProductionLineQueue[]>(items); // -- estado local para controlar el orden mostrado en UI
    const [saving, setSaving] = useState(false); // Este estado es para feedback visual opcional
  
    // Sincroniza cuando cambie la fuente (p.ej. refetch)
    useEffect(() => {
      setLocalItems(items);
    }, [items]);
  
    const sensors = useSensors(useSensor(PointerSensor));
  
    const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
  
      const prev = localItems; // para rollback
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
  
      // 1) Actualiza inmediatamente la UI
      const moved = arrayMove(prev, oldIndex, newIndex);
      setLocalItems(moved);
  
      // 2) Persiste en backend (y haz rollback si falla)
      try {
        setSaving(true);
        await onItemsChange(lineId, moved);
      } catch (err) {
        console.error("Fallo al persistir reorden:", err);
        setLocalItems(prev); // rollback
      } finally {
        setSaving(false);
      }
    };
  
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement, restrictToVerticalAxis]}
      >
        {/* Importante: SortableContext con los IDs del estado local */}
        <SortableContext items={localItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <ul
            className={StyleModule.productionOrderContent}
            style={{
              listStyle: "none",
              opacity: saving ? 0.8 : 1, // feedback visual opcional
              ...style,
            }}
          >
            {localItems.map((item) => (
              <DraggableProductionOrderItem
                key={item.id}
                productionLineQueue={item}
                onClick={() => onClick(item.production_order as IProductionOrder)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    );
  };

/* ===================== Drag & Drop: Container ===================== */
/*
interface DraggableProductionOrderContainerProps {
    lineId: number;
    items: IProductionLineQueue[];
    onItemsChange: (id: number, production_order: IProductionLineQueue[]) => void;
    className?: string;
    style?: CSSProperties;
    onClick: (productionOrder: IProductionOrder) => void;
}

const DraggableProductionOrderContainer = ({
    lineId,
    items,
    onItemsChange,
    style,
    onClick
}: DraggableProductionOrderContainerProps) => {
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const moved = arrayMove(items, oldIndex, newIndex);
            console.log("moved", moved);
            onItemsChange(lineId, moved);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement, restrictToVerticalAxis]}
        >
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
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
                            onClick={() => onClick(item.production_order as IProductionOrder)}
                        />
                    ))}
                </ul>
            </SortableContext>
        </DndContext>
    );
};
*/

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

/* ===================== Drag & Drop: Item ===================== */

interface DraggableProductionOrderItemProps {
    productionLineQueue: IProductionLineQueue;
    style?: CSSProperties;
    onClick: (productionOrder: IProductionOrder) => void;
}

const DraggableProductionOrderItem = ({
    productionLineQueue,
    style,
    onClick
}: DraggableProductionOrderItemProps) => {

    const {
        attributes, listeners, setNodeRef,
        transform, transition
    } = useSortable({ id: productionLineQueue.id });

    const [isPanelExpand, setIsPanelExpand] = useState(false);

    const combinedStyle: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
        ...style,
    };

    const handleOnClickToggle = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsPanelExpand(!isPanelExpand);
    };

    return (
        <li
            key={productionLineQueue.id}
            ref={setNodeRef}
            style={combinedStyle}
            {...attributes} {...listeners}
            className={StyleModule.productionOrderItem}
        >
            <div
                className={StyleModule.productionOrderItemTitle}
                onPointerDown={(e) => e.stopPropagation()} // 👈 esto sí bloquea el inicio del drag
                onClick={() => onClick(productionLineQueue.production_order as IProductionOrder)}
            >
                <Package2 className={StyleModule.productionOrderItemIcon} />
                <div className={`nunito-bold ${StyleModule.productionOrderItemTag}`}>{productionLineQueue.production_order?.order_id}</div>
            </div>

            <div className={StyleModule.productionOrderDescriptionContainer}>
                <div className={StyleModule.productionOrderItemDescription}>
                    <dl className="nunito-bold">
                        <dt>Cantidad:</dt>
                        <dd>{productionLineQueue.production_order?.qty}</dd>
                    </dl>
                    <dl className="nunito-bold">
                        <dt>Producto:</dt>
                        <dd>{productionLineQueue.production_order?.order?.product_name}</dd>
                    </dl>
                </div>
                <button
                    onPointerDown={(e) => e.stopPropagation()} // 👈 esto sí bloquea el inicio del drag
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

export default ProductionSequencingBoard;