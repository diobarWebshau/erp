import fetch from 'node-fetch';

const locationTypesData = [
    { name: 'Store' },
    { name: 'Productión' },
];

const sendLocationType = async (data) => {
    try {
        const response = await fetch('http://localhost:3003/locations/location-types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const contentType = response.headers.get('Content-Type');
        if (response.ok) {
            const responseData = contentType && contentType.includes('application/json')
                ? await response.json()
                : await response.text();
            console.log('Tipo de ubicación creado correctamente:', responseData);
        } else {
            const errorMessage = contentType && contentType.includes('application/json')
                ? await response.json()
                : await response.text();
            console.error('Error al crear tipo de ubicación:', response.status);
            console.error('Mensaje del servidor:', errorMessage);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
};

const sendMultipleLocationTypes = async () => {
    for (let i = 0; i < locationTypesData.length; i++) {
        await sendLocationType(locationTypesData[i]);
    }
};

export default sendMultipleLocationTypes;
