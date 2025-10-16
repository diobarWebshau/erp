import { useMemo, useState, type Dispatch } from "react";
import type { IPartialShippingOrder, IShippingOrder, LoadEvidenceItem, LoadEvidenceManager, PartialLoadEvidenceItem } from "../../../../interfaces/shippingOrder";
import type { AppDispatchRedux } from "../../../../store/store";
import { deleteShippingOrderInDB, createCompleteShippingOrderInDB, updateCompleteShippingOrderInDB } from "../../../../queries/shippingOrderQueries";
import { useDispatch } from "react-redux";
import { generateColumnsShippingOrders } from "./structure/columns";
import type { RowAction } from "../../../../components/ui/table/types";
import { Trash2, Download, Plus, Search, Eraser, PackageCheck, PackageSearch, TrendingDown, Ban } from "lucide-react";
import useShippingOrderDetailById from "./hooks/useShippingOrderDetailById";
import { diffObjectArrays, diffObjects } from "../../../../utils/validation-on-update/validationOnUpdate"
import type { IPartialShippingOrderPurchasedOrderProduct, IShippingOrderPurchasedOrderProduct, IShippingOrderPurchasedOrderProductManager } from "../../../../interfaces/shippingPurchasedProduct";
import type { Table } from "@tanstack/react-table";
import StyleModule from "./ShippingOrdersModel.module.css";
import { clearAllErrors } from "../../../../store/slicer/errorSlicer";
import ShippingOrderModuleProvider from "./context/ShippingOrderModuleProvider";
import AddWizardShippingOrder from "./wizards/add/AddWirzardShippingOrder";
import GenericTableMemo from "./../../../../comp/primitives/table/tableContext/GenericTable";
import type { TableState, TableAction } from "./../../../../comp/primitives/table/tableContext/tableTypes";
import { reset_column_filters } from "./../../../../comp/primitives/table/tableContext/tableActions";
import InputTextCustom from "../../../../comp/primitives/input/text/custom/InputTextCustom";
import MainActionButtonCustom from "../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import SecundaryActionButtonCustom from "../../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom";
import useShippingOrders from "../../../../modelos/shipping_orders/hooks/useShippingOrders";
import KPICardCustomPurple from "../../../../comp/primitives/cards/kpi/custom/purple/KPICardCustomPurple";
import KPICardCustomRed from "../../../../comp/primitives/cards/kpi/custom/red/KPICardCustomRed";
import KPICardCustomGreen from "../../../../comp/primitives/cards/kpi/custom/green/KPICardCustomGreen";
import LoadModal from "./modals/load/LoadModal";

const ShippingOrderModel = () => {

    // * ******************** Estados ******************** 

    // ? Estados para acceso a redux
    const dispatch: AppDispatchRedux = useDispatch();

    // ? Estados de control de errores y loading

    const [serverError, setServerError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // ? Estados para los datos del modelo    

    const [shippingOrderRecord, setShippingOrderRecord] = useState<IPartialShippingOrder | null>();

    // ? Estados para los modales 

    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);
    const [isActiveLoadModal, setIsActiveLoadModal] =
        useState<boolean>(false);
    const [isActiveFinishedModal, setIsActiveFinishedModal] =
        useState<boolean>(false);

    const toggleIsActiveLoadModal = () => setIsActiveLoadModal((prev) => !prev);
    const toggleIsActiveLoadModalSetup = () => {
        setIsActiveLoadModal(true)
        console.log("modal de carga")
    }

    const toggleIsActiveFinishedModal = () => setIsActiveFinishedModal((prev) => !prev);
    const toggleIsActiveFinishedModalSetup = () => {
        // setIsActiveFinishedModal(true)
        console.log("modal de finalizado")
    }


    const [search, setSearch] = useState<string>("");

    const { shippingOrders, loadingShippingOrders, refetchShippingOrders } = useShippingOrders({ like: search, debounce: 500 });

    // * ******************** Funciones de operaciones CRUD ******************** 

    const handleCreate = async (shipping: IPartialShippingOrder) => {
        setLoading(true);
        try {
            const new_shipping = { ...shipping }
            delete new_shipping.load_evidence;
            const responseCreate = await createCompleteShippingOrderInDB(new_shipping, dispatch);
            refetchShippingOrders();
            if (!responseCreate) return;
            setServerError(null);
        } catch (error) {
            if (error instanceof Error) setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (shipping: IPartialShippingOrder) => {
        setLoading(true);
        try {

            const shipping_old = {
                ...shippingOrderDetailById,
                delivery_cost:
                    Number(shippingOrderDetailById?.delivery_cost)
            };

            const shipping_new = shipping;

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

            const diff_shipping: IPartialShippingOrder =
                await diffObjects(
                    shipping_old,
                    shipping_new
                );

            const diff_sopops: IShippingOrderPurchasedOrderProductManager = diffObjectArrays(sopops_old, sopops_new);

            const hasChangesSopops: boolean = [
                diff_sopops.added,
                diff_sopops.deleted,
                diff_sopops.modified
            ].some(
                (arr: (
                    IShippingOrderPurchasedOrderProduct |
                    IPartialShippingOrderPurchasedOrderProduct)[]
                ) => arr.length > 0);

            const diff_evidences: LoadEvidenceManager = diffObjectArrays(evidences_old, evidences_new);

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
                    shippingOrderDetailById?.load_evidence?.filter(
                        (evidence) => {
                            if (evidence instanceof File) return false;
                            return !excludedIds.has(evidence.id);
                        }
                    ) as LoadEvidenceItem[];

                const new_shipping: IPartialShippingOrder = {
                    ...diff_shipping,
                    shipping_order_purchase_order_product_manager:
                        diff_sopops,
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
                    await updateCompleteShippingOrderInDB(
                        shippingOrderRecord?.id || null,
                        new_shipping,
                        dispatch
                    );

                if (!response) {
                    return;
                }
                await refetchShippingOrderDetailById();
            }
            setServerError(null);
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
            await deleteShippingOrderInDB(
                shippingOrderRecord?.id || null,
                dispatch
            );
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    // * ******************** Funciones para control de modales ******************** 

    const toggleisActiveAddModal = () => {
        setIsActiveAddModal(!isActiveAddModal);
    }

    const toggleisActiveEditModalSetup = (record: IShippingOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setShippingOrderRecord(record);
    }

    const toggleisActiveEditModal = () => {
        setIsActiveEditModal(!isActiveEditModal);
    }

    const toggleisActiveDeleteModalSetup = (record: IShippingOrder) => {
        dispatch(clearAllErrors());
        setServerError(null);
        setShippingOrderRecord(record);
    }

    const toggleisActiveDeleteModal = () => {
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }

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
            onClick: (row: IShippingOrder) => { console.log(`Eliminar`, row) },
            icon: <Trash2 className={StyleModule.IconRowActions} />,
            condition: (row: IShippingOrder) => row.status === "released"
        },
    ], []);
    // * ******************** Componentes extra para inyectar como props en el GenericTable ******************** 

    interface ExtraComponentsProps<T> {
        table: Table<T>,
        state: TableState,
        dispatch: Dispatch<TableAction>
    }

    const ExtraComponents = ({ table, state, dispatch }: ExtraComponentsProps<IShippingOrder>) => {


        const handleClearFilters = () => {
            dispatch(reset_column_filters())
        }

        const handleExportTable = () => {
            console.log("exporting table")
        }

        return (
            <div className={StyleModule.containerExtraComponents}>
                <div className={StyleModule.containerInputSearch}>
                    <InputTextCustom
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar"
                        icon={<Search />}
                        classNameInput={StyleModule.inputTextCustom}
                        withValidation={false}
                    />
                </div>
                <div className={StyleModule.containerButtons}>
                    <SecundaryActionButtonCustom
                        label="Limpiar filtros"
                        onClick={handleClearFilters}
                        disabled={state.columnFiltersState.length <= 0}
                        icon={<Eraser />}
                    />
                    <SecundaryActionButtonCustom
                        label="Exportar tabla"
                        onClick={handleExportTable}
                        icon={<Download />}
                    />
                </div>
            </div>
        );
    }

    interface StatusActionsProps {
        value: string;
        onClick?: () => void;
    }
    const statusActions = useMemo((): StatusActionsProps[] => {
        return [
            { value: "released", onClick: toggleIsActiveLoadModalSetup },
            { value: "finished", onClick: toggleIsActiveFinishedModal }
        ]
    }, [toggleIsActiveLoadModalSetup, toggleIsActiveFinishedModal]);

    const columnsMemo = useMemo(() => generateColumnsShippingOrders(statusActions), [statusActions]);

    // * ******************** Hooks ******************** */

    const { shippingOrderDetailById, refetchShippingOrderDetailById } = useShippingOrderDetailById(shippingOrderRecord?.id || null);

    return (
        <div className={StyleModule.containerShippingOrdersModel}>
            <div className={`nunito-medium ${StyleModule.headerSection}`}>
                <h1 className="nunito-bold">Logistica</h1>
                <MainActionButtonCustom
                    label="Orden de envio1"
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

                /* acciones de la tabla */
                rowActions={rowActions}
                typeRowActions="icon"
                extraComponents={ExtraComponents}

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
                isActiveLoadModal && shippingOrderDetailById && (
                    <LoadModal
                        onClose={toggleIsActiveLoadModal}
                        shippingOrder={shippingOrderDetailById}
                    />
                )
            }
        </div>
    );
}

export default ShippingOrderModel;