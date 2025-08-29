import fetch from 'node-fetch';

// Definimos el objeto de relación entre productos y procesos
const productProcess = {
    product_id: 1,  
    process_id: 2   
};

// Función para enviar un solo producto-proceso
const sendProductProcess = async () => {
    try {
        const response = await fetch('http://localhost:3003/products_processes', {
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

export default sendProductProcess;
