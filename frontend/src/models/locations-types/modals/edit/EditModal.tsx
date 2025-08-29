import InputText
    from "../../../../components/ui/general/input-text/InputText";
import {
    type MouseEvent, type SetStateAction, type Dispatch,
    useState, useEffect
} from "react";
import type {
    ILocationType,
    IPartialLocationType
} from "../../../../interfaces/locationTypes";
import { X } from "lucide-react"

interface IEditModalProps {
    value: IPartialLocationType,
    originalRecord: ILocationType,
    onValue: Dispatch<SetStateAction<IPartialLocationType>>
    onClose: Dispatch<SetStateAction<boolean>>
    onEdit: () => void,
    validation: string[];
}

const EditModal = (
    {
        originalRecord,
        onValue,
        onClose,
        onEdit,
        validation
    }: IEditModalProps
) => {

    const [name, setName] = useState<string | undefined>(originalRecord.name);

    useEffect(() => {
        onValue((prev) => ({
            ...prev,
            name
        }));
    }, [name]);


    const handleOnClickAdd = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (name) onEdit(); else setName("");
    }

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
                    <form>
                        <h2> New location type</h2>
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
                        {validation.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                {validation.map((error, index) => (
                                    <small key={index} style={{
                                        color: 'red',
                                        display: 'block'
                                    }}>
                                        {error}
                                    </small>
                                ))}
                            </div>
                        )}
                        <div>
                            <button
                                onClick={() => onClose(false)}
                            >Cancel</button>
                            <button
                                onClick={handleOnClickAdd}
                            >Accept</button>
                        </div>
                    </form>
                </div>
            </div >
        </>
    );
}

export default EditModal;


