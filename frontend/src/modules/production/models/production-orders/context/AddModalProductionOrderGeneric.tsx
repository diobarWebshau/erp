import ProviderAddModalProductionOrder
    from "./AddModalProductionOrderProvider";
import type {
    ReactNode
} from "react";

interface IModalProductionOrderGeneric {
    children: ReactNode;
}

const ModalProductionOrderGeneric = ({
    children
}: IModalProductionOrderGeneric) => {
    return (
        <ProviderAddModalProductionOrder>
            {children}
        </ProviderAddModalProductionOrder>
    );
};

export default ModalProductionOrderGeneric;
