import fetch from 'node-fetch';

const purchaseOrderProducts = [
    {
        purchase_order_id: 1,
        product_id: 1,
        qty: 1200,
        status: "Process"
    },
    // {
    //     purchase_order_id: 1,
    //     product_id: 2,
    //     qty: 700,
    //     status: "Process"
    // },
    // {
    //     purchase_order_id: 1,
    //     product_id: 3,
    //     qty: 500,
    //     status: "Process"
    // },
    // {
    //     purchase_order_id: 2,
    //     product_id: 1,
    //     qty: 1300,
    //     status: "Process"
    // },
    // {
    //     purchase_order_id: 2,
    //     product_id: 2,
    //     qty: 1100,
    //     status: "Process"
    // }
];

const sendPurchaseOrderProductData = async (productData) => {
    try {
        const response = await fetch(
            'http://localhost:3003/sales/purchased-orders-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
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
        console.error(error.message);
    }
};

const sendMultiplePurchaseOrderProductData = async () => {
    for (let i = 0; i < purchaseOrderProducts.length; i++) {
        const product = purchaseOrderProducts[i];
        await sendPurchaseOrderProductData(product);
    }
};

export default sendMultiplePurchaseOrderProductData;
