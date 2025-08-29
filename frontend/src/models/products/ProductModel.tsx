
import EditModal
    from "./modals/edit/EditModal";
import {
    useDispatch
} from "react-redux";
import type {
    AppDispatchRedux
} from "../../store/store";
import type {
    RowAction
} from "../../components/ui/table/types";
import GenericTable
    from "../../components/ui/table/Table copy";
import {
    fetchProductsFromDB,
    createCompleteProductInDB,
    updateCompleteProductInDB,
    deleteProductInDB
} from "../../queries/productsQueries";
import {
    useEffect,
    useState
} from "react";
import type {
    IPartialProduct,
    IProduct,
} from "../../interfaces/product";
import {
    Edit, Trash2
} from "lucide-react";
import {
    columnsProducts
} from "../../models/products/structure/columns"
import type {
    IPartialProcess,
    IProcess
} from "../../interfaces/processes";
import AddModal
    from "./modals/add/AddModal";
import type {
    IPartialProductDiscountRange
} from "../../interfaces/product-discounts-ranges";
import type {
    IPartialProductInput,
    ProductInputManager
} from "../../interfaces/productsInputs";
import useProductDetails
    from "./hooks/useProductDetails";
import type {
    ProductProcessManager
} from "../../interfaces/productsProcesses";
import type {
    ProductDiscountRangeManager
} from "../../interfaces/product-discounts-ranges";
import {
    diffObjectArrays,
    diffObjects
} from "./../../utils/validation-on-update/validationOnUpdate"
import DeleteModal from "./modals/delete/DeleteModal";

const ProductsModel = () => {

    // Manejo del estado global

    const dispatch =
        useDispatch<AppDispatchRedux>();

    // Manejo de carga gui y errores del servidor

    const [loading, setLoading] =
        useState<boolean>(false);
    const [serverError, setServerError] =
        useState<string | null>(null);

    // Manejo de los registros de los modelos

    const [products, setProducts] =
        useState<IProduct[]>([]);

    // Manejo del estado local del componente

    const [productRecord, setProductRecord] =
        useState<IProduct | null>(null);
    const [productDetail, setProductDetail] =
        useState<IProduct | null>(null);
    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);

    const toggleActiveAddModal = () => {
        setServerError(null);
        setIsActiveAddModal(!isActiveAddModal);
    }

    const toggleActiveEditModal = async (record: IProduct) => {
        setServerError(null);
        setProductDetail(record);
        setIsActiveEditModal(true);
    };

    const toggleActiveDeleteModal = (record: IProduct) => {
        setServerError(null);
        setProductRecord(record);
        setIsActiveDeleteModal(true);
    }

    // Funciones CRUD para products

    const fetch = async () => {
        setLoading(true);
        try {
            const productsData =
                await fetchProductsFromDB(dispatch);
            setProducts(productsData);
        } catch (error) {
            if (error instanceof Error) {
                setServerError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    const {
        productDetails,
        loadingProductDetails,
        refetchProductDetails
    } = useProductDetails(productDetail?.id);

    const handleCreate = async (
        product: IPartialProduct,
        processes: IPartialProcess[],
        discounts: IPartialProductDiscountRange[],
        inputs: IPartialProductInput[]
    ) => {
        setLoading(true);
        try {
            console.log({
                product,
                processes,
                discounts,
                inputs
            });
            const response =
                await createCompleteProductInDB(
                    product, processes,
                    inputs, discounts,
                    dispatch
                );
            if (!response) {
                return;
            }
            await fetch();
            setIsActiveAddModal(false);
            setServerError(null);
        } catch (error) {
            if (error instanceof Error) {
                setServerError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await deleteProductInDB(
                productRecord?.id,
                dispatch
            );
            if (!response) {
                return;
            }
            await fetch();
            setIsActiveDeleteModal(false);
            setServerError(null);
        } catch (error) {
            if (error instanceof Error) {
                setServerError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleUpdate = async (
        product: IPartialProduct,
        processes: IPartialProduct[],
        discounts: IPartialProductDiscountRange[],
        inputs: IPartialProductInput[]
    ) => {
        setLoading(true);
        try {
            if (!productDetails) {
                return;
            }

            // obtenemos el objeto principaly lo desestructuramos
            const product_old = {
                ...productDetails,
                sale_price: Number(productDetails?.sale_price)
            };
            const processes_old = product_old?.product_processes || [];
            const discounts_old = product_old?.product_discount_ranges || [];
            const inputs_old = product_old?.products_inputs || [];

            // elimamos la columnas secuandarias del objeto principal
            delete product.product_processes;
            delete product.product_discount_ranges;
            delete product.products_inputs;

            // elimamos la columnas secuandarias del objeto de update_values
            delete product_old.product_processes;
            delete product_old.product_discount_ranges;
            delete product_old.products_inputs;

            // obtenemos los cambios
            const update_values: IPartialProduct = await
                diffObjects(product_old, product);
            const update_values_processes: ProductProcessManager =
                diffObjectArrays(processes_old, processes);
            const update_values_discounts: ProductDiscountRangeManager =
                diffObjectArrays(discounts_old, discounts);
            const update_values_inputs: ProductInputManager =
                diffObjectArrays(inputs_old, inputs);

            // verificamos si hubo cambios en los procesos
            const hasChanges = [
                update_values_processes.added.map((d) => delete d.id),
                update_values_processes.deleted,
                update_values_processes.modified
            ].some((arr: any[]) => arr.length > 0);

            const hasChangesDiscounts = [
                update_values_discounts.added.map((d) => delete d.id),
                update_values_discounts.deleted,
                update_values_discounts.modified
            ].some((arr: any[]) => arr.length > 0);

            const hasChangesInputs = [
                update_values_inputs.added.map((d) => delete d.id),
                update_values_inputs.deleted,
                update_values_inputs.modified
            ].some((arr: any[]) => arr.length > 0);

            if (
                Object.keys(update_values).length > 0 ||
                hasChanges ||
                hasChangesDiscounts ||
                hasChangesInputs
            ) {
                const update_value_product = {
                    ...update_values,
                    product_processes_updated: update_values_processes,
                    product_discount_ranges_updated: update_values_discounts,
                    products_inputs_updated: update_values_inputs
                }

                console.log(update_value_product);

                const response = await updateCompleteProductInDB(
                    product_old.id,
                    update_value_product,
                    dispatch
                );


                if (!response) {
                    return;
                }
                await fetch();
                refetchProductDetails();

            }
            setIsActiveEditModal(false);
            setServerError(null);
        } catch (error) {
            if (error instanceof Error) {
                setServerError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    // Objetos de configuracion para la tabla

    const actionsRows: RowAction<IProduct>[] = [
        {
            label: "Edit",
            onClick: toggleActiveEditModal,
            icon: <Edit size={15} />,
        },
        {
            label: "Delete",
            onClick: toggleActiveDeleteModal,
            icon: <Trash2 size={15} />,
        }
    ]

    // Efectos de la GUI

    useEffect(() => {
        fetch();
    }, []);

    return (
        <>
            <GenericTable
                modelName="Products"
                columns={columnsProducts}
                data={products}
                onAdd={toggleActiveAddModal}
                onDeleteSelected={
                    () => console.log(
                        "borrado selectivo"
                    )
                }
                rowActions={actionsRows}
            />
            {
                isActiveAddModal && <AddModal
                    onClose={toggleActiveAddModal}
                    onCreate={handleCreate}
                />
            }
            {
                isActiveEditModal && !loadingProductDetails &&
                <EditModal
                    onClose={setIsActiveEditModal}
                    onCreate={handleUpdate}
                    record={{
                        ...productDetails,
                        sale_price:
                            Number(
                                productDetails?.sale_price
                            )
                            ?? 0
                    } as IProduct}
                />
            }

            {
                isActiveDeleteModal && <DeleteModal
                    onClose={setIsActiveDeleteModal}
                    onDelete={handleDelete}
                />
            }
            {/* <ModernForm /> */}
        </>
    );
}

export default ProductsModel;