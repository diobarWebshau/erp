import fetch from 'node-fetch';

const inventoryTransfers = [
    {
        item_type: "product",
        item_id: 1,
        qty: 5,
        reason: "Reposición por baja de stock",
        status: "completed",
        source_location_id: 1,
        destination_location_id: 2
    },
    {
        item_type: "product",
        item_id: 1,
        qty: 5,
        reason: "Reorganización de insumos",
        status: "completed",
        source_location_id: 2,
        destination_location_id: 1
    },
    {
        item_type: "product",
        item_id: 1,
        qty: 5,
        reason: "Reorganizacion",
        status: "completed",
        source_location_id: 1,
        destination_location_id: 3
    }
];

const sendInventoryTransfer = async (data) => {
    try {
        const response = await fetch('http://localhost:3003/inventory-transfers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const contentType = response.headers.get('content-type');

        if (response.ok) {
            if (contentType && contentType.includes('application/json')) {
                const responseData = await response.json();
                console.log(responseData);
            } else {
                const text = await response.text();
                console.warn(text);
            }
        } else {
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                console.error(errorData);
            } else {
                const errorText = await response.text();
                console.error(errorText);
            }
        }
    } catch (err) {
        console.error("Error al enviar la solicitud:", err);
    }
};

const sendMultipleInventoryTransfers = async () => {
    for (const transfer of inventoryTransfers) {
        await sendInventoryTransfer(transfer);
    }
};

export default sendMultipleInventoryTransfers;
