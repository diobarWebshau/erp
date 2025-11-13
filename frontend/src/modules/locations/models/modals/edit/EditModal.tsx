import InputText
    from "../../../../../../components/ui/general/input-text/InputText";
import {
    type SetStateAction, type Dispatch,
    useState, useEffect,
    type FormEvent
} from "react";
import type {
    IPartialLocation
} from "../../../../../../interfaces/locations";
import { X } from "lucide-react"
import type {
    ILocationType
} from "../../../../../../interfaces/locationTypes";
import useLocationTypes
    from "../../hooks/useLocationTypes";
import {
    SelectableMultipleCardList
} from "../../../../../../components/ui/general/selected-card-list-T-multiple-select/SelectableMultipleCardList";
import type {
    RootState
} from "../../../../../../store/store";
import {
    useSelector
} from "react-redux";
import type {
    AppDispatchRedux
} from "../../../../../../store/store";
import {
    clearAllErrors
} from "../../../../../../store/slicer/errorSlicer";
import {
    useDispatch
} from "react-redux";
import {
    SelectableCardList
} from "../../../../../../components/ui/general/selectable-card-list-t/SelectableCardList";

interface IEditModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onEdit: (location: IPartialLocation, types: ILocationType[]) => void,
    location: IPartialLocation,
    types: ILocationType[]
}

const EditModal = (
    {
        onClose,
        onEdit,
        location,
        types
    }: IEditModalProps
) => {

    const distpatch: AppDispatchRedux = useDispatch();

    const [name, setName] =
        useState<string | undefined>(location.name);
    const [description, setDescription] =
        useState<string | undefined>(location.description);
    const [isActive, setIsActive] =
        useState<boolean | undefined>(location.is_active);
    const [locationTypesSelect, setLocationTypesSelect] =
        useState<ILocationType[] | undefined>(types);
    const validation =
        useSelector((state: RootState) => state.error);

    const {
        locationTypes,
    } = useLocationTypes();

    const handleOnClickAdd = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (name && description && locationTypesSelect
            && locationTypesSelect.length > 0 && isActive !== undefined) {
            const newLocation: IPartialLocation = {
                ...location,
                name,
                description: description || "",
                is_active: isActive,
            };
            onEdit(newLocation, locationTypesSelect);
        };
    }

    useEffect(() => {
        distpatch(clearAllErrors());
    }, []);

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
                        <h2> New location</h2>
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
                        <div>
                            <div>
                                <InputText
                                    placeholder={"Description"}
                                    label={"Description"}
                                    type={"text"}
                                    value={description || ""}
                                    onChange={(value) => setDescription(value)}
                                    required
                                />
                                {description === "" && (
                                    <small
                                        style={{
                                            color: "red"
                                        }}
                                    >
                                        Description is required
                                    </small>
                                )}
                            </div>
                        </div>
                        <div>

                            <SelectableMultipleCardList
                                items={locationTypes}
                                getId={p => p.id}
                                label="Select location type"
                                name="Location type"
                                onChange={setLocationTypesSelect}
                                selectedItems={locationTypesSelect}
                                emptyMessage="No location types found"
                                renderFields={(value) => (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column"
                                        }}
                                    >
                                        <small>{`Id: ${value.name}`}</small>
                                    </div>
                                )}
                            />
                            {locationTypesSelect && locationTypesSelect?.length === 0 && (
                                <small
                                    style={{
                                        color: "red"
                                    }}
                                >
                                    Location Type is required
                                </small>
                            )}
                        </div>
                        <div>
                            <SelectableCardList
                                name="status"
                                items={[true, false]}
                                getId={(value) => Number(value)}
                                renderFields={(value) => (
                                    <>
                                        <div>{value ? "Active" : "Inactive"}</div>
                                    </>
                                )}
                                selectedItem={isActive}
                                onChange={setIsActive}
                                label={`Select status`}
                                emptyMessage="No hay status disponibles"
                            />
                            {/* {isActive !== undefined && (
                                <small
                                    style={{
                                        color: "red"
                                    }}
                                >
                                    Status is required
                                </small>
                            )} */}
                        </div>

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
                                onClick={() => { onClose(false) }}
                            >Cancel</button>
                            <button
                                type="submit"
                            >Accept</button>
                        </div>
                    </form>
                </div>
            </div >
        </>
    );
}

export default EditModal;


