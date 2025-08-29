import type {
    IProcess
} from "../../../../interfaces/processes";
import type {
    IPartialProduct
} from "../../../../interfaces/product";
import type {
    Dispatch, SetStateAction, FormEvent
} from "react";
import type {
    IPartialProductDiscountRange,
} from "../../../../interfaces/product-discounts-ranges";
import {
    useDispatch,
    useSelector
} from "react-redux";
import type {
    AppDispatchRedux, RootState
} from "../../../../store/store";
import {
    clearAllErrors,
} from "../../../../store/slicer/errorSlicer";
import {
    useEffect, useState, useRef, useMemo
} from "react";
import { X } from "lucide-react";
import useProcesses
    from "../../hooks/useProcesses";
import InputText
    from "../../../../components/ui/general/input-text/InputText";
import { SelectableCardList }
    from "../../../../components/ui/general/selectable-card-list-t/SelectableCardList";
import InputNumber
    from "../../../../components/ui/general/input-number/InputNamber";
import DraggableList
    from '../../../../components/ui/general/draggableList/DraggableList';
import type {
    IPartialProductProcess
} from "../../../../interfaces/productsProcesses";
import {
    SelectableMultipleCardList
} from "../../../../components/ui/general/selected-card-list-T-multiple-select/SelectableMultipleCardList";
import useInputs from "../../hooks/useInputs";
import type {
    IInput,
    IPartialInput
} from "../../../../interfaces/inputs";
import type {
    IPartialProductInput,
} from "../../../../interfaces/productsInputs";
import {
    SelectableCardListWithImage
} from "../../../../components/ui/general/selectable-card-list-t-image/SelectableCardList";
import { ListItem } from "../../../../components/ui/general/listItem/ListItem";


type onCreateType = (
    product: IPartialProduct,
    processes: IPartialProductProcess[],
    discounts: IPartialProductDiscountRange[],
    inputs: IPartialInput[],
) => void;

interface IAddModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onCreate: onCreateType
}

const AddModal = ({
    onClose,
    onCreate,
}: IAddModalProps
) => {

    // Manejo del estado global
    const distpatch:
        AppDispatchRedux = useDispatch();

    // Manejo de carga gui y errores del servidor
    const validation =
        useSelector((state: RootState) => state.error);


    // Estados locales del componente
    const [proccessesAsigned, setProccessesAsigned] =
        useState<IPartialProductProcess[]>([]);
    const [discountsAsigned, setDiscountsAsigned] =
        useState<IPartialProductDiscountRange[]>([]);
    const [inputsAsigned, setInputsAsigned] =
        useState<IPartialProductInput[]>([]);
    const [equivalence, setEquivalence] =
        useState<number | undefined>(undefined);
    const [inputSelected, setInputSelected] =
        useState<IInput | undefined>(undefined);
    const [name, setName] =
        useState<string | undefined>(undefined);
    const [sku, setSku] =
        useState<string | undefined>(undefined);
    const [description, setDescription] =
        useState<string | undefined>(undefined);
    const [type, setType] =
        useState<string | undefined>(undefined);
    const [isActive, setIsActive] =
        useState<boolean | undefined>(undefined);
    const [salePrice, setSalePrice] =
        useState<number | undefined>(undefined);
    // Guarda el archivo seleccionado
    const [imageFile, setImageFile] =
        useState<File | null>(null);
    // Guarda URL temporal para mostrar preview
    const [previewUrl, setPreviewUrl] =
        useState<string | null>(null);
    const [selectedProcesses, setSelectedProcesses] =
        useState<IProcess[]>([]);
    const [minQty, setMinQty] =
        useState<number | undefined>(undefined);
    const [maxQty, setMaxQty] =
        useState<number | undefined>(undefined);
    const [unitPrice, setUnitPrice] =
        useState<number | undefined>(undefined);

    const {
        processes
    } = useProcesses();

    const {
        inputs
    } = useInputs();

    // Manejo de estado de la gui

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);
    const [isHasProccesses, setIsHasProccesses] =
        useState<boolean | undefined>(undefined);
    const [isHasInputs, setIsHasInputs] =
        useState<boolean | undefined>(undefined);
    const [isHasDiscountRanges, setIsHasDiscountRanges] =
        useState<boolean | undefined>(undefined);
    const [isAddProcesses, setIsAddprocesses] =
        useState<boolean | undefined>(undefined);
    const [isAddInput, setIsAddInput] =
        useState<boolean | undefined>(undefined);
    const [isAddDiscount, setIsAddDiscount] =
        useState<boolean | undefined>(undefined);

    const toggleStateIsAddProcesses = () => {
        if (isAddProcesses === undefined) {
            setIsAddprocesses(true);
        }
        setIsAddprocesses((prev) => !prev);
    };

    const toggleStateIsAddDiscounts = () => {
        setMinQty(undefined);
        setMaxQty(undefined);
        setUnitPrice(undefined);
        if (isAddDiscount === undefined) {
            setIsAddDiscount(true);
        }
        setIsAddDiscount((prev) => !prev);
    };

    const handleOnClickAddDiscounts = (): void => {
        if (
            minQty !== undefined && minQty >= 0 &&
            maxQty !== undefined && maxQty >= 0 &&
            unitPrice !== undefined && unitPrice >= 0
            && (minQty < maxQty || minQty === maxQty)
        ) {
            const newDiscount: IPartialProductDiscountRange = {
                id: Date.now() + Math.random(),
                min_qty: minQty,
                max_qty: maxQty,
                unit_price: unitPrice,
            };
            const hasError = discountsAsigned.some(
                (d) =>
                    d.min_qty !== undefined &&
                    d.max_qty !== undefined &&
                    d.min_qty <= maxQty &&
                    d.max_qty >= minQty
            );
            if (!hasError) {
                setDiscountsAsigned((prev) => [...prev, newDiscount]);
                setMinQty(undefined);
                setMaxQty(undefined);
                setUnitPrice(undefined);
                setIsAddDiscount(false);
            }
        }
    };

    const handleOnClickAddProcesses = () => {
        if (selectedProcesses.length > 0) {
            const newProcesses: IPartialProductProcess[] = [];
            selectedProcesses.forEach((p, index) => {
                newProcesses.push({
                    process: p,
                    sort_order: (proccessesAsigned.length) + 1 + index,
                    process_id: p.id,
                });
            });
            setProccessesAsigned((prev) => [...prev, ...newProcesses]);
            setSelectedProcesses([]);
            setIsAddprocesses(false);
        }
    }

    const toggleStateIsAddInput = () => {
        setEquivalence(undefined);
        if (isAddInput === undefined) {
            setIsAddInput(true);
        }
        setIsAddInput((prev) => !prev);
    };

    const handleOnClickAddInput = () => {
        if (inputSelected) {
            const newProductInput: IPartialProductInput = {
                equivalence: equivalence,
                inputs: inputSelected,
                input_id: inputSelected?.id || 0,
            }
            setInputsAsigned((prev) => [...prev, newProductInput]);
            setInputSelected(undefined);
            setIsAddInput(false);
            setEquivalence(undefined);
        }
    }

    // Manejo del estado local del componente
    const handleOnClickAdd = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            name && name !== "" &&
            description && description !== "" &&
            type && type !== "" &&
            sku && sku !== "" &&
            salePrice && salePrice >= 0 &&
            isActive !== undefined &&
            imageFile
        ) {
            const newProduct: IPartialProduct = {
                name,
                description,
                type,
                sku,
                active: isActive,
                photo: imageFile,
                sale_price: salePrice,
            }
            onCreate(
                newProduct,
                (isHasProccesses && proccessesAsigned.length > 0) ? proccessesAsigned : [],
                (isHasDiscountRanges && discountsAsigned.length > 0)
                    ? discountsAsigned.map((d) => ({
                        max_qty: d.max_qty,
                        min_qty: d.min_qty,
                        unit_price: d.unit_price
                    }))
                    : [],
                (isHasInputs && inputsAsigned.length > 0) ? inputsAsigned : []
            );
        }
    }

    // Efectos secundarios para la GUI
    useEffect(() => {
        distpatch(clearAllErrors());
    }, []);

    // Actualiza la URL cuando cambia el archivo
    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(objectUrl);

        // Limpia la URL cuando cambia o componente se desmonta
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    // Maneja la selección del archivo (input tipo file)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const orderedItems = useMemo(
        () => [...proccessesAsigned]
            .sort(
                (a, b) =>
                    (a.sort_order ?? 0) -
                    (b.sort_order ?? 0)
            ),
        [proccessesAsigned]
    );

    useEffect(() => {
        distpatch(clearAllErrors());
    }, []);

    useEffect(() => {
        setProccessesAsigned([]);
        setSelectedProcesses([]);
        setIsAddprocesses(undefined);
    }, [isHasProccesses])
    useEffect(() => {
        setInputsAsigned([]);
        setInputSelected(undefined);
        setEquivalence(undefined);
        setIsAddInput(undefined);
    }, [isHasInputs])
    useEffect(() => {
        setDiscountsAsigned([]);
        setMaxQty(undefined);
        setMinQty(undefined);
        setUnitPrice(undefined);
        setIsAddDiscount(undefined);
    }, [isHasDiscountRanges])

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
                        <div>
                            <InputText
                                placeholder={"Type "}
                                label={"Type"}
                                type={"text"}
                                value={type || ""}
                                onChange={(value) => setType(value)}
                                required
                            />
                            {type === "" && (
                                <small
                                    style={{
                                        color: "red"
                                    }}
                                >
                                    Type is required
                                </small>
                            )}
                        </div>
                        <div>
                            <InputText
                                placeholder={"Serial number"}
                                label={"Serial number"}
                                type={"text"}
                                value={sku || ""}
                                onChange={(value) => setSku(value)}
                                required
                            />
                            {sku === "" && (
                                <small
                                    style={{
                                        color: "red"
                                    }}
                                >
                                    Serial number is required
                                </small>
                            )}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                marginTop: 16,
                            }}
                        >
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
                        </div>
                        <div>
                            <SelectableCardList
                                name="hasProcesses"
                                items={[true, false]}
                                getId={(value) => Number(value)}
                                renderFields={(value) => (
                                    <>
                                        <div>{value ? "Yes" : "No"}</div>
                                    </>
                                )}
                                selectedItem={isHasProccesses}
                                onChange={setIsHasProccesses}
                                label={`Has processes?`}
                                emptyMessage="No found proccesses"
                            />
                            {
                                isHasProccesses &&
                                <div>
                                    <button
                                        type="button"
                                        onClick={toggleStateIsAddProcesses}
                                    >Show processes</button>
                                    {
                                        isAddProcesses && <div>
                                            <SelectableMultipleCardList
                                                items={processes.filter(
                                                    (p) => !proccessesAsigned.find((s) => s.process?.id === p.id)
                                                )}
                                                getId={p => p.id}
                                                label="Select processes"
                                                name="purchased-order-product"
                                                onChange={setSelectedProcesses}
                                                selectedItems={selectedProcesses}
                                                emptyMessage="No processes found"
                                                renderFields={(pop) => (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection: "column"
                                                        }}
                                                    >
                                                        <small>{`${pop.name}`}</small>
                                                    </div>
                                                )}
                                            />
                                            {processes.filter(
                                                (p) => !proccessesAsigned.find((s) => s.process?.id === p.id)).length > 0 &&
                                                <div>
                                                    <button type="button" onClick={() => {
                                                        toggleStateIsAddProcesses();
                                                        setSelectedProcesses([]);
                                                    }}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" onClick={handleOnClickAddProcesses}>
                                                        Add selected processes
                                                    </button>
                                                </div>
                                            }
                                        </div>

                                    }
                                    <DraggableList
                                        items={orderedItems.map((item) => ({
                                            ...item,
                                            id: String(item.process_id)
                                        }))}
                                        onItemsChange={(newItems) => {
                                            // Restauramos la lista sin el `id` si no quieres guardarlo
                                            setProccessesAsigned(newItems.map(({ id, ...rest }) => ({
                                                ...rest,
                                                process_id: Number(id), // opcional si ya lo tienes
                                            })));
                                        }}
                                        renderItemContent={(item) => (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    gap: "1rem",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: "50px",
                                                        textAlign: "center",
                                                        fontWeight: "bold",
                                                        color: "#4a5568"
                                                    }}
                                                >
                                                    {`${item.sort_order}`}
                                                </span>
                                                <span>
                                                    {`${item.process?.name}`}
                                                </span>
                                            </div>
                                        )}
                                        emptyMessage="No processes assigned"
                                    />
                                </div>
                            }
                        </div>
                        <div>
                            <SelectableCardList
                                name="hasInputs"
                                items={[true, false]}
                                getId={(value) => Number(value)}
                                renderFields={(value) => (
                                    <>
                                        <div>{value ? "Yes" : "No"}</div>
                                    </>
                                )}
                                selectedItem={isHasInputs}
                                onChange={setIsHasInputs}
                                label={`Has inputs?`}
                                emptyMessage="No found inputs"
                            />
                            {
                                isHasInputs &&
                                <div>
                                    <button
                                        type="button"
                                        onClick={toggleStateIsAddInput}
                                    >Show inputs</button>
                                    {
                                        isAddInput && <div>
                                            <div>
                                                <SelectableCardListWithImage
                                                    name="input"
                                                    items={inputs.filter(
                                                        (p) => !inputsAsigned.find((s) => s.inputs?.id === p.id))}
                                                    getId={(i) => i.id}
                                                    renderFields={(value) => (
                                                        <>
                                                            <div><strong>name:</strong> {value.name}</div>
                                                            <div><strong>Supplier:</strong> {value.supplier}</div>
                                                        </>
                                                    )}
                                                    selectedItem={inputSelected}
                                                    getImage={(i) => {
                                                        if (i.photo) {
                                                            return i.photo.toString();
                                                        }
                                                        return "";
                                                    }}
                                                    onChange={setInputSelected}
                                                    label={`Select input`}
                                                    emptyMessage="No inputs found"
                                                />
                                                {inputs.filter(
                                                    (p) => !inputsAsigned.find((s) => s.inputs?.id === p.id)).length > 0 &&
                                                    <div>
                                                        <div>
                                                            <InputNumber
                                                                min={0}
                                                                label="Equivalence"
                                                                required
                                                                numberType="integer"
                                                                value={Number(equivalence) || 0}
                                                                onChange={setEquivalence}
                                                            />
                                                        </div>
                                                        <div>
                                                            <button type="button" onClick={() => {
                                                                toggleStateIsAddInput();
                                                                setEquivalence(undefined);
                                                                setInputSelected(undefined);
                                                            }}>
                                                                Cancel
                                                            </button>
                                                            <button type="button" onClick={handleOnClickAddInput}>
                                                                Add selected input
                                                            </button>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    }
                                    <ListItem
                                        items={inputsAsigned}
                                        emptyMessage={"No inputs assigned"}
                                        onDelete={(item) => {
                                            setInputsAsigned((prev) =>
                                                prev.filter((i) => i.input_id !== item.input_id)
                                            );
                                        }}
                                        getId={(item) => Number(item.inputs?.id)}
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
                                                <small>{`Name: ${item.inputs?.name}`}</small>
                                                <small>{`Unit cost:  ${item.inputs?.unit_cost}`}</small>
                                                <small>{`Supplier: ${item.inputs?.supplier}`}</small>
                                                <small>{`Equivalence: ${item.equivalence}`}</small>
                                            </div>
                                        )}
                                        label="Inputs assigned"
                                    />
                                </div>
                            }
                            <div>
                                <SelectableCardList
                                    name="hasDiscounts"
                                    items={[true, false]}
                                    getId={(value) => Number(value)}
                                    renderFields={(value) => (
                                        <>
                                            <div>{value ? "Yes" : "No"}</div>
                                        </>
                                    )}
                                    selectedItem={isHasDiscountRanges}
                                    onChange={setIsHasDiscountRanges}
                                    label={`Has discount ranges?`}
                                    emptyMessage="No found discouts ranges"
                                />
                                {
                                    isHasDiscountRanges && <div>
                                        <button
                                            type="button"
                                            onClick={toggleStateIsAddDiscounts}
                                        >Add discounts ranges</button>
                                        {
                                            isAddDiscount && <div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "1rem",
                                                    }}
                                                >
                                                    <InputNumber
                                                        min={0}
                                                        label="Min quantity"
                                                        required
                                                        numberType="integer"
                                                        value={Number(minQty) || 0}
                                                        onChange={setMinQty}
                                                    />
                                                    <InputNumber
                                                        min={0}
                                                        label="Max quantity"
                                                        required
                                                        numberType="integer"
                                                        value={Number(maxQty) || 0}
                                                        onChange={setMaxQty}
                                                    />
                                                    <InputNumber
                                                        min={0}
                                                        label="Unit price"
                                                        required
                                                        numberType="decimal"
                                                        value={Number(unitPrice) || 0}
                                                        onChange={setUnitPrice}
                                                    />
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            toggleStateIsAddDiscounts()
                                                            setMinQty(undefined);
                                                            setMaxQty(undefined);
                                                            setUnitPrice(undefined);
                                                        }}
                                                    > Cancel </button>
                                                    <button type="button" onClick={handleOnClickAddDiscounts}>
                                                        Add discount
                                                    </button>
                                                </div>
                                            </div>
                                        }
                                        <ListItem
                                            items={discountsAsigned}
                                            emptyMessage={"No discounts ranges assigned"}
                                            onDelete={(item) => {
                                                setDiscountsAsigned((prev) =>
                                                    prev.filter((i) => i.id !== item.id)
                                                );
                                            }}
                                            getId={(item) => Number(item?.id)}
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
                                                    <small>{`Min qty : ${item.min_qty}`}</small>
                                                    <small>{`Max qty : ${item.max_qty}`}</small>
                                                    <small>{`Unit price : ${item.unit_price}`}</small>
                                                </div>
                                            )}
                                            label="Discount ranges assigned"
                                        />
                                    </div>

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
                            <div>
                                <InputNumber
                                    min={0}
                                    label="Sale price"
                                    required
                                    numberType="decimal"
                                    onChange={setSalePrice}
                                    value={Number(salePrice) || 0}
                                />
                                {
                                    salePrice !== undefined && salePrice !== null && salePrice <= 0 && (
                                        <small style={{ color: "red" }}>
                                            Sale price is required
                                        </small>
                                    )
                                }
                            </div>
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