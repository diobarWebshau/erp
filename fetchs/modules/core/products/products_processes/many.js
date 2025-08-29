import fetch from 'node-fetch';

const productProcesses = [
    { product_id: 1, process_id: 2 },
    { product_id: 1, process_id: 3 },
];

const sendProductProcess = async (productProcess) => {
    try {
        const response = await fetch('http://localhost:3003/products/products-processes/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productProcess),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            console.log(`Relación enviada correctamente para el producto con ID ${productProcess.product_id}`);
        } else {
            console.error(`Error al enviar la relación del producto ${productProcess.product_id}:`, response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar la relación producto-proceso:", error);
    }
};

const sendMultipleProductProcesses = async () => {
    for (let i = 0; i < productProcesses.length; i++) {
        await sendProductProcess(productProcesses[i]);
    }
};

export default sendMultipleProductProcesses;
