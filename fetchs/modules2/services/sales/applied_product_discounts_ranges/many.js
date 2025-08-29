import fetch from 'node-fetch';

const appliedProductDiscountsRanges = [
    {
        purchase_order_product_id: 1,
        product_discount_range_id: 1,
    },
    {
        purchase_order_product_id: 2,
        product_discount_range_id: 2,
    }
];

const sendAppliedProductDiscountRangeData = async (discountData) => {
    try {
        const response = await fetch('http://localhost:3003/sales/applied-product-discounts-ranges', {
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

const sendMultipleAppliedProductDiscountRangeData = async () => {
    await Promise.all(appliedProductDiscountsRanges.map(p => sendAppliedProductDiscountRangeData(p)));
};

export default sendMultipleAppliedProductDiscountRangeData;
