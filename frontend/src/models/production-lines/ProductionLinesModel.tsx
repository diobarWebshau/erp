import type {
    RowAction
} from "./../../components/ui/table/types"
import {
    useEffect, useState
} from "react";
import type {
    AppDispatchRedux
} from "../../store/store";
import {
    useDispatch
} from "react-redux";
import type {
    IPartialProductionLine,
    IProductionLine
} from "../../interfaces/productionLines";
import {
    defaultValueProductionLine
} from "../../interfaces/productionLines";
import {
    Edit, Trash2
} from "lucide-react";
import {
    columnsProductionLines
} from "./structure/structure";
import {
    fetchproductionLinesFromDB,
    createCompleteproductionLineInDB,
    updateCompleteproductionLineInDB,
    deleteproductionLineInDB
} from "../../queries/productionLines";
import GenericTable
    from "../../components/ui/table/Table copy";
import AddModal
    from "./modals/add/AddModal"
import EditModal
    from "./modals/edit/EditModal"
import useProductionLineById
    from "./hooks/useProductionLineById";
import {
    diffObjectArrays,
    diffObjects,
} from "../../utils/validation-on-update/validationOnUpdate";
import type {
    IPartialProductionLineProduct,
    IProductionLineProductManager
} from "../../interfaces/productionLinesProducts";
import type {
    IPartialLocationProductionLine
} from "../../interfaces/locationsProductionLines";
import DeleteModal
    from "./modals/delete/DeleteModal";


const ProductionLinesModel = () => {

    // ESTADOS PARA LA RENDERIZACION, MANEJO DE ERRORES Y DESPACHADOR DE REDUX

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [loading, setLoading] =
        useState<boolean>(false);
    const [serverError, setServerError] =
        useState<string | null>(null);

    // ESTADOS PARA EL CONTROL DEL FLUJO DE LOS DATOS DEL MODELO

    const [productionLines, setProductionLines] =
        useState<IProductionLine[]>([]);
    const [productionLineRecord, setProductionLineRecord] =
        useState<IProductionLine>(defaultValueProductionLine);


    // ESTADOS PARA CONTROLAR ACTIVIDAD DE MODALES

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

    const toggleActiveEditModal = async (record: IProductionLine) => {
        setServerError(null);
        setProductionLineRecord(record);
        setIsActiveEditModal(true);
    };

    const toggleActiveDeleteModal = (record: IProductionLine) => {
        setServerError(null);
        setProductionLineRecord(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }

    const {
        productionLinesById,
        loadingProductionLinesById,
        refetchProductionLinesById
    } = useProductionLineById(productionLineRecord?.id);

    /* FUNCIONES CRUD PARA EL MODELO */

    const fetchs = async () => {
        setLoading(true);
        try {
            const response =
                await fetchproductionLinesFromDB(dispatch);
            if (response.length > 0) {
                setProductionLines(response);
            } else {
                setProductionLines([])
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onHandleCreate = async (
        productionLine: IPartialProductionLine,
        products: IPartialProductionLineProduct[],
        location: IPartialLocationProductionLine
    ) => {
        setLoading(true);
        try {

            console.log(
                productionLine,
                products,
                location
            );
            const new_production_line: IPartialProductionLine = {
                ...productionLine,
                production_lines_products: products,
                location_production_line: location
            }

            const response =
                await createCompleteproductionLineInDB(
                    new_production_line,
                    dispatch
                );

            if (!response) {
                return;
            }

            await fetchs();
            setIsActiveAddModal(false);
            setServerError(null);

        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const onHandleUpdate = async (
        productionLine: IPartialProductionLine,
        products: IPartialProductionLineProduct[],
        location: IPartialLocationProductionLine
    ) => {
        setLoading(true);
        try {

            // Obtiene una copia de productionLine
            const productionLine_old = {
                ...productionLinesById,
            }
            const location_old =
                productionLine_old.location_production_line || null;
            const products_old =
                productionLine_old.production_lines_products || [];

            // Remueve los campos que no se van a actualizar de productionLine
            delete productionLine.location_production_line;
            delete productionLine.production_lines_products;
            delete productionLine_old.location_production_line;
            delete productionLine_old.production_lines_products;

            // Obtiene los valores que se van a actualizar de sus relaciones
            const update_values: IPartialProductionLine =
                await diffObjects(
                    productionLine_old,
                    productionLine
                );

            const update_values_location: IPartialLocationProductionLine =
                await diffObjects(
                    location_old,
                    location
                );

            const update_values_products: IProductionLineProductManager =
                diffObjectArrays(
                    products_old,
                    products
                );

            // verificamos si hubo cambios en los procesos
            const hasChangesProducts = [
                update_values_products.added.map((d) => delete d.id),
                update_values_products.deleted,
                update_values_products.modified
            ].some((arr: any[]) => arr.length > 0);

            if (
                Object.keys(update_values).length > 0 ||
                hasChangesProducts ||
                update_values_location
            ) {
                const update_values_production_line: IPartialProductionLine = {
                    ...update_values,
                    location_production_line: update_values_location,
                    production_lines_products_updated: update_values_products
                }
                const response =
                    await updateCompleteproductionLineInDB(
                        productionLineRecord.id,
                        update_values_production_line,
                        dispatch
                    );
                if (!response) {
                    return;
                }
                await fetchs();
                refetchProductionLinesById();
            }
            setIsActiveEditModal(false);
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response =
                await deleteproductionLineInDB(
                    productionLineRecord.id,
                    dispatch
                );
            if (!response) {
                return;
            }
            await fetchs();
            setIsActiveDeleteModal(false);
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    /* EFECTOS SECUNDARIOS DE RENDERIZACION */

    useEffect(() => {
        fetchs();
    }, [])


    /* OBJETOS DE CONFIGURACION PARA LA VISUABLIZACION DEL MODELO EN LA TABLA */

    const rowActions: RowAction<IProductionLine>[] = [
        {
            label: "Edit",
            onClick: toggleActiveEditModal,
            icon: <Edit size={15} />
        },
        {
            label: "Delete",
            onClick: toggleActiveDeleteModal,
            icon: <Trash2 size={15} />
        }
    ];

    return (
        <>
            <GenericTable
                modelName="ProductionLines"
                columns={columnsProductionLines}
                data={productionLines}
                rowActions={rowActions}
                onDeleteSelected={() => console.log("borrado selectivo")}
                onAdd={toggleActiveAddModal}
            />
            {
                isActiveAddModal && <AddModal
                    onClose={setIsActiveAddModal}
                    onCreate={onHandleCreate}
                />
            }
            {
                isActiveEditModal && !loadingProductionLinesById && <EditModal
                    onClose={setIsActiveEditModal}
                    onEdit={onHandleUpdate}
                    record={{
                        ...productionLinesById
                    } as IProductionLine}
                />
            }
            {
                isActiveDeleteModal && <DeleteModal
                    onClose={setIsActiveDeleteModal}
                    onDelete={handleDelete}
                />
            }
        </>
    )
};

export default ProductionLinesModel;