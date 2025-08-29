import type {
    MouseEvent,
    SetStateAction,
    Dispatch,
} from "react";
import {
    useState,
    useEffect,
    memo,
    useMemo,
    useCallback
} from 'react';
import {
    Plus,
    Trash2,
    X
} from "lucide-react"
import type {
    RootState
} from "../../../../../../store/store";
import {
    useDispatch, useSelector
} from "react-redux";
import type {
    AppDispatchRedux
} from "../../../../../../store/store";
import {
    clearAllErrors
} from "./../../../../../../store/slicer/errorSlicer"
import type {
    IPartialShippingOrder,
    LoadEvidenceItem
} from "./../../../../../../interfaces/shippingOrder"

import type {
    ICarrier
} from "./../../../../../../interfaces/carriers"
import type {
    IClient
} from "../../../../../../interfaces/clients";

import type {
    IClientAddress
} from "../../../../../../interfaces/clientAddress";
import type {
    IPurchasedOrderProduct
} from "../../../../../../interfaces/purchasedOrdersProducts";
import {
    SelectableCardList
} from "../../../../../../components/ui/general/selectable-card-list-t/SelectableCardList";
import useCarriers
    from "../../hooks/carriers/useCarriers";
import useClients
    from "../../hooks/clients/useClients";
import useClientAddresses from "../../hooks/client-addresses/useClientAddresses";
import InputNumber
    from "../../../../../../components/ui/general/input-number/InputNamber";
import usePurchasedOrdersProductByClientAddress
    from "../../hooks/purchased-orders/usePurchasedOrderProducts";
import type {
    ColumnDef
} from "@tanstack/react-table";
import type {
    RowAction,
    TopButtonAction
} from "../../../../../../components/ui/table/types";
import GenericTable
    from "../../../../../../components/ui/table/GenericTable";
import AddPop from "../addPop/AddPop";
import type {
    IPartialShippingOrderPurchasedOrderProduct,
} from "../../../../../../interfaces/shippingPurchasedProduct";
import ImageUploader
    from "../../../../../../components/ui/general/uploaderImage/ImageUploader";

interface IAddModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onCreate: (value: IPartialShippingOrder) => void,
}

const CantidadCell = memo(
    ({
        rowId,
        value,
        onChange,
    }: {
        rowId: number;
        value: number;
        onChange: (val: number) => void;
    }) => {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                }}
            >
                <InputNumber
                    id={`cantidad-${rowId}`}
                    value={value}
                    onChange={onChange}
                />
            </div>
        );
    }
);


const AddModal = (
    {
        onClose,
        onCreate,
    }: IAddModalProps
) => {

    const validation =
        useSelector((state: RootState) => state.error);
    const distpatch: AppDispatchRedux =
        useDispatch();
    const [carrier, setCarrier] =
        useState<ICarrier | undefined>(undefined);
    const [deliveryCost, setDeliveryCost] =
        useState<number | undefined>(undefined);
    const [client, setClient] =
        useState<IClient | undefined>(undefined);
    const [clientAddresses, setClientAddress] =
        useState<IClientAddress | undefined>(undefined);
    const [purchasedOrderProductsSelected, setPurchasedOrderProductsSelected] =
        useState<IPurchasedOrderProduct[]>([]);
    const [customValues, setCustomValues] =
        useState<Record<number, number>>({});
    const [isActiveAddPopModal, setIsActiveAddPopModal] =
        useState<boolean>(false);
    const [images, setImages] = useState<File[]>([]);
    const [isLoadedEvidence, setIsLoadedEvidence] =
        useState<boolean | undefined>(undefined);


    const handleOnClickAdd = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (carrier &&
            deliveryCost && deliveryCost > 0 &&
            purchasedOrderProductsSelected.length > 0 &&
            Object.values(customValues).length > 0 && (
                isLoadedEvidence && images.length > 0
                || !isLoadedEvidence
            )
        ) {

            const shippingProducts:
                IPartialShippingOrderPurchasedOrderProduct[] =
                purchasedOrderProductsSelected.map(
                    (p) => ({
                        purchase_order_product_id: p.id,
                        qty: customValues[p.id]
                    })
                )

            const imagesLoadEvidence: LoadEvidenceItem[] = images.map(
                (image) => ({
                    path: image,
                    id: image.name
                })
            )

            const shipping: IPartialShippingOrder = {
                delivery_cost: deliveryCost,
                carrier_id: carrier.id,
                shipping_order_purchase_order_product:
                    shippingProducts,
                load_evidence: imagesLoadEvidence,
            }
            onCreate(shipping);
        }
    }

    // Define las columnas UNA SOLA VEZ, sin customValues en las dependencias
    const columns: ColumnDef<IPurchasedOrderProduct>[] = useMemo(
        () => [
            {
                accessorKey: "order_code",
                header: "Order code",
                cell: ({ row, }) => {
                    const qtyShipping =
                        row.original
                            ?.purchase_order?.order_code ?? "";
                    return (
                        <small>
                            {qtyShipping}
                        </small>
                    );
                },
            },
            {
                accessorKey: "location",
                header: "Location",
                cell: ({ row, }) => {
                    const location =
                        row
                            .original.purchase_order_product_location_production_line
                            ?.production_line
                            ?.location_production_line
                            ?.location?.name ?? "";
                    return (
                        <small>
                            {location}
                        </small>
                    );
                },
            },
            {
                accessorKey: "product_name",
                header: "Product",
                meta: {
                    type: "string",
                    autoGenerated: false,
                    hidden: false,
                },
            },
            {
                id: "qty",
                header: "Qty",
                cell: ({ row, }) => {
                    const rowId = row.original.id;
                    // Lee el valor del estado actual aquí (no en las dependencias)
                    const value = customValues[rowId] ?? 0;
                    // Esta función es estable porque está memoizada arriba
                    const onChange = (val: number) => handleCantidadChange(rowId, val);
                    return (
                        <div>
                            <CantidadCell
                                rowId={rowId}
                                value={value}
                                onChange={onChange}
                            />
                        </div>
                    );
                },
            },
            // {    accessorKey: "qty shipping",
            //     header: "Qty Shipping",
            //     cell: ({ row, }) => {
            //         const rowId = row.original.id;

            //         const qtyShipping: IShippingOrderPurchasedOrderProduct[] =
            //             row.original
            //                 ?.shipping_order_purchase_order_product as
            //             IShippingOrderPurchasedOrderProduct[] ?? [];

            //         const current_qty = customValues[rowId] ?? 0;

            //         const qtyShippingTotal =
            //             qtyShipping.reduce((acc, item) => acc + (item.qty || 0), 0);

            //         return (
            //             <div
            //                 key={`${rowId}-${current_qty}`}
            //             >
            //                 <small>
            //                     {Number(qtyShippingTotal) + Number(current_qty)} / {Number(row.original.qty)}
            //                 </small>
            //             </div>
            //         );
            //     },
            // },
        ],
        [] // **OJO aquí NO va customValues ni handleCantidadChange** para evitar recrear columnas
    );

    const handleCantidadChange = useCallback(
        (rowId: number, value: number) => {
            setCustomValues((prev) => ({
                ...prev,
                [rowId]: value,
            }));
        },
        []
    );

    const handleAddPop = (value: IPurchasedOrderProduct[]) => {
        setPurchasedOrderProductsSelected([
            ...purchasedOrderProductsSelected,
            ...value
        ])
        toggleActiveAddPopModal();
    }

    const handleDeleteSelected = (item: IPurchasedOrderProduct) => {
        setPurchasedOrderProductsSelected(prev => prev.filter(p => p.id !== item.id));
        setCustomValues((prev) => {
            const newValues = { ...prev };
            delete newValues[item.id];
            return newValues;
        });

    }

    const rowActions: RowAction<IPurchasedOrderProduct>[] = useMemo(
        () => [
            {
                label: "Delete",
                icon: <Trash2 size={15} />,
                onClick: handleDeleteSelected,
            },
        ],
        [customValues]
    );

    const toggleActiveAddPopModal = () => {
        console.log(customValues)
        setIsActiveAddPopModal(!isActiveAddPopModal);
    };

    const extraButtons: TopButtonAction<IPurchasedOrderProduct>[] = [
        {
            label: "Add",
            onClick: toggleActiveAddPopModal,
            icon: <Plus size={15} />,
            disabled: !clientAddresses
        }
    ];

    const {
        carriers,
    } = useCarriers();

    const {
        clients
    } = useClients();

    const {
        addresses
    } = useClientAddresses(client?.id)

    const {
        purchasedOrdersProducts,
        refetchPurchasedOrders
    } = usePurchasedOrdersProductByClientAddress(clientAddresses?.id);

    useEffect(() => {
        refetchPurchasedOrders();
    }, [clientAddresses])

    useEffect(() => {
        setClientAddress(undefined);
    }, [client])

    useEffect(() => {
        setPurchasedOrderProductsSelected([]);
        setCustomValues({});
    }, [clientAddresses])

    useEffect(() => {
        distpatch(clearAllErrors());
    }, [])


    return (
        <>
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    zIndex: 10,
                    padding: "1rem",
                    overflowY: "auto",
                    width: "60%",
                    height: "70%",
                    backgroundColor: "black",
                }}
            >
                <div
                >
                    <div>
                        <div
                            style={{
                                position: "absolute",
                                top: 5,
                                right: 5
                            }}
                            onClick={() => onClose(false)}
                        >
                            <X size={20} />
                        </div>
                        <form>
                            <h2> New shipping order</h2>
                            <SelectableCardList
                                name="carrier"
                                items={carriers}
                                getId={(c) => c.id}
                                label="Select carrier"
                                selectedItem={carrier}
                                onChange={setCarrier}
                                emptyMessage="No carrier found"
                                renderFields={(carrier) => (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column"
                                        }}
                                    >
                                        <small>{`Id: ${carrier.id}`}</small>
                                        <small>{`code: ${carrier.name}`}</small>
                                        <small>{`License number: ${carrier.license_number}`}</small>
                                        <small>{`RFC: ${carrier.rfc}`}</small>
                                        <small>{`Phone: ${carrier.phone}`}</small>
                                        <small>{`Company: ${carrier.company_name}`}</small>
                                        <small>{`Plates: ${carrier.plates}`}</small>
                                        <small>{`Vehicle: ${carrier.vehicle}`}</small>
                                    </div>
                                )}
                            />
                            <SelectableCardList
                                name="clients"
                                items={clients}
                                getId={(c) => c.id}
                                label="Select client"
                                selectedItem={client}
                                onChange={setClient}
                                emptyMessage="No client found"
                                renderFields={(client) => (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column"
                                        }}
                                    >
                                        <small>{`Id: ${client.id}`}</small>
                                        <small>{`Company: ${client.company_name}`}</small>
                                        <small>{`Phone: ${client.phone}`}</small>
                                        <small>{`Email: ${client.email}`}</small>
                                        <small>{`Country: ${client.country}`}</small>
                                    </div>
                                )}
                            />
                            {client &&
                                <SelectableCardList
                                    name="clientAddress"
                                    items={addresses}
                                    getId={(c) => c.id}
                                    label="Select client address"
                                    selectedItem={clientAddresses}
                                    onChange={setClientAddress}
                                    emptyMessage="No client address found"
                                    renderFields={(client) => (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column"
                                            }}
                                        >
                                            <small>{`Id: ${client.id}`}</small>
                                            <small>{`City: ${client.city}`}</small>
                                            <small>{`State: ${client.state}`}</small>
                                            <small>{`Country: ${client.country}`}</small>
                                            <small>{`Address: ${client.address}`}</small>
                                        </div>
                                    )}
                                />
                            }
                            <GenericTable<IPurchasedOrderProduct>
                                modelName=""
                                data={purchasedOrderProductsSelected}
                                columns={columns}
                                onDeleteSelected={() => { }}
                                rowActions={rowActions}
                                enableSorting={false}
                                enableFilters={false}
                                enableViews={false}
                                enablePagination={false}
                                enableRowSelection={false}
                                extraButtons={extraButtons}
                                // enableOptionsColumn={false}
                                noResultsMessage="No purchased order product selected"

                            />
                            <div>
                                <SelectableCardList
                                    name="evidence"
                                    items={[true, false]}
                                    getId={(value) => Number(value)}
                                    renderFields={(value) => (
                                        <>
                                            <div>{value ? "Yes" : "No"}</div>
                                        </>
                                    )}
                                    selectedItem={isLoadedEvidence}
                                    onChange={setIsLoadedEvidence}
                                    label={`Evidence`}
                                    emptyMessage="No found evidence"
                                />
                                {
                                    isLoadedEvidence &&
                                    <ImageUploader
                                        multiple={true}
                                        initialFiles={[]}
                                        onChange={(files) => setImages(files)}
                                    />
                                }
                            </div>
                            <InputNumber
                                numberType="decimal"
                                value={deliveryCost}
                                label="Delivery cost"
                                min={1}
                                required
                                onChange={setDeliveryCost}
                            />
                            {
                                Object.keys(validation).length > 0 &&
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        color: "red"
                                    }}
                                >
                                    {
                                        Object.keys(validation).map((key) => {
                                            const errorValue = validation[key];
                                            if (!errorValue) return null;
                                            if (Array.isArray(errorValue)) {
                                                return errorValue.map((msg, index) => (
                                                    <small key={`${key}-${index}`}>{msg}</small>
                                                ));
                                            }
                                            return <small key={key}>{errorValue}</small>;
                                        })
                                    }
                                </div>
                            }
                            <div>
                                <button
                                    type="button"
                                    onClick={() => onClose(false)}
                                >Cancel</button>
                                <button
                                    type="button"
                                    onClick={handleOnClickAdd}
                                >Accept</button>
                            </div>
                        </form>
                    </div>
                    {
                        isActiveAddPopModal &&
                        <AddPop
                            onClose={setIsActiveAddPopModal}
                            clientAddressId={clientAddresses?.id as number}
                            purchasedOrderProductsSelected={purchasedOrderProductsSelected}
                            onAdd={handleAddPop}
                        />
                    }
                </div>
            </div >
        </>
    );
}

export default AddModal;


