import { deleteproductionLineInDB, createCompleteProductionLineInDB, updateCompleteProductionLineInDB } from '../../../modelos/productionLines/query/productionLinesQueries'
import SecundaryActionButtonCustom from '../../../comp/primitives/button/custom-button/secundary-action/SecundaryActionButtonCustom'
import type { IPartialProductionLineProduct, IProductionLineProductManager } from 'interfaces/productionLinesProducts'
import MainActionButtonCustom from '../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom'
import { diffObjects, diffObjectArrays } from "./../../../utils/validation-on-update/ValidationOnUpdate2"
import { useTableDispatch, useTableState } from '../../../comp/primitives/table/tableContext/tableHooks'
import FeedBackModal from '../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal'
import { reset_column_filters } from '../../../comp/primitives/table/tableContext/tableActions'
import useProductionLines from '../../../modelos/productionLines/hooks/useProductionLines'
import type { IPartialProductionLine, IProductionLine } from 'interfaces/productionLines'
import InputTextCustom from '../../../comp/primitives/input/text/custom/InputTextCustom'
import GenericTableMemo from '../../../comp/primitives/table/tableContext/GenericTable'
import ProductionLineModuleProvider from '../context/productionLineModuleProvider'
import ToastMantine from '../../../comp/external/mantine/toast/base/ToastMantine'
import DeleteModal from '../../../comp/primitives/modal/deleteModal/DeleteModal'
import EditWizardProductionLine from './wizard/edit/EditWizardProductionLine'
import AddWizardProductionLine from './wizard/add/AddWizardProductionLine'
import type { RowAction } from '../../../comp/primitives/table/types'
import { setError } from '../../../store/slicer/errorSlicer'
import { CircleCheck, PlusIcon, Trash2 } from 'lucide-react'
import type { IApiError } from '../../../interfaces/errorApi'
import { memo, useCallback, useMemo, useState } from 'react'
import { Search, Eraser, Download } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import Tag from '../../../comp/primitives/tag/Tag'
import { useDispatch } from 'react-redux';
import StyleModule from './ProductionLineModel.module.css'

const ProductionLineModel = () => {

    const dispatchRedux = useDispatch();

    const [search, setSearch] = useState<string>("");
    const [isActiveDeleteModal, setIsActiveDeleteModal] = useState<boolean>(false);
    const [isAcviveAddModal, setIsAcviveAddModal] = useState<boolean>(false);
    const [isAcviveEditModal, setIsAcviveEditModal] = useState<boolean>(false);
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] = useState<boolean>(false);
    const [selectedProductionLineRecord, setSelectedProductionLineRecord] = useState<IProductionLine | null>(null);
    const { productionLines, loadingProductionLines, refetchProductionLines } = useProductionLines({ like: search, debounce: 500 })

    const toggleIsActiveDeleteModal = useCallback(() => setIsActiveDeleteModal(v => !v), []);
    const toggleIsActiveFeedBackModal = useCallback(() => setIsActiveFeedBackModal(v => !v), []);
    const toggleIsActiveEditModal = useCallback(() => setIsAcviveEditModal(v => !v), []);
    const toggleIsActiveAddModal = useCallback(() => setIsAcviveAddModal(v => !v), []);

    const toggleIsActiveDeleteModalSetup = useCallback((value: IProductionLine | null) => {
        setSelectedProductionLineRecord(value);
        setIsActiveDeleteModal(v => !v);
    }, []);
    const toggleIsActiveEditModalSetup = useCallback((value: IProductionLine | null) => {
        setSelectedProductionLineRecord(value);
        setIsAcviveEditModal(v => !v);
    }, []);

    const handleDelete = useCallback(async (): Promise<boolean> => {
        if (!selectedProductionLineRecord?.id) return false;
        try {
            await deleteproductionLineInDB({ id: selectedProductionLineRecord?.id as number });
            refetchProductionLines();
            setIsActiveFeedBackModal(prev => !prev);
            return true;
        } catch (err: unknown) {
            if (err instanceof Error) {
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            } else {
                const error = err as IApiError;
                if (error.validation)
                    error.validation.forEach((msg: string) => {
                        dispatchRedux(setError({ key: "deleteProductionLine", message: { validation: msg } }));
                        ToastMantine.error({ message: msg });
                    });
            }
            return false;
        }
    }, [selectedProductionLineRecord, refetchProductionLines, dispatchRedux]);

    const handleCreate = useCallback(async (data: IPartialProductionLine): Promise<boolean> => {
        try {
            await createCompleteProductionLineInDB({ productionLine: data });
            refetchProductionLines();
            return true;
        } catch (err: unknown) {
            if (err instanceof Error) {
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            } else {
                const error = err as IApiError;
                if (error.validation) {
                    error.validation.forEach((msg: string) => {
                        dispatchRedux(setError({ key: "createCompleteProductionLine", message: { validation: msg } }));
                        ToastMantine.error({ message: msg });
                    });
                }
            }
            return false;
        }
    }, [dispatchRedux, refetchProductionLines]);

    const handleUpdate = useCallback(async ({ original, update }: { original: IPartialProductionLine, update: IPartialProductionLine }): Promise<boolean> => {
        if (!selectedProductionLineRecord?.id) return false;
        try {
            const baseOriginal: IPartialProductionLine = structuredClone(original);
            const baseUpdated: IPartialProductionLine = structuredClone(update);

            const base_original_plp: IPartialProductionLineProduct[] = baseOriginal.production_lines_products ?? [];
            const base_updated_plp: IPartialProductionLineProduct[] = baseUpdated.production_lines_products ?? [];

            delete baseOriginal.production_lines_products;
            delete baseUpdated.production_lines_products;

            const diffObject: IPartialProductionLine = await diffObjects(baseOriginal, baseUpdated);
            const diffObjectPLP: IProductionLineProductManager = await diffObjectArrays(base_original_plp, base_updated_plp);

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
                await updateCompleteProductionLineInDB({ id: selectedProductionLineRecord?.id as number, productionLine: object_update });
                refetchProductionLines();
            }
            return true;
        } catch (err: unknown) {
            if (err instanceof Error) {
                ToastMantine.feedBackForm({ message: err.message || "Ocurrió un error inesperado" });
            } else {
                const error = err as IApiError;
                if (error.validation)
                    error.validation.forEach((msg: string) => {
                        dispatchRedux(setError({ key: "updateLocation", message: { validation: msg } }));
                        ToastMantine.error({ message: msg });
                    });
            }
            return false;
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
    ], [toggleIsActiveDeleteModalSetup]);

    const ExtraComponents = useCallback(() => <ExtraComponent search={search} setSearch={setSearch} />, [search, setSearch]);

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
            {isActiveDeleteModal && (
                <DeleteModal
                    title="¿Estás seguro de eliminar esta línea de producción?"
                    message="Esta acción no se puede deshacer."
                    onClose={toggleIsActiveDeleteModal}
                    onDelete={handleDelete}
                />
            )}
            {isAcviveAddModal && (
                <ProductionLineModuleProvider initialStep={0} totalSteps={3}>
                    <AddWizardProductionLine onClose={toggleIsActiveAddModal} onCreate={handleCreate} />
                </ProductionLineModuleProvider>
            )}
            {isAcviveEditModal && (
                <ProductionLineModuleProvider initialStep={2} totalSteps={3} data={selectedProductionLineRecord ?? undefined}>
                    <EditWizardProductionLine onClose={toggleIsActiveEditModal} onUpdate={handleUpdate} />
                </ProductionLineModuleProvider>
            )}
            {isActiveFeedBackModal && (
                <FeedBackModal
                    title="Se ha eliminado la línea de producción"
                    onClose={toggleIsActiveFeedBackModal}
                    icon={<CircleCheck />}
                />
            )}
        </div>
    )
}

export default ProductionLineModel

interface IExtraComponentProp {
    search: string,
    setSearch: (value: string) => void
}

const ExtraComponent = memo(({ search, setSearch }: IExtraComponentProp) => {

    const state = useTableState();
    const dispatch = useTableDispatch();

    const handleClearFilters = useCallback(() => dispatch(reset_column_filters()), [dispatch]);
    const handleExportTable = useCallback(() => console.log("exporting table"), []);

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
                    disabled={!state.columnFiltersState.length}
                />
                <SecundaryActionButtonCustom
                    label="Exportar tabla"
                    onClick={handleExportTable}
                    icon={<Download />}
                    disabled={!Object.keys(state.rowSelectionState).length}
                />
            </div>
        </div>
    );
});
