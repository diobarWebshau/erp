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
    useModalEditDispatch,
    useModalEditState
} from "../../context/modalEditHooks";
import {
    update_purchase_order,
    back_step, set_step,
    remove_purchase_order_products,
    set_purchase_order_products_qty,
    set_purchase_order_products_price,
    set_purchase_order_products_price_manual
} from "../../context/modalEditActions";
import {
    CircleX, Plus, Pencil,
    Calendar, Trash2,
    RefreshCcwDot, Check,
    Bookmark
} from "lucide-react";
import type {
    IPartialClientAddress
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
    isValidDate,
    parseMySQLTimestampToDate
} from "../../../../../../../../utils/fomatted_data_mysql/formtated_date_mysql";
import CustomModal from "../../../../../../../../comp/primitives/modal/customModal/CustomModal";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../../../../store/store";
import { Progress } from "@mantine/core";

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
                iconConditional={<DiscountIcon className={styleModule.iconConditional} />}
                iconDefault={<RefreshCcwDot className={styleModule.iconDefault} />}
                onClickIconDefault={onClickIconDefault}
                onClickIconConditional={onClickIconConditional}
            />
        );
    }
);

interface Step3Props {
    onEdit: (updateRecord: IPartialPurchasedOrder | null) => void;
    refetch: () => void;
}

interface Validation {
    dateCreation?: string;
    dateDeliver?: string;
    purchaseOrderProducts?: IPartialPurchasedOrderProduct[];
}

const Step3 = ({
    onEdit,
    refetch
}: Step3Props) => {

    // * ************ Hooks para el contexto ************/

    const dispatch = useModalEditDispatch();
    const state = useModalEditState();

    const validationRedux = useSelector(
        (state: RootState) => state.error
    );

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
                    let recorded_price =
                        Number(row.original.recorded_price)
                        ?? Number(row.original.product?.sale_price) ?? 0;

                    const onChangeRecordedPrice = (value: number) => {
                        handleChangeRecordedPrice(productId ?? 0, value);
                    };

                    const onClickIconDefault = () => {
                        console.log("onClickIconDefault");
                        dispatch(set_purchase_order_products_price_manual({
                            id: productId ?? 0,
                            was_price_edited_manually: null
                        }));
                    };

                    const onClickIconConditional = () => {
                        console.log("onClickIconConditional");
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
                    const qty = Number(Number(row.original.qty).toFixed(2)) ?? 0;

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
                accessorFn: (row) => row.stock_available?.available,
                header: "Disponibilidad",
                cell: ({ row }) => {

                    const qty = row.original.qty ?? 0;
                    const available_stock = row.original.stock_available?.available ?? 0;
                    const committed = row.original.inventory_commited?.qty ?? 0;
                    const production  = row.original?.production_order?.production_breakdown?.finished ?? 0;
                    const available = available_stock + production + committed;


                    const minStock = row.original.stock_available?.minimum_stock ?? 0;

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
                accessorFn: (row) => row.production_summary,
                header: "Producción",
                cell: ({ row }) => {
                    const isNew = row.original.id ? false : true;
                    const record = row.original;

                    let total_order = 0, total_production = 0, progress = 0, isCompleted = false;

                    if (isNew) {
                        const qty = record.qty ?? 0;
                        const available = record.product?.summary_location?.available ?? 0;
                        if (qty >= available) {
                            total_order = qty - available;
                            total_production = 0;
                            progress = (total_production / total_order) * 100;
                            isCompleted = progress === 100 || total_order === total_production ? true : false;
                        } else {
                            isCompleted = true;
                        }
                    } else {
                        total_order = record.production_order?.production_breakdown?.order_qty ?? 0;
                        total_production = record.production_order?.production_breakdown?.finished ?? 0;
                        progress = (total_production / total_order) * 100;
                        isCompleted = progress === 100 || total_order === total_production ? true : false;
                    }

                    return (
                        <span className={styleModule.containerProgressQtyProduction}>
                            {isCompleted
                                ? <div className={styleModule.completedProgressTag}>
                                    Completed
                                </div>
                                : (
                                    <div className={styleModule.containerProgressIsNotCompleted}>
                                        <span className={styleModule.containerProgress}>
                                            <Progress
                                                radius="lg"
                                                size="md"
                                                value={progress}
                                                striped
                                                animated
                                                classNames={{
                                                    root: styleModule.progressBar,
                                                    label: styleModule.labelProgressBar,
                                                    section: styleModule.sectionProgressBar,
                                                }}
                                            />
                                        </span>
                                        <span className={styleModule.containerProgressText}>
                                            {total_production} / {total_order}
                                        </span>
                                    </div>
                                )
                            }
                        </span>
                    );
                }
            },
            {
                accessorFn: (row) => row.shipping_summary,
                header: "Cantidad enviada",
                cell: ({ row }) => {
                    const isNewRecord = row.original.id ? false : true;
                    const shipping_summary = row.original.shipping_summary;

                    const total_order = isNewRecord ? row.original.qty : shipping_summary?.order_qty ?? 0;
                    const total_shipping = shipping_summary?.shipping_qty ?? 0;

                    return (
                        <div>
                            {total_order === total_shipping ? <div className={styleModule.completedProgressTag}>
                                {`${total_shipping} / ${total_order}`}
                            </div>
                                : <div>
                                    {`${total_shipping} / ${total_order}`}
                                </div>
                            }
                        </div>
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


    // * ************ Estados *********** */

    const [selectedAddress, setSelectedAddress] =
        useState<IPartialClientAddress | null>(
            {
                address: state.updated.shipping_address ?? "",
                city: state.updated.shipping_city ?? "",
                state: state.updated.shipping_state ?? "",
                zip_code: state.updated.shipping_zip_code ?? "",
                country: state.updated.shipping_country ?? "",
            }
        );

    const [dateDeliver, setDateDeliver] = useState<Date | undefined>(
        state.updated.delivery_date ?
            parseMySQLTimestampToDate(state.updated.delivery_date.toString()) ?? undefined :
            state.updated.delivery_date
                ? parseMySQLTimestampToDate(state.updated.delivery_date.toString()) ?? undefined
                : undefined
    );

    const [dateCreation, setDateCreation] = useState<Date | undefined>(
        state.updated.created_at ?
            parseMySQLTimestampToDate(state.updated.created_at.toString()) ?? undefined :
            state.updated.created_at ?
                parseMySQLTimestampToDate(state.updated.created_at.toString()) ?? undefined :
                undefined
    );

    const [selectedProduct, setSelectedProduct] =
        useState<IPartialPurchasedOrderProduct | null>(null);
    const [validation, setValidation] =
        useState<Validation>({});
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
            dispatch(update_purchase_order({
                delivery_date: formatDateTimeForMySQL(date)
            }));
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
            dispatch(update_purchase_order({
                created_at: formatDateTimeForMySQL(date)
            }));
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
            && state?.updated?.purchase_order_products
            && state.updated.purchase_order_products.length > 0
        ) {
            if (
                state.current_step + 1 <= state.total_steps + 1 &&
                selectedAddress
            ) {
                const currentState = state.updated;
                const purchasedOrder: IPartialPurchasedOrder = {
                    created_at: formatDateTimeForMySQL(dateCreation),
                    delivery_date: formatDateTimeForMySQL(dateDeliver),
                    purchase_order_products: state.updated.purchase_order_products
                }
                dispatch(update_purchase_order(purchasedOrder));
                const update = {
                    ...currentState,
                    ...purchasedOrder
                };
                console.log("valor que se actualiza")
                console.log(update);
                onEdit(update);
                console.log("validationRedux")
                console.log(validationRedux);
                if (Object.keys(validationRedux).length === 0) {
                    toggleConfirmModal();
                }
            }
            return;
        } else {
            const validateDateCreation = validateField("dateCreation", dateCreation);
            const validateDateDeliver = validateField("dateDeliver", dateDeliver);
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

    const handleOnClickCancelButton = () => {
        dispatch(set_step(4));
    }

    const handleOnClickCloseConfirmModal = () => {
        refetch();
        setIsActiveConfirmModal(false);
        dispatch(set_step(4));
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
                    <h2 className="nunito-bold">{state.updated.order_code}</h2>
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
                            <p>{state.updated.address}</p>
                        </section>
                    </section>
                </section>
                <section className={styleModule.secondBlock}>
                    <div className={styleModule.containerDescriptionDate}>
                        <ReactDayPickerField
                            label="Fecha de creación:"
                            icon={<Calendar className={styleModule.iconDayPickerField} />}
                            value={dateCreation}
                            onChange={handleOnChangeDateCreation}
                            classNameContainer={styleModule.containerMainDayPickerFieldCreation}
                            classNameField={styleModule.containerFieldDayPickerFieldCreation}
                            classNameLabel={`nunito-bold `
                                + `${validation?.dateCreation
                                    ? styleModule.labelDayPickerFieldCreationValidate
                                    : styleModule.labelDayPickerFieldCreation}`
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
                    <section className={styleModule.AddressOrderSection}>
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
                        <p>{state.updated.shipping_address}</p>
                    </section>
                </section>
                <section className={styleModule.thirdBlock}>
                    <dt className="nunito-bold">Creada por:</dt>
                    <dd className="nunito-semibold">{"Roberto Mireles"}</dd>
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
                            ) => `temp-${index}`
                        }
                        data={state.updated.purchase_order_products || []}
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
                        classNameButton={styleModule.cancelEditButton}
                        classNameLabel={styleModule.cancelEditButtonLabel}
                        classNameSpan={styleModule.cancelEditButtonSpan}
                        icon={<CircleX className={styleModule.cancelEditButtonIcon} />}
                        onClick={handleOnClickCancelButton}
                    />
                    <FadeButton
                        label="Guardar"
                        type="submit"
                        typeOrderIcon="first"
                        classNameButton={styleModule.saveEditButton}
                        classNameLabel={styleModule.saveEditButtonLabel}
                        classNameSpan={styleModule.saveEditButtonSpan}
                        icon={<Bookmark className={styleModule.saveEditButtonIcon} />}
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
                    onClose={handleOnClickCloseConfirmModal}
                    title="Tu orden de compra se ha actualizado correctamente."
                    icon={<Check className={styleModule.iconCloseConfirmModalAdd} />}
                />
            }
        </div>
    )
}

export default Step3;