import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useModalEditDispatch, useModalEditState } from "../../context/modalEditHooks";
import {
    update_purchase_order,
    back_step, set_step,
    remove_purchase_order_products,
    set_purchase_order_products_qty,
    set_purchase_order_products_price,
    set_purchase_order_products_price_manual,
    add_purchase_order_products, update_sync_data
} from "../../context/modalEditActions";
import {
    Plus, Pencil,
    Calendar, FileCheck2,
    Trash2, RefreshCcwDot,
    Check
} from "lucide-react";
import type {
    IPartialPurchasedOrder
} from "../../../../../../../interfaces/purchasedOrder";
import styleModule
    from "./Step3.module.css"
import ReactDayPickerField
    from "../../../../../../../components/ui/general/field-react-day-picker/ReactDayPickerField";
import type {
    ColumnDef,
    Table
} from "@tanstack/react-table";
import type {
    IPartialPurchasedOrderProduct,
} from "../../../../../../../interfaces/purchasedOrdersProducts";
import type {
    RowAction
} from "../../../../../../../components/ui/table/types";
import DeleteModal
    from "../../../../../../../comp/primitives/modal/deleteModal/DeleteModal";
import InputToggle
    from "../../../../../../../components/ui/table/components/gui/inputss/inputToggle/InputToggle";
import InputConditionalIcon
    from "../../../../../../../components/ui/table/components/gui/inputss/inputConditionalIcon/InputConditionalIcon";
import DiscountIcon
    from "../../../../../../../components/icons/Discount";
import {
    formatCurrency
} from "../../../../../../../helpers/formttersNumeric";
import {
    formatDateTimeForMySQL,
    isValidDate
} from "../../../../../../../utils/fomatted_data_mysql/formtated_date_mysql";
import CustomModal from "../../../../../../../comp/primitives/modal/customModal/CustomModal";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import SelectObjectsModalMemo from "../../../../../../../comp/features/modal-product2/SelectProductsModal";
import type { IPartialProduct, IProduct } from "../../../../../../../interfaces/product";
import { clearError, setError } from "../../../../../../../store/slicer/errorSlicer";
import { type AppDispatchRedux } from "../../../../../../../store/store";
import { useDispatch } from "react-redux";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RELATIVE_PATH = "products/products/exclude/";
const API_URL = new URL(RELATIVE_PATH, API_BASE_URL);



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
                className={styleModule.ContainerInputMemorizado}
                classNameInput={`nunito-semibold ${styleModule.InputMemorizado}`}
            />
        );
    }
);


const InputConditionalIconMemorizado = memo(
    ({
        value,
        onChange,
        onClickIconDefault,
        onClickIconConditional,
        isConditional
    }: {
        value: number | undefined;
        onChange: (value: number) => void;
        onClickIconDefault?: () => void;
        onClickIconConditional?: () => void;
        isConditional: boolean | null;
    }) => {
        return (
            <InputConditionalIcon
                value={value}
                onChange={onChange}
                min={1}
                isConditional={isConditional}
                iconConditional={<RefreshCcwDot className={styleModule.iconConditional} />}
                iconDefault={<DiscountIcon className={styleModule.iconDefault} />}
                onClickIconDefault={onClickIconDefault}
                onClickIconConditional={onClickIconConditional}
            />
        );
    }
);

interface Step3Props {
    onEdit: (updateRecord: IPartialPurchasedOrder) => void;
    refetch: () => void;
}



interface Validation {
    dateCreation?: string;
    dateDeliver?: string;
    purchaseOrderProducts?: IPartialPurchasedOrderProduct[];
}

const Step3 = ({
    onEdit, refetch
}: Step3Props) => {


    // * ************ Hooks para el contexto ************/

    const dispatch = useModalEditDispatch();
    const state = useModalEditState();
    const dispatchRedux = useDispatch<AppDispatchRedux>();


    // * ************ COLUMNS Y COMPONENTE A RENDERIZAR ************/

    // Este hook debe estar fuera del render de columnas


    const handleChangeQty = useCallback(
        (id: number, value: number) => {
            dispatch(set_purchase_order_products_qty({
                id,
                qty: value
            }));
        },
        [dispatch]
    );

    const getRowId = useCallback((row: IPartialPurchasedOrderProduct, index: number) => row?.product_id?.toString() ?? index.toString(), []);
    const getRowAttr = useMemo(() => (data: IProduct) => data.name, []);


    const handleChangeRecordedPrice = useCallback(
        (id: number, value: number) => {
            dispatch(set_purchase_order_products_price({
                id,
                recorded_price: value,
            }));
        },
        [dispatch]
    );

    const columns: ColumnDef<IPartialPurchasedOrderProduct>[] = useMemo(
        () => [
            {
                accessorFn: (row) => row.product?.custom_id,
                header: "ID",
            },
            {
                accessorFn: (row) => row.product?.name,
                header: "Producto",
            },
            {
                accessorFn: (row) => row.recorded_price,
                header: "Precio unitario",
                cell: ({ row }) => {
                    console.log('row', row.original);
                    const productId = row.original.product?.id;
                    const recorded_price = Number(
                        row.original.recorded_price
                        ?? row.original.product?.sale_price ?? 0
                    );

                    console.log('dasds', recorded_price)

                    const onChangeRecordedPrice = (value: number) => {
                        handleChangeRecordedPrice(
                            productId ?? 0,
                            value,
                        );
                    };

                    const onClickIconDefault = () => {
                        dispatch(set_purchase_order_products_price_manual({
                            id: productId ?? 0,
                            was_price_edited_manually: null
                        }));
                    };

                    const onClickIconConditional = () => {
                        dispatch(set_purchase_order_products_price_manual({
                            id: productId ?? 0,
                            was_price_edited_manually: null
                        }));
                    };

                    return (
                        <div className={styleModule.containerPrice}>
                            <InputConditionalIconMemorizado
                                isConditional={row.original.was_price_edited_manually ?? null}
                                value={Number(recorded_price.toFixed(2))}
                                onChange={onChangeRecordedPrice}
                                onClickIconDefault={onClickIconDefault}
                                onClickIconConditional={onClickIconConditional}
                            />
                        </div>
                    );
                }
            },
            {
                accessorFn: (row) => row.qty,
                header: "Cantidad",
                cell: ({ row }) => {
                    const productId = row.original.product?.id;
                    const qty = row.original.qty ?? 0;

                    const onChangeQty = (value: number) => {
                        handleChangeQty(productId ?? 0, value);
                    };

                    return (
                        <div>

                            <InputToggleMemoized
                                value={qty}
                                onChange={onChangeQty}
                            />
                        </div>
                    );
                }
            },
            {
                accessorFn: (row) => row.product?.summary_location?.available,
                header: "Disponibilidad",
                cell: ({ row }) => {
                    const available = row.original.product?.summary_location?.available ?? 0;
                    const minStock = row.original.product?.summary_location?.minimum_stock ?? 0;
                    const qty = row.original.qty ?? 0;

                    let className = styleModule.unavailable;

                    if (available >= qty) {
                        if ((available - qty) >= minStock) {
                            className = styleModule.highStock;
                        } else {
                            className = styleModule.lowStock;
                        }
                    }

                    return (
                        <span className={`${styleModule.baseAvailable} ${className}`}>
                            {available}
                        </span>
                    );
                }
            },
            {
                id: "price",
                header: "Total",
                cell: ({ row }) => {
                    const recorded_price = row.original.recorded_price ?? row.original.product?.sale_price ?? 0;
                    const qty = row.original.qty ?? 0;
                    const total = (qty * recorded_price);
                    return formatCurrency(Number(total.toFixed(2)));
                }
            }
        ],
        [handleChangeQty, dispatch, handleChangeRecordedPrice]
    );

    const handleOnClickCancelButton = () => {
        dispatch(set_step(3));
    }

    // * ************ Estados ************/

    // const [selectedAddress, setSelectedAddress] = useState<IClientAddress | null>(addresses.find(
    //     (address) =>
    //         address.id === state.data.client_address_id)
    //     || null
    // );

    const [dateDeliver, setDateDeliver] =
        useState<Date | undefined>(undefined);
    const [dateCreation, setDateCreation] =
        useState<Date | undefined>(new Date());
    const [selectedProduct, setSelectedProduct] =
        useState<IPartialPurchasedOrderProduct | null>(null);
    const [validation, setValidation] =
        useState<Validation>({ dateDeliver: "Fecha invalida" });
    const [isAddProductModalActive, setIsAddProductModalActive] =
        useState<boolean>(false);
    const [isDeleteProductModalActive, setIsDeleteProductModalActive] =
        useState<boolean>(false);

    const [isActiveConfirmModal, setIsActiveConfirmModal] =
        useState<boolean>(false);

    // * ************ Funciones ************/

    const toggleActiveAddProductModal = useCallback(() => {
        setIsAddProductModalActive((prev) => !prev);
    }, [])

    const toggleConfirmModal = useCallback(() => {
        setIsActiveConfirmModal((prev) => !prev);
    }, [])

    const handleOnClickActiveDeleteProductModal = useCallback((
        product: IPartialPurchasedOrderProduct
    ) => {
        setSelectedProduct(product);
        setIsDeleteProductModalActive(true);
    }, [])

    const fetchSyntheticRemoveProduct = useCallback(() => {
        if (!selectedProduct) return;
        dispatch(remove_purchase_order_products(selectedProduct));
        setIsDeleteProductModalActive(false);
        setSelectedProduct(null);
    }, [selectedProduct, dispatch]);


    const validateField = useCallback((
        key: string,
        value: Date | string | undefined
    ): string | undefined => {
        if (!value && key === "dateCreation") {
            return "Fecha invalida";
        }

        if (!value && key === "dateDeliver") {
            return "Fecha invalida";
        }
        return undefined;
    }, []);

    const handleOnChangeDateCreation = useCallback((
        date: Date | undefined
    ) => {
        if (!(date)) {
            setDateCreation(undefined);
            const validationDateCreation =
                validateField("dateCreation", undefined);
            setValidation((prev) => ({
                ...prev,
                dateCreation: validationDateCreation
            }));
            return;
        } else {
            const validationDateCreation =
                validateField("dateCreation", date);
            setValidation((prev) => ({
                ...prev,
                dateCreation: validationDateCreation
            }));
            setDateCreation(date);
        }
    }, [validateField])

    const handleOnChangeDateDeliver = useCallback((
        date: Date | undefined
    ) => {
        if (!date) {
            setDateDeliver(undefined);
            const validationDateDeliver =
                validateField("dateDeliver", undefined);
            setValidation((prev) => ({
                ...prev,
                dateDeliver: validationDateDeliver
            }));
            return;
        } else {
            const validationDateDeliver =
                validateField("dateDeliver", date);
            setValidation((prev) => ({
                ...prev,
                dateDeliver: validationDateDeliver
            }));
            setDateDeliver(date);
        }
    }, [validateField])

    const excludeIds = useMemo<number[]>(() => state.updated?.purchase_order_products?.map(p => p.product_id as number) ?? [], [state.updated?.purchase_order_products]);


    const handleOnClickAdd = useCallback((products: IPartialProduct[]) => {
        const pops: IPartialPurchasedOrderProduct[] = products.map((p): IPartialPurchasedOrderProduct => ({
            product: p,
            product_id: p.id,
            original_price: p.sale_price,
            product_name: p.name,
        }))
        dispatch(add_purchase_order_products(pops));
        setIsAddProductModalActive(prev => !prev);
    }, [dispatch]);


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
                const updated: IProduct[] = await response.json();
                return updated;
            } catch (error) {
                // Si fue aborto, simplemente ignora o retorna []
                if ((error as any)?.name === "AbortError") return [];
                console.error("Error fetching products:", error);
                return [];
            }
        },
        [dispatchRedux, excludeIds] // elimina deps que no se usan
    );


    const handleOnClickNextStep = useCallback(async () => {
        if (
            dateCreation
            && dateDeliver
            && isValidDate(dateCreation.toISOString().slice(0, 10))
            && isValidDate(dateDeliver.toISOString().slice(0, 10))
            && state?.updated?.purchase_order_products
            && state.updated.purchase_order_products.length > 0
        ) {
            const currentState = state.updated;
            const purchasedOrder: IPartialPurchasedOrder = {
                created_at: formatDateTimeForMySQL(dateCreation),
                delivery_date: formatDateTimeForMySQL(dateDeliver),
            }
            dispatch(update_purchase_order(purchasedOrder));
            console.log({
                ...currentState,
                created_at: formatDateTimeForMySQL(dateCreation),
                delivery_date: formatDateTimeForMySQL(dateDeliver),
            })

            console.log("create", {
                ...currentState,
                created_at: formatDateTimeForMySQL(dateCreation),
                delivery_date: formatDateTimeForMySQL(dateDeliver),
            });



            await onEdit({
                ...currentState,
                created_at: formatDateTimeForMySQL(dateCreation),
                delivery_date: formatDateTimeForMySQL(dateDeliver),
            });
            dispatch(update_sync_data({
                ...currentState,
                created_at: formatDateTimeForMySQL(dateCreation),
                delivery_date: formatDateTimeForMySQL(dateDeliver),
            }));
            toggleConfirmModal();
        } else {
            ToastMantine.feedBackForm({
                message: "Debes completar todos los campos"
            })
        }
    }, [dateCreation, dateDeliver, dispatch, onEdit, state.updated, toggleConfirmModal]);

    const handleOnClickBack = useCallback(() => {
        dispatch(back_step());
    }, [dispatch])

    const handleOnClickEditClient = useCallback(() => {
        dispatch(set_step(1));
    }, [dispatch])

    const handleOnClickEditAddress = useCallback(() => {
        dispatch(set_step(2));
    }, [dispatch])

    const handleOnClickCloseConfirmModal = () => {
        refetch();
        setIsActiveConfirmModal(false);
        dispatch(set_step(4));
    }
    // * ************ Componentes extra para inyectar como props en el GenericTable ************/


    // * ************ Funciones para control de acciones de la tabla ************/

    const rowActions: RowAction<IPartialPurchasedOrderProduct>[] = [
        {
            label: "Eliminar",
            onClick: handleOnClickActiveDeleteProductModal,
            icon: <Trash2
                className={styleModule.trash2IconShippingOrderModel}
            />
        },
    ];

    return (
        <div className={styleModule.container}>
            <section className={styleModule.headerSection}>
                <section className={styleModule.firstBlock}>
                    <h2 className="nunito-bold">Orden #1234</h2>
                    <section className={styleModule.clientSection}>
                        <section className={`nunito-semibold ${styleModule.clientOrderSection}`}>
                            <div className={styleModule.subTitleContainer}>
                                <p className="nunito-bold">Cliente</p>
                                <button
                                    type="button"
                                    className={styleModule.buttonPencil}
                                    onClick={handleOnClickEditClient}
                                >
                                    <Pencil className={styleModule.iconPencil} />
                                </button>
                            </div>
                            <p>{state.updated.company_name}</p>
                            <p>{state.updated.email}</p>
                            <p>{`Tel. ${state.updated.phone}`}</p>
                            <p>
                                {
                                    `${state.updated.city}, `
                                    + `${state.updated.state}, `
                                    + `${state.updated.country}.`
                                }
                            </p>
                            <p>{`${state.updated.shipping_street}, ${state.updated.shipping_street_number}, ${state.updated.shipping_neighborhood}`}</p>
                        </section>
                    </section>
                </section>
                <section className={`nunito-bold ${styleModule.secondBlock}`}>
                    <div className={`nunito-bold ${styleModule.containerDescriptionDate}`}>
                        <ReactDayPickerField
                            label="Fecha de creación:"
                            icon={<Calendar className={styleModule.iconDayPickerField} />}
                            value={dateCreation}
                            onChange={handleOnChangeDateCreation}
                            classNameContainer={styleModule.containerMainDayPickerFieldCreation}
                            classNameField={styleModule.containerFieldDayPickerFieldCreation}
                            classNameLabel={
                                validation?.dateCreation
                                    ? styleModule.labelDayPickerFieldCreationValidate
                                    : styleModule.labelDayPickerFieldCreation
                            }
                            classNameInput={
                                validation?.dateCreation
                                    ? `nunito-semibold ${styleModule.inputDayPickerFieldCreationValidate}`
                                    : `nunito-semibold ${styleModule.inputDayPickerFieldCreation}`
                            }
                            classNameButton={styleModule.buttonDayPickerFieldCreation}
                            classNameDayPicker={`nunito-semibold ${styleModule.dayPicker}`}
                            classNamePopover={styleModule.containerPopoverDayPickerField}
                        />
                        <ReactDayPickerField
                            label="Fecha estimada de entrega:"
                            icon={<Calendar className={styleModule.iconDayPickerField} />}
                            value={dateDeliver}
                            onChange={handleOnChangeDateDeliver}
                            classNameContainer={styleModule.containerMainDayPickerFieldDeliver}
                            classNameField={styleModule.containerFieldDayPickerFieldDeliver}
                            classNamePopover={styleModule.containerPopoverDayPickerField}
                            classNameLabel={`nunito-bold ` +
                                `${validation?.dateDeliver
                                    ? styleModule.labelDayPickerFieldDeliverValidate
                                    : styleModule.labelDayPickerFieldDeliver}`
                            }
                            classNameInput={
                                validation?.dateDeliver
                                    ? `nunito-semibold ${styleModule.inputDayPickerFieldDeliverVidate}`
                                    : `nunito-semibold ${styleModule.inputDayPickerFieldDeliver}`
                            }
                            classNameButton={styleModule.buttonDayPickerFieldDeliver}
                            classNameDayPicker={`nunito-semibold ${styleModule.dayPicker}`}
                        />
                    </div>
                    <section className={`nunito-bold ${styleModule.AddressOrderSection}`}>
                        <div className={styleModule.subTitleContainer}>
                            <p className="nunito-bold">Dirección de envío </p>
                            <button
                                type="button"
                                className={styleModule.buttonPencil}
                                onClick={handleOnClickEditAddress}
                            >
                                <Pencil className={styleModule.iconPencil} />
                            </button>
                        </div>
                        <p className="nunito-semibold">
                            {
                                `${state.updated.shipping_city}, `
                                + `${state.updated.shipping_state}, `
                                + `${state.updated.shipping_country}.`
                            }
                        </p>
                        <p className="nunito-semibold">{`${state.updated.shipping_street}, ${state.updated.shipping_street_number}, ${state.updated.shipping_neighborhood}`}</p>
                    </section>
                </section>
                <section className={`nunito-bold ${styleModule.thirdBlock}`}>
                    <dt>Creada por:</dt>
                    <dd>{"Roberto Mireles"}</dd>
                </section>
            </section>
            <form onSubmit={handleOnClickNextStep} className={styleModule.formSection}>
                <section className={styleModule.bodySection}>
                    <GenericTableMemo
                        modelName="AddProducts"
                        columns={columns}
                        getRowId={getRowId}
                        data={state.updated.purchase_order_products || []}
                        enableOptionsColumn={true}
                        extraComponents={({ table, state, dispatch }) => {
                            if (!table || !state || !dispatch) return null;
                            else {
                                return <div className={styleModule.containerExtraComponents}>
                                    <MainActionButtonCustom
                                        label="Agregar producto"
                                        icon={<Plus />}
                                        onClick={toggleActiveAddProductModal}
                                    />
                                </div>
                            }

                        }}
                        footerComponents={(table: Table<IPartialPurchasedOrderProduct>) => <FooterComponent table={table} />}

                        rowActions={rowActions}
                        typeRowActions="icon"
                        noResultsMessage="Selecciona los productos"
                    />
                </section>
                <section className={styleModule.footerSection}>
                    <CriticalActionButton
                        label="Cancelar"
                        onClick={handleOnClickCancelButton}
                    />
                    <CriticalActionButton
                        label="Regresar"
                        onClick={handleOnClickBack}
                    />
                    <MainActionButtonCustom
                        onClick={handleOnClickNextStep}
                        label="Siguiente"
                        icon={<FileCheck2 />}
                    />
                </section>
            </form>
            {
                isAddProductModalActive &&
                <SelectObjectsModalMemo
                    onClose={toggleActiveAddProductModal}
                    onClick={handleOnClickAdd}
                    placeholder="Buscar productos"
                    labelOnClick="Asignar productos"
                    headerTitle="Asignar productos"
                    emptyMessage="No hay productos que coincidan con la búsqueda"
                    getRowAttr={getRowAttr}
                    loadOptions={fetchLoadProducts}
                    label="Productos"
                />
            }
            {
                isDeleteProductModalActive &&
                <DeleteModal
                    onClose={() => setIsDeleteProductModalActive(false)}
                    onDelete={fetchSyntheticRemoveProduct}
                    title="¿Estás seguro de eliminar este producto?"
                />
            }
            {
                isActiveConfirmModal && <CustomModal
                    onClose={handleOnClickCloseConfirmModal}
                    title="Tu orden de compra se ha actualizado correctamente."
                    icon={<Check className={styleModule.iconCloseConfirmModalAdd} />}
                />
            }
        </div>
    )
}

export default Step3;


interface IfooterComponent {
    table: Table<IPartialPurchasedOrderProduct>
}


const FooterComponent = memo(({ table }: IfooterComponent) => {

    console.log(table)
    const state = useModalEditState();
    const dispatch = useModalEditDispatch();

    const { subtotal, iva, total } = useMemo(() => {
        const subtotalCalc =
            state?.updated?.purchase_order_products?.reduce((acc, row) => {
                const price = row.recorded_price ?? row.product?.sale_price ?? 0;
                const qty = row.qty ?? 0;
                return acc + price * qty;
            }, 0) ?? 0;

        const ivaCalc = subtotalCalc * 0.16;
        const totalCalc = subtotalCalc + ivaCalc;

        return { subtotal: subtotalCalc, iva: ivaCalc, total: totalCalc };
    }, [state?.updated.purchase_order_products]);

    // 👉 guardar en el estado global solo el total_price
    useEffect(() => {
        dispatch(update_purchase_order({ total_price: total }));
    }, [total, dispatch]);

    return (
        <div className={`nunito-semibold ${styleModule.containerFooterComponents}`}>
            <section className={styleModule.containerFooterComponentsSymbologySection}>
                <dl>
                    <dt><DiscountIcon className={styleModule.iconConditional} /></dt>
                    <dd>Descuento aplicado</dd>
                </dl>
                <dl>
                    <dt><RefreshCcwDot className={styleModule.iconDefault} /></dt>
                    <dd>Precio modificado</dd>
                </dl>
            </section>
            <section className={styleModule.containerFooterComponentsTotalSection}>
                <div className={styleModule.cargos}>
                    <dt>Subtotal:</dt>
                    <dt>IVA:</dt>
                    <dt className={styleModule.total}>Total:</dt>
                </div>
                <div>
                    <dd>{formatCurrency(Number(subtotal.toFixed(2)))}</dd>
                    <dd>{formatCurrency(Number(iva.toFixed(2)))}</dd>
                    <dd className={styleModule.total}>{formatCurrency(Number(total.toFixed(2)))}</dd>
                </div>
            </section>
        </div>
    )
});