
import MainActionButtonCustom from '../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom'
import GenericTableMemo from '../../../comp/primitives/table/tableContext/GenericTable'
import type { ColumnDef } from '@tanstack/react-table'
import type { IPartialProductionLine, IProductionLine } from 'interfaces/productionLines'
import { CircleCheck, PlusIcon, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import StyleModule from './ProductionLineModel.module.css'
import { useTableDispatch, useTableState } from '../../../comp/primitives/table/tableContext/tableHooks'
import { reset_column_filters } from '../../../comp/primitives/table/tableContext/tableActions'
import InputTextCustom from '../../../comp/primitives/input/text/custom/InputTextCustom'
import SecundaryActionButtonCustom from '../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom'
import { Search, Eraser, Download } from 'lucide-react'
import useProductionLines from '../../../modelos/productionLines/hooks/useProductionLines'
import Tag from '../../../comp/primitives/tag/Tag'
import type { RowAction } from '../../../comp/primitives/table/types'
import DeleteModal from '../../../comp/primitives/modal/deleteModal/DeleteModal'
import {
    createCompleteproductionLineInDB, deleteproductionLineInDB,
    updateCompleteproductionLineInDB
} from '../../../modelos/productionLines/query/productionLinesQueries'
import { useDispatch } from 'react-redux';
import AddWizardProductionLine from './wizard/add/AddWizardProductionLine'
import EditWizardProductionLine from './wizard/edit/EditWizardProductionLine'
import ProductionLineModuleProvider from '../context/productionLineModuleProvider'
import type { IPartialProductionLineProduct, IProductionLineProductManager } from 'interfaces/productionLinesProducts'
import { diffObjects, diffObjectArrays } from "./../../../utils/validation-on-update/ValidationOnUpdate2"
import FeedBackModal from '../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal'
import ToastMantine from '../../../comp/external/mantine/toast/base/ToastMantine'

const ProductionLineModel = () => {

    const dispatchRedux = useDispatch();
    const [search, setSearch] = useState<string>("");
    const [isActiveDeleteModal, setIsActiveDeleteModal] = useState<boolean>(false);
    const [isAcviveAddModal, setIsAcviveAddModal] = useState<boolean>(false);
    const [isAcviveEditModal, setIsAcviveEditModal] = useState<boolean>(false);
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [selectedProductionLineRecord, setSelectedProductionLineRecord] = useState<IProductionLine | null>(null);
    const { productionLines, loadingProductionLines, refetchProductionLines } = useProductionLines({ like: search, debounce: 500 })

    const toggleIsActiveDeleteModal = useCallback(() => {
        setIsActiveDeleteModal(v => !v);
    }, []);

    const toggleIsActiveDeleteModalSetup = useCallback((value: IProductionLine | null) => {
        setSelectedProductionLineRecord(value);
        setIsActiveDeleteModal(v => !v);
    }, []);

    const toggleIsActiveEditModalSetup = useCallback((value: IProductionLine | null) => {
        setSelectedProductionLineRecord(value);
        setIsAcviveEditModal(v => !v);
    }, []);

    const toggleIsActiveEditModal = useCallback(() => {
        setIsAcviveEditModal(v => !v);
    }, []);

    const toggleIsActiveAddModal = useCallback(() => {
        setIsAcviveAddModal(v => !v);
    }, []);

    const toggleIsActiveFeedBackModal = useCallback(() => {
        setIsActiveFeedBackModal(v => !v);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!selectedProductionLineRecord?.id) {
            return;
        }
        setLoading(true);
        try {
            const response = await deleteproductionLineInDB(
                selectedProductionLineRecord?.id,
                dispatchRedux
            );
            if (!response) {
                ToastMantine.error({
                    message: response?.validation
                });
                return;
            }
            setServerError(null);
            refetchProductionLines();
            toggleIsActiveFeedBackModal();
            toggleIsActiveDeleteModal();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }, [selectedProductionLineRecord, refetchProductionLines, dispatchRedux]);

    const handleCreate = useCallback(async (data: IPartialProductionLine) => {
        setLoading(true);
        try {
            const response = await createCompleteproductionLineInDB(data,
                dispatchRedux
            );
            if (!response) {
                return;
            }
            setServerError(null);
            refetchProductionLines();
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }, [dispatchRedux, refetchProductionLines]);

    const handleUpdate = useCallback(async (original: IPartialProductionLine, updated: IPartialProductionLine) => {
        if (!selectedProductionLineRecord?.id) return;
        setLoading(true);
        try {
            const baseOriginal: IPartialProductionLine = { ...original };
            const baseUpdated: IPartialProductionLine = { ...updated };

            const base_original_plp: IPartialProductionLineProduct[] =
                baseOriginal.production_lines_products ?? [];
            const base_updated_plp: IPartialProductionLineProduct[] =
                baseUpdated.production_lines_products ?? [];

            delete baseOriginal.production_lines_products;
            delete baseUpdated.production_lines_products;

            const diffObject = await diffObjects(baseOriginal, baseUpdated);
            const diffObjectPLP: IProductionLineProductManager =
                await diffObjectArrays(base_original_plp, base_updated_plp);

            const hasChangesPLP: boolean = [
                diffObjectPLP.added,
                diffObjectPLP.deleted,
                diffObjectPLP.modified
            ].some((arr: IPartialProductionLineProduct[]) => arr.length > 0);

            if (Object.keys(diffObject).length > 0 || hasChangesPLP) {
                const object_update: IPartialProductionLine = {
                    ...diffObject,
                    production_lines_products_updated: diffObjectPLP
                };
                const response = await updateCompleteproductionLineInDB(
                    selectedProductionLineRecord?.id,
                    object_update, dispatchRedux
                );

                if (!response) {
                    return;
                }
                refetchProductionLines();
            }
            setServerError(null);
        } catch (error) {
            console.log('error', error);
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }, [dispatchRedux, refetchProductionLines, selectedProductionLineRecord]);

    const getRowId = useMemo(() => (row: IProductionLine) => row.id.toString(), []);

    const columns: ColumnDef<IProductionLine>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            meta: {
                hidden: false,
                autoGenerated: false,
                type: "number",
                mode: "range"
            }
        },
        {
            accessorKey: "name",
            header: "Nombre de la línea",
            meta: {
                hidden: false,
                autoGenerated: false,
                type: "string"
            }
        },
        {
            id: "location",
            header: "Ubicación",
            accessorFn: (row) => row.location_production_line?.location?.name,
            meta: {
                hidden: false,
                autoGenerated: false,
                type: "string"
            }
        },
        {
            accessorKey: "is_active",
            header: "Estado",
            cell: ({ row }) => {
                const state = row.original.is_active ? "Activo" : "Detenida";
                return (
                    <div className={StyleModule.containerTag}>
                        <Tag
                            label={state}
                            className={
                                state === "Activo"
                                    ? StyleModule?.tagActive
                                    : StyleModule?.tagInactive
                            }
                        />
                    </div>
                );
            },
            meta: {
                hidden: false,
                autoGenerated: false,
                type: "boolean",
                booleanLabels: ["Detenida", "Activo"]
            }
        }
    ], []);

    const actionsRow: RowAction<IProductionLine>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: toggleIsActiveDeleteModalSetup,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], []);

    const ExtraComponents = useCallback(() => {
        const state = useTableState();
        const dispatch = useTableDispatch();

        const handleClearFilters = useCallback(() => {
            dispatch(reset_column_filters());
        }, [dispatch]);

        const handleExportTable = useCallback(() => {
            console.log("exporting table")
        }, []);

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

    return (
        <div className={StyleModule.productionLineModelContainer}>
            <div className={StyleModule.productionLineModelHeader}>
                <h1 className='nunito-bold'>Lineas de producción</h1>
                <MainActionButtonCustom
                    icon={<PlusIcon />}
                    label="Línea de producción"
                    onClick={toggleIsActiveAddModal}
                />
            </div>
            <GenericTableMemo
                /* modelo e identificador */
                modelName="Líneas de producción"
                getRowId={getRowId}

                /* data y columnas */
                columns={columns}
                data={productionLines}
                isLoadingData={loadingProductionLines}

                /* funcionalidades */
                enablePagination
                enableFilters
                enableSorting
                enableOptionsColumn
                enableRowEditClick
                typeRowActions='icon'

                /* acciones al hacer click en la fila */
                enableRowEditClickHandler={toggleIsActiveEditModalSetup}

                /* acciones de filas */
                rowActions={actionsRow}

                /* extra components */
                extraComponents={ExtraComponents}

                /* estilos */
                classNameGenericTableContainer={StyleModule.genericTableContainer}
            />
            {
                isActiveDeleteModal && (
                    <DeleteModal
                        title="¿Estás seguro de eliminar esta línea de producción?"
                        message="Esta acción no se puede deshacer."
                        onClose={toggleIsActiveDeleteModal}
                        onDelete={handleDelete}
                    />
                )
            }
            {
                isAcviveAddModal && (
                    <ProductionLineModuleProvider initialStep={0} totalSteps={3}>
                        <AddWizardProductionLine onClose={toggleIsActiveAddModal} onCreate={handleCreate} />
                    </ProductionLineModuleProvider>
                )
            }
            {
                isAcviveEditModal && (
                    <ProductionLineModuleProvider initialStep={2} totalSteps={3} data={selectedProductionLineRecord ?? undefined}>
                        <EditWizardProductionLine onClose={toggleIsActiveEditModal} onUpdate={handleUpdate} />
                    </ProductionLineModuleProvider>
                )
            }
            {
                isActiveFeedBackModal && (
                    <FeedBackModal
                        title="Se ha eliminado la línea de producción"
                        onClose={toggleIsActiveFeedBackModal}
                        icon={<CircleCheck />}
                    />
                )
            }
        </div>
    )
}

export default ProductionLineModel
