import {
    useEffect, useState
} from "react";
import GenericTable
    from "../../components/ui/table/Table copy";
import type {
    IPartialLocation, ILocation
} from "../../interfaces/locations";
import {
    defaultValueLocation,
} from "../../interfaces/locations";
import type {
    AppDispatchRedux
} from "../../store/store";
import {
    useDispatch
} from "react-redux";
import type {
    RowAction
} from "../../components/ui/table/types";
import {
    Edit, Trash2
} from "lucide-react";
import {
    deleteLocationInDB,
    fetchLocationsFromDB,
    createCompleteLocationInDB,
    getTypesOfLocationFromDB,
    updateCompleteLocationInDB
} from "../../queries/locationsQueries";
import {
    columnsLocations
} from "./structure/columns"
import AddModal
    from "./modals/add/AddModal";
import type {
    ILocationType
} from "../../interfaces/locationTypes";
import DeleteModal
    from "./modals/delete/DeleteModal";
import EditModal
    from "./modals/edit/EditModal";
import {
    diffObjects,
    diffObjectArrays
} from "../../utils/validation-on-update/validationOnUpdate";


const LocationsModel = () => {

    // ESTADO PARA CONTROLAR LOS DATOS DE LA TABLA
    const dispatch: AppDispatchRedux = useDispatch();

    const [locations, setLocations] =
        useState<ILocation[]>([]);
    const [locationRecord, setLocationRecord] =
        useState<ILocation>(defaultValueLocation);
    const [locationTypes, setLocationTypes] =
        useState<ILocationType[]>([]);

    const [loading, setLoading] =
        useState<boolean>(false);
    const [serverError, setServerError] =
        useState<string | null>(null);

    // ESTADO PARA CONTROLAR ACTIVIDAD DE MODALES
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

    const toggleActiveEditModal = async (record: ILocation) => {
        setServerError(null);
        const types =
            await getTypesOfLocationFromDB(
                record.id,
                dispatch
            );
        setLocationRecord(record);
        setLocationTypes(types?.types ?? []);
        setIsActiveEditModal(true);
    };

    const toggleActiveDeleteModal = (record: ILocation) => {
        setServerError(null);
        setLocationRecord(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    }

    const fetchs = async () => {
        setLoading(true);
        try {
            const response =
                await fetchLocationsFromDB(dispatch);
            if (response.length > 0) {
                setLocations(response);
            } else {
                setLocations([])
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };


    const handleCreate = async (
        location: IPartialLocation,
        types: ILocationType[]
    ) => {
        setLoading(true);
        try {
            const newLocation = {
                ...location,
                types: types
            }
            const response =
                await createCompleteLocationInDB(
                    newLocation,
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
    };

    const handleUpdate = async (
        location: IPartialLocation,
        types: ILocationType[]
    ) => {
        setLoading(true);
        setServerError(null);
        try {
            const update_values_location = await diffObjects
                (locationRecord, location);

            const update_values_types = diffObjectArrays(
                locationTypes,
                types
            );
            const data = {
                update_fields: update_values_location,
                update_types: update_values_types
            }
            const response =
                await updateCompleteLocationInDB(
                    locationRecord.id,
                    data,
                    dispatch
                );
            if (!response) {
                return;
            }
            fetchs();
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
        setServerError(null);
        try {
            const response =
                await deleteLocationInDB(
                    locationRecord.id,
                    dispatch
                );
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
            setIsActiveDeleteModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const rowActions: RowAction<ILocation>[] = [
        {
            label: "Edit",
            onClick: toggleActiveEditModal,
            icon: <Edit size={15} />
        },
        {
            label: "Delete",
            onClick: toggleActiveDeleteModal,
            icon: <Trash2 size={15} />
        },
    ];

    useEffect(() => {
        fetchs();
    }, []);

    return (
        <>
            <GenericTable
                columns={columnsLocations}
                data={locations}
                modelName="Locations"
                rowActions={rowActions}
                onAdd={toggleActiveAddModal}
                onDeleteSelected={
                    () =>
                        console.log("borrado selectivo")
                }
            />
            {isActiveAddModal && <AddModal
                onClose={setIsActiveAddModal}
                onCreate={handleCreate}
            />}
            {isActiveDeleteModal && <DeleteModal
                onClose={setIsActiveDeleteModal}
                onDelete={handleDelete}
            />}
            {isActiveEditModal && <EditModal
                onClose={setIsActiveEditModal}
                onEdit={handleUpdate}
                location={locationRecord}
                types={locationTypes}
            />}
        </>
    )
}


export default LocationsModel;