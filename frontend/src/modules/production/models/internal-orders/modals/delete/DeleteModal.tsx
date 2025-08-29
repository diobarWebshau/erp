import type {
    SetStateAction,
    Dispatch,
} from "react";
import {
    useSelector,
} from "react-redux";
import type {
    RootState
} from "../../../../../../store/store";

interface IDeleteModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onDelete: () => void,
}

const DeleteModal = (
    {
        onClose,
        onDelete,
    }: IDeleteModalProps
) => {

    const validation =
        useSelector((state: RootState) => state.error)
    return (
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
                <h2>
                    Are you absolutely sure?
                </h2>
                <p>
                    This action cannot be undone. It will permanently delete the selected internal order(s).
                </p>
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
                        onClick={() => onClose(false)}
                    >Cancel</button>
                    <button
                        onClick={onDelete}
                    >Delete</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;


