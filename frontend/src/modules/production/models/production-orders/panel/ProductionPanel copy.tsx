import { ArrowLeft, ChevronsLeft, ChevronsRight, CircleDot, Factory, Package2, Settings2, User, TrendingDown, MapPin, ChevronsDown, ChevronsUp } from "lucide-react";
import TransparentButtonCustom from "../../../../../components/ui/table/components/gui/button/custom-button/transparent/TransparentButtonCustom";
import StyleModule from "./ProductionPanel.module.css";
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
import BaseModal from "../../../../../components/ui/modal/baseGenericModal/BaseModal";
import PopoverFloatingIUBase from "../../../../../components/ui/popover_floatingIU/PopoverFloatingIUBase";
import GenericTable from "../../../../../components/ui/table/tableContext/GenericTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { IProductionOrder } from "../../../../../interfaces/productionOrder";
import useLocationWithAllInformation from "../../../../../modelos/locations/hooks/useLocationsWithAllInformation";
import type { ILocation } from "../../../../../interfaces/locations";
import { fetchLocationsWithTypesFromDB } from "../../../../../queries/locationsQueries";
import type { AppDispatchRedux } from "../../../../../store/store";
import { useDispatch } from "react-redux";
import type { IProductionLine } from "../../../../../interfaces/productionLines";
import type { IPurchasedOrderProduct } from "../../../../../interfaces/purchasedOrdersProducts";

interface IProductionPanel {
    onClose: () => void
    productionOrder: IProductionOrder;
}

/* ===================== Componente ===================== */

const ProductionPanel = ({
    onClose,
    productionOrder
}: IProductionPanel) => {


    const dispatch: AppDispatchRedux = useDispatch();

    const [locations, setLocations] = useState<ILocation[]>();
    const [isPanelExpand, setIsPanelExpand] = useState<boolean>(false);
    const [locationSelected, setLocationSelected] = useState<ILocation | null>(productionOrder?.extra_data?.location || null);
    const [selectedProductionOrder, setSelectedProductionOrder] = useState<IProductionOrder | null>(null);
    const [productionLines, setProductionLines] = useState<IProductionLine[]>();
    const [isActiveOrderView, setIsActiveOrderView] = useState(false);
    const [isActiveProductionLineView, setIsActiveProductionLineView] = useState(false);

    const handleOnClickToggle = () => {
        setIsPanelExpand((prev) => !prev);
    };

    const toggleOrderView = () => {
        setIsActiveOrderView((prev) => !prev);
    };

    const columns: ColumnDef<IPurchasedOrderProduct>[] = [
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
            header: "Producción",
            cell: (row) => {
                return (
                    <SingleProgress />
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

    return (
        <div className={StyleModule.containerProductionPanel}>
            <div className={StyleModule.headerSection}>
                <TransparentButtonCustom label="Regresar" onClick={onClose} icon={<ArrowLeft />} />
                <h1 className="nunito-bold">Producción</h1>
            </div>

            <div className={StyleModule.mainSection}>
                <div className={StyleModule.panelSection}>
                    {locations.map((location) => {
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
                        <div className={StyleModule.contentContent}>
                            {locationWithAllInformation?.locations_production_lines?.map((lpl) => {
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
                                                            <p className="nunito-bold">{
                                                                lpl.production_line?.production_lines_products?.find(
                                                                    (plp) =>
                                                                        plp.products?.id === lpl.production_line?.production_order?.[0].product_id)?.products?.name}
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
                                            lineId={production_line.id}
                                            items={production_line?.production_order}
                                            onItemsChange={(lineId, items) => {
                                                setProductionLines((prev) =>
                                                    prev.map((line) => {
                                                        if (line.id === lineId) {
                                                            return { ...line, production_order: items };
                                                        }
                                                        return line;
                                                    })
                                                );
                                            }}
                                            onClick={toggleOrderView}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
            {isActiveOrderView &&
                <BaseModal
                    onClose={toggleOrderView}
                >
                    <div className={StyleModule.modalOrderView}>
                        <div className={StyleModule.modalOrderViewHeader}>
                            <h3>Orden de venta</h3>
                            <dl className="nunito-bold">
                                <dt>Fecha de orden: </dt>
                                <dd>{new Date().toLocaleDateString()}</dd>
                            </dl>
                        </div>
                        <GenericTable
                            modelName="production_order"
                            columns={columns}
                            data={data}
                            onDeleteSelected={() => { }}
                            enableFilters={false}
                            enableSorting={false}
                            enableViews={false}
                            enablePagination={false}
                            enableRowSelection={false}
                            enableOptionsColumn={false}
                            getRowId={(row) => row.id.toString()}
                        />
                    </div>
                </BaseModal>
            }
        </div>
    );
};

/* ===================== Drag & Drop: Container ===================== */

interface DraggableProductionOrderContainerProps {
    lineId: number;
    items: IProductionOrder[];
    onItemsChange: (id: number, production_order: IProductionOrder[]) => void;
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
}

const DraggableProductionOrderContainer = ({
    lineId,
    items,
    onItemsChange,
    className,
    style,
    onClick
}: DraggableProductionOrderContainerProps) => {
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            onItemsChange(lineId, newItems);
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
                            production_order={item}
                            onClick={onClick}
                        />
                    ))}
                </ul>
            </SortableContext>
        </DndContext>
    );
};



type Props = {
    total: number;           // p. ej. 8
    completed?: number;      // segmentos completos (verde)
    inProgress?: number;     // segmentos en curso (amarillo)
    width?: number | string; // ancho opcional
};

const GroupProgress = ({
    total,
    processes,
}: {
    total: number;
    processes: PPDemoProcess[];
}) => {
    return (
        <ul
            className={StyleModule.productionOrderItemProcessList}
        >
            {processes?.map((process: PPDemoProcess) => {

                return (
                    <li
                        key={process.id}
                        className={`nunito-bold ${StyleModule.containerProgressIsNotCompleted}`}
                    >
                        <span>{process.name}</span>
                        <span className={StyleModule.containerProgress}>
                            <Progress
                                radius="lg"
                                size="md"
                                value={30}
                                striped
                                animated
                                classNames={{
                                    root: StyleModule.progressBar,
                                    label: StyleModule.labelProgressBar,
                                    section: StyleModule.sectionProgressBar,
                                }}
                            />
                        </span>
                        <span className={StyleModule.containerProgressText}>
                            10/100
                        </span>
                    </li>
                )
            })}
        </ul>
    )
}

const SingleProgress = () => {
    return (
        <div
            className={`nunito-bold ${StyleModule.containerProgressIsNotCompleted}`}
        >
            <span className={StyleModule.containerProgress}>
                <Progress
                    radius="lg"
                    size="md"
                    value={30}
                    striped
                    animated
                    classNames={{
                        root: StyleModule.progressBar,
                        label: StyleModule.labelProgressBar,
                        section: StyleModule.sectionProgressBar,
                    }}
                />
            </span>
            <span className={StyleModule.containerProgressText}>
                10/100
            </span>
        </div>
    )
}

function SegmentedProgress({
    total,
    completed = 0,
    inProgress = 0,
    width = 280,
}: Props) {
    const part = 100 / total;
    const sections = Array.from({ length: total }, (_, i) => {
        const color =
            i < completed
                ? 'teal'          // completado
                : i < completed + inProgress
                    ? 'yellow'        // en curso
                    : 'gray.3';       // pendiente
        return { value: part, color };
    });

    // Conteo mostrado: completados + en curso
    const active = Math.min(completed + inProgress, total);

    return (
        <Group
            className={StyleModule.containerProgressMain}
        >
            <Progress.Root w={width}
                classNames={{
                    root: StyleModule.root,
                    section: StyleModule.section,
                }}
            >
                {sections.map((s, idx) => (
                    <Progress.Section
                        key={idx}
                        value={s.value}
                        color={s.color}
                        animated
                    />
                ))}
            </Progress.Root>
            <Text
                className={StyleModule.containerProgressTextMain}
            >
                {active}/{total}
            </Text>
        </Group>
    );
}


/* ===================== Drag & Drop: Item ===================== */

interface DraggableProductionOrderItemProps {
    production_order: PPDemoOrder;
    style?: CSSProperties;
    onClick?: () => void;
}

const DraggableProductionOrderItem = ({
    production_order,
    style,
    onClick
}: DraggableProductionOrderItemProps) => {

    const {
        attributes, listeners, setNodeRef,
        transform, transition
    } = useSortable({ id: production_order.id });

    const [isPanelExpand, setIsPanelExpand] = useState(false);

    const combinedStyle: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
        ...style,
    };

    const handleOnClickToggle = (e: MouseEvent<HTMLButtonElement>) => {
        console.log(`toggle`);
        e.stopPropagation();
        setIsPanelExpand(!isPanelExpand);
    };

    return (
        <li
            key={production_order.id}
            ref={setNodeRef}
            style={combinedStyle}
            {...attributes} {...listeners}
            className={StyleModule.productionOrderItem}
        >
            <div
                className={StyleModule.productionOrderItemTitle}
                onPointerDown={(e) => e.stopPropagation()} // 👈 esto sí bloquea el inicio del drag
                onClick={onClick}
            >
                <Package2 className={StyleModule.productionOrderItemIcon} />
                <div className={`nunito-bold ${StyleModule.productionOrderItemTag}`}>{production_order.name}</div>
            </div>

            <div className={StyleModule.productionOrderDescriptionContainer}>
                <div className={StyleModule.productionOrderItemDescription}>
                    <dl className="nunito-bold">
                        <dt>Cantidad:</dt>
                        <dd>{production_order.qty}</dd>
                    </dl>
                    <dl className="nunito-bold">
                        <dt>Producto:</dt>
                        <dd>{production_order?.product?.name}</dd>
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
                    total={production_order?.product?.process?.length ?? 0}
                    completed={2}
                    inProgress={2}
                    width={240}
                />
                {
                    isPanelExpand && (
                        <GroupProgress
                            total={production_order?.qty ?? 0}
                            processes={production_order?.product?.process ?? []}
                        />
                    )
                }
            </div>
        </li>
    );
};

export default ProductionPanel;