import {
    memo,
    useCallback,
    useEffect,
    useMemo, useState,
} from "react";
import type {
    FormEvent, MouseEvent
} from "react";
import {
    useModalAddDispatch, useModalAddState
} from "../../context/modalAddHooks";
import {
    next_step, update_purchase_order,
    back_step, set_step,
    remove_purchase_order_products,
    set_purchase_order_products_qty,
    set_purchase_order_products_price,
    set_purchase_order_products_price_manual
} from "../../context/modalAddActions";
import {
    ChevronLeft, CircleX, Plus, Pencil,
    Calendar, FileCheck2,
    Trash2, RefreshCcwDot,
    Send,
    Eye,
    Check
} from "lucide-react";
import type {
    IClientAddress
} from "../../../../../../../../interfaces/clientAddress";
import FadeButton
    from "../../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import type {
    IPartialPurchasedOrder
} from "../../../../../../../../interfaces/purchasedOrder";
import styleModule
    from "./Step3.module.css"
import ReactDayPickerField
    from "../../../../../../../../components/ui/general/field-react-day-picker/ReactDayPickerField";
import GenericTable
    from "../../../../../../../../components/ui/table/tableContext/GenericTable";
import type {
    ColumnDef,
    Table
} from "@tanstack/react-table";
import type {
    IPartialPurchasedOrderProduct,
} from "../../../../../../../../interfaces/purchasedOrdersProducts";
import type {
    RowAction
} from "../../../../../../../../components/ui/table/types";
import BaseModal
    from "../../../../../../../../comp/primitives/modal/baseGenericModal/BaseModal";
import AddProductModal
    from "./modal/AddProductModal";
import DeleteModal
    from "../../../../../../../../comp/primitives/modal/deleteModal/DeleteModal";
import InputToggle
    from "../../../../../../../../components/ui/table/components/gui/inputss/inputToggle/InputToggle";
import InputConditionalIcon
    from "../../../../../../../../components/ui/table/components/gui/inputss/inputConditionalIcon/InputConditionalIcon";
import DiscountIcon
    from "../../../../../../../../components/icons/Discount";
import {
    formatCurrency
} from "../../../../../../../../helpers/formttersNumeric";
import {
    formatDateTimeForMySQL,
    isValidDate
} from "../../../../../../../../utils/fomatted_data_mysql/formtated_date_mysql";
import CustomModal from "../../../../../../../../comp/primitives/modal/customModal/CustomModal";

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
    onClose: () => void;
    onEdit: () => void;
    onCloseAddModal: () => void;
    addresses: IClientAddress[];
    loadingAddresses: boolean;
    refetchAddresses: () => void;
    onCreate: (data: IPartialPurchasedOrder) => void;
}

interface Validation {
    dateCreation?: string;
    dateDeliver?: string;
    purchaseOrderProducts?: IPartialPurchasedOrderProduct[];
}

const Step3 = ({
    onClose,
    onCloseAddModal,
    addresses,
    loadingAddresses,
    refetchAddresses,
    onCreate,
    onEdit
}: Step3Props) => {


    // * ************ Hooks para el contexto ************/

    const dispatch = useModalAddDispatch();
    const state = useModalAddState();

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
                accessorFn: (row) => row.product?.sku,
                header: "SKU",
            },
            {
                accessorFn: (row) => row.product?.name,
                header: "Producto",
            },
            {
                accessorFn: (row) => row.recorded_price,
                header: "Precio unitario",
                cell: ({ row }) => {
                    const productId = row.original.product?.id;
                    let recorded_price = Number(
                        row.original.recorded_price
                        ?? row.original.product?.sale_price ?? 0
                    );

                    const onChangeRecordedPrice = (value: number) => {
                        handleChangeRecordedPrice(
                            productId ?? 0,
                            value,
                        );
                    };

                    const onClickIconDefault = () => {
                        console.log("diobar");
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
                accessorFn: (row) => { },
                header: "Total",
                cell: ({ row }) => {
                    const recorded_price =
                        row.original.recorded_price
                        ?? row.original.product?.sale_price ?? 0;
                    const qty = row.original.qty ?? 0;
                    const total = (qty * recorded_price);
                    return formatCurrency(Number(total.toFixed(2)));
                }
            }
        ],
        []
    );


    // * ************ Estados ************/

    const [selectedAddress, setSelectedAddress] =
        useState<IClientAddress | null>(
            addresses.find(
                (address) =>
                    address.id === state.data.client_address_id)
            || null
        );

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

    const toggleActiveAddProductModal = () => {
        setIsAddProductModalActive((prev) => !prev);
    }

    const toggleConfirmModal = () => {
        setIsActiveConfirmModal((prev) => !prev);
    }

    const handleOnClickActiveDeleteProductModal = (
        product: IPartialPurchasedOrderProduct
    ) => {
        setSelectedProduct(product);
        setIsDeleteProductModalActive(true);
    }

    const toggleActiveDeleteProductModal = () => {
        setIsDeleteProductModalActive((prev) => !prev);
    }

    const fetchSyntheticRemoveProduct = () => {
        if (!selectedProduct) return;
        dispatch(remove_purchase_order_products(
            selectedProduct
        ));
        setSelectedProduct(null);
        setIsDeleteProductModalActive(false);
    }

    const handleOnChangeDateDeliver = (
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
    }

    const handleOnChangeDateCreation = (
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
    }

    const validateField = (
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
    };

    const handleOnClickNextStep = (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        if (
            dateCreation
            && dateDeliver
            && isValidDate(dateCreation.toISOString().slice(0, 10))
            && isValidDate(dateDeliver.toISOString().slice(0, 10))
            && state?.data?.purchase_order_products
            && state.data.purchase_order_products.length > 0
        ) {
            if (
                state.current_step + 1 <= state.total_steps + 1 &&
                selectedAddress
            ) {
                const currentState = state.data;
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
                onCreate({
                    ...currentState,
                    created_at: formatDateTimeForMySQL(dateCreation),
                    delivery_date: formatDateTimeForMySQL(dateDeliver),
                });
                toggleConfirmModal();
            }
            return;
        } else {
            const validateDateCreation =
                validateField("dateCreation", dateCreation);
            const validateDateDeliver =
                validateField("dateDeliver", dateDeliver);
            setValidation((prev) => ({
                ...prev,
                dateCreation: validateDateCreation,
                dateDeliver: validateDateDeliver
            }));
        }
    }

    const handleOnClickBack = (
        e: MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        dispatch(back_step());
    }

    const handleOnClickEditClient = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dispatch(set_step(1));
    }

    const handleOnClickEditAddress = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dispatch(set_step(2));
    }

    const returnToPrincipalSalesPage = () => {
        toggleConfirmModal();
        onCloseAddModal();
    }

    const goToViewPurchasedOrder = () => {
        onCloseAddModal();
        onEdit();
        console.log("go to view purchased order");
    }

    const sendByEmail = () => {
        console.log("send by email");
    }


    // * ************ Componentes extra para inyectar como props en el GenericTable ************/


    const ExtraComponents = (table: Table<IPartialPurchasedOrderProduct>) => {
        return (
            <div className={styleModule.containerExtraComponents}>
                <FadeButton
                    label="Agregar producto"
                    icon={<Plus
                        className={styleModule.extraComponentsFadeButtonIcon}
                    />}
                    onClick={toggleActiveAddProductModal}
                    typeOrderIcon="first"
                    classNameButton={styleModule.extraComponentsFadeButton}
                    classNameSpan={styleModule.extraComponentsFadeButtonSpan}
                    classNameLabel={styleModule.extraComponentsFadeButtonLabel}
                    type="button"
                />
            </div>
        )
    }

    const FooterComponents = ({ table }: { table: Table<IPartialPurchasedOrderProduct> }) => {
        const state = useModalAddState();
        const dispatch = useModalAddDispatch();

        const { subtotal, iva, total } = useMemo(() => {
            const subtotalCalc =
                state?.data?.purchase_order_products?.reduce((acc, row) => {
                    const price = row.recorded_price ?? row.product?.sale_price ?? 0;
                    const qty = row.qty ?? 0;
                    return acc + price * qty;
                }, 0) ?? 0;

            const ivaCalc = subtotalCalc * 0.16;
            const totalCalc = subtotalCalc + ivaCalc;

            return { subtotal: subtotalCalc, iva: ivaCalc, total: totalCalc };
        }, [state?.data.purchase_order_products]);

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
        );
    };



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
                            <p>{state.data.company_name}</p>
                            <p>{state.data.email}</p>
                            <p>{`Tel. ${state.data.phone}`}</p>
                            <p>
                                {
                                    `${state.data.city}, `
                                    + `${state.data.state}, `
                                    + `${state.data.country}.`
                                }
                            </p>
                            <p>{state.data.address}</p>
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
                                `${state.data.shipping_city}, `
                                + `${state.data.shipping_state}, `
                                + `${state.data.shipping_country}.`
                            }
                        </p>
                        <p className="nunito-semibold">{state.data.shipping_address}</p>
                    </section>
                </section>
                <section className={`nunito-bold ${styleModule.thirdBlock}`}>
                    <dt>Creada por:</dt>
                    <dd>{"Roberto Mireles"}</dd>
                </section>
            </section>
            <form onSubmit={handleOnClickNextStep} className={styleModule.formSection}>
                <section className={styleModule.bodySection}>
                    <GenericTable
                        modelName="AddProducts"
                        columns={columns}
                        onDeleteSelected={() => console.log("delete")}
                        getRowId={
                            (
                                row: IPartialPurchasedOrderProduct,
                                index: number
                            ) => `temp-${row.product?.id}`
                        }
                        data={state.data.purchase_order_products || []}
                        enableSorting={false}
                        enableRowSelection={false}
                        enablePagination={false}
                        enableFilters={false}
                        enableViews={false}
                        enableOptionsColumn={true}
                        extraComponents={
                            (table: Table<IPartialPurchasedOrderProduct>) =>
                                ExtraComponents(table)
                        }
                        footerComponents={
                            (table: Table<IPartialPurchasedOrderProduct>) =>
                                <FooterComponents table={table} />
                        }
                        rowActions={rowActions}
                        typeRowActions="icon"
                        noResultsMessage="Selecciona los productos"
                    />
                </section>
                <section className={styleModule.footerSection}>
                    <FadeButton
                        label="Cancelar"
                        type="button"
                        typeOrderIcon="first"
                        classNameButton={styleModule.cancelButton}
                        classNameLabel={styleModule.cancelButtonLabel}
                        classNameSpan={styleModule.cancelButtonSpan}
                        icon={<CircleX className={styleModule.cancelButtonIcon} />}
                        onClick={onClose}
                    />
                    <FadeButton
                        label="Regresar"
                        type="button"
                        typeOrderIcon="first"
                        classNameButton={styleModule.backButton}
                        classNameLabel={styleModule.backButtonLabel}
                        classNameSpan={styleModule.backButtonSpan}
                        icon={<ChevronLeft className={styleModule.backButtonIcon} />}
                        onClick={handleOnClickBack}
                    />
                    <FadeButton
                        label="Crear orden"
                        type="submit"
                        typeOrderIcon="first"
                        classNameButton={styleModule.nextButton}
                        classNameLabel={styleModule.nextButtonLabel}
                        classNameSpan={styleModule.nextButtonSpan}
                        icon={<FileCheck2 className={styleModule.nextButtonIcon} />}
                    />
                </section>
            </form>
            {
                isAddProductModalActive &&
                <BaseModal
                    onClose={toggleActiveAddProductModal}
                    className={styleModule.addProductModal}
                    classNameCustomContainer={styleModule.addProductModalCustomContainer}
                >
                    <AddProductModal
                        onClose={toggleActiveAddProductModal}
                    />
                </BaseModal>
            }
            {
                isDeleteProductModalActive &&
                <DeleteModal
                    onClose={toggleActiveDeleteProductModal}
                    onDelete={fetchSyntheticRemoveProduct}
                    title="¿Estás seguro de eliminar este producto?"
                />
            }
            {
                isActiveConfirmModal && <CustomModal
                    onClose={returnToPrincipalSalesPage}
                    title="Tu orden de venta se ha creado correctamente"
                    icon={<Check className={styleModule.iconCloseConfirmModalAdd} />}
                    children={
                        () => {
                            return (
                                <div className={styleModule.containerConfirmModalAdd}>
                                    <div className={styleModule.containerConfirmModalAddButtons}>
                                        <FadeButton
                                            label="Enviar por correo"
                                            type="button"
                                            typeOrderIcon="first"
                                            classNameButton={styleModule.sendByEmailButtonConfirmModalAdd}
                                            classNameLabel={styleModule.sendByEmailButtonConfirmModalAddLabel}
                                            classNameSpan={styleModule.sendByEmailButtonConfirmModalAddSpan}
                                            icon={<Send
                                                className={styleModule.sendByEmailButtonConfirmModalAddIcon}
                                            />}
                                        />
                                        <FadeButton
                                            label="Ver venta"
                                            type="button"
                                            typeOrderIcon="first"
                                            classNameButton={styleModule.seeSaleButtonConfirmModalAdd}
                                            classNameLabel={styleModule.seeSaleButtonConfirmModalAddLabel}
                                            classNameSpan={styleModule.seeSaleButtonConfirmModalAddSpan}
                                            icon={<Eye className={styleModule.seeSaleButtonConfirmModalAddIcon} />}
                                            onClick={goToViewPurchasedOrder}
                                        />
                                    </div>
                                    <div className={styleModule.containerConfirmModalAddButtonBackSales}>
                                        <FadeButton
                                            label="Regresar a ventas"
                                            type="button"
                                            typeOrderIcon="first"
                                            classNameButton={styleModule.backToSalesButtonConfirmModalAdd}
                                            classNameLabel={styleModule.backToSalesButtonConfirmModalAddLabel}
                                            classNameSpan={styleModule.backToSalesButtonConfirmModalAddSpan}
                                            onClick={returnToPrincipalSalesPage}
                                        />
                                    </div>
                                </div>
                            );
                        }
                    }
                />
            }
        </div>
    )
}

export default Step3;