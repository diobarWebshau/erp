import {
    useEffect, useState
} from "react";
import type {
    IPartialProductionOrder,
    IProductionOrder
} from "../../../../interfaces/productionOrder";
import {
    defaultValuePartialProductionOrder,
    defaultValueProductionOrder
} from "../../../../interfaces/productionOrder";

import {
    createProductionOrderInDB,
    deleteProductionOrderInDB,
    fetchProductionOrdersFromDB,
    updateProductionOrderInDB
} from "../../../../queries/productionOrdersQueries";
import {
    createProductionInDB
} from "../../../../queries/productionQueries"
import {
    useDispatch
} from "react-redux";
import {
    columnsProductionOrders
} from "./structure/columns"
import {
    AddModal
} from "./modals";
import {
    Edit, Trash2, CheckCheck,
    Download,
    Search,
    Plus,
    Eraser,
    DollarSign,
    Boxes,
    TrendingDown,
    TrendingUp
} from "lucide-react";
import type {
    RowAction
} from "../../../../components/ui/table/types";
import DeleteModal
    from "./modals/delete/DeleteModal";
import CheckModal from "./modals/check/CheckModal";
import type {
    IPartialProduction
} from "../.././../../interfaces/production";
import {
    clearAllErrors
} from "../../../../store/slicer/errorSlicer"
import type {
    AppDispatchRedux
} from "../../../../store/store";
import EditModal from "./modals/edit/EditModal";
import {
    diffObjects
} from "../../../../utils/validation-on-update/validationOnUpdate";
import GenericTable from "../../../../components/ui/table/tableContext/GenericTable";
import type { Table } from "@tanstack/react-table";
import InvertOnHoverButton from "../../../../components/ui/table/components/gui/button/Invert-on-hover-button/InvertOnHoverButton";
import StyleModule from "./ProductionOrdersModel.module.css";
import { useTableDispatch, useTableState } from "../../../../components/ui/table/tableContext/tableHooks";
import { reset_column_filters } from "../../../../components/ui/table/tableContext/tableActions";
import FadeButton from "../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import InputSearch from "../../../../components/ui/table/components/gui/input/input-text-search/input";
import KPICard from "../../../../components/ui/table/components/gui/kpi-card/KPICard";

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
        setproductionOrderRecord
    ] = useState<IPartialProductionOrder>(
        defaultValuePartialProductionOrder);
    const [
        originalproductionOrderRecord,
        setOriginalproductionOrderRecord
    ] = useState<IProductionOrder>(
        defaultValueProductionOrder);
    const [
        productionOrderRecordDelete,
        setproductionOrderRecordDelete
    ] = useState<IProductionOrder>(
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

    const handleCreate = async (productionOrder: IPartialProductionOrder) => {
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
            fetchs();
            setIsActiveAddModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (productionOrder: IPartialProduction) => {
        setLoading(true);
        try {
            const update_values_po =
                await diffObjects(
                    originalproductionOrderRecord,
                    productionOrder
                );
            if (Object.keys(update_values_po).length > 0) {
                const response = await updateProductionOrderInDB(
                    originalproductionOrderRecord.id,
                    update_values_po,
                    dispatch
                );
                if (!response) {
                    return;
                }
            }
            setServerError(null);
            fetchs();
            setIsActiveEditModal(false);
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
            const response =
                await deleteProductionOrderInDB(
                    productionOrderRecordDelete.id,
                    dispatch
                );
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
            setIsActiveDeleteModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleCreateCheckPoint = async (production: IPartialProduction) => {
        setLoading(true);
        try {
            const response =
                await createProductionInDB(
                    production,
                    dispatch
                );
            console.log(response);
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
            setIsActiveCheckPointModal(false);
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
        setproductionOrderRecord({ ...record, qty: Number(record.qty) });
        setOriginalproductionOrderRecord({ ...record, qty: Number(record.qty) });
        setIsActiveEditModal(!isActiveEditModal);
    }
    const toggleActiveDeleteModal = (record: IProductionOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setproductionOrderRecordDelete(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }
    const toggleActiveCheckPointModal = (record: IProductionOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setOriginalproductionOrderRecord(record);
        setIsActiveCheckPointModal(!isActiveCheckPointModal);
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
                                <Boxes className={StyleModule.IconKPIFirst}/>
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
                                <TrendingUp className={StyleModule.IconKPISecond}/>
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
                                <TrendingDown className={StyleModule.IconKPIThird}/>
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

    // * ******************** Efectos secundarios ******************** */

    useEffect(() => {
        fetchs();
    }, []);

    return (
        <>
            <div
                className={StyleModule.containerProductionOrdersModel}
            >
                <GenericTable
                    // nombre del modelo
                    modelName="Production"

                    // distribucion de columnas y rows
                    columns={columnsProductionOrders}
                    data={productionOrders}
                    getRowId={
                        (
                            row: IProductionOrder,
                            index: number
                        ) => row.id.toString()
                    }

                    //  funcionalidades habilitadas
                    enableFilters={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    enableOptionsColumn={true}

                    // acciones de la tabla
                    onDeleteSelected={() => console.log("Delete selected")}
                    typeRowActions="icon"
                    rowActions={rowActions}

                    // componentes extra
                    extraComponents={(table) => ExtraComponents(table)}

                    // estilos
                    classNameGenericTableContainer={StyleModule.containerGenericTableContainer}

                />
                {
                    isActiveDeleteModal && <DeleteModal
                        onClose={setIsActiveDeleteModal}
                        onDelete={handleDelete}
                    />
                }
            </div>
        </>
    );
}

export default ProductionOrderModel;