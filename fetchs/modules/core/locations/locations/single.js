import fetch from 'node-fetch';

const location = {
    name: "Ubicación A",          
    type: "Tipo A",               
    description: "Descripción A", 
    active: 1                     
};

const sendLocation = async () => {
    try {
        const response = await fetch('http://localhost:3003/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(location),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            console.log(`Ubicación enviada correctamente: ${location.name}`);
        } else {
            console.error(`Error al enviar la ubicación ${location.name}:`, response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar la ubicación:", error);
    }
};

export default sendLocation;
