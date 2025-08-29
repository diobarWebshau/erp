import fetch from 'node-fetch';

const inventoriesData = [
    // Location 1
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 5
    },
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 3
    },
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 5
    },
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 3
    },
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 7
    }, 
    // Location 2
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 3
    },
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 7
    }, 
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 5
    },
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 3
    },
    // Location 3
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 7
    }, 
    {
        stock: 0,
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 7
    }, 
    {
        stock: 0, 
        minimum_stock: 100.0000,
        maximum_stock: 10000.0000,
        lead_time: 7
    }
];

const sendInventory = async (data) => {
    try {
        const response = await fetch('http://localhost:3003/inventories/inventories', {
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
    } catch (error) {
        console.error('Error al registrar el inventario:', error.message);
    }
};

const sendMultipleInventories = async () => {
    for (let i = 0; i < inventoriesData.length; i++) {
        await sendInventory(inventoriesData[i]);
    }
};

export default sendMultipleInventories;
