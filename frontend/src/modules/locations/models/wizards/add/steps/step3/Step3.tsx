import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import ProductionLineModuleProvider from "./../../../../../../../modules/production_lines/context/productionLineModuleProvider"
import AddWizardProductionLine from "./../../../../../../../modules/production_lines/model/wizard/add/AddWizardProductionLine"
import type { IPartialLocationProductionLine } from "../../../../../../../interfaces/locationsProductionLines";
import type { IPartialInventoryLocationItem } from "../../../../../../../interfaces/inventoriesLocationsItems";
import SelectObjectsModal from "../../../../../../../comp/features/modal-product2/SelectProductsModal";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import FeedBackModal from "../../../../../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";
import type { IPartialProductionLine } from "../../../../../../../interfaces/productionLines";
import type { IPartialProductionLineProduct } from "interfaces/productionLinesProducts";
import type { LocationAction, LocationState } from "../../../../context/locationTypes";
import { clearError, setError } from "../../../../../../../store/slicer/errorSlicer";
import type { IPartialLocation } from "../../../../../../../interfaces/locations";
import { ArrowLeft, Bookmark, CircleCheck } from "lucide-react";
import Tag from "../../../../../../../comp/primitives/tag/Tag";
import { generateRandomIds } from "../../../../../../../helpers/nanoId";
import { useCallback, type Dispatch, useState, useMemo, type ReactNode } from "react";
import {
    back_step, add_location_production_line,
    add_inventory_location_item
} from "../../../../context/locationActions";
import type { ColumnDef } from "@tanstack/react-table";
import type { AppDispatchRedux, RootState } from "store/store";
import type { IProduct } from "../../../../../../../interfaces/product";
import { useDispatch, useSelector } from "react-redux";
import { Divider } from "@mantine/core";
import StyleModule from "./Step3.module.css";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "products/products/exclude/";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

interface IStep3Props {
    state: LocationState,
    dispatch: Dispatch<LocationAction>,
    onCancel: () => void,
    onCreate: (location: IPartialLocation) => (Promise<boolean> | boolean),
    onClose: () => void
}

const Step3 = ({ state, dispatch, onCancel, onCreate, onClose }: IStep3Props) => {

    // ********** States **********
    const dispatchRedux: AppDispatchRedux = useDispatch<AppDispatchRedux>();
    const errorRedux = useSelector((state: RootState) => state.error);


    const excludeIds = useMemo<number[]>(() => {
        return state.data?.inventories_locations_items?.map(p => p.item?.item?.id as number) ?? [];
    }, [state.data?.inventories_locations_items]);

    const [isActiveModalAddProduct, setIsActiveModalAddProduct] = useState<boolean>(false);
    const [isActiveModalFeedBack, setIsActiveModalFeedBack] = useState<boolean>(false);
    const [customMessageConfirmModal, setCustomMessageConfirmModal] = useState<ReactNode | null>(null);

    const toggleIsActiveFeedBackModal = useCallback(() => setIsActiveModalFeedBack(prev => !prev), [])

    const toggleIsActiveModalAddProduct = useCallback(() => {
        setIsActiveModalAddProduct(v => !v);
    }, []);

    const getRowAttr = useMemo(() => (data: IProduct) => data.name, []);

    const handleOnClickAddProduct = useCallback((products: IProduct[]) => {
        const inventoriesLocationsItems: IPartialInventoryLocationItem[] = products.map((p) => {
            const inventoryLocationItem: IPartialInventoryLocationItem = {
                id: generateRandomIds(),
                item: {
                    item_id: p.id,
                    item: p,
                    item_type: "product"
                },
                item_id: p.id,
                item_type: "product",
            }
            return inventoryLocationItem;
        });
        dispatch(add_inventory_location_item(inventoriesLocationsItems));
        setIsActiveModalAddProduct(prev => !prev);
    }, [dispatch]);


    const [isActiveAddWizardProductionLine, setIsActiveAddWizardProductionLine] = useState<boolean>(false);

    const toggleIsActiveAddWizardProductionLine = useCallback(() => {
        setIsActiveAddWizardProductionLine(prev => !prev);
    }, []);

    const handleOnAddProductionLines = useCallback((productionLine: IPartialProductionLine): void => {
        const newDataLocationProductionLine: IPartialLocationProductionLine = {
            id: generateRandomIds(),
            production_line: {
                ...productionLine,
                id: generateRandomIds()
            },
        };
        dispatch(add_location_production_line([newDataLocationProductionLine]));
    }, [dispatch]);


    // ********** Components for ProductionLine table **********

    const getRowIdLocationProductionLine = useMemo(() => (row: IPartialLocationProductionLine, index: number) => row?.id ? row.id.toString() : index.toString(), []);

    const columnsLocationProductionLine: ColumnDef<IPartialLocationProductionLine>[] = useMemo(() => [
        {
            id: "customId",
            accessorFn: (row) => row.production_line?.custom_id,
            header: "ID",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            },
            cell: ({ row }) => (<div>{row.original.production_line?.custom_id}</div>)
        },
        {
            id: "name",
            accessorFn: (row) => row.production_line?.name,
            header: "Nombre",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            },
            cell: ({ row }) => (<div>{row.original.production_line?.name}</div>)

        },
        {
            id: "products",
            accessorFn: (row) => row.production_line?.name,
            header: "Productos asignados",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "array",
            },
            cell: ({ row }) => {
                const values: IPartialProductionLineProduct[] = row.original.production_line?.production_lines_products ?? [];
                return (
                    <div className={StyleModule.containerProductionLineProducts}>
                        {values?.map((plp, index) => {
                            return <div key={index}>{plp.products?.name}</div>
                        })}
                    </div>
                );
            }
        }
    ], []);


    // ********** Components for Products asinged Table **********

    // ********** Functions **********

    const getRowIdInventoryLocationItem = useMemo(() => (row: IPartialInventoryLocationItem, index: number) => row?.id ? row.id.toString() : index.toString(), []);

    const handleOnClickBack = useCallback(() => dispatch(back_step()), [dispatch]);
    const handleOnClickNext = useCallback(async () => {
        const ok = await onCreate(state.data);
        if (!ok) {
            console.log(`ok`, ok);
            const errorsEntries = Object.entries(errorRedux);
            console.log(`errorEntries`, errorsEntries);
            const errors = errorsEntries.map(([value]) => value);
            errors.forEach(error => ToastMantine.error({ message: error as string }));
            return;
        }
        const customMessage: ReactNode = (
            <span className={`nunito-bold ${StyleModule.customMessageConfirmModal}`}>
                La ubicación {` `} <span>{state.data.name}</span> {` `} se ha agregado correctamente.
            </span>
        );
        setCustomMessageConfirmModal(customMessage);
        setIsActiveModalFeedBack(prev => !prev);
    }, [onCreate, state.data, errorRedux]);

    const columns: ColumnDef<IPartialInventoryLocationItem>[] = useMemo(() => [
        {
            accessorFn: (row) => row.item?.item?.id,
            header: "ID",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        },
        {
            accessorFn: (row) => row.item?.item?.name,
            header: "Producto",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        },
        {
            accessorFn: (row) => row.item?.item?.description,
            header: "Descripción",
            meta: {
                hidden: false,
                autoGenerated: true,
                type: "string",
            }
        }
    ], []);

    const fetchLoadProducts = useCallback(
        async (query: string | number, signal?: AbortSignal): Promise<IProduct[]> => {
            try {
                const params = new URLSearchParams();
                params.append("filter", String(query));

                // Repite el param por cada id: ?excludeIds=1&excludeIds=2...
                for (const id of excludeIds) params.append("excludeIds", String(id));

                const url = new URL(API_URL.toString());
                url.search = params.toString();

                const response = await fetch(url.toString(), { method: "GET", signal });

                if (!response.ok) {
                    // intenta leer json, pero no lo asumas
                    const errorData = await response.json().catch(() => ({}));
                    const message = errorData?.message ?? "Error al cargar productos";

                    if (response.status >= 500) throw new Error(message);

                    dispatchRedux(setError({ key: "likeWithExcludeToProducts", message }));
                    return [];
                }

                dispatchRedux(clearError("likeWithExcludeToProducts"));
                const data: IProduct[] = await response.json();
                return data;
            } catch (error) {
                // Si fue aborto, simplemente ignora o retorna []
                if ((error as any)?.name === "AbortError") return [];
                console.error("Error fetching products:", error);
                return [];
            }
        },
        [dispatchRedux, excludeIds] // elimina deps que no se usan
    );

    const handleOnCloseConfirmModal = useCallback(() => {
        toggleIsActiveFeedBackModal();
        onClose();
    }, [toggleIsActiveFeedBackModal, onClose]);
    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>
                <div className={StyleModule.informationBlock}>
                    <h2 className={`nunito-bold ${StyleModule.subTitle}`}>Información de ubicación</h2>
                    <div className={StyleModule.rowBlock}>
                        <div className={`nunito-bold ${StyleModule.firstBlock}`}>
                            <dl className={StyleModule.definitionList}>
                                <dt>{`Nombre de la ubicación: `}</dt>
                                <dd>{state.data.name}</dd>
                            </dl>
                            <dl className={StyleModule.definitionList}>
                                <dt>{`ID único: `}</dt>
                                <dd>{state.data.custom_id}</dd>
                            </dl>
                            <dl className={StyleModule.definitionList}>
                                <dt>{`Dirección: `}</dt>
                                <dd>{`${state.data.street} ${state.data.street_number}, ${state.data.neighborhood}, ${state.data.city}, ${state.data.state}, ${state.data.country}`}</dd>
                            </dl>
                        </div>
                        <div className={`nunito-bold ${StyleModule.firstBlock}`}>
                            <dl className={StyleModule.definitionList}>
                                <dt>{`Teléfono: `}</dt>
                                <dd>{state.data.phone}</dd>
                            </dl>
                            <dl className={StyleModule.definitionList}>
                                <dt>{`Responsable: `}</dt>
                                <dd>{state.data.location_manager}</dd>
                            </dl>
                            <dl className={StyleModule.definitionList}>
                                <dt>{`Tipo de ubicación: `}</dt>
                                <dd>
                                    {state.data.location_location_type?.map(
                                        llt => (llt.location_type?.name as string) === "Store"
                                            ? "Almacén" : "Planta de producción"
                                    ).join(",")}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className={StyleModule.productionBlock}>
                    <h2 className={`nunito-bold ${StyleModule.subTitle}`}>Planta de producción</h2>
                    <div className={`nunito-bold ${StyleModule.firstBlock}`}>
                        <dl className={StyleModule.definitionList}>
                            <dt>{`Capacidad de producción: `}</dt>
                            <dd>{`${state.data.production_capacity} unidades`}</dd>
                        </dl>
                    </div>
                    <GenericTableMemo
                        // modelo e indentificador
                        modelName="Locations production lines"
                        getRowId={getRowIdLocationProductionLine}
                        // data y columnas
                        columns={columnsLocationProductionLine}
                        data={state.data?.location_production_line ?? []}
                    />
                </div>
                <div className={StyleModule.inventoryBlock}>
                    <h2 className={`nunito-bold ${StyleModule.subTitle}`}>Almacén</h2>
                    <div className={StyleModule.inventoryBlockButtonContainer}>
                    </div>
                    <GenericTableMemo
                        /* modelo e identificador */
                        modelName="products asignados a almacen"
                        getRowId={getRowIdInventoryLocationItem}
                        noResultsMessage="No hay productos asignados"
                        /* data y columnas */
                        columns={columns}
                        data={state.data?.inventories_locations_items || []}
                    /* funcionalidades */
                    />
                </div>
                <div className={StyleModule.statusBlock}>
                    <dl className={StyleModule.dlStatus}>
                        <dt className={`nunito-bold`}>Estado de la línea:</dt>
                        <dd>
                            <Tag
                                label={state.data?.is_active ? "Activa" : "Inactiva"}
                                className={state.data?.is_active ? StyleModule.tagActive : StyleModule.tagInactive}
                            />
                        </dd>
                    </dl>
                </div>
                <Divider color="var(--color-theme-primary-light)" />
            </div>
            <div className={StyleModule.containerButtons}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onCancel}
                />
                <TertiaryActionButtonCustom
                    label="Regresar"
                    onClick={handleOnClickBack}
                    icon={<ArrowLeft />}
                />
                <TertiaryActionButtonCustom
                    label="Guardar y salir"
                    onClick={() => console.log("guardar y salir")}
                    icon={<Bookmark />}
                />
                <MainActionButtonCustom
                    label="Guardar y continuar"
                    onClick={handleOnClickNext}
                    icon={<Bookmark />}
                />
            </div>
            {isActiveAddWizardProductionLine && (
                <ProductionLineModuleProvider initialStep={0} totalSteps={3} >
                    <AddWizardProductionLine
                        onCreate={handleOnAddProductionLines}
                        onClose={toggleIsActiveAddWizardProductionLine}
                    />
                </ProductionLineModuleProvider>
            )}
            {
                isActiveModalAddProduct && (
                    <SelectObjectsModal
                        onClose={toggleIsActiveModalAddProduct}
                        onClick={handleOnClickAddProduct}
                        placeholder="Buscar productos"
                        labelOnClick="Asignar productos"
                        headerTitle="Asignar productos"
                        emptyMessage="No hay productos que coincidan con la búsqueda"
                        getRowAttr={getRowAttr}
                        loadOptions={fetchLoadProducts}
                        label="Productos"
                    />
                )
            }
            {
                isActiveModalFeedBack && (<FeedBackModal
                    message="Ya lo puedes visualizar en panel principal de productos."
                    onClose={handleOnCloseConfirmModal}
                    messageCustom={customMessageConfirmModal}
                    icon={<CircleCheck className={StyleModule.iconConfirmModal} />}
                />)
            }
        </div>
    );
}

export default Step3;
