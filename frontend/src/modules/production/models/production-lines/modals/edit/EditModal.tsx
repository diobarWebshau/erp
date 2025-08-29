import type {
    IPartialProductionLine
} from "../../../../../../interfaces/productionLines";
import {
    useEffect,
    useState
} from "react";
import type {
    Dispatch,
    FormEvent,
    SetStateAction
} from "react"
import {
    useDispatch,
    useSelector
} from "react-redux";
import type {
    AppDispatchRedux,
    RootState
} from "../../../../../../store/store";
import {
    X
} from "lucide-react";
import {
    clearAllErrors
} from "../../../../../../store/slicer/errorSlicer"
import InputText
    from "../../../../../../components/ui/general/input-text/InputText";
import useLocations
    from "../../hooks/useLocations";
import type {
    ILocation
} from "../../../../../../interfaces/locations";
import {
    SelectableCardList
} from "../../../../../../components/ui/general/selectable-card-list-t/SelectableCardList";
import {
    SelectableCardListMultipleImage
} from "../../../../../../components/ui/general/selectable-card-list-t-multiple-image/SelectableCardList";
import useProducts
    from "../../hooks/useProducts";
import type {
    IProduct
} from "../../../../../../interfaces/product";
import {
    ListItem
} from "../../../../../../components/ui/general/listItem/ListItem";
import type {
    IPartialProductionLineProduct
} from "../../../../../../interfaces/productionLinesProducts";
import type {
    IPartialLocationProductionLine
} from "../../../../../../interfaces/locationsProductionLines";

interface IEditModalProps {
    onClose: Dispatch<SetStateAction<boolean>>,
    onEdit: (
        productionLine: IPartialProductionLine,
        products: IPartialProductionLineProduct[],
        location: IPartialLocationProductionLine
    ) => void,
    record: IPartialProductionLine | null
}

const EditModal = ({
    onClose,
    onEdit,
    record
}: IEditModalProps) => {

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [name, setName] =
        useState<string | undefined>(record?.name ?? undefined);
    const [status, setStatus] =
        useState<boolean | undefined>(record?.is_active ?? undefined)
    const validation =
        useSelector((state: RootState) => state.error);
    const [locationSelected, setLocationSelected] =
        useState<ILocation | undefined>(record?.location_production_line?.location ?? undefined);
    const [productionLineProduct, setProductionLineProduct] =
        useState<IPartialProductionLineProduct[]>(record?.production_lines_products ?? []);
    const [productsSelected, setProductsSelected] =
        useState<IProduct[]>([]);
    const [isAddingProduct, setIsAddingProduct] =
        useState<boolean>(false);

    const handleOnClickActiveModalAddProduct = () => {
        setProductsSelected([]);
        setIsAddingProduct(!isAddingProduct);
    }

    const handleOnClickAddProduct = () => {
        if (productsSelected.length > 0) {
            const newProductionLineProduct: IPartialProductionLineProduct[] =
                productsSelected.map((p) => ({
                    products: p,
                    product_id: p.id,
                }));
            setProductionLineProduct((prev) => [...prev, ...newProductionLineProduct]);
            setProductsSelected([]);
            setIsAddingProduct(false);
            setProductsSelected([]);
        }
    }

    const handleOnClickAdd = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            name !== undefined && name !== "" ||
            locationSelected !== undefined &&
            status !== undefined
        ) {
            if (productionLineProduct.length > 0) {

                const productionLine: IPartialProductionLine = {
                    ...record,
                    name,
                    is_active: status,
                };

                const location: IPartialLocationProductionLine = {
                    ...record?.location_production_line,
                    location_id: locationSelected?.id,
                    location: locationSelected
                };

                onEdit(
                    productionLine,
                    productionLineProduct,
                    location
                );
                return;
            }
        }
    }

    const {
        locations
    } = useLocations();

    const {
        products,
    } = useProducts();

    useEffect(() => {
        dispatch(clearAllErrors());
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
                    <form
                        onSubmit={handleOnClickAdd}
                    >
                        <h2> New production line</h2>
                        <div>
                            <div>
                                <InputText
                                    placeholder={"Name"}
                                    label={"Name"}
                                    type={"text"}
                                    value={name || ""}
                                    onChange={(value) => setName(value)}
                                    required
                                />
                                {name === "" && (
                                    <small
                                        style={{
                                            color: "red"
                                        }}
                                    >
                                        Name is required
                                    </small>
                                )}
                            </div>
                        </div>
                        <SelectableCardList
                            name="locations"
                            items={locations.filter((t) => t.types?.some((type) => type.name === "Production"))}
                            getId={(value) => value.id}
                            renderFields={(value) => (
                                <>
                                    <div key={value.id}>
                                        <div><strong>Name:</strong> {value.name}</div>
                                        <div><strong>Description:</strong> {value.description}</div>
                                        <div>
                                            <strong>Types:</strong>{" "}
                                            {value.types?.map((t, i) => (
                                                <small key={t.id}>
                                                    {t.name}
                                                    {i < (value.types?.length ?? 0) - 1 && ", "}
                                                </small>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                            selectedItem={locationSelected}
                            onChange={setLocationSelected}
                            label={`Select location`}
                            emptyMessage="No locations available to select"
                        />

                        <div>
                            <label>Assign products</label>
                            <button
                                type="button"
                                onClick={handleOnClickActiveModalAddProduct}
                            >
                                Add product
                            </button>
                            {isAddingProduct && <div>
                                <SelectableCardListMultipleImage
                                    items={products.filter((p) => !productionLineProduct.find((plp) => plp.products?.id === p.id))}
                                    label="Select products"
                                    name="products"
                                    onChange={setProductsSelected}
                                    selectedItems={productsSelected}
                                    renderFields={(value) => (
                                        <>
                                            <div key={value.id}>
                                                <div><strong>Name:</strong> {value.name}</div>
                                                <div><strong>Description:</strong> {value.description}</div>
                                            </div>
                                        </>
                                    )}
                                    emptyMessage="No products available to select"
                                    getId={(value) => value.id}
                                    getImage={(value) => value.photo.toString()}
                                />

                                <button
                                    type="button"
                                    onClick={handleOnClickActiveModalAddProduct}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleOnClickAddProduct}
                                >
                                    Asign products
                                </button>
                            </div>
                            }
                        </div>
                        <ListItem
                            items={productionLineProduct}
                            emptyMessage={"No inputs assigned"}
                            onDelete={(item) => {
                                setProductionLineProduct((prev) =>
                                    prev?.filter((i) => i.products?.id !== item.products?.id)
                                );
                            }}
                            getId={(item) => Number(item.products?.id)}
                            renderFields={(item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-evenly",
                                        color: "black"
                                    }}
                                >
                                    <small>{`Name: ${item.products?.name}`}</small>
                                    <small>{`Description: ${item.products?.description}`}</small>
                                    <small>{`Type: ${item.products?.type}`}</small>
                                </div>
                            )}
                            label="Inputs assigned"
                        />
                        <SelectableCardList
                            name="status"
                            items={[true, false]}
                            getId={(value) => Number(value)}
                            renderFields={(value) => (
                                <>
                                    <div>{value ? "Active" : "Inactive"}</div>
                                </>
                            )}
                            selectedItem={status}
                            onChange={setStatus}
                            label={`Select status`}
                            emptyMessage="No status available to select"
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
                            <button type="submit">Accept</button>
                        </div>
                    </form>
                </div >
            </div >
        </>
    );
}

export default EditModal;