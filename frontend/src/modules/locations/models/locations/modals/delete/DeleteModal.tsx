import {
    type SetStateAction,
    type Dispatch,
    useEffect,
} from "react";
import {
    useDispatch,
    useSelector,
} from "react-redux";
import type {
    AppDispatchRedux,
    RootState
} from "../../../../../../store/store";
import {
    clearAllErrors
} from "../../../../../../store/slicer/errorSlicer";


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

    const distpatch: AppDispatchRedux = useDispatch();
    const validation =
        useSelector((state: RootState) => state.error)

    useEffect(() => {
        distpatch(clearAllErrors());
    }, []);

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
                    This action cannot be undone. It will permanently delete the selected location.
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


