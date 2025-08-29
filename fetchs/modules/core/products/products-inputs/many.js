import fetch from 'node-fetch';

const productsInputs = [
    { product_id: 1, input_id: 1, equivalence: 2 },
    { product_id: 1, input_id: 2, equivalence: 3 },
    { product_id: 2, input_id: 2, equivalence: 2 },
];

const sendProductInput = async (ProductInput) => {
    try {
        const response = await fetch('http://localhost:3003/products/products-inputs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ProductInput),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            console.log(`Relación enviada correctamente para el producto con ID ${ProductInput.product_id}`);
        } else {
            console.error(`Error al enviar la relación del producto ${ProductInput.product_id}:`, response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar la relación producto-proceso:", error);
    }
};

const sendMultipleProductsInputs = async () => {
    for (let i = 0; i < productsInputs.length; i++) {
        await sendProductInput(productsInputs[i]);
    }
};

export default sendMultipleProductsInputs;
