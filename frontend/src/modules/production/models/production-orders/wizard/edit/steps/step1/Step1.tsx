import { ChevronDown, ChevronLeft, FileCheck2, Search } from "lucide-react";
import StyleModule from "./Step1.module.css";
import { next_step, remove_draft_attributes, set_draft_production_order, update_draft_production_order } from "../../../../context/AddModalProductionOrderActions";
import { useAddModalProductionOrderDispatch, useAddModalProductionOrderState } from "../../../../context/AddModalProductionOrderHooks";
import useProductInventoryInput from "../../../../../../../../modelos/locations/hooks/useProductInventoryInput";
import GenericTable from "../../../../../../../../components/ui/table/tableContext/GenericTable";
import type { IInventoryInput } from "../../../../../../../../interfaces/inventoryInputs";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { ILocation } from "../../../../../../../../interfaces/locations";
import type { IProduct } from "../../../../../../../../interfaces/product";
import useLocationsProducedOneProduct from "../../../../../../../../modelos/locations/hooks/useLocationsProducedOneProduct";
import SingleSelectSearchCheck from "../../../../../../../../components/ui/table/components/gui/diobar/prueba/SingleSelectSearchCheck";
import CustomSelectObject from "../../../../../../../../components/ui/table/components/gui/customSelectObject/CustomSelectObject";
import InputToggle from "../../../../../../../../components/ui/table/components/gui/inputss/inputToggle/InputToggle";
import { update_production_order } from "../../../../context/AddModalProductionOrderActions";
import CustomModal from "../../../../../../../../components/ui/modal/customModal/CustomModal";
import WarningIcon from "../../../../../../../../components/icons/WarningIcon";
import ValidationContainer from "../../../../../../../../components/ui/table/components/gui/validation-container/ValidationContainer";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/tertiary-action/TertiaryActionButtonCustom";

const InputToggleMemorizado = memo(
    ({
        value,
        onChange,
    }: {
        value: number | undefined;
        onChange: (value: number) => void;
    }) => {
        return (
            <InputToggle
                value={value}
                onChange={onChange}
                min={1}
                className={StyleModule.ContainerInputMemorizado}
                classNameInput={`nunito-semibold ${StyleModule.InputMemorizado}`}
            />
        );
    }
);


const Step1 = () => {
    const dispatch = useAddModalProductionOrderDispatch();
    const state = useAddModalProductionOrderState();

    const firstRender = useRef(true);

    const [openDropDownSelectProduct, setOpenDropDownSelectProduct] =
        useState(false);
    const [searchDropDownSelectProduct, setSearchDropDownSelectProduct] =
        useState(state.draft.product?.name ?? "");
    const [isActiveModalConfirmation, setIsActiveModalConfirmation] =
        useState<boolean>(false);

    const columnsInventoryInputs: ColumnDef<IInventoryInput>[] = useMemo(
        () => [
            {
                header: "SKU",
                accessorKey: "input_id",
            },
            {
                header: "Insumo",
                accessorKey: "input_name",
            },
            {
                header: "Requerido",
                cell: ({ row }) => {
                    const qty = row.original.equivalence * (state.draft.qty ?? 0);
                    return qty;
                }
            },
            {
                header: "Disponibilidad",
                cell: ({ row }) => {
                    const available = row.original.available;
                    let className = StyleModule.unavailable;

                    if (available >= (state.draft?.qty ?? 0)) {
                        if ((available - (state.draft?.qty ?? 0)) >= row.original.minimum_stock) {
                            className = StyleModule.highStock;
                        } else {
                            className = StyleModule.lowStock;
                        }
                    }
                    return (
                        <span className={`${StyleModule.baseAvailable} ${className}`}>
                            {available}
                        </span>
                    );
                }
            },
        ], [[state.draft.qty, state.draft.product?.id, state.draft.location?.id]
    ]);



    const {
        inventoryInputsProduct,
        loadingInventoryInputsProduct,
    } = useProductInventoryInput(
        state.draft.product?.id ?? null,
        state.draft.location?.id ?? null
    );

    const {
        locationsProducedProduct,
        loadingLocationsProducedProduct,
    } = useLocationsProducedOneProduct(state.draft.product?.id ?? null);

    const hadnleOnChangeProduct = (product: IProduct | null) => {
        if (product) {
            dispatch(update_draft_production_order({
                product: product,
                product_id: product.id,
            }))
        }
    };

    const hadnleOnChangeQuantity = (value: number) => {
        if (value && Number(value) > 0) {
            dispatch(update_draft_production_order({
                qty: value
            }))
        }
    };

    const handlerOnChangeLocation = (value: ILocation | null | undefined) => {
        if (value) {
            dispatch(update_draft_production_order({
                location: value,
            }))
        }
    };

    const handlerOnClickButtonNext = () => {
        const isFulfillable = inventoryInputsProduct.every(input => input.available >= ((state.draft.qty ?? 0) * input.equivalence));
        if (isFulfillable) {
            dispatch(next_step());
        } else {
            setIsActiveModalConfirmation(true);
        }
    };

    const handlerOnClickButtonContinue = () => {
        dispatch(next_step());
    };

    const handlerOnClickButtonBackModal = () => {
        setIsActiveModalConfirmation(false);
    };

    const fetchProductsLike = async (query: string): Promise<IProduct[]> => {
        if (!query || query.trim().length === 0) return [];

        const encodedQuery = encodeURIComponent(query);

        try {
            const response = await fetch(`http://localhost:3003/products/products/filter-exclude/${encodedQuery}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ excludeIds: [state.draft.product?.id ?? 0] }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const products: IProduct[] = await response.json();
            return products;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    };

    const handlerOnClickButtonCancel = () => {
        dispatch(set_draft_production_order(state.data));
        dispatch(next_step());
    }

    function useWhatChanged(deps: any[], depNames: string[]) {
        // Referencia para guardar el valor anterior de las dependencias
        const prevDeps = useRef<any[]>([]);

        useEffect(() => {
            // Array para registrar los nombres de dependencias que cambiaron
            const changes: string[] = [];

            // Recorre cada dependencia y compara valor previo vs actual
            deps.forEach((dep, idx) => {
                // Si el valor previo es diferente al actual, marca que cambió
                if (prevDeps.current[idx] !== dep) {
                    changes.push(depNames[idx]);
                }
            });

            if (firstRender.current) {
                firstRender.current = false;
            } else {
                if (changes.length > 0) {
                    // if (changes.includes('product')) {
                    //     if (state.draft.order_type === "client" && state.draft.purchase_order) {
                    //         dispatch(update_production_order({
                    //             order_id: state.draft.purchase_order.purchase_order_products?.find(
                    //                 (p) => p.product?.id === state.draft.product?.id
                    //             )?.id,
                    //         }))
                    //     }
                    //     if (state.draft.location) {
                    //         dispatch(remove_draft_attributes(['location']));
                    //     }
                    // }
                    if (changes.includes('location')) {
                        dispatch(remove_draft_attributes(['production_line']));
                    }
                }
            }
            // Actualiza los valores previos para la próxima comparación
            prevDeps.current = deps;
            // Nota: así, en el próximo render, prevDeps tendrá los valores actuales
        }, deps); // El efecto se ejecuta cada vez que cambia cualquiera de las dependencias
    }

    useWhatChanged([state.draft.product, state.draft.location], ['product', 'location']);

    return (
        <div className={StyleModule.container}>
            <section className={StyleModule.headerSection}>
                <h2 className="nunito-bold">Información del producto</h2>
            </section>
            <section className={StyleModule.bodySection}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {!loadingLocationsProducedProduct && (
                        <ValidationContainer validation={state.draft.product ? null : "Debe seleccionar un producto"}>
                            <SingleSelectSearchCheck<IProduct>
                                rowId="name"
                                search={searchDropDownSelectProduct}
                                setSearch={setSearchDropDownSelectProduct}
                                open={openDropDownSelectProduct}
                                setOpen={setOpenDropDownSelectProduct}
                                emptyMessage="No hay productos"
                                icon={<Search className={StyleModule.iconButton} />}
                                placeholder="Seleccione un producto..."
                                classNameDropDownSelectItemInput={StyleModule.selectSearchMultiCheckDropDownSelectItemInput}
                                classNameContainer={StyleModule.selectSearchMultiCheckContainer}
                                classNameInputContainer={StyleModule.selectSearchMultiCheckInputContainer}
                                classNameDropDown={StyleModule.selectSearchMultiCheckDropDown}
                                classNameDropDownSelect={StyleModule.selectSearchMultiCheckDropDownSelect}
                                classNameButtonInput={StyleModule.selectSearchMultiCheckButtonInput}
                                classNameInput={`nunito-semibold ${StyleModule.selectSearchMultiCheckInput}`}
                                classNameDropDownSelectItemSelected={`nunito-semibold ${StyleModule.selectSearchMultiCheckDropDownSelectItemSelected}`}
                                classNameDropDownSearch={StyleModule.selectSearchMultiCheckDropDownSearch}
                                classNameDropDownSearchItem={`nunito-semibold ${StyleModule.selectSearchMultiCheckDropDownSearchItem}`}
                                classNameSeparator={StyleModule.selectSearchMultiCheckSeparator}
                                classNameDropDownHeader={`nunito-bold ${StyleModule.selectSearchMultiCheckDropDownHeader}`}
                                classNameEmptyMessage={`nunito-semibold ${StyleModule.selectSearchMultiCheckEmptyMessage}`}
                                {...(state.draft.order_type === "client"
                                    ? {
                                        options: state.draft.purchase_order?.purchase_order_products
                                            ?.map(product => product.product)
                                            ?.filter((p): p is IProduct => p !== undefined) // <-- Aquí filtras undefined y aseguras el tipo
                                    }
                                    : { loadOptions: fetchProductsLike })}
                                selected={state.draft.product ? state.draft.product : null}
                                setSelected={hadnleOnChangeProduct}
                                disabled
                            />
                        </ValidationContainer>
                    )}
                    {!loadingLocationsProducedProduct && (
                        <ValidationContainer validation={state.draft.location ? null : "Debe seleccionar una ubicacion"}>
                            <CustomSelectObject
                                options={locationsProducedProduct}
                                labelKey="name"
                                defaultLabel="Selecciona una ubicacion"
                                autoOpen={false}
                                onChange={handlerOnChangeLocation}
                                value={state.draft.location}
                                icon={<ChevronDown className={StyleModule.iconButton} />}
                                classNameFieldContainer={StyleModule.customSelectFieldContainer}
                                classNameToggleContainer={StyleModule.customSelectToggleContainer}
                                classNameOption={StyleModule.customSelectOption}

                            />
                        </ValidationContainer>
                    )}
                    <ValidationContainer validation={state.draft.qty && state.draft.qty > 0 ? null : "Debe ingresar una cantidad valida"}>
                        <InputToggleMemorizado
                            value={Number(Number(state.draft.qty).toFixed(0))}
                            onChange={hadnleOnChangeQuantity}
                        />
                    </ValidationContainer>
                </div>
                {!loadingInventoryInputsProduct && state.draft.product && state.draft.location && (
                    <div className={StyleModule.externalContainerGenericTable}>
                        <GenericTable
                            modelName="InventoryInputs"
                            columns={columnsInventoryInputs}
                            data={inventoryInputsProduct}
                            onDeleteSelected={() => console.log("Delete selected")}
                            getRowId={i => i.input_id.toString()}
                            enableFilters={false}
                            enablePagination={false}
                            enableRowSelection={false}
                            enableOptionsColumn={false}
                            enableSorting={false}
                            enableViews={false}
                            enableRowEditClick={false}
                            typeRowActions="icon"
                            noResultsMessage="El producto no requiere de insumos"
                            classNameGenericTableContainer={StyleModule.containerGenericTableContainer}
                        />
                    </div>
                )}
            </section>
            <section className={StyleModule.footerSection}>
                <CriticalActionButton
                    onClick={handlerOnClickButtonCancel}
                    label="Cancelar"
                />
                <MainActionButtonCustom
                    onClick={handlerOnClickButtonNext}
                    label="Continuar"
                    icon={<FileCheck2 />}
                />
            </section>
            {
                isActiveModalConfirmation && (
                    <CustomModal
                        onClose={() => setIsActiveModalConfirmation(false)}
                        title="Esta planta no cuenta con los insumos suficientes para la orden de producción. ¿Seguro que desea continuar?"
                        icon={<WarningIcon className={StyleModule.iconButtonModal} />}
                        message="Esta acción puede ocasionar conflictos"

                        children={() => (
                            <div className={StyleModule.containerModalButtons}>
                                <TertiaryActionButtonCustom
                                    onClick={handlerOnClickButtonBackModal}
                                    label="Regresar"
                                    icon={<ChevronLeft />}
                                />
                                <MainActionButtonCustom
                                    onClick={handlerOnClickButtonContinue}
                                    label="Continuar"
                                    icon={<FileCheck2 />}
                                />
                            </div>
                        )}
                    />
                )
            }
        </div>
    );
};

export default Step1;
