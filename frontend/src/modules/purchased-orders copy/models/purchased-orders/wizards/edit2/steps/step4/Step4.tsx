import {
    useMemo,
    useState
} from "react";
import type {
    FormEvent, MouseEvent
} from "react";
import {
    useModalEditDispatch, useModalEditState
} from "../../context/modalEditHooks";
import {
    back_step,
    set_update_data
} from "../../context/modalEditActions";
import {
    CircleX, Pencil,
    FileCheck2,
    RefreshCcwDot,
    Printer
} from "lucide-react";
import FadeButton
    from "../../../../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import styleModule
    from "./Step4.module.css"
import GenericTable
    from "../../../../../../../../components/ui/table/tableContext/GenericTable";
import type {
    ColumnDef,
    Table
} from "@tanstack/react-table";
import type {
    IPartialPurchasedOrderProduct,
} from "../../../../../../../../interfaces/purchasedOrdersProducts";
import DiscountIcon
    from "../../../../../../../../components/icons/Discount";
import {
    formatCurrency
} from "../../../../../../../../helpers/formttersNumeric";
import formatDateToDMY
    from "../../../../../../../../components/ui/table/utils/formatDateToDMY";
import DeleteModal
    from "../../../../../../../../comp/primitives/modal/deleteModal/DeleteModal";
import {
    useSelector
} from "react-redux";
import type {
    RootState
} from "../../../../../../../../store/store";
import { Progress } from '@mantine/core';



interface Step4Props {
    onCloseAddModal: () => void;
    onDelete: () => void;
}

// interface Validation {
//     dateCreation?: string;
//     dateDeliver?: string;
//     purchaseOrderProducts?: IPartialPurchasedOrderProduct[];
// }

const Step4 = ({
    onCloseAddModal,
    onDelete
}: Step4Props) => {


    // * ************ Hooks para el contexto ************/

    const dispatch = useModalEditDispatch();
    const state = useModalEditState();
    const validation = useSelector((state: RootState) => state.error);


    // * ************ COLUMNS Y COMPONENTE A RENDERIZAR ************/

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
                    const recorded_price =
                        row.original.recorded_price
                        ?? row.original.product?.sale_price ?? 0;
                    return (
                        <div className={styleModule.containerPrice}>
                            <div className={styleModule.divPrice}>
                                <span className={styleModule.containerPriceText}>
                                    <span>$</span>
                                    <span>{recorded_price}</span>
                                </span>
                                {row.original.was_price_edited_manually ? (
                                    <DiscountIcon className={styleModule.iconConditional} />
                                ) : row.original.was_price_edited_manually === false ? (
                                    <RefreshCcwDot className={styleModule.iconDefault} />
                                ) : (
                                    null
                                )}
                            </div>
                        </div>
                    );
                }
            },
            {
                accessorFn: (row) => row.qty,
                header: "Cantidad",
                cell: ({ row }) => {
                    const qty = row.original.qty ?? 0;
                    return (
                        <span>
                            {qty}
                        </span>
                    );
                }
            },
            {
                accessorFn: (row) => row.stock_available?.available,
                header: "Disponibilidad",
                cell: ({ row }) => {

                    const qty = row.original.qty ?? 0;
                    const available_stock = row.original.stock_available?.available ?? 0;
                    // const committed = row.original.inventory_commited?.qty ?? 0;
                    // const production = row.original?.production_order?.production_breakdown?.finished ?? 0;
                    const available = available_stock > 0 ? available_stock : 0;

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
                    const record = row.original;
                    const total_order = record.production_order?.production_breakdown?.order_qty ?? 0;
                    const total_production = record.production_order?.production_breakdown?.finished ?? 0;
                    const progress = (total_production / total_order) * 100;
                    const isCompleted = progress === 100 || total_order === total_production ? true : false;

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
                    const shipping_summary = row.original.shipping_summary;
                    const total_order = shipping_summary?.order_qty ?? 0;
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
                // accessorFn: (row) => { },
                id: "Asdsad",
                header: "Total",
                cell: ({ row }) => {
                    const recorded_price =
                        row.original.recorded_price
                        ?? row.original.product?.sale_price ?? 0;
                    const qty = row.original.qty ?? 0;
                    const total = (qty * recorded_price);
                    return formatCurrency(total);
                }
            }
        ],
        []
    );


    // * ************ Estados *********** */
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState(false);

    // * ************ Funciones ************/

    const handleOnClickNextStep = (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
    }

    const handleOnClickBack = (
        e: MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        dispatch(set_update_data(state.data));
        dispatch(back_step());
    }

    const toggleIsActiveDeleteModal = () => {
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }

    const onHandleDeletePurchasedOrder = () => {
        onDelete();
        if (Object.keys(validation).length === 0) {
            onCloseAddModal();
        }
    }

    // * ************ Componentes extra para inyectar como props en el GenericTable ************/


    const footerComponents = (table: Table<IPartialPurchasedOrderProduct>) => {

        const subtotal =
            state?.data?.purchase_order_products
                ?.reduce((acc, row) => {
                    const price = row.recorded_price ?? row.product?.sale_price ?? 0;
                    const qty = row.qty ?? 0;
                    return acc + (price * qty);
                }, 0) ?? 0;

        const iva = subtotal * (16 / 100);
        const total = subtotal + iva;

        return (
            <div className={`nunito-semibold ${styleModule.containerFooterComponents}`}>
                <section className={styleModule.containerFooterComponentsSymbologySection}>
                    <dl>
                        <dt>
                            <DiscountIcon className={styleModule.iconConditional} />
                        </dt>
                        <dd>Precio modificado</dd>
                    </dl>
                    <dl>
                        <dt>
                            <RefreshCcwDot className={styleModule.iconDefault} />
                        </dt>
                        <dd>Descuento aplicado</dd>
                    </dl>
                </section>
                <section className={styleModule.containerFooterComponentsTotalSection}>
                    <div className={styleModule.cargos}>
                        <dt>Subtotal:</dt>
                        <dt>IVA:</dt>
                        <dt className={styleModule.total}>Total:</dt>
                    </div>
                    <div>
                        <dd>{formatCurrency(subtotal)}</dd>
                        <dd>{formatCurrency(iva)}</dd>
                        <dd className={styleModule.total}>{formatCurrency(total)}</dd>
                    </div>
                </section>
            </div>
        )
    }

    // * ************ Funciones para control de acciones de la tabla ************/

    return (
        <div className={styleModule.container}>
            <section className={styleModule.headerSection}>
                <section className={styleModule.firstBlock}>
                    <h2 className="nunito-bold">{state.data.order_code}</h2>
                    <section className={styleModule.clientSection}>
                        <section className={`nunito-semibold ${styleModule.clientOrderSection}`}>
                            <div className={styleModule.subTitleContainer}>
                                <p className="nunito-bold">Cliente</p>
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
                            <p>{`${state.data.street}, ` + `${state.data.street_number}, ` + `${state.data.neighborhood}`}</p>
                        </section>
                    </section>
                </section>
                <section className={styleModule.secondBlock}>
                    <div className={styleModule.containerDescriptionDate}>
                        <div className={`nunito-bold ${styleModule.containerDate}`}>
                            <label>Fecha de creación:</label>
                            <p className="nunito-semibold">{formatDateToDMY(state.data.created_at ?? "")}</p>
                        </div>
                        <div className={`nunito-bold ${styleModule.containerDate}`}>
                            <label>Fecha estimada de entrega:</label>
                            <p className="nunito-semibold">{formatDateToDMY(state.data.delivery_date ?? "")}</p>
                        </div>
                    </div>
                    <section className={styleModule.AddressOrderSection}>
                        <div className={styleModule.subTitleContainer}>
                            <p className="nunito-bold">Dirección de envío </p>
                        </div>
                        <p className="nunito-semibold">
                            {
                                `${state.data.shipping_city}, `
                                + `${state.data.shipping_state}, `
                                + `${state.data.shipping_country}.`
                            }
                        </p>
                        <p>{`${state.data.shipping_street}, ` + `${state.data.shipping_street_number}, ` + `${state.data.shipping_neighborhood}`}</p>
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
                        data={state.data.purchase_order_products || []}
                        enableSorting={false}
                        enableRowSelection={false}
                        enablePagination={false}
                        enableFilters={false}
                        enableViews={false}
                        enableOptionsColumn={false}
                        footerComponents={
                            (table: Table<IPartialPurchasedOrderProduct>) =>
                                footerComponents(table)
                        }
                        typeRowActions="icon"
                        noResultsMessage="Selecciona los productos"

                    />
                </section>
                <section className={styleModule.footerSection}>
                    <div>
                        <FadeButton
                            label="Eliminar"
                            type="button"
                            typeOrderIcon="first"
                            classNameButton={styleModule.deleteButton}
                            classNameLabel={styleModule.deleteButtonLabel}
                            classNameSpan={styleModule.deleteButtonSpan}
                            icon={<CircleX className={styleModule.deleteButtonIcon} />}
                            onClick={toggleIsActiveDeleteModal}
                        />
                        <FadeButton
                            label="Editar"
                            type="button"
                            typeOrderIcon="first"
                            classNameButton={styleModule.editButton}
                            classNameLabel={styleModule.editButtonLabel}
                            classNameSpan={styleModule.editButtonSpan}
                            icon={<Pencil className={styleModule.editButtonIcon} />}
                            onClick={handleOnClickBack}
                        />
                        <FadeButton
                            label="Enviar por correo"
                            type="submit"
                            typeOrderIcon="first"
                            classNameButton={styleModule.sendByEmailButton}
                            classNameLabel={styleModule.sendByEmailButtonLabel}
                            classNameSpan={styleModule.sendByEmailButtonSpan}
                            icon={<FileCheck2 className={styleModule.sendByEmailButtonIcon} />}
                        // onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        //     // e.preventDefault();
                        //     console.log("Evento enviar por correo");
                        // }}
                        />
                        <FadeButton
                            label="Imprimir"
                            type="submit"
                            typeOrderIcon="first"
                            classNameButton={styleModule.printButton}
                            classNameLabel={styleModule.printButtonLabel}
                            classNameSpan={styleModule.printButtonSpan}
                            icon={<Printer className={styleModule.printButtonIcon} />}
                        // onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        //     // e.preventDefault();
                        //     console.log(
                        //         state.data
                        //     );
                        // }}
                        />
                    </div>
                    <div>
                        <FadeButton
                            label="Regresar a ventas"
                            type="button"
                            typeOrderIcon="first"
                            classNameButton={styleModule.backtToSaleButton}
                            classNameLabel={styleModule.backtToSaleButtonLabel}
                            classNameSpan={styleModule.backtToSaleButtonSpan}
                            onClick={onCloseAddModal}
                        />
                    </div>
                </section>
            </form>
            {
                isActiveDeleteModal && <DeleteModal
                    title="¿Seguro que desea eliminar esta orden?"
                    message="Este proceso no se puede deshacer."
                    onClose={toggleIsActiveDeleteModal}
                    onDelete={onHandleDeletePurchasedOrder}
                />
            }
        </div>

    )
}

export default Step4;