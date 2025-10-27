import { memo, useCallback, useMemo, useState } from "react";
import type { IPartialShippingOrder, IShippingOrder, LoadEvidenceItem, LoadEvidenceManager, PartialLoadEvidenceItem } from "../../../../interfaces/shippingOrder";
import type { AppDispatchRedux } from "../../../../store/store";
import { deleteShippingOrderInDB, createCompleteShippingOrderInDB, updateCompleteShippingOrderInDB, loadCompleteShippingOrderInDB } from "../../../../queries/shippingOrderQueries";
import { useDispatch } from "react-redux";
import { generateColumnsShippingOrders } from "./structure/columns";
import type { RowAction } from "../../../../components/ui/table/types";
import { Trash2, Download, Plus, Search, Eraser, PackageCheck, PackageSearch, TrendingDown, Ban, Check } from "lucide-react";
import { diffObjectArrays, diffObjects } from "../../../../utils/validation-on-update/ValidationOnUpdate2"
import type { IPartialShippingOrderPurchasedOrderProduct, IShippingOrderPurchasedOrderProduct, IShippingOrderPurchasedOrderProductManager } from "../../../../interfaces/shippingPurchasedProduct";
import StyleModule from "./ShippingOrdersModel.module.css";
import { clearAllErrors } from "../../../../store/slicer/errorSlicer";
import ShippingOrderModuleProvider from "./context/ShippingOrderModuleProvider";
import AddWizardShippingOrder from "./wizards/add/AddWirzardShippingOrder";
import GenericTableMemo from "./../../../../comp/primitives/table/tableContext/GenericTable";
import { reset_column_filters } from "./../../../../comp/primitives/table/tableContext/tableActions";
import InputTextCustom from "../../../../comp/primitives/input/text/custom/InputTextCustom";
import MainActionButtonCustom from "../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import SecundaryActionButtonCustom from "../../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import useShippingOrders from "../../../../modelos/shipping_orders/hooks/useShippingOrders";
import KPICardCustomPurple from "../../../../comp/primitives/cards/kpi/custom/purple/KPICardCustomPurple";
import KPICardCustomRed from "../../../../comp/primitives/cards/kpi/custom/red/KPICardCustomRed";
import KPICardCustomGreen from "../../../../comp/primitives/cards/kpi/custom/green/KPICardCustomGreen";
import LoadModal from "./modals/load/LoadModal";
import EditWizardShippingOrder from "./wizards/edit/EditWizardShippingOrder";
import type { ColumnDef } from "@tanstack/react-table";
import { useTableDispatch, useTableState } from "../../../../comp/primitives/table/tableContext/tableHooks";
import PreviewModal from "./modals/preview/PreviewModal";
import DeleteModal from "./../../../../comp/primitives/modal/deleteModal/DeleteModal";
import FinishedModal from "./modals/finish/FinishedModal";
import ConfirmModal from "./modals/finish/ConfirmModal";
import FeedBackModal from "./../../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";

const ShippingOrderModel = () => {

    // * ******************** Estados ******************** 

    // ? Estados para acceso a redux
    const dispatch: AppDispatchRedux = useDispatch();

    // ? Estados de control de errores y loading

    const [serverError, setServerError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // ? Estados para los datos del modelo    

    const [shippingOrderRecord, setShippingOrderRecord] =
        useState<IPartialShippingOrder | null>();
    const [shippingOrderRecordFinish, setShippingOrderRecordFinish] =
        useState<IPartialShippingOrder | null>();

    // ? Estados para los modales 

    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);
    const [isActiveLoadModal, setIsActiveLoadModal] =
        useState<boolean>(false);
    const [isActivePreviewModal, setIsActivePreviewModal] =
        useState<boolean>(false);
    const [isActiveFinishModal, setIsActiveFinishModal] =
        useState<boolean>(false);
    const [isActiveConfirmFinishModal, setIsActiveConfirmFinishModal] =
        useState<boolean>(false);
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] =
        useState<boolean>(false);
    const [messageReactNode, setMessageReactNode] =
        useState<React.ReactNode | null>();

    const [search, setSearch] = useState<string>("");

    const { shippingOrders, loadingShippingOrders, refetchShippingOrders } =
        useShippingOrders({ like: search, debounce: 500 });

    // * ******************** Funciones de operaciones CRUD ******************** 

    const handleCreate = useCallback(async (shipping: IPartialShippingOrder) => {
        setLoading(true);
        try {
            const new_shipping = { ...shipping }
            delete new_shipping.load_evidence;
            const responseCreate =
                await createCompleteShippingOrderInDB(new_shipping, dispatch);
            refetchShippingOrders();
            if (!responseCreate) return;
            setServerError(null);
        } catch (error) {
            if (error instanceof Error) setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    const handleLoad = useCallback(async (shipping: IPartialShippingOrder, shippingOrderDetailById: IPartialShippingOrder) => {
        setLoading(true);
        try {
            const shipping_old = {
                ...shipping,
            };

            const shipping_new = { ...shippingOrderDetailById };

            console.log("shipping_old", shipping_old);
            console.log("shipping_new", shipping_new);

            /* Nos quedamos unicamente con los archivos */
            const evidences_old = shipping_old.load_evidence || [];
            delete shipping_old.load_evidence;
            delete shipping_old.shipping_order_purchase_order_product;

            /* Nos quedamos unicamente con los archivos */
            const evidences_new = shipping_new.load_evidence || [];
            delete shipping_new.load_evidence;
            delete shipping_new.shipping_order_purchase_order_product;

            const diff_shipping = await diffObjects(shipping_old, shipping_new);

            // Obtenemos las diferencias entre los archivos
            const diff_evidences: LoadEvidenceManager =
                await diffObjectArrays(evidences_old, evidences_new);

            /* Obtenemos si hay cambios en los archivos */
            const hasChangesEvidences: boolean = [
                diff_evidences.added,
                diff_evidences.deleted,
                diff_evidences.modified
            ].some((arr: (
                LoadEvidenceItem |
                PartialLoadEvidenceItem
            )[]) => arr.length > 0);

            if (hasChangesEvidences || Object.keys(diff_shipping).length > 0) {

                const excludedIds = new Set<string>(
                    [
                        ...diff_evidences.added,
                        ...diff_evidences.deleted,
                        ...diff_evidences.modified
                    ].map(item => item.id)
                );

                const load_evidence_old =
                    shippingOrderDetailById?.load_evidence?.filter(
                        (evidence) => {
                            if (evidence instanceof File) return false;
                            return !excludedIds.has(evidence.id);
                        }
                    ) as LoadEvidenceItem[];

                const new_shipping: IPartialShippingOrder = {
                    ...diff_shipping,
                    shipping_date: (shipping_new.shipping_date instanceof Date)
                        ? shipping_new.shipping_date.toISOString()
                        : shipping_new.shipping_date,
                    load_evidence:
                        diff_evidences.added.map(
                            (e) => e.path as File
                        ) || [],
                    load_evidence_deleted:
                        diff_evidences.deleted.map(
                            (e) => { return { id: e.id } }
                        ) as PartialLoadEvidenceItem[] || [],
                    load_evidence_old:
                        load_evidence_old.map(
                            (e) => { return { id: e.id } }
                        ) as PartialLoadEvidenceItem[] || [],
                }

                const response =
                    await loadCompleteShippingOrderInDB(
                        shippingOrderRecord?.id || null,
                        new_shipping,
                        dispatch
                    );

                if (!response) return;
            }
            refetchShippingOrders();
        } catch (error) {
            if (error instanceof Error) setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }, [shippingOrderRecord]);

    const handleUpdate = useCallback(async (original: IPartialShippingOrder, updated: IPartialShippingOrder) => {
        setLoading(true);
        try {
            const shipping_old = {
                ...original,
                delivery_cost:
                    Number(original?.delivery_cost)
            };
            const shipping_new = updated;

            delete shipping_old.shipping_order_purchase_order_product_aux;
            delete shipping_new.shipping_order_purchase_order_product_aux;

            const sopops_old =
                shipping_old.shipping_order_purchase_order_product || [];
            const evidences_old =
                shipping_old.load_evidence || [];

            delete shipping_old.load_evidence;
            delete shipping_old.shipping_order_purchase_order_product;

            const sopops_new =
                shipping_new.shipping_order_purchase_order_product || [];
            const evidences_new =
                shipping_new.load_evidence || [];

            delete shipping_new.load_evidence;
            delete shipping_new.shipping_order_purchase_order_product;

            const diff_shipping: IPartialShippingOrder = await diffObjects(shipping_old, shipping_new);

            const diff_sopops: IShippingOrderPurchasedOrderProductManager = await diffObjectArrays(sopops_old, sopops_new, {
                objectKeyById: ['location'],
                nullUndefEqual: true,
                coerceNumberStrings: true,
            });

            const hasChangesSopops: boolean = [
                diff_sopops.added,
                diff_sopops.deleted,
                diff_sopops.modified
            ].some(
                (arr: (
                    IShippingOrderPurchasedOrderProduct |
                    IPartialShippingOrderPurchasedOrderProduct)[]
                ) => arr.length > 0);

            const diff_evidences: LoadEvidenceManager =
                await diffObjectArrays(evidences_old, evidences_new);

            const hasChangesEvidences: boolean = [
                diff_evidences.added,
                diff_evidences.deleted,
                diff_evidences.modified
            ].some((arr: (
                LoadEvidenceItem |
                PartialLoadEvidenceItem
            )[]) => arr.length > 0);

            if (
                Object.keys(diff_shipping).length > 0 ||
                hasChangesSopops ||
                hasChangesEvidences
            ) {
                const excludedIds = new Set<string>(
                    [
                        ...diff_evidences.added,
                        ...diff_evidences.deleted,
                        ...diff_evidences.modified
                    ].map(item => item.id)
                );

                const load_evidence_old =
                    updated?.load_evidence?.filter(
                        (evidence) => {
                            if (evidence instanceof File) return false;
                            return !excludedIds.has(evidence.id);
                        }
                    ) as LoadEvidenceItem[];

                const new_shipping: IPartialShippingOrder = {
                    ...diff_shipping,
                    ...(
                        diff_shipping.delivery_date
                            ? {
                                delivery_date: (diff_shipping.delivery_date instanceof Date)
                                    ? diff_shipping.delivery_date.toISOString()
                                    : diff_shipping.delivery_date
                            }
                            : {}
                    ),
                    ...(
                        diff_shipping.scheduled_ship_date
                            ? {
                                scheduled_ship_date: (diff_shipping.scheduled_ship_date instanceof Date)
                                    ? diff_shipping.scheduled_ship_date.toISOString()
                                    : diff_shipping.scheduled_ship_date
                            }
                            : {}
                    ),
                    shipping_order_purchase_order_product_manager: {
                        added: diff_sopops.added?.map(({ id, ...rest }) => rest) || [],
                        deleted: diff_sopops.deleted,
                        modified: diff_sopops.modified
                    },
                    load_evidence: diff_evidences.added?.map((e) => e.path as File) || [],
                    load_evidence_deleted: diff_evidences.deleted?.map((e) => { return { id: e.id } }) as PartialLoadEvidenceItem[] || [],
                    load_evidence_old: load_evidence_old?.map((e) => { return { id: e.id } }) as PartialLoadEvidenceItem[] || [],
                }

                const response =
                    await updateCompleteShippingOrderInDB(
                        shippingOrderRecord?.id || null,
                        new_shipping,
                        dispatch
                    );
                if (!response) {
                    return;
                }
                if (isActiveConfirmFinishModal) {
                    console.log("entro")
                    refetchShippingOrders();
                    setMessageReactNode(
                        <span className={StyleModule.messageReactNode}>
                            La orden de envío
                            <span className={`nunito-bold ${StyleModule.code}`}>{` #${shippingOrderRecord?.code} `}</span>
                            se ha finalizado correctamente
                        </span>
                    );
                    console.log("seteo mensaje");
                }
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error) setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }, [shippingOrderRecord, isActiveConfirmFinishModal]);

    const handleDelete = useCallback(async () => {
        setLoading(true);
        try {
            const response = await deleteShippingOrderInDB(
                shippingOrderRecord?.id || null,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            refetchShippingOrders();
            setIsActiveDeleteModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }, [shippingOrderRecord, refetchShippingOrders]);

    // * ******************** Funciones para control de modales ******************** 

    const toggleisActiveDeleteModalSetup = useCallback((record: IShippingOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setShippingOrderRecord(record);
        setIsActiveDeleteModal(v => !v);
    }, [dispatch]);

    const toggleIsActiveFinishModal = useCallback(() => {
        setIsActiveFinishModal(v => !v);
    }, []);

    const toggleIsActiveFinishModalSetup = useCallback((record: IShippingOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setShippingOrderRecord(record);
        setIsActiveFinishModal(v => !v);
    }, [dispatch]);

    const toggleIsActiveConfirmFinishModalSetup = useCallback((record: IShippingOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setShippingOrderRecordFinish(record);
        setIsActiveConfirmFinishModal(v => !v);
        setIsActiveFinishModal(false);
    }, [dispatch]);

    const toggleIsActiveConfirmFinishModal = useCallback(() => {
        setIsActiveConfirmFinishModal(v => !v);
        setIsActiveFinishModal(false);
    }, []);

    const toggleisActiveDeleteModal = useCallback(() => {
        setIsActiveDeleteModal(v => !v);
    }, []);

    // Handlers estables
    const toggleisActiveAddModal = useCallback(() => {
        setIsActiveAddModal(v => !v);
    }, []);

    const toggleisActiveEditModal = useCallback(() => {
        setIsActiveEditModal(v => !v);
    }, []);

    const toggleIsActiveFeedBackModal = useCallback(() => {
        setIsActiveFeedBackModal(v => !v);
    }, []);

    const toggleisActiveEditModalSetup = useCallback((record: IShippingOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        if (record.status === "released") {
            setIsActiveEditModal(v => !v);
            setShippingOrderRecord(record);
            return;
        }
        if (record.status === "finished" || record.status === "shipping") {
            setIsActivePreviewModal(v => !v);
            setShippingOrderRecord(record);
            return;
        }
    }, [dispatch]);

    const toggleIsActiveLoadModal = useCallback(() => {
        setIsActiveLoadModal(v => !v);
    }, []);

    const toggleIsActiveLoadModalSetup = useCallback((
        record: IShippingOrder
    ) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setShippingOrderRecord(record);
        setIsActiveLoadModal(v => !v);
        if (isActiveEditModal) {
            setIsActiveEditModal(v => !v);
        }
    }, [isActiveEditModal]);

    const toggleIsActivePreviewModal = useCallback(() => {
        setIsActivePreviewModal(v => !v);
    }, []);

    // * ******************** Funciones para control de acciones de la tabla ******************** 

    const rowActions: RowAction<IShippingOrder>[] = useMemo(() => [
        {
            label: "Cancelar",
            onClick: (row: IShippingOrder) => { console.log(`Cancelar`, row) },
            icon: <Ban className={StyleModule.IconRowActions} />,
            condition: (row: IShippingOrder) => row.status !== "finished" && row.status !== "released"
        },
        {
            label: "Eliminar",
            onClick: toggleisActiveDeleteModalSetup,
            icon: <Trash2 className={StyleModule.IconRowActions} />,
            condition: (row: IShippingOrder) => row.status === "released"
        },
    ], []);
    // * ******************** Componentes extra para inyectar como props en el GenericTable ******************** 

    interface StatusActionsProps {
        value: string;
        onClick?: (record: IShippingOrder) => void;
    }
    const statusActions = useMemo((): StatusActionsProps[] => {
        return [
            { value: "released", onClick: toggleIsActiveLoadModalSetup },
            { value: "shipping", onClick: toggleIsActiveFinishModalSetup }
        ]
    }, [shippingOrders, toggleIsActiveLoadModalSetup, toggleIsActiveFinishModalSetup, toggleIsActivePreviewModal]);

    const ExtraComponents = useCallback(() => {
        const state = useTableState();
        const dispatch = useTableDispatch();


        const handleClearFilters = () => {
            dispatch(reset_column_filters());
        }
        const handleExportTable = () => {
            console.log("exporting table")
        }

        return (
            <div className={StyleModule.containerExtraComponents}>
                <div className={StyleModule.searchSection}>
                    <InputTextCustom
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar"
                        icon={<Search />}
                        classNameInput={StyleModule.inputTextCustom}
                        classNameContainer={StyleModule.containerInputSearch}
                        withValidation={false}
                    />
                </div>
                <div className={StyleModule.containerButtons}>
                    <SecundaryActionButtonCustom
                        label="Limpiar filtros"
                        onClick={handleClearFilters}
                        icon={<Eraser />}
                        disabled={state.columnFiltersState.length === 0}
                    />
                    <SecundaryActionButtonCustom
                        label="Exportar tabla"
                        onClick={handleExportTable}
                        icon={<Download />}
                        disabled={Object.keys(state.rowSelectionState).length === 0}
                    />
                </div>
            </div>
        );
    }, [search]);


    const columnsMemo: ColumnDef<IShippingOrder>[] = useMemo(
        () => generateColumnsShippingOrders(statusActions), [statusActions]
    );

    return (
        <div className={StyleModule.containerShippingOrdersModel}>
            <HeaderComponent
                toggleisActiveAddModal={toggleisActiveAddModal}
            />
            <GenericTableMemo
                modelName="Ordenes de envio"

                /* distribucion de columnas y rows */
                getRowId={(row) => row.id.toString()}
                columns={columnsMemo}
                data={shippingOrders}
                isLoadingData={loadingShippingOrders}

                /* funcionalidades habilitadas */
                enableFilters
                enableSorting
                enablePagination
                enableRowEditClick
                enableRowEditClickHandler={toggleisActiveEditModalSetup}
                enableOptionsColumn
                extraComponents={ExtraComponents}
                /* acciones de la tabla */
                rowActions={rowActions}
                typeRowActions="icon"
                /* estilos */
                classNameGenericTableContainer={StyleModule.containerTable}
            />
            {
                isActiveAddModal && (
                    <ShippingOrderModuleProvider
                        initialStep={1}
                        totalSteps={4}
                    >
                        <AddWizardShippingOrder
                            onCreate={handleCreate}
                            onClose={toggleisActiveAddModal}
                        />
                    </ShippingOrderModuleProvider>
                )
            }
            {
                isActiveEditModal && shippingOrderRecord && (
                    <ShippingOrderModuleProvider
                        initialStep={3}
                        totalSteps={3}
                        data={shippingOrderRecord}
                    >
                        <EditWizardShippingOrder
                            onClose={toggleisActiveEditModal}
                            onUpdate={handleUpdate}
                            onLoad={toggleIsActiveLoadModalSetup}
                        />
                    </ShippingOrderModuleProvider>
                )
            }
            {
                isActiveLoadModal && shippingOrderRecord && (
                    <LoadModal
                        onClose={toggleIsActiveLoadModal}
                        shippingOrder={shippingOrderRecord}
                        onUpdate={handleLoad}
                    />
                )
            }
            {
                isActivePreviewModal && shippingOrderRecord && (
                    <PreviewModal
                        onClose={toggleIsActivePreviewModal}
                        record={shippingOrderRecord as IShippingOrder}
                    />
                )
            }
            {
                isActiveDeleteModal && shippingOrderRecord && (
                    <DeleteModal
                        onDelete={handleDelete}
                        onClose={toggleisActiveDeleteModal}
                        title="¿Estas seguro de eliminar esta orden de envío?"
                        message="Esta acción no se puede deshacer"
                    />
                )
            }
            {
                isActiveFinishModal && shippingOrderRecord && (
                    <FinishedModal
                        onClose={toggleIsActiveFinishModal}
                        shippingOrderRecord={shippingOrderRecord}
                        onConfirm={toggleIsActiveConfirmFinishModalSetup}
                    />
                )
            }
            {
                isActiveConfirmFinishModal && shippingOrderRecordFinish && (
                    <ConfirmModal
                        onClose={toggleIsActiveConfirmFinishModal}
                        shippingOrderRecord={shippingOrderRecord as IShippingOrder}
                        shippingOrderUpdate={shippingOrderRecordFinish as IShippingOrder}
                        onUpdate={handleUpdate}
                        onFeedBack={toggleIsActiveFeedBackModal}
                    />
                )
            }
            {
                isActiveFeedBackModal && (
                    <FeedBackModal
                        onClose={toggleIsActiveFeedBackModal}
                        icon={<Check />}
                        messageCustom={messageReactNode}
                    />
                )
            }
        </div>
    );
}

export default ShippingOrderModel;

interface HeaderComponentProps {
    toggleisActiveAddModal: () => void;
}

const HeaderComponent = memo(({
    toggleisActiveAddModal,
}: HeaderComponentProps) => {
    return (
        <div className={StyleModule.containerHeader}>
            <div className={`nunito-medium ${StyleModule.headerSection}`}>
                <h1 className="nunito-bold">Logistica</h1>
                <MainActionButtonCustom
                    label="Orden de envío"
                    onClick={toggleisActiveAddModal}
                    icon={<Plus />}
                />
            </div>
            <div className={StyleModule.containerKPIs}>
                <KPICardCustomPurple
                    childrenSectionValue={<h2>35</h2>}
                    childrenSectionText={<span className={StyleModule.containerSectionTextKPICard}>
                        <span className="nunito-bold">Órdenes entregadas a tiempo</span>
                        <span className="nunito-bold">
                            <span className={StyleModule.wrapperText}>+5.2%</span> que la semana pasada<span></span>
                        </span>
                    </span>}
                    icon={<PackageCheck />}
                />
                <KPICardCustomGreen
                    childrenSectionValue={<h2>56</h2>}
                    childrenSectionText={<span className={StyleModule.containerSectionTextKPICard}>
                        <span className="nunito-bold">Órdenes en proceso</span>
                        <span className="nunito-bold">
                            <span className={StyleModule.wrapperText}>+2.6%</span> que la semana pasada<span></span>
                        </span>
                    </span>}
                    icon={<PackageSearch />}
                />
                <KPICardCustomRed
                    childrenSectionValue={<h2>3</h2>}
                    childrenSectionText={<span className={StyleModule.containerSectionTextKPICard}>
                        <span className="nunito-bold">Órdenes retrasadas</span>
                        <span className="nunito-bold">
                            <span>en los ultimos</span> <span className={StyleModule.wrapperText}>7 dias</span>
                        </span>
                    </span>}
                    icon={<TrendingDown />}
                />
            </div>
        </div>
    );
});