import type {
    Dispatch,
    FormEvent,
    SetStateAction
} from "react";
import {
    useDispatch,
    useSelector
} from "react-redux";
import type {
    AppDispatchRedux,
    RootState
} from "../../../../../../store/store";

import {
    useEffect,
    useRef,
    useState
} from "react";
import {
    X
} from "lucide-react";
import type {
    IPartialInput
} from "../../../../../../interfaces/inputs";
import type {
    IInputType,
} from "../../../../../../interfaces/inputType";
import {
    clearAllErrors,
} from "../../../../../../store/slicer/errorSlicer";
import InputText
    from "../../../../../../components/ui/general/input-text/InputText";
import InputNumber
    from "../../../../../../components/ui/general/input-number/InputNamber";
import {
    SelectableCardList
} from "../../../../../../components/ui/general/selectable-card-list-t/SelectableCardList";
import useInputTypes
    from "../../hooks/useInputTypes";
import base64ToFileOrNull
    from "../../../../../../scripts/convertBase64ToFile";

interface IAddModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onCreate: (
        input: IPartialInput,
    ) => void,
    record: IPartialInput
}

const AddModal = ({
    onClose,
    onCreate,
    record
}: IAddModalProps
) => {

    const distpatch:
        AppDispatchRedux = useDispatch();
    const validation =
        useSelector((state: RootState) => state.error);
    const [name, setName] =
        useState<string | undefined>(record?.name ?? undefined);
    const [inputType, setInputType] =
        useState<IInputType | undefined>(record?.input_types ?? undefined);
    const [unitCost, setUnitCost] =
        useState<number | undefined>(record?.unit_cost ?? undefined);
    const [isActive, setIsActive] =
        useState<boolean | undefined>(record?.status ?? undefined);
    const [supplier, setSupplier] =
        useState<string | undefined>(record?.supplier ?? undefined);
    const fileInputRef =
        useRef<HTMLInputElement | null>(null);
    const [imageFile, setImageFile] =
        useState<File | null>(
            base64ToFileOrNull(record?.photo, "image")
        );
    const [previewUrl, setPreviewUrl] =
        useState<string | null>(null);


    const handleOnClickAdd = (
        e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (name && name !== "" &&
            unitCost && unitCost > 0 &&
            isActive !== undefined &&
            supplier && supplier !== "" &&
            inputType && inputType.id !== 0 &&
            imageFile
        ) {
            const newInput: IPartialInput = {
                ...record,
                name: name,
                unit_cost: unitCost,
                status: isActive,
                supplier: supplier,
                photo: imageFile,
                input_types_id: inputType.id,
                // input_types: inputType,
            }
            onCreate(newInput);
        }
    }

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const {
        inputTypes,
        refetchInputTypes,
        loadingInputTypes
    } = useInputTypes();

    useEffect(() => {
        distpatch(clearAllErrors());
    }, []);

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

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
                    width: "40%",
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
                        <h2>New Input</h2>
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
                        <label>Photo: </label>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-evenly',
                                gap: 8,
                            }}
                        >
                            <div>
                                <label
                                    htmlFor="product-image-input"
                                    style={{
                                        display: 'inline-block',
                                        padding: '8px 16px',
                                        backgroundColor: '#3182ce',
                                        color: 'white',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        marginBottom: 8,
                                    }}
                                >
                                    {previewUrl ? 'Change Image' : 'Upload Image'}
                                </label>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <input
                                    ref={fileInputRef}
                                    id="product-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                {previewUrl ? (
                                    <div
                                        style={{
                                            position: 'relative',
                                            display: 'inline-block',
                                            marginTop: 8,
                                            maxWidth: '100%',
                                            borderRadius: 8,
                                            overflow: 'hidden',
                                            boxShadow: '0 0 8px rgba(0,0,0,0.15)',
                                        }}
                                    >
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{
                                                width: 250,
                                                height: 250,
                                                objectFit: 'contain',
                                                display: 'block',
                                                borderRadius: 8,
                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            aria-label="Remove image"
                                            style={{
                                                position: 'absolute',
                                                top: 6,
                                                right: 6,
                                                backgroundColor: 'rgba(229, 62, 62, 0.85)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: 30,
                                                height: 30,
                                                color: 'white',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                boxShadow: '0 0 5px rgba(0,0,0,0.3)',
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            marginTop: 8,
                                            color: '#666',
                                            fontStyle: 'italic',
                                            fontSize: 14,
                                        }}
                                    >
                                        No image selected.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <SelectableCardList
                                name="InputType"
                                items={inputTypes}
                                getId={(value) => Number(value.id)}
                                renderFields={(value) => (
                                    <>
                                        <div>{value.name}</div>
                                    </>
                                )}
                                selectedItem={inputType}
                                onChange={setInputType}
                                label={`Select Input Type`}
                                emptyMessage="No Input Types available"
                            />
                        </div>
                        <div>
                            <InputText
                                placeholder={"Supplier"}
                                label={"Supplier"}
                                type={"text"}
                                value={supplier || ""}
                                onChange={(value) => setSupplier(value)}
                                required
                            />
                            {supplier === "" && (
                                <small
                                    style={{
                                        color: "red"
                                    }}
                                >
                                    Supplier is required
                                </small>
                            )}
                        </div>
                        <div>
                            <InputNumber
                                label="Unit Cost"
                                value={unitCost || 0}
                                min={0}
                                onChange={setUnitCost}
                                placeholder="Enter unit cost"
                                required
                                numberType="decimal"
                            />
                            {
                                unitCost === 0 &&
                                <small
                                    style={{ color: "red" }}
                                >Unit cost is required
                                </small>
                            }
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

export default AddModal;