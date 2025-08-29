import fetch from 'node-fetch';

const productDiscounts = [
    {
        client_id: 1,
        product_id: 1,
        discount_percentage: 15.0
    },
    {
        client_id: 2,
        product_id: 1,
        discount_percentage: 20.0
    }
];

const sendProductDiscountData = async (discountData) => {
    try {
        const response = await fetch('http://localhost:3003/sales/product-discounts-clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discountData),
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

const sendMultipleProductDiscountData = async () => {
    for (let i = 0; i < productDiscounts.length; i++) {
        const discount = productDiscounts[i];
        await sendProductDiscountData(discount);
    }
};

export default sendMultipleProductDiscountData;
