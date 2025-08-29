import fetch from 'node-fetch';

const appliedProductDiscountsClient = [
    {
        purchase_order_product_id: 1,
        product_discount_client_id: 1,
    },
    {
        purchase_order_product_id: 4,
        product_discount_client_id: 2,
    }
];

const sendAppliedProductDiscountData = async (discountData) => {
    try {
        const response = await fetch('http://localhost:3003/sales/applied-product-discounts-clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discountData),
        });

        const contentType = response.headers.get('content-type');

        if (response.ok) {
            if (contentType?.includes('application/json')) {
                const responseData = await response.json();
                console.log(responseData);
            } else {
                const text = await response.text();
                console.warn(text);
            }
        } else {
            if (contentType?.includes('application/json')) {
                const errorData = await response.json();
                console.error(errorData);
            } else {
                const errorText = await response.text();
                console.error(errorText);
            }
        }
    } catch (error) {
        console.error("Error en la solicitud:", error.message);
    }
};

const sendMultipleAppliedProductDiscountData = async () => {
    await Promise.all(appliedProductDiscountsClient.map(p => sendAppliedProductDiscountData(p)));
};

export default sendMultipleAppliedProductDiscountData;
