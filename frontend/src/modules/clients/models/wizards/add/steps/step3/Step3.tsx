import StyleModule from "./Step3.module.css";
import type { ClientState, ClientAction } from "../../../../../context/clientTypes"
import type { Dispatch } from "react";

interface IStep1 {
    state: ClientState;
    dispatch: Dispatch<ClientAction>;
    onCancel: () => void;
}
const Step3 = () => {
    return (
        <div>
            <h1>Step 3</h1>
        </div>
    );
};

export default Step3;
