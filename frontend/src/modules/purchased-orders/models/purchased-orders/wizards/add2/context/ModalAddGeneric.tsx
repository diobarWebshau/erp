import type {
    Dispatch,
    SetStateAction
} from "react";
import ProviderModalAdd
    from "./modalAddProvider"
import ModalAdd
    from "../ModalAdd";
import type {
    IPartialPurchasedOrder
} from "../../../../../../../interfaces/purchasedOrder";

interface IModalAddGeneric {
    onClose: () => void;
    onCreate: (data: IPartialPurchasedOrder) => void;
    onEdit: () => void;
}

const ModalAddGeneric = ({
    onClose,
    onCreate,
    onEdit
}: IModalAddGeneric) => {
    return (
        <ProviderModalAdd>
            <ModalAdd
                onClose={onClose}
                onCreate={onCreate}
                onEdit={onEdit}
            />
        </ProviderModalAdd>
    );
}

export default ModalAddGeneric;