import type {
    AppDispatchRedux
} from "../../store/store";
import {
    useDispatch
} from "react-redux";
import {
    useEffect,
    useState
} from "react";
import {
    deleteInputInDB,
    fetchInputsFromDB,
} from "../../queries/inputsQueries";
import type {
    IInput,
    IPartialInput
} from "../../interfaces/inputs";
import {
    defaultValueInput
} from "../../interfaces/inputs";
import {
    columnsInputs
} from "./structure/columns";
import {
    Pencil, Trash, Plus
} from "lucide-react";
import GenericTable
    from "../../components/ui/table/Table copy 2";
import type {
    RowAction,
    TopButtonAction
} from "../../components/ui/table/types";
import AddModal
    from "./modals/add/AddModal";
import EditModal
    from "./modals/edit/EditModal";
import DeleteModal
    from "./modals/delete/DeleteModal";
import {
    diffObjects
} from "../../utils/validation-on-update/validationOnUpdate";
import useInputWithTypes
    from "./hooks/useInputWithTypes";
import {
    updateCompleteInputInDB,
    createCompleteInputInDB
} from "../../queries/inputsQueries";


const InputsModel = () => {

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [Inputs, setInputs] =
        useState<IInput[]>([]);
    const [loading, setLoading] =
        useState<boolean>(false);
    const [serverError, setServerError] =
        useState<string | null>(null);
    const [InputsRecord, setInputsRecord] =
        useState<IInput>(defaultValueInput);
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
                await fetchInputsFromDB(dispatch);
            if (response.length > 0) {
                setInputs(response);
            } else {
                setInputs([])
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
        Input: IPartialInput,
    ) => {
        setLoading(true);
        try {

            const input_old = {
                ...InputWithTypes,
                unit_cost:
                    Number(InputWithTypes?.unit_cost)
            }

            const input_new = {
                ...Input,
                unit_cost:
                    Number(Input.unit_cost)
            }

            console.log(input_old);
            console.log(input_new);

            const update_values =
                await diffObjects(
                    input_old,
                    input_new
                );

            console.log(update_values);

            if (Object.keys(update_values).length > 0) {
                const response =
                    await updateCompleteInputInDB(
                        InputsRecord.id,
                        Input,
                        dispatch
                    );
                if (!response) {
                    return;
                }
                await fetchs();
                await refetchInputWithTypesById();
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
        input: IPartialInput,
    ) => {
        setLoading(true);
        console.log(input);
        try {
            const response =
                await createCompleteInputInDB(
                    input,
                    dispatch
                );
            if (!response) {
                return;
            }
            await fetchs();
            setServerError(null);
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
                await deleteInputInDB(
                    InputsRecord.id,
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

    const toggleActiveEditModal = (record: IInput) => {
        setServerError(null);
        setInputsRecord(record);
        setIsActiveEditModal(!isActiveEditModal);
    };

    const toggleActiveDeleteModal = (record: IInput) => {
        setServerError(null);
        setInputsRecord(record);
        setIsActiveDeleteModal(!isActiveDeleteModal);
    };

    const toggleActiveAddModal = () => {
        setServerError(null);
        setIsActiveAddModal(!isActiveAddModal);
    };

    const rowActions: RowAction<IInput>[] = [
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

    const extraButtons: TopButtonAction<IInput>[] = [
        {
            label: "Add",
            onClick: toggleActiveAddModal,
            icon: <Plus size={15} />
        }
    ];

    const {
        InputWithTypes,
        loadingInputWithTypes,
        refetchInputWithTypesById
    } = useInputWithTypes(InputsRecord.id);

    useEffect(() => {
        fetchs();
    }, []);

    return (
        <>
            <GenericTable
                columns={columnsInputs}
                data={Inputs}
                rowActions={rowActions}
                onDeleteSelected={
                    () => console.log("borrado selectivo")}
                modelName="Input"
                extraButtons={extraButtons}
            />
            {
                isActiveAddModal && <AddModal
                    onClose={setIsActiveAddModal}
                    onCreate={onHandleCreate}
                />
            }
            {
                isActiveEditModal && !loadingInputWithTypes
                && <EditModal
                    onClose={setIsActiveEditModal}
                    onCreate={onHandleUpdate}
                    record={{
                        ...InputWithTypes,
                        unit_cost:
                            Number(InputWithTypes?.unit_cost)
                    }}
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

export default InputsModel;