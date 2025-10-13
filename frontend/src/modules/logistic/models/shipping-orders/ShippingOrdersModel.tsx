import { useEffect, useState } from "react";
import type { IPartialShippingOrder, IShippingOrder, LoadEvidenceItem, LoadEvidenceManager, PartialLoadEvidenceItem } from "../../../../interfaces/shippingOrder";
import type { AppDispatchRedux } from "../../../../store/store";
import { deleteShippingOrderInDB, fetchShippingOrderFromDB, createCompleteShippingOrderInDB, updateCompleteShippingOrderInDB } from "../../../../queries/shippingOrderQueries";
import GenericTable from "../../../../components/ui/table/tableContext/GenericTable";
import { useDispatch } from "react-redux";
import { columnsShippingOrders } from "./structure/columns";
import type { RowAction } from "../../../../components/ui/table/types";
import { Trash2, Download, Plus, Search, Eraser } from "lucide-react";
import useShippingOrderDetailById from "./hooks/useShippingOrderDetailById";
import { diffObjectArrays, diffObjects } from "../../../../utils/validation-on-update/validationOnUpdate"
import type { IPartialShippingOrderPurchasedOrderProduct, IShippingOrderPurchasedOrderProduct, IShippingOrderPurchasedOrderProductManager } from "../../../../interfaces/shippingPurchasedProduct";
import InvertOnHoverButton from "../../../../components/ui/table/components/gui/button/Invert-on-hover-button/InvertOnHoverButton";
import type { Table } from "@tanstack/react-table";
import FadeButton from "../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import InputSearch from "../../../../components/ui/table/components/gui/input/input-text-search/input";
import StyleModule from "./ShippingOrdersModel.module.css";
import { useTableDispatch, useTableState } from "../../../../components/ui/table/tableContext/tableHooks";
import { reset_column_filters } from "../../../../components/ui/table/tableContext/tableActions";
import { clearAllErrors } from "../../../../store/slicer/errorSlicer";
import ShippingOrderModuleProvider from "./context/ShippingOrderModuleProvider";
import AddWizardShippingOrder from "./wizards/add/AddWirzardShippingOrder";

const ShippingOrderModel = () => {

    // * ******************** Estados ******************** 

    // ? Estados para acceso a redux
    const dispatch: AppDispatchRedux = useDispatch();

    // ? Estados de control de errores y loading

    const [serverError, setServerError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // ? Estados para los datos del modelo    

    const [shippingOrderRecord, setShippingOrderRecord] = useState<IPartialShippingOrder | null>();
    const [shippingOrders, setShippingOrders] = useState<IShippingOrder[]>([]);

    // ? Estados para los modales 

    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);

    // * ******************** Funciones de operaciones CRUD ******************** 

    const fetchs = async () => {
        setLoading(true);
        try {
            const response =
                await fetchShippingOrderFromDB(dispatch);
            if (response.length > 0) {
                setShippingOrders(response);
            } else {
                setShippingOrders([])
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (shipping: IPartialShippingOrder) => {
        setLoading(true);
        try {
            const new_shipping = { ...shipping }
            delete new_shipping.load_evidence;
            const responseCreate = await createCompleteShippingOrderInDB(new_shipping, dispatch);
            if (!responseCreate) { return; }
            setServerError(null);
            fetchs();
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

            const diff_sopops:
                IShippingOrderPurchasedOrderProductManager =
                diffObjectArrays(
                    sopops_old,
                    sopops_new
                );

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
                diffObjectArrays(
                    evidences_old,
                    evidences_new
                );

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
                await fetchs();
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
            fetchs();
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

    const rowActions: RowAction<IShippingOrder>[] = [
        {
            label: "Delete",
            onClick: toggleisActiveDeleteModalSetup,
            icon: <Trash2 className={StyleModule.trash2IconShippingOrderModel} />
        }
    ];

    // * ******************** Componentes extra para inyectar como props en el GenericTable ******************** 

    const ExtraComponents = (table: Table<IShippingOrder>) => {
        const state = useTableState();
        const dispatch = useTableDispatch();
        return (
            <div
                className={StyleModule.containerExtraComponents}
            >
                <div
                    className={`nunito-medium ${StyleModule.firstBlock}`}
                >
                    <h1 className="nunito-bold">Logistica</h1>
                    <FadeButton
                        label="Orden de envio1"
                        onClick={toggleisActiveAddModal}
                        icon={<Plus className={StyleModule.plusIconShippingOrderModel} />}
                        typeOrderIcon="first"
                        classNameButton={StyleModule.fadeButtonExtraComponents}
                        classNameSpan={StyleModule.fadeButtonSpanExtraComponents}
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


    // * ******************** Efectos ******************** */

    useEffect(() => { fetchs() }, []);

    // * ******************** Hooks ******************** */

    const { shippingOrderDetailById, refetchShippingOrderDetailById } = useShippingOrderDetailById(shippingOrderRecord?.id || null);

    return (
        <div
            className={StyleModule.containerShippingOrdersModel}
        >
            <GenericTable
                modelName="Ordenes de envio"

                /* distribucion de columnas y rows */
                getRowId={(row) => row.id.toString()}
                columns={columnsShippingOrders}
                data={shippingOrders}

                /* funcionalidades habilitadas */
                enableFilters={true}
                enableSorting={false}
                enableViews={false}
                enablePagination={true}
                enableRowSelection={false}
                enableRowEditClick={true}
                enableRowEditClickHandler={toggleisActiveEditModalSetup}

                /* acciones de la tabla */
                rowActions={rowActions}
                typeRowActions="icon"
                onDeleteSelected={() => console.log("borrado selectivo")}

                /* componentes extra */
                extraComponents={(table) => ExtraComponents(table)}

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
        </div>
    );
}

export default ShippingOrderModel;