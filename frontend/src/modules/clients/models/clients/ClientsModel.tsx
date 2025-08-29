import type {
    AppDispatchRedux
} from "../../../../store/store";
import {
    useDispatch
} from "react-redux";
import {
    useEffect,
    useState
} from "react";
import {
    deleteClientInDB,
    fetchClientsFromDB
} from "../../../../queries/clientsQueries";
import type {
    IClient,
    IPartialClient
} from "../../../../interfaces/clients";
import {
    defaultValueClient
} from "../../../../interfaces/clients";
import {
    columnsClients
} from "./structure/columns";
import {
    Pencil, Trash, Plus
} from "lucide-react";
import GenericTable
    from "../../../../components/ui/table/Table copy 2";
import type {
    RowAction,
    TopButtonAction
} from "../../../../components/ui/table/types";
import AddModal
    from "./modals/add/AddModal";
import EditModal
    from "./modals/edit/EditModal";
import DeleteModal
    from "./modals/delete/DeleteModal";
import useClientWithAddresses
    from "./hooks/useClientWithAddresses";
import {
    createCompleteClientInDB,
    updateCompleteClientInDB,
} from "../../../../queries/clientsQueries";
import type {
    IClientAddressesManager,
    IPartialClientAddress
} from "../../../../interfaces/clientAddress";
import {
    diffObjectArrays,
    diffObjects
} from "../../../../utils/validation-on-update/validationOnUpdate";


const ClientsModel = () => {

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [clients, setClients] =
        useState<IClient[]>([]);
    const [loading, setLoading] =
        useState<boolean>(false);
    const [serverError, setServerError] =
        useState<string | null>(null);
    const [clientsRecord, setClientsRecord] =
        useState<IClient>(defaultValueClient);
    const [isActiveAddModal, setIsActiveAddModal] =
        useState<boolean>(false);
    const [isActiveEditModal, setIsActiveEditModal] =
        useState<boolean>(false);
    const [isActiveDeleteModal, setIsActiveDeleteModal] =
        useState<boolean>(false);

    const fetchs = async () => {
        setLoading(true);
        try {
            const response =
                await fetchClientsFromDB(dispatch);
            if (response.length > 0) {
                setClients(response);
            } else {
                setClients([])
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onHandleUpdate = async (
        client: IPartialClient,
        addresses: IPartialClientAddress[]
    ) => {
        setLoading(true);
        try {

            const client_old = {
                ...clientWithAddresses,
            }

            const addresses_old =
                client_old.addresses || [];

            delete client_old.addresses;

            const update_values: IPartialClient =
                await diffObjects(
                    client_old,
                    client
                );

            const addresses_update: IClientAddressesManager =
                await diffObjectArrays(
                    addresses_old,
                    addresses
                );

            const hasChangesAddresses = [
                addresses_update.added.map((d) => delete d.id),
                addresses_update.deleted,
                addresses_update.modified
            ].some((arr: any[]) => arr.length > 0);

            if (Object.keys(update_values).length > 0
                || hasChangesAddresses) {
                const new_client: IPartialClient = {
                    ...update_values,
                    addresses_update: addresses_update,
                }
                const response =
                    await updateCompleteClientInDB(
                        clientsRecord.id,
                        new_client,
                        dispatch
                    );

                if (!response) {
                    return;
                }
                await fetchs();
                await refetchClientWithAddressesById();
            }
            setIsActiveEditModal(false);
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onHandleCreate = async (
        client: IPartialClient,
        addresses: IPartialClientAddress[]
    ) => {
        setLoading(true);

        try {

            const new_client: IPartialClient = {
                ...client,
                addresses: addresses,
            }

            console.log(new_client);

            const response =
                await createCompleteClientInDB(
                    new_client,
                    dispatch
                );

            if (!response) {
                console.log("entro");
                return;
            }
            await fetchs();
            setServerError(null);
            console.log("entro2");
            setIsActiveAddModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }

    };

    const onHandleDelete = async () => {
        setLoading(true);
        try {
            const response =
                await deleteClientInDB(
                    clientsRecord.id,
                    dispatch
                );
            if (!response) {
                return;
            }
            await fetchs();
            setIsActiveDeleteModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleActiveEditModal = (record: IClient) => {
        setServerError(null);
        setClientsRecord(record);
        setIsActiveEditModal(!isActiveEditModal);
    };

    const toggleActiveDeleteModal = (record: IClient) => {
        setServerError(null);
        setClientsRecord(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    };

    const toggleActiveAddModal = () => {
        setServerError(null);
        setIsActiveAddModal(!isActiveAddModal);
    };

    const rowActions: RowAction<IClient>[] = [
        {
            label: "Edit",
            onClick: toggleActiveEditModal,
            icon: <Pencil size={15} />
        },
        {
            label: "Delete",
            onClick: toggleActiveDeleteModal,
            icon: <Trash size={15} />
        },
    ];

    const extraButtons: TopButtonAction<IClient>[] = [
        {
            label: "Add",
            onClick: toggleActiveAddModal,
            icon: <Plus size={15} />
        }
    ];

    const {
        clientWithAddresses,
        loadingClientWithAddresses,
        refetchClientWithAddressesById
    } = useClientWithAddresses(clientsRecord?.id);

    useEffect(() => {
        fetchs();
    }, []);

    return (
        <>
            <GenericTable
                columns={columnsClients}
                data={clients}
                rowActions={rowActions}
                onDeleteSelected={
                    () => console.log("borrado selectivo")}
                modelName="Client"
                extraButtons={extraButtons}
            />
            {
                isActiveAddModal && <AddModal
                    onClose={setIsActiveAddModal}
                    onCreate={onHandleCreate}
                />
            }
            {
                isActiveEditModal && !loadingClientWithAddresses && <EditModal
                    onClose={setIsActiveEditModal}
                    onEdit={onHandleUpdate}
                    record={{ ...clientWithAddresses, credit_limit: Number(clientWithAddresses?.credit_limit) }}
                />
            }
            {
                isActiveDeleteModal && <DeleteModal
                    onClose={setIsActiveDeleteModal}
                    onDelete={onHandleDelete}
                />
            }
        </>
    );

};

export default ClientsModel;