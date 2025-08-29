import fetch from 'node-fetch';

const productDiscountRangesData = [
    // Producto 1 con dos rangos de descuento
    {
        product_id: 1,
        unit_price: 99.99,
        min_qty: 10,
        max_qty: 100
    },
    {
        product_id: 1,
        unit_price: 90.00,  
        min_qty: 101,
        max_qty: 200
    },

    // Producto 2 con dos rangos de descuento
    {
        product_id: 2,
        unit_price: 79.99,
        min_qty: 10,
        max_qty: 200
    },
    {
        product_id: 2,
        unit_price: 70.00,  
        min_qty: 201,
        max_qty: 500
    },
    // Producto 3 con un solo rango de descuento
    {
        product_id: 3,
        unit_price: 120.50,
        min_qty: 10,
        max_qty: 50
    }
];

const sendProductDiscountRange = async (data) => {
    try {
        const response = await fetch('http://localhost:3003/products/product-discounts-ranges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData);
        } else {
            console.error('Error al registrar el descuento de producto:', response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error('Error al registrar el descuento de producto:', error);
    }
};

const sendMultipleProductDiscountRanges = async () => {
    for (let i = 0; i < productDiscountRangesData.length; i++) {
        await sendProductDiscountRange(productDiscountRangesData[i]);
    }
};


export default sendMultipleProductDiscountRanges;
