import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleDot, Factory, Package2, Settings2, User, TrendingDown, MapPin } from "lucide-react";
import TransparentButtonCustom from "../../../../../components/ui/table/components/gui/button/custom-button/transparent/TransparentButtonCustom";
import StyleModule from "./ProductionPanel.module.css";
import { useState } from "react";

interface IProductionPanel {
    onClose: () => void;
}

const ProductionPanel = ({
    onClose
}: IProductionPanel) => {

    const [isPanelExpand, setIsPanelExpand] = useState<boolean>(false);
    const [locationSelected, setLocationSelected] = useState<{ id: number, name: string }>({
        id: 1,
        name: "Location A"
    });

    const handleOnClickToggle = () => {
        setIsPanelExpand(!isPanelExpand);
    }

    const locations = [
        {
            id: 1,
            name: "Location A"
        },
        {
            id: 2,
            name: "Location B"
        },
        {
            id: 3,
            name: "Location C"
        },
        {
            id: 4,
            name: "Location D"
        },
        {
            id: 5,
            name: "Location E"
        }
    ]

    const production_lines = [
        {
            id: 1,
            name: "Linea A",
            production_order: [
                {
                    id: 1,
                    name: "#PO-0001",
                    product: {
                        id: 1,
                        name: "Producto A",
                        process: [
                            {
                                id: 1,
                                name: "Proceso A"
                            },
                            {
                                id: 2,
                                name: "Proceso B"
                            },
                            {
                                id: 3,
                                name: "Proceso C"
                            }
                        ]
                    },
                    qty: 100
                },
                {
                    id: 2,
                    name: "#PO-0002",
                    product: {
                        id: 2,
                        name: "Producto B",
                        process: [
                            {
                                id: 1,
                                name: "Proceso A"
                            },
                            {
                                id: 2,
                                name: "Proceso B"
                            },
                            {
                                id: 3,
                                name: "Proceso C"
                            }
                        ]

                    },
                    qty: 200
                },
                {
                    id: 3,
                    name: "#PO-0003",
                    product: {
                        id: 3,
                        name: "Producto C",
                        process: {
                            id: 1,
                            name: "Proceso A",
                            process: [
                                {
                                    id: 1,
                                    name: "Proceso A"
                                },
                                {
                                    id: 2,
                                    name: "Proceso B"
                                },
                                {
                                    id: 3,
                                    name: "Proceso C"
                                }
                            ]
                        }
                    },
                    qty: 300
                }
            ]
        },
        {
            id: 2,
            name: "Linea B",
            production_order: [
                {
                    id: 1,
                    name: "#PO-0001",
                    product: {
                        id: 1,
                        name: "Producto A",
                        process: [
                            {
                                id: 1,
                                name: "Proceso A"
                            },
                            {
                                id: 2,
                                name: "Proceso B"
                            },
                            {
                                id: 3,
                                name: "Proceso C"
                            }
                        ]
                    },
                    qty: 100
                },
                {
                    id: 2,
                    name: "#PO-0002",
                    product: {
                        id: 2,
                        name: "Producto B",
                        process: [
                            {
                                id: 1,
                                name: "Proceso A"
                            },
                            {
                                id: 2,
                                name: "Proceso B"
                            },
                            {
                                id: 3,
                                name: "Proceso C"
                            }
                        ]

                    },
                    qty: 200
                },
                {
                    id: 3,
                    name: "#PO-0003",
                    product: {
                        id: 3,
                        name: "Producto C",
                        process: {
                            id: 1,
                            name: "Proceso A",
                            process: [
                                {
                                    id: 1,
                                    name: "Proceso A"
                                },
                                {
                                    id: 2,
                                    name: "Proceso B"
                                },
                                {
                                    id: 3,
                                    name: "Proceso C"
                                }
                            ]
                        }
                    },
                    qty: 300
                }
            ]
        },
        {
            id: 3,
            name: "Linea C",
            production_order: [
                {
                    id: 1,
                    name: "#PO-0001",
                    product: {
                        id: 1,
                        name: "Producto A",
                        process: [
                            {
                                id: 1,
                                name: "Proceso A"
                            },
                            {
                                id: 2,
                                name: "Proceso B"
                            },
                            {
                                id: 3,
                                name: "Proceso C"
                            }
                        ]
                    },
                    qty: 100
                },
                {
                    id: 2,
                    name: "#PO-0002",
                    product: {
                        id: 2,
                        name: "Producto B",
                        process: [
                            {
                                id: 1,
                                name: "Proceso A"
                            },
                            {
                                id: 2,
                                name: "Proceso B"
                            },
                            {
                                id: 3,
                                name: "Proceso C"
                            }
                        ]

                    },
                    qty: 200
                },
                {
                    id: 3,
                    name: "#PO-0003",
                    product: {
                        id: 3,
                        name: "Producto C",
                        process: {
                            id: 1,
                            name: "Proceso A",
                            process: [
                                {
                                    id: 1,
                                    name: "Proceso A"
                                },
                                {
                                    id: 2,
                                    name: "Proceso B"
                                },
                                {
                                    id: 3,
                                    name: "Proceso C"
                                }
                            ]
                        }
                    },
                    qty: 300
                }
            ]
        },
    ]

    return (
        <div className={StyleModule.containerProductionPanel}>
            <div className={StyleModule.headerSection}>
                <TransparentButtonCustom
                    label="Regresar"
                    onClick={onClose}
                    icon={<ArrowLeft />}
                />
                <h1 className="nunito-bold">
                    Producción
                </h1>
            </div>
            <div className={StyleModule.mainSection}>
                <div className={StyleModule.panelSection}>
                    {
                        locations.map((location) => {
                            const isSelected = locationSelected.id === location.id;
                            return (
                                <div
                                    key={location.id}
                                    className={`${StyleModule.tabPanelSection} ${isSelected ? StyleModule.tabPanelSectionSelected : ""}`}
                                    onClick={() => setLocationSelected(location)}
                                >
                                    <p>{location.name}</p>
                                </div>
                            )
                        })
                    }
                </div>
                <div className={StyleModule.dataSection}>
                    <aside className={` ${StyleModule.asideSection} ${isPanelExpand ? StyleModule.asideSectionExpand : StyleModule.asideSectionCollapse}`}>
                        <section className={` ${StyleModule.asideContent} ${isPanelExpand ? StyleModule.asideContentExpand : StyleModule.asideContentCollapse}`}>
                            <h3 className={`${StyleModule.headerH3} nunito-bold`}>
                                Planta de producción
                            </h3>
                            <div className={`nunito-bold ${StyleModule.asideContentItems}`}>
                                <span>{locationSelected.name}</span>
                                <span className={`${StyleModule.asideContentItem}`}>
                                    <Factory className={StyleModule.asideContentIcon} />
                                    <p>{locationSelected.name}</p>
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
                                    <span><p>Responsable:</p> <p>Jose Ramirez</p></span>
                                </span>
                            </div>
                        </section>
                        <div className={`${StyleModule.asideToggle} ${isPanelExpand ? StyleModule.asideToggleExpand : StyleModule.asideToggleCollapse}`}
                            onClick={handleOnClickToggle}
                        >
                            {
                                isPanelExpand ? (
                                    <ChevronsLeft className={StyleModule.asideToggleIcon} />
                                ) : (
                                    <ChevronsRight className={StyleModule.asideToggleIcon} />
                                )
                            }
                        </div>
                    </aside>
                    <section className={StyleModule.contentSection}>
                        <h3 className={`${StyleModule.headerH3} nunito-bold`}>
                            Lineas de producción
                        </h3>
                        <div className={StyleModule.contentContent}>
                            {
                                production_lines.map((production_line) => {
                                    return (
                                        <div
                                            key={production_line.id}
                                            className={StyleModule.productionLineContent}
                                        >
                                            <div className={`nunito-bold ${StyleModule.productionLineItemName}`}>
                                                <Settings2 className={StyleModule.productionLineItemIcon} />
                                                <p>{production_line.name}</p>
                                            </div>
                                            <div className={`nunito-bold ${StyleModule.productionOrderContent}`}>
                                                {
                                                    production_line.production_order.map((production_order) => {
                                                        return (
                                                            <div className={StyleModule.productionOrderItem}>
                                                                <div className={StyleModule.productionOrderItemTitle}>
                                                                    <Package2 className={StyleModule.productionOrderItemIcon} />
                                                                    <p>{production_order.name}</p>
                                                                </div>
                                                                <div className={StyleModule.productionOrderItemDescription}>
                                                                    <span>{production_order.qty}</span>
                                                                    <span>{production_order.product.name}</span>
                                                                </div>
                                                                <div className={StyleModule.productionOrderItemProcess}>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProductionPanel;
