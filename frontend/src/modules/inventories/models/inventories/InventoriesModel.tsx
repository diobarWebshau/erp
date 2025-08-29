import {
    useEffect, useState
} from "react";
import type {
    AppDispatchRedux
} from "../../../../store/store";
import type {
    IInventoryDetails
} from "../../../../interfaces/inventories";
import {
    defaultValueInventoryDetails,
} from "../../../../interfaces/inventories";
import GenericTable
    from "../../../../components/ui/table/Table copy 2";
import {
    useDispatch
} from "react-redux";
import {
    columnsInventoryDetails
} from "./structure/columns"
import {
    fetchInventoriesDetailsFromDB,
} from "../../../../queries/inventoriesQueries"
import {
    createInventoryMovementInDB
} from "../../../../queries/inventoryMovementsQueries"
import type {
    RowAction,
    TopButtonAction
} from "../../../../components/ui/table/types";
import {
    Plus, Minus,
    CirclePlus
} from "lucide-react";
import StockInModal
    from "./modals/stock-in/StockInModal";
import StockOutModal
    from "./modals/stock-out/StockOutModal";
import type {
    IPartialInventoryMovement
} from "../../../../interfaces/inventoyMovements";
import TransferModal from "./modals/transfer/TransferModal";
import type {
    IPartialInventoryTransfer
} from "../../../../interfaces/inventoryTransfer";
import {
    createInventoryTransferInDB
} from "../../../../queries/inventoryTransferQueries";

const InventoriesModel = () => {

    const dispatch: AppDispatchRedux =
        useDispatch();
    const [inventories, setInventories] =
        useState<IInventoryDetails[]>([])
    const [serverError, setServerError] =
        useState<string | null>(null);
    const [loading, setLoading] =
        useState<boolean>(false);
    const [
        inventoriesRecord,
        setInventoriesRecord
    ] = useState<IInventoryDetails>(defaultValueInventoryDetails);

    const [isActiveStockInModal, setIsActiveStockInModal] =
        useState<boolean>(false);
    const [isActiveStockOutModal, setIsActiveStockOutModal] =
        useState<boolean>(false);
    const [isActiveTransferModal, setIsActiveTransferModal] =
        useState<boolean>(false);

    const fetchs = async () => {
        setLoading(true);
        try {
            const response =
                await fetchInventoriesDetailsFromDB(dispatch);
            if (response.length > 0) {
                setInventories(response);
            } else {
                setInventories([])
            }
            setServerError(null);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStockIn = async (inventory: IPartialInventoryMovement) => {
        setLoading(true);
        try {
            console.log(inventory);

            const response = await createInventoryMovementInDB(
                inventory,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
            setIsActiveStockInModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStockOut = async (inventory: IPartialInventoryMovement) => {
        setLoading(true);
        try {
            console.log(inventory);
            const response = await createInventoryMovementInDB(
                inventory,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
            setIsActiveStockOutModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleTransfer = async (transfer: IPartialInventoryTransfer) => {
        setLoading(true);
        try {

            console.log(transfer);
            const response = await createInventoryTransferInDB(
                transfer,
                dispatch
            );
            if (!response) {
                return;
            }
            setServerError(null);
            fetchs();
            setIsActiveTransferModal(false);
        } catch (error) {
            if (error instanceof Error)
                setServerError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const toggleActiveTransferModal = () => {
        setServerError(null);
        console.log("entro");
        setIsActiveTransferModal(!isActiveTransferModal);
    }


    const toggleActiveStockInModal = (record: IInventoryDetails) => {
        setServerError(null);
        setInventoriesRecord(record);
        setIsActiveStockInModal(!isActiveStockInModal);
    }

    const toggleActiveStockOutModal = (record: IInventoryDetails) => {
        setServerError(null);
        setInventoriesRecord(record);
        setIsActiveStockOutModal(!isActiveStockOutModal);
    }

    const rowActions: RowAction<IInventoryDetails>[] = [
        {
            label: "Stock in",
            onClick: toggleActiveStockInModal,
            icon: <Plus size={15} />
        },
        {
            label: "Stock out",
            onClick: toggleActiveStockOutModal,
            icon: <Minus size={15} />
        },
    ];

    const extraButtons: TopButtonAction<IInventoryDetails>[] = [
        {
            label: "Transfer",
            onClick: toggleActiveTransferModal,
            icon: <CirclePlus size={15} />
        }
    ];


    useEffect(() => {
        fetchs();
    }, []);

    return (
        <>
            <GenericTable
                columns={columnsInventoryDetails}
                data={inventories}
                rowActions={rowActions}
                onDeleteSelected={
                    () => console.log("borrado selectivo")}
                modelName="Internal order"
                extraButtons={extraButtons}
            />
            {
                isActiveStockInModal && < StockInModal
                    onClose={setIsActiveStockInModal}
                    onStockIn={(value) => handleStockIn(value)}
                    record={inventoriesRecord}
                />
            }
            {
                isActiveStockOutModal && <StockOutModal
                    onClose={setIsActiveStockOutModal}
                    onStockOut={(value) => handleStockOut(value)}
                    record={inventoriesRecord}
                />
            }
            {
                isActiveTransferModal && <TransferModal
                    onClose={setIsActiveTransferModal}
                    onTransfer={(value) => handleTransfer(value)}
                />
            }
        </>
    );
}

export default InventoriesModel;