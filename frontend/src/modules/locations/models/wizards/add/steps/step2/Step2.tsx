import UnderlineLabelInputNumeric from "./../../../../../../../comp/primitives/input/layouts/underline-label/numeric/UnderlineLabelInputNumeric";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import ProductionLineModuleProvider from "./../../../../../../../modules/production_lines/context/productionLineModuleProvider"
import AddWizardProductionLine from "./../../../../../../../modules/production_lines/model/wizard/add/AddWizardProductionLine"
import SwitchMantineCustom from "./../../../../../../../comp/external/mantine/switch/custom/SwitchMantineCustom";
import type { IPartialLocationProductionLine } from "../../../../../../../interfaces/locationsProductionLines";
import type { IPartialInventoryLocationItem } from "../../../../../../../interfaces/inventoriesLocationsItems";
import SelectObjectsModal from "../../../../../../../comp/features/modal-product2/SelectProductsModal";
import type { RowAction } from "../../../../../../../comp/primitives/table/tableContext/tableTypes";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";
import type { IPartialProductionLine } from "../../../../../../../interfaces/productionLines";
import type { IPartialProductionLineProduct } from "interfaces/productionLinesProducts";
import type { LocationAction, LocationState } from "../../../../context/locationTypes";
import { clearError, setError } from "../../../../../../../store/slicer/errorSlicer";
import { ArrowLeft, Bookmark, Check, Plus, Trash2, X } from "lucide-react";
import { generateRandomIds } from "../../../../../../../helpers/nanoId";
import { useCallback, type Dispatch, useState, useMemo, useEffect } from "react";
import {
    back_step, next_step, update_location, add_location_production_line,
    remove_location_production_line, remove_inventory_location_item,
    add_inventory_location_item
} from "../../../../context/locationActions";
import type { ColumnDef } from "@tanstack/react-table";
import type { AppDispatchRedux } from "store/store";
import type { IProduct } from "interfaces/product";
import { useDispatch } from "react-redux";
import { Divider } from "@mantine/core";
import StyleModule from "./Step2.module.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "products/products/exclude/";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);

interface IStep2Props { state: LocationState, dispatch: Dispatch<LocationAction>, onCancel: () => void }

const Step2 = ({ state, dispatch, onCancel }: IStep2Props) => {

    // ********** States **********
    const dispatchRedux: AppDispatchRedux = useDispatch<AppDispatchRedux>();

    const excludeIds = useMemo<number[]>(() => {
        return state.data?.inventories_locations_items?.map(p => p.item?.item?.id as number) ?? [];
    }, [state.data?.inventories_locations_items]);

    const [productionCapacity, setProductionCapacity] = useState<number | null>(state.data?.production_capacity ?? null);
    const [isActiveModalAddProduct, setIsActiveModalAddProduct] = useState<boolean>(false);
    const [isAvailableProducts, setIsAvailableProducts] = useState<boolean>(false);

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

    const handleOnRemoveProductionLines = useCallback((newData: IPartialLocationProductionLine) => {
        if (!newData?.id) return;
        dispatch(remove_location_production_line([newData.id?.toString()]));
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

    const actionsRowProductionLine: RowAction<IPartialLocationProductionLine>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: handleOnRemoveProductionLines,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], [handleOnRemoveProductionLines]);

    // ********** Components for Products asinged Table **********

    // ********** Functions **********

    const getRowIdInventoryLocationItem = useMemo(() => (row: IPartialInventoryLocationItem, index: number) => row?.id ? row.id.toString() : index.toString(), []);

    const handleOnChangeActive = useCallback((value: boolean) => dispatch(update_location({ is_active: value })), [dispatch]);
    
    const handleOnClickNext = useCallback(() => {
        if (!productionCapacity || productionCapacity === 0) {
            ToastMantine.feedBackForm({ message: "Debe completar todos los campos" });
            return;
        }
        dispatch(update_location({ production_capacity: productionCapacity }));
        dispatch(next_step());
    }, [dispatch, productionCapacity]);
    const handleOnClickBack = useCallback(() => dispatch(back_step()), [dispatch]);

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

    const handleOnRemoveInventoryLocationItem = useCallback((row: IPartialInventoryLocationItem) => {
        if (!row?.id) return;
        dispatch(remove_inventory_location_item([row.id as (string | number)]));
    }, [dispatch]);

    const actionsRowInventoryLocationItem: RowAction<IPartialInventoryLocationItem>[] = useMemo(() => [
        {
            id: "delete",
            label: "Eliminar",
            onClick: handleOnRemoveInventoryLocationItem,
            icon: <Trash2 className={StyleModule.iconTrash} />
        }
    ], [handleOnRemoveInventoryLocationItem]);

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

    useEffect(() => {
        const isAvailableProductFunction = async () => {
            const allProduct = await fetchLoadProducts("");
            setIsAvailableProducts(allProduct.length > 0);
        }
        isAvailableProductFunction();
    }, [fetchLoadProducts]);

    return (
        <div className={StyleModule.containerStep}>
            <div className={StyleModule.containerContent}>
                <UnderlineLabelInputNumeric
                    value={productionCapacity}
                    onChange={setProductionCapacity}
                    label="Capacidad de producción"
                    withValidation
                />
                <div className={StyleModule.productionBlock}>
                    <h2 className={`nunito-bold ${StyleModule.subTitle}`}>Planta de producción</h2>
                    <div className={StyleModule.productionBlockButtonContainer}>
                        <span className={`nunito-bold ${StyleModule.subTitleSpan}`}>Líneas de producción</span>
                        <div>
                            <MainActionButtonCustom
                                label="Línea nueva"
                                onClick={toggleIsActiveAddWizardProductionLine}
                                icon={<Plus />}
                            />
                            <MainActionButtonCustom
                                label="Asignar líneas"
                                onClick={() => console.log("agregar")}
                                icon={<Plus />}
                            />
                        </div>
                    </div>
                    <GenericTableMemo
                        // modelo e indentificador
                        modelName="Locations production lines"
                        getRowId={getRowIdLocationProductionLine}
                        // data y columnas
                        columns={columnsLocationProductionLine}
                        data={state.data?.location_production_line ?? []}
                        // funcionalidades 
                        enablePagination
                        enableOptionsColumn
                        typeRowActions="icon"
                        rowActions={actionsRowProductionLine}
                    />
                </div>
                <div className={StyleModule.inventoryBlock}>
                    <h2 className={`nunito-bold ${StyleModule.subTitle}`}>Almacén</h2>
                    <div className={StyleModule.inventoryBlockButtonContainer}>
                        <span className={`nunito-bold ${StyleModule.subTitleSpan}`}>Productos asignados</span>
                        <MainActionButtonCustom
                            label="Asignar productos"
                            onClick={toggleIsActiveModalAddProduct}
                            icon={<Plus />}
                            disabled={!isAvailableProducts}
                        />
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
                        enableOptionsColumn
                        typeRowActions="icon"
                        rowActions={actionsRowInventoryLocationItem}
                    />
                </div>
                <div className={StyleModule.containerSwitch}>
                    <span className={`nunito-bold ${StyleModule.subTitleSpan}`}>Activar ubicación</span>
                    <SwitchMantineCustom
                        value={state.data?.is_active ?? true}
                        onChange={handleOnChangeActive}
                        size="lg"
                        labelOff="Inactiva"
                        labelOn="Activa"
                        iconActive={<Check />}
                        iconInactive={<X />}
                        color="var(--color-theme-primary)"
                    />
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
        </div>
    );
}

export default Step2;
