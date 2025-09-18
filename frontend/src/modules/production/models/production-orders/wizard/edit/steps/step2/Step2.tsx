
import { Calendar, ChevronDown, Pencil, Search } from "lucide-react";
import StyleModule from "./Step2.module.css";
import { useAddModalProductionOrderDispatch, useAddModalProductionOrderState } from "../../../../context/AddModalProductionOrderHooks";
import { back_step, next_step, update_draft_production_order, remove_draft_attributes, update_production_order, set_production_order } from "../../../../context/AddModalProductionOrderActions";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialProductionOrder } from "../../../../../../../../interfaces/productionOrder";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import GenericTable from "../../../../../../../../components/ui/table/tableContext/GenericTable";
// import type { IProduct } from "../../../../../../../../interfaces/product";
import type { ILocation } from "../../../../../../../../interfaces/locations";
import type { IProductionLine } from "../../../../../../../../interfaces/productionLines";
// import SingleSelectSearchCheckFloating from "../../../../../../../../components/ui/table/components/gui/diobar/prueba/SingleSelectSearchCheckFloating";
import useLocationsProducedOneProduct from "../../../../../../../../modelos/locations/hooks/useLocationsProducedOneProduct";
import CustomSelectObject from "../../../../../../../../components/ui/table/components/gui/customSelectObject/CustomSelectObject";
import InputToggle from "../../../../../../../../components/ui/table/components/gui/inputss/inputToggle/InputToggle";
import useProductionLinesForProductAtLocation from "../../../../../../../../modelos/locations/hooks/useProductionLinesForProductAtLocation";
import ReactDayPickerField from "../../../../../../../../components/ui/general/field-react-day-picker/ReactDayPickerField";
import StandardTextArea from "../../../../../../../../components/ui/table/components/gui/text-area/StandarTextArea";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../../../../store/store";
import CriticalActionButton from "../../../../../../../../components/ui/table/components/gui/button/custom-button/critical-action/CriticalActionButton";
import TertiaryActionButtonCustom from "../../../../../../../../components/ui/table/components/gui/button/custom-button/tertiary-action/TertiaryActionButtonCustom";

interface IStep2Props {
    onUpdate: (data: IPartialProductionOrder) => void;
}

const Step2 = ({
    onUpdate,
}: IStep2Props) => {

    const validationError =
        useSelector((state: RootState) => state.error);

    const dispatch =
        useAddModalProductionOrderDispatch();
    const state =
        useAddModalProductionOrderState();

    const firstRender = useRef(true);

    const [showModalConfirm, setShowModalConfirm] =
        useState(false);

    const [deliveryDate, setDeliveryDate] =
        useState<Date | undefined>(new Date());

    // const handlerOnChangeSelectedProduct = (
    //     product: IProduct | null) => {
    //     if (product) {
    //         dispatch(update_draft_production_order({
    //             product: product,
    //             product_id: product.id,
    //         }))
    //     }
    // }
    const handlerOnChangeSelectedLocation = (
        location: ILocation | null | undefined) => {
        if (location) {
            console.log("location", location);
            dispatch(update_draft_production_order({
                location: location,
            }))
        }
    }
    const handlerOnChangeSelectedProductionLine = (
        productionLine: IProductionLine | null | undefined) => {
        if (productionLine) {
            dispatch(update_draft_production_order({
                production_line: productionLine,
            }))
        }
    }

    const handlerOnChangeQuantity = (quantity: number) => {
        dispatch(update_draft_production_order({
            qty: quantity,
        }))
    }

    // const SingleSelectSearchCheckFloatingMemoized = memo(function ItemTable({
    //     options,
    //     loadOptions,
    //     selected,
    //     setSelected,
    //     initialSearch = "",
    // }: {
    //     options?: IProduct[];
    //     loadOptions?: (q: string) => Promise<IProduct[]>;
    //     selected: IProduct | null;
    //     setSelected: (p: IProduct | null) => void;
    //     initialSearch?: string;
    // }) {
    //     const [search, setSearch] = useState(initialSearch);
    //     const [open, setOpen] = useState(false);

    //     return (
    //         <SingleSelectSearchCheckFloating<IProduct>
    //             rowId="name"
    //             search={search}
    //             setSearch={setSearch}
    //             open={open}
    //             setOpen={setOpen}
    //             emptyMessage="No hay productos"
    //             icon={<Search className={StyleModule.iconButton} />}
    //             placeholder="Seleccione un producto..."
    //             classNameDropDownSelectItemInput={StyleModule.selectSearchMultiCheckDropDownSelectItemInput}
    //             classNameContainer={StyleModule.selectSearchMultiCheckContainer}
    //             classNameInputContainer={StyleModule.selectSearchMultiCheckInputContainer}
    //             classNameDropDown={StyleModule.selectSearchMultiCheckDropDown}
    //             classNameDropDownSelect={StyleModule.selectSearchMultiCheckDropDownSelect}
    //             classNameButtonInput={StyleModule.selectSearchMultiCheckButtonInput}
    //             classNameInput={`nunito-semibold ${StyleModule.selectSearchMultiCheckInput}`}
    //             classNameDropDownSelectItemSelected={`nunito-semibold ${StyleModule.selectSearchMultiCheckDropDownSelectItemSelected}`}
    //             classNameDropDownSearch={StyleModule.selectSearchMultiCheckDropDownSearch}
    //             classNameDropDownSearchItem={`nunito-semibold ${StyleModule.selectSearchMultiCheckDropDownSearchItem}`}
    //             classNameSeparator={StyleModule.selectSearchMultiCheckSeparator}
    //             classNameDropDownHeader={`nunito-bold ${StyleModule.selectSearchMultiCheckDropDownHeader}`}
    //             classNameEmptyMessage={`nunito-semibold ${StyleModule.selectSearchMultiCheckEmptyMessage}`}
    //             {...(options ? { options } : { loadOptions })}
    //             selected={selected}
    //             setSelected={setSelected}
    //         />
    //     );
    // });

    const CustomSelectObjectLocationMemoized = memo(function ItemTable({
        selected,
        setSelected,
    }: {
        selected: ILocation | null;
        setSelected: (l: ILocation | null | undefined) => void;
    }) {
        const {
            locationsProducedProduct,
            loadingLocationsProducedProduct,
        } = useLocationsProducedOneProduct(state.draft.product?.id ?? null);

        return (
            <div className={StyleModule.externalContainerCustomSelectObject}>
                {
                    !loadingLocationsProducedProduct && <CustomSelectObject
                        options={locationsProducedProduct}
                        labelKey="name"
                        defaultLabel="Selecciona una ubicacion"
                        autoOpen={false}
                        onChange={setSelected}
                        value={selected}
                        icon={<ChevronDown className={StyleModule.iconButton} />}
                        classNameFieldContainer={StyleModule.customSelectFieldContainer}
                        classNameToggleContainer={StyleModule.customSelectToggleContainer}
                        classNameOption={StyleModule.customSelectOption}
                    />
                }
            </div>
        );
    });

    const CustomSelectObjectProductionLineMemoized = memo(function ItemTable({
        selected,
        setSelected,
    }: {
        selected: IProductionLine | null;
        setSelected: (l: IProductionLine | null | undefined) => void;
    }) {
        const {
            productionLinesForProductAtLocation,
            loadingProductionLinesForProductAtLocation,
        } = useProductionLinesForProductAtLocation(
            state.draft.product?.id ?? null,
            state.draft.location?.id ?? null
        );

        return (
            <div className={StyleModule.externalContainerCustomSelectObject}>
                {
                    !loadingProductionLinesForProductAtLocation && <CustomSelectObject
                        options={productionLinesForProductAtLocation}
                        labelKey="name"
                        defaultLabel="Selecciona una linea de produccion"
                        autoOpen={false}
                        onChange={setSelected}
                        value={selected}
                        icon={<ChevronDown className={StyleModule.iconButton} />}
                        classNameFieldContainer={StyleModule.customSelectFieldContainer}
                        classNameToggleContainer={StyleModule.customSelectToggleContainer}
                        classNameOption={StyleModule.customSelectOption}
                    />
                }
            </div>
        );
    });

    const InputToggleMemoized = memo(
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
                    onlyCommitOnBlur={true}
                    className={StyleModule.ContainerInputMemorizado}
                    classNameInput={`nunito-semibold ${StyleModule.InputMemorizado}`}
                />
            );
        }
    );

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
                    if (changes.includes('location')) {
                        
                        dispatch(remove_draft_attributes(['production_line']));
                        dispatch(back_step());
                    }
                    if (changes.includes('product')) {
                        if (state.draft.order_type === "client" && state.draft.purchase_order) {
                            dispatch(update_production_order({
                                order_id: state.draft.purchase_order.purchase_order_products?.find(
                                    (p) => p.product?.id === state.draft.product?.id
                                )?.id,
                            }))
                        }
                        if (state.draft.location) {
                            dispatch(remove_draft_attributes(['location']));
                        }
                        dispatch(back_step());
                    }
                    if (changes.includes('qty')) {
                        dispatch(back_step());
                    }
                }
            }
            // Actualiza los valores previos para la próxima comparación
            prevDeps.current = deps;
            // Nota: así, en el próximo render, prevDeps tendrá los valores actuales
        }, deps); // El efecto se ejecuta cada vez que cambia cualquiera de las dependencias
    }

    useWhatChanged([state.draft.location, state.draft.product, state.draft.qty], ['location', 'product', 'qty']);

    const columnsPartialProductionOrder: ColumnDef<IPartialProductionOrder>[] = useMemo(
        () => [
            {
                header: "SKU",
                accessorFn: (row) => row.product?.sku,
            },
            {
                header: "Producto",
                cell: ({ row }) => {
                    // const typeOrder = state.draft.order_type;
                    return (
                        // <SingleSelectSearchCheckFloatingMemoized
                        //     {...(typeOrder === 'client' && { options: state.draft.purchase_order?.purchase_order_products?.map((p) => p.product as IProduct) })}
                        //     selected={state.draft.product ?? null}
                        //     {...(typeOrder === 'internal' && { loadOptions: fetchProductsLike })}
                        //     loadOptions={fetchProductsLike}
                        //     setSelected={handlerOnChangeSelectedProduct}
                        //     initialSearch={row.original.product?.name ?? ""}
                        // />
                        <p>{row.original.product?.name}</p>
                    )
                }
            },
            {
                header: "Cantidad",
                cell: ({ row }) => {
                    const qty = row.original.qty;
                    return (
                        <InputToggleMemoized
                            value={Number(Number(qty)?.toFixed(0))}
                            onChange={handlerOnChangeQuantity}
                        />
                    )
                }
            },
            {
                header: "Planta de produccion",
                cell: () => {
                    return (
                        <CustomSelectObjectLocationMemoized
                            selected={state.draft.location ?? null}
                            setSelected={handlerOnChangeSelectedLocation}
                        />
                    )
                }
            },
            {
                header: "Linea de produccion",
                cell: () => {
                    return (
                        <CustomSelectObjectProductionLineMemoized
                            selected={state.draft.production_line ?? null}
                            setSelected={handlerOnChangeSelectedProductionLine}
                        />
                    )
                }
            },
            {
                header: "Entrega estimada",
                cell: () => {
                    return <ReactDayPickerField
                        icon={<Calendar className={StyleModule.iconDayPickerField} />}
                        value={deliveryDate}
                        onChange={setDeliveryDate}
                        classNameContainer={StyleModule.containerMainDayPickerFieldDeliver}
                        classNameField={StyleModule.containerFieldDayPickerFieldDeliver}
                        classNameLabel={
                            false
                                ? StyleModule.labelDayPickerFieldDeliverValidate
                                : StyleModule.labelDayPickerFieldDeliver
                        }
                        classNameInput={
                            false
                                ? `nunito-semibold ${StyleModule.inputDayPickerFieldDeliverValidate}`
                                : `nunito-semibold ${StyleModule.inputDayPickerFieldDeliver}`
                        }
                        classNameButton={StyleModule.buttonDayPickerFieldDeliver}
                        classNameDayPicker={`nunito-semibold ${StyleModule.dayPicker}`}
                        classNamePopover={StyleModule.containerPopoverDayPickerField}
                    />;
                },
            },
        ], [[]]
    );

    // const fetchProductsLike = async (query: string): Promise<IProduct[]> => {
    //     if (!query || query.trim().length === 0) return [];

    //     const encodedQuery = encodeURIComponent(query);

    //     try {
    //         const response = await fetch(`http://localhost:3003/products/products/filter-exclude/${encodedQuery}`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ excludeIds: [state.draft.product?.id ?? 0] }),
    //         });

    //         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    //         const products: IProduct[] = await response.json();
    //         return products;
    //     } catch (error) {
    //         console.error("Error fetching products:", error);
    //         return [];
    //     }
    // };

    const handleToggleModalConfirm = () => {
        if (
            state.draft.product && state.draft.location &&
            state.draft.production_line && state.draft.qty && deliveryDate
        ) {
            console.log
            onUpdate(state.draft);
            if (!(Object.keys(validationError).length > 0)) {
                // setShowModalConfirm(!showModalConfirm);
                dispatch(set_production_order(state.draft));
                dispatch(next_step());
            }
        }
    }


    const handlerOnClickButtonCancel = () => {
        dispatch(next_step());
    }

    return (
        <div className={StyleModule.container}>
            <section className={StyleModule.headerSection}>
                <h1 className='nunito-semibold'>Order 123</h1>
                <span className={StyleModule.containerDate}>
                    <p className='nunito-semibold'>Fecha de orden: </p>
                    <p className='nunito-semibold'>{new Date().toLocaleDateString()}</p>
                </span>
            </section>
            <section className={StyleModule.bodySection}>
                <div className={StyleModule.externalContainerGenericTable}>
                    <GenericTable
                        modelName="InventoryInputs"
                        columns={columnsPartialProductionOrder}
                        data={[{ ...state.draft }]}
                        onDeleteSelected={() => console.log("Delete selected")}
                        getRowId={(_, idx) => `row-${idx}`}
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
                <div className={StyleModule.containerTextArea}>
                    <StandardTextArea
                        ComponentLabel={({
                            id
                        }: { id: string }) => (
                            <label
                                className={StyleModule.labelTextArea} htmlFor={id}>
                                <p className='nunito-bold'>{`Comentarios`}</p>
                                <p className='nunito-semibold'>{`(Opcional):`}</p>
                            </label>
                        )}
                        classNameContainer={StyleModule.containerTextArea}
                        classNameTextArea={`nunito-regular ${StyleModule.textArea}`}
                        id="notes"
                        placeholder="comentarios"
                        maxLength={1000}
                    />
                </div>
            </section>
            <section className={StyleModule.footerSection}>
                <CriticalActionButton
                    onClick={handlerOnClickButtonCancel}
                    label="Cancelar"
                />
                <TertiaryActionButtonCustom
                    onClick={handleToggleModalConfirm}
                    label="Guardar"
                    icon={<Pencil />}
                />
            </section>
        </div>
    );
};

export default Step2;
