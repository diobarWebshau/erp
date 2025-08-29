import fetch from 'node-fetch';

// Datos simulados de órdenes de compra
const purchasedOrders = [
    {
        order_code: "ORD12dasd345",
        delivery_date: "2025-05-01T00:00:00Z",
        status: "Pending",
        client_id: 1,
        client_address_id: 1,
        total_price: 250.00
    },
    {
        order_code: "ORD12dsa34556",
        delivery_date: "2025-05-02T00:00:00Z",
        status: "Pending",
        client_id: 2,
        client_address_id: 2,
        total_price: 320.00
    }
];

const sendPurchasedOrderData = async (order) => {
    try {
        const response = await fetch('http://localhost:3003/sales/purchased-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
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
        console.error('Error al enviar los datos de la orden de compra:', error.message);
    }
};

const sendMultiplePurchasedOrderData = async () => {
    for (let i = 0; i < purchasedOrders.length; i++) {
        const order = purchasedOrders[i];
        await sendPurchasedOrderData(order);
    }
};


export default sendMultiplePurchasedOrderData;
