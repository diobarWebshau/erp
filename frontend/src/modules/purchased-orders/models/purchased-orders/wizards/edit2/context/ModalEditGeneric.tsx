import ProviderModalAdd from "./modalEditProvider"
import EditModal from "../EditModal";
import type { IPartialPurchasedOrder } from "../../../../../../../interfaces/purchasedOrder";

interface IModalAddGeneric {
    record: IPartialPurchasedOrder,
    onClose: () => void,
    onEdit: (({ original, update }: { original: IPartialPurchasedOrder; update: IPartialPurchasedOrder }) => Promise<boolean>),
    onDelete: () => void;
}

const ModalAddGeneric = ({
    record,
    onClose,
    onEdit,
    onDelete
}: IModalAddGeneric) => {
    return (
        <ProviderModalAdd>
            <EditModal
                record={record}
                onClose={onClose}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </ProviderModalAdd>
    );
}

export default ModalAddGeneric;