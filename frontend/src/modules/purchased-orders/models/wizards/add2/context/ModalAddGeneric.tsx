import type { IPartialPurchasedOrder } from "../../../../../../interfaces/purchasedOrder";
import ProviderModalAdd from "./modalAddProvider"
import ModalAdd from "../ModalAdd";

interface IModalAddGeneric {
    onClose: () => void;
    onCreate: (data: IPartialPurchasedOrder) => (Promise<void> | void);
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