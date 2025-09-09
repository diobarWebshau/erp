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
        }
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
                        <section className={` ${!isPanelExpand ? StyleModule.asideContentCollapse : StyleModule.asideContent}`}>
                            <h2 className="nunito-bold">
                                Planta de producción
                            </h2>
                            <div className={StyleModule.asideContentItems}>
                                <span>{locationSelected.name}</span>
                                <span className={StyleModule.asideContentItem}>
                                    <Factory />
                                    <p>{locationSelected.name}</p>
                                </span>
                                <span className={StyleModule.asideContentItem}>
                                    <MapPin />
                                    <p>Mexicali, Baja California</p>
                                </span>
                                <span className={StyleModule.asideContentItem}>
                                    <CircleDot />
                                    <p>Activa</p>
                                </span>
                                <span className={StyleModule.asideContentItem}>
                                    <Settings2 />
                                    <p>Lineas activas: 5 de 7</p>
                                </span>
                                <span className={StyleModule.asideContentItem}>
                                    <Package2 />
                                    <p>Produccion total de hoy: 12,400 unidades</p>
                                </span>
                                <span className={StyleModule.asideContentItem}>
                                    <TrendingDown />
                                    <p>Scrap promedio: 1.8% </p>
                                </span>
                                <span className={StyleModule.asideContentItem}>
                                    <User />
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
                        <h2 className="nunito-bold">
                            Lineas de producción
                        </h2>
                        <div className={StyleModule.contentContent}>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProductionPanel;
