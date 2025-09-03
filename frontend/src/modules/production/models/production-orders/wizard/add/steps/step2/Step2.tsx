
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    CircleX,
    FileCheck,
    FileCheck2,
    Search
} from "lucide-react";
import FadeButton
    from "../../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import StyleModule
    from "./Step2.module.css";
import {
    back_step,
    next_step
} from "../../../../context/AddModalProductionOrderActions";
import {
    useAddModalProductionOrderDispatch,
    useAddModalProductionOrderState
} from "../../../../context/AddModalProductionOrderHooks";
import useProductInventoryInput
    from "../../../../../../../../modelos/locations/hooks/useProductInventoryInput";
import GenericTable from "../../../../../../../../components/ui/table/tableContext/GenericTable";
import type { IInventoryInput } from "../../../../../../../../interfaces/inventoryInputs";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo, useState } from "react";
import type { ILocation } from "../../../../../../../../interfaces/locations";
import type { IProduct } from "../../../../../../../../interfaces/product";
import useLocationsProducedOneProduct from "../../../../../../../../modelos/locations/hooks/useLocationsProducedOneProduct";
import SingleSelectSearchCheck from "../../../../../../../../components/ui/table/components/gui/diobar/prueba/SingleSelectSearchCheck";
import CustomSelectObject from "../../../../../../../../components/ui/table/components/gui/customSelectObject/CustomSelectObject";
import InputToggle from "../../../../../../../../components/ui/table/components/gui/inputss/inputToggle/InputToggle";
import {
    update_production_order,
} from "../../../../context/AddModalProductionOrderActions";
import CustomModal from "../../../../../../../../components/ui/modal/customModal/CustomModal";
import WarningIcon from "../../../../../../../../components/icons/WarningIcon";
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

const Step2 = () => {
    const dispatch = useAddModalProductionOrderDispatch();
    const state = useAddModalProductionOrderState();

    const [location, setLocation] =
        useState<ILocation | null>(state.data.location ?? null);

    const [selectedProduct, setSelectedProduct] =
        useState<IProduct | null>(state.data.product ?? null);
    const [openDropDownSelectProduct, setOpenDropDownSelectProduct] =
        useState(false);
    const [searchDropDownSelectProduct, setSearchDropDownSelectProduct] =
        useState(state.data.product?.name ?? "");
    const [selectedLocation, setSelectedLocation] =
        useState<ILocation | null | undefined>(state.data.location ?? null);
    const [quantity, setQuantity] =
        useState<number | undefined>(state.data.qty ?? undefined);
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
            // {
            //     header: "Equivalencia",
            //     cell: ({ row }) => {
            //         return row.original.equivalence;
            //     }
            // },
            {
                header: "Requerido",
                cell: ({ row }) => {
                    const qty = row.original.equivalence * (state.data.qty ?? 0);
                    return qty;
                }
            },
            {
                header: "Disponibilidad",
                cell: ({ row }) => {
                    const available = row.original.available;
                    let className = StyleModule.unavailable;

                    if (available >= (state.data?.qty ?? 0)) {
                        if ((available - (state.data?.qty ?? 0)) >= row.original.minimum_stock) {
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
        ], [[state.data.qty]
    ]);



    const {
        inventoryInputsProduct,
        loadingInventoryInputsProduct,
        refetchInventoryInputsProduct
    } = useProductInventoryInput(
        selectedProduct?.id ?? null,
        selectedLocation?.id ?? null
    );

    const {
        locationsProducedProduct,
        loadingLocationsProducedProduct,
        refetchLocationsProducedProduct
    } = useLocationsProducedOneProduct(selectedProduct?.id ?? null);

    const hadnleOnChangeProduct = (product: IProduct | null) => {
        if (product) {
            setSelectedProduct(product);
        } else {
            setSelectedProduct(null);
        }
    };

    const hadnleOnChangeQuantity = (value: number) => {
        console.log(value);
        if (value && Number(value) > 0) {
            dispatch(update_production_order({
                qty: value
            }))
            console.log(value);
        }
    };

    const handlerOnClickButtonNext = () => {
        // dispatch(next_step());
        const isFulfillable = inventoryInputsProduct.every(input => input.available >= ((state.data.qty ?? 0) * input.equivalence));
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
                body: JSON.stringify({ excludeIds: [selectedProduct?.id ?? 0] }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const products: IProduct[] = await response.json();
            return products;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    };

    const handlerOnClickButtonBack = () => {
        dispatch(back_step());
    }

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
                            {...(state.data.order_type === "client"
                                ? {
                                    options: state.data.purchase_order?.purchase_order_products
                                        ?.map(product => product.product)
                                        ?.filter((p): p is IProduct => p !== undefined) // <-- Aquí filtras undefined y aseguras el tipo
                                }
                                : { loadOptions: fetchProductsLike })}
                            selected={selectedProduct}
                            setSelected={hadnleOnChangeProduct}
                        />
                    )}
                    {!loadingLocationsProducedProduct && (
                        <CustomSelectObject
                            options={locationsProducedProduct}
                            labelKey="name"
                            defaultLabel="Selecciona una ubicacion"
                            autoOpen={false}
                            onChange={setSelectedLocation}
                            value={selectedLocation}
                            icon={<ChevronDown className={StyleModule.iconButton} />}

                        />
                    )}
                    {/* <StandarNumericField
                        value={quantity || ''}
                        onChange={hadnleOnChangeQuantity}
                        required
                        type="number"
                        placeholder="Ingrese la cantidad"
                        autoFocus
                        id="quantity"
                        name="quantity"

                    /> */}
                    <InputToggleMemorizado
                        value={state.data.qty}
                        onChange={hadnleOnChangeQuantity}
                    />
                </div>
                <div
                style={{
                backgroundColor: "#fff"    
                }}
                >
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
                        classNameGenericTableContainer={StyleModule.containerGenericTableContainer}
                    />
                </div>
            </section>
            <section className={StyleModule.footerSection}>
                <FadeButton
                    label="Cancelar"
                    onClick={() => { }}
                    type="button"
                    typeOrderIcon="first"
                    classNameButton={StyleModule.cancelButton}
                    classNameLabel={StyleModule.cancelButtonLabel}
                    classNameSpan={StyleModule.cancelButtonSpan}
                    icon={<CircleX className={StyleModule.cancelButtonIcon} />}
                />
                <FadeButton
                    label="Regresar"
                    onClick={handlerOnClickButtonBack}
                    type="button"
                    typeOrderIcon="first"
                    classNameButton={StyleModule.backButton}
                    classNameLabel={StyleModule.backButtonLabel}
                    classNameSpan={StyleModule.backButtonSpan}
                    icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
                />
                <FadeButton
                    label="Siguiente"
                    onClick={handlerOnClickButtonNext}
                    type="button"
                    typeOrderIcon="first"
                    classNameButton={StyleModule.nextButton}
                    classNameLabel={StyleModule.nextButtonLabel}
                    classNameSpan={StyleModule.nextButtonSpan}
                    icon={<ChevronRight className={StyleModule.nextButtonIcon} />}
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
                                <FadeButton
                                    label="Regresar"
                                    onClick={handlerOnClickButtonBackModal}
                                    type="button"
                                    typeOrderIcon="first"
                                    classNameButton={StyleModule.cancelButton}
                                    classNameLabel={StyleModule.cancelButtonLabel}
                                    classNameSpan={StyleModule.cancelButtonSpan}
                                    icon={<ChevronLeft className={StyleModule.cancelButtonIcon} />}
                                />
                                <FadeButton
                                    label="Continuar"
                                    onClick={handlerOnClickButtonContinue}
                                    type="button"
                                    typeOrderIcon="first"
                                    classNameButton={StyleModule.nextButton}
                                    classNameLabel={StyleModule.nextButtonLabel}
                                    classNameSpan={StyleModule.nextButtonSpan}
                                    icon={<FileCheck2 className={StyleModule.nextButtonIcon} />}
                                />
                            </div>
                        )}
                    />
                )
            }
        </div>
    );
};

export default Step2;
