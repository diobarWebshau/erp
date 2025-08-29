import {
    type SetStateAction, type Dispatch,
} from "react";

interface IDeleteModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    onDelete: () => void,
    validation: string[]
}

const DeleteModal = (
    {
        onClose,
        onDelete,
        validation
    }: IDeleteModalProps
) => {
    console.log(validation)
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
                    This action cannot be undone. It will permanently delete the selected location type(s).
                </p>
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
                        onClick={onDelete}
                    >Delete</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;


