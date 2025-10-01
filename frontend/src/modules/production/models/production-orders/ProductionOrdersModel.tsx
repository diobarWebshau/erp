import {
    useEffect, useState
} from "react";
import type {
    IPartialProductionOrder,
    IProductionOrder
} from "../../../../interfaces/productionOrder";
import {
    defaultValueProductionOrder
} from "../../../../interfaces/productionOrder";

import {
    createProductionOrderInDB,
    deleteProductionOrderInDB,
    fetchProductionOrdersFromDB,
    updateProductionOrderInDB
} from "../../../../queries/productionOrdersQueries";
import {
    useDispatch
} from "react-redux";
import {
    columnsProductionOrders
} from "./structure/Columns"
import {
    Trash2, Download, Search,
    Plus, Eraser, Boxes,
    TrendingDown, TrendingUp
} from "lucide-react";
import type {
    RowAction
} from "../../../../components/ui/table/types";
import DeleteModal
    from "../../../../comp/primitives/modal/deleteModal/DeleteModal";
import {
    clearAllErrors
} from "../../../../store/slicer/errorSlicer"
import type {
    AppDispatchRedux
} from "../../../../store/store";
import GenericTable
    from "../../../../components/ui/table/tableContext/GenericTable";
import type {
    Row,
    Table
} from "@tanstack/react-table";
import InvertOnHoverButton
    from "../../../../components/ui/table/components/gui/button/Invert-on-hover-button/InvertOnHoverButton";
import StyleModule from "./ProductionOrdersModel.module.css";
import {
    useTableDispatch, useTableState
} from "../../../../components/ui/table/tableContext/tableHooks";
import {
    reset_column_filters
} from "../../../../components/ui/table/tableContext/tableActions";
import FadeButton
    from "../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import InputSearch
    from "../../../../components/ui/table/components/gui/input/input-text-search/input";
import KPICard
    from "../../../../components/ui/table/components/gui/kpi-card/KPICard";
import AddModalProductionOrderGeneric
    from "././context/AddModalProductionOrderGeneric";
import AddModal from "./wizard/add/AddModal";
import EditModal from "./wizard/edit/EditModal";
import useProductionOrderById from "../../../../modelos/production_orders/hooks/useProductionOrderById";
// import ProductionPanel from "./panel/ProductionPanel";
import ProductionSequencingBoard from "./panel/sequencing-board/ProductionSequencingBoard";
import ProductionOperatorConsole from "./panel/operator-console/ProductionOperatorConsole";

const ProductionOrderModel = () => {

    // * ******************** Estados ******************** */

    // ? Estados para acceso a redux
    const dispatch: AppDispatchRedux =
        useDispatch();

    // ? Estados de control de errores y loading
    const [serverError, setServerError] =
        useState<string | null>(null);
    const [loading, setLoading] =
        useState<boolean>(false);

    // ? Estados para los datos del modelo
    const [productionOrders, setProductionOrders] =
        useState<IProductionOrder[]>([])
    const [
        productionOrderRecord,
        setProductionOrderRecord
    ] = useState<IProductionOrder | null>(
        defaultValueProductionOrder);

    // ? Estados para el control de la apertura de los modales
    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);
    const [isActiveCheckPointModal, setIsActiveCheckPointModal] =
        useState<boolean>(false);
    const [isActiveProductionOperatorConsole, setIsActiveProductionOperatorConsole] =
        useState<boolean>(false);
    const [isActiveProductionSequencingBoard, setIsActiveProductionSequencingBoard] =
        useState<boolean>(false);

    // * ******************** Funciones de operaciones CRUD ******************** */

    const fetchs = async () => {
        setLoading(true);
        try {
            const response =
                await fetchProductionOrdersFromDB(dispatch);
            if (response.length > 0) {
                setProductionOrders(response);
            } else {
                setProductionOrders([])
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (
        productionOrder: IPartialProductionOrder
    ) => {
        try {
            const result =
                await createProductionOrderInDB(
                    productionOrder,
                    dispatch
                );
            if (!result) {
                return;
            }
            setServerError(null);
            await fetchs();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        }
    };

    const handleUpdate = async (productionOrder: IPartialProductionOrder) => {
        setLoading(true);
        try {
            if (!productionOrderRecord) {
                return;
            }
            const response = await updateProductionOrderInDB(
                productionOrderRecord.id,
                {
                    ...productionOrder,
                    qty: Number(productionOrder.qty)
                },
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            console.log("hago el refetch");
            await refetchProductionOrderById();
            await fetchs();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        setLoading(true);
        try {
            if (!productionOrderRecord) {
                return;
            }
            const response =
                await deleteProductionOrderInDB(
                    productionOrderRecord.id,
                    dispatch
                );
            if (!response) {
                return;
            }
            setServerError(null);
            await fetchs();
            setIsActiveDeleteModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    // * ******************** Funciones de control de modales ******************** */

    const toggleActiveAddModal = () => {
        dispatch(clearAllErrors());
        setServerError(null);
        setIsActiveAddModal(!isActiveAddModal);
    }
    const toggleActiveEditModal = (record: IProductionOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setProductionOrderRecord({ ...record, qty: Number(record.qty) });
        setIsActiveEditModal(!isActiveEditModal);
    }
    const toggleActiveDeleteModal = (record: IProductionOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setProductionOrderRecord(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }

    const toggleActiveProductionOperatorConsole = async () => {
        await fetchs();
        setIsActiveProductionOperatorConsole(!isActiveProductionOperatorConsole);
    }

    // * ******************** Funciones de control de acciones de la tabla ******************** */

    const rowActions: RowAction<IProductionOrder>[] = [
        {
            label: "Eliminar",
            onClick: toggleActiveDeleteModal,
            icon: <Trash2 color="red" size={15} />
        }
    ];

    // * ******************** Componentes extra para inyectar como props en el GenericTable ******************** 


    const ExtraComponents = (table: Table<IProductionOrder>) => {
        const state = useTableState();
        const dispatch = useTableDispatch();
        return (
            <div
                className={StyleModule.containerExtraComponents}
            >
                <div
                    className={`nunito-medium ${StyleModule.firstBlock}`}
                >
                    <h1 className="nunito-bold">Producción</h1>
                    <FadeButton
                        label="Orden de producción"
                        onClick={toggleActiveAddModal}
                        icon={<Plus className={StyleModule.plusIconProductionOrderModel} />}
                        typeOrderIcon="first"
                        classNameButton={StyleModule.fadeButtonExtraComponents}
                        classNameSpan={StyleModule.fadeButtonSpanExtraComponents}
                    />
                </div>
                <div className={StyleModule.containerKPI}>
                    <KPICard

                        childrenSectionValue={
                            <span className={`nunito-bold ${StyleModule.sectionValueKPI}`}>
                                55
                            </span>
                        }
                        childrenSectionText={
                            <div className={`nunito-bold ${StyleModule.sectionTextKPI}`}>
                                <p>Órdenes terminadas de hoy </p>
                                <span>
                                    <div className={StyleModule.containerValueKPI}>
                                        +5.2%
                                    </div>
                                    que el día de ayer
                                </span>
                            </div>
                        }
                        childrenIcon={
                            <div className={StyleModule.containerIconKPI}>
                                <Boxes className={StyleModule.IconKPIFirst} />
                            </div>
                        }
                        classNameContainer={StyleModule.containerKPIFirst}
                    />
                    <KPICard
                        childrenSectionValue={
                            <span className={`nunito-bold ${StyleModule.sectionValueKPI}`}>
                                92%
                            </span>
                        }
                        childrenSectionText={
                            <div className={`nunito-bold ${StyleModule.sectionTextKPI}`}>
                                <p>Eficiencia</p>
                                <span>
                                    Meta:
                                    <div className={StyleModule.containerValueKPI}>
                                        95%
                                    </div>
                                </span>
                            </div>
                        }
                        childrenIcon={
                            <div className={StyleModule.containerIconKPI}>
                                <TrendingUp className={StyleModule.IconKPISecond} />
                            </div>
                        }
                        classNameContainer={StyleModule.containerKPISecond}
                    />
                    <KPICard
                        childrenSectionValue={
                            <span className={`nunito-bold ${StyleModule.sectionValueKPI}`}>
                                1.2%
                            </span>
                        }
                        childrenSectionText={
                            <div className={`nunito-bold ${StyleModule.sectionTextKPI}`}>
                                <p>Scrap</p>
                                <span>
                                    <div className={StyleModule.containerValueKPI}>
                                        +2%
                                    </div>
                                    <p>que el dia de ayer</p>
                                </span>
                            </div>
                        }
                        childrenIcon={
                            <div className={StyleModule.containerIconKPI}>
                                <TrendingDown className={StyleModule.IconKPIThird} />
                            </div>
                        }
                        classNameContainer={StyleModule.containerKPIThird}
                    />
                </div>
                <div
                    className={`nunito-semibold ${StyleModule.secondBlock}`}
                >
                    <InputSearch
                        type="text"
                        placeholder="Buscar"
                        value={""}
                        onChange={(e) => console.log(e.target.value)}
                        icon={<Search className={StyleModule.searchIconExtraComponents} />}
                        classNameContainer={StyleModule.InputSearchContainerExtraComponents}
                        classNameInput={StyleModule.InputSearchInputExtraComponents}
                        classNameButton={StyleModule.InputSearchButtonExtraComponents}
                    />
                    <div
                        className={`nunito-medium ${StyleModule.containerButtons}`}
                    >
                        <InvertOnHoverButton
                            label="Limpiar filtros"
                            onClick={() => {
                                console.log("clear filters")
                                console.log(state.columnFiltersState)
                                console.log(state.columnFiltersState.length <= 0)
                                dispatch(reset_column_filters())
                            }}
                            disabled={state.columnFiltersState.length <= 0}
                            icon={<Eraser className={StyleModule.trash2IconExtraComponents} />}
                            typeOrderIcon="first"
                            classNameButton={StyleModule.toggleInverseButtonExtraComponents}
                            classNameSpan={StyleModule.toggleInverseButtonSpanExtraComponents}
                            classNameLabel={StyleModule.toggleInverseButtonLabelExtraComponents}
                        />
                        <InvertOnHoverButton
                            label="Exportar tabla"
                            onClick={() => console.log("exporting table")}
                            icon={<Download className={StyleModule.downloadIconExtraComponents} />}
                            typeOrderIcon="first"
                            classNameButton={StyleModule.toggleInverseButtonExtraComponents}
                            classNameSpan={StyleModule.toggleInverseButtonSpanExtraComponents}
                            classNameLabel={StyleModule.toggleInverseButtonLabelExtraComponents}
                        />
                    </div>
                </div>
            </div>
        );
    }


    const {
        productionOrderById,
        loadingProductionOrderById,
        refetchProductionOrderById,
    } = useProductionOrderById(productionOrderRecord?.id)

    // * ******************** Efectos secundarios ******************** */

    useEffect(() => {
        fetchs();
    }, []);


    const getColumns = () => {
        return columnsProductionOrders({ onClickContent });
    }

    const onClickContent = (e: React.MouseEvent, row: Row<IProductionOrder>) => {
        e.stopPropagation();
        setProductionOrderRecord(row.original);
        setIsActiveProductionSequencingBoard(true);
    }

    return (
        <>
            <div
                className={StyleModule.containerProductionOrdersModel}
            >
                <GenericTable
                    // nombre del modelo
                    modelName="Production"

                    // distribucion de columnas y rows
                    columns={getColumns()}
                    data={productionOrders}
                    getRowId={
                        (
                            row: IProductionOrder,
                        ) => row.id.toString()
                    }

                    //  funcionalidades habilitadas
                    enableFilters={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    enableOptionsColumn={true}
                    enableRowEditClick={true}
                    enableRowEditClickHandler={toggleActiveEditModal}
                    
                    // acciones de la tabla
                    onDeleteSelected={() => console.log("Delete selected")}
                    typeRowActions="icon"
                    rowActions={rowActions}

                    // componentes extra
                    extraComponents={(table) => ExtraComponents(table)}

                    // estilos
                    classNameGenericTableContainer={StyleModule.containerGenericTableContainer}

                />
                <button onClick={() => setIsActiveProductionOperatorConsole(true)}>Open</button>
                {
                    isActiveDeleteModal && <DeleteModal
                        title="Eliminar Orden de Producción"
                        message="¿Estás seguro de eliminar esta orden de producción?"
                        onClose={() => setIsActiveDeleteModal(false)}
                        onDelete={handleDelete}
                    />
                }
                {
                    isActiveAddModal && (
                        <AddModalProductionOrderGeneric
                            mode="create"
                            currentStep={1}
                            totalSteps={3}
                        >
                            <AddModal
                                onClose={() => setIsActiveAddModal(false)}
                                onCreate={handleCreate}
                            />
                        </AddModalProductionOrderGeneric>
                    )
                }
                {
                    isActiveEditModal && !loadingProductionOrderById && productionOrderRecord && (
                        <AddModalProductionOrderGeneric
                            mode="update"
                            currentStep={3}
                            totalSteps={3}
                            data={{...productionOrderById}}
                        >
                            <EditModal
                                onClose={() => setIsActiveEditModal(false)}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                            />
                        </AddModalProductionOrderGeneric>
                    )
                }
                {/* {
                    isActiveProductionOperatorConsole && <ProductionOperatorConsole
                        onClose={() => setIsActiveProductionOperatorConsole(false)}
                    />
                } */}
                {
                    isActiveProductionSequencingBoard && productionOrderRecord && <ProductionSequencingBoard
                        onClose={() => setIsActiveProductionSequencingBoard(false)}
                        productionOrder={productionOrderRecord}
                    />
                }
                {
                    isActiveProductionOperatorConsole && <ProductionOperatorConsole
                        onClose={toggleActiveProductionOperatorConsole}
                    />
                }
            </div>
        </>
    );
}

export default ProductionOrderModel;