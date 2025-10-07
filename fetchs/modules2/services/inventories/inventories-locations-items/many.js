import fetch from 'node-fetch';

const inventoryLocationItemsData = [
    // Location 1
    {
        inventory_id: 1,
        location_id: 1,
        item_type: 'input',
        item_id: 1
    },
    {
        inventory_id: 2,
        location_id: 1,
        item_type: 'input',
        item_id: 2
    },
    {
        inventory_id: 3,
        location_id: 1,
        item_type: 'product',
        item_id: 1
    },
    {
        inventory_id: 4,
        location_id: 1,
        item_type: 'product',
        item_id: 2
    },
    {
        inventory_id: 5,
        location_id: 1,
        item_type: 'product',
        item_id: 3
    },
    // Location 2
    {
        inventory_id: 6,
        location_id: 2,
        item_type: 'input',
        item_id: 1
    },
    {
        inventory_id: 7,
        location_id: 2,
        item_type: 'input',
        item_id: 2
    },
    {
        inventory_id: 8,
        location_id: 2,
        item_type: 'product',
        item_id: 1
    },
    {
        inventory_id: 9,
        location_id: 2,
        item_type: 'product',
        item_id: 2
    },
    // Location 3
    {
        inventory_id: 10,
        location_id: 3,
        item_type: 'input',
        item_id: 1
    },
    {
        inventory_id: 11,
        location_id: 3,
        item_type: 'input',
        item_id: 2
    },
    {
        inventory_id: 12,
        location_id: 3,
        item_type: 'product',
        item_id: 1
    }
];

const sendInventoryLocationItem = async (data) => {
    try {
        const response = await fetch('http://localhost:3003/inventories/inventories-locations-items', {
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
    } catch (error) {

        console.error('Error al registrar el elemento de ubicación de inventario:', error.message);
    }
};

const sendMultipleInventoryLocationItems = async () => {
    for (let i = 0; i < inventoryLocationItemsData.length; i++) {
        await sendInventoryLocationItem(inventoryLocationItemsData[i]);
    }
};

export default sendMultipleInventoryLocationItems;
