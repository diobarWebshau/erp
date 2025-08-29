import fetch from 'node-fetch';

const productionLineLocation = {
    production_line_id: 1,
    location_id: 2
};

const sendProductionLineLocation = async () => {
    try {
        const response = await fetch('http://localhost:3003/production-lines-locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productionLineLocation),
        });
        if (response.ok) {
            const responseData = await response.json();
            console.log('Respuesta del servidor:', responseData);
            console.log(`Relación enviada correctamente: Línea de Producción ${data.production_line_id} - Ubicación ${data.location_id}`);
        } else {
            console.error(`Error al enviar la relación: Línea de Producción ${data.production_line_id} - Ubicación ${data.location_id}`, response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error("Error al enviar la relación:", error);
    }
};

export default sendProductionLineLocation;