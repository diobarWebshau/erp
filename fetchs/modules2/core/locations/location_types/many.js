import fetch from 'node-fetch';

const locationTypesData = [
    {
        name: "Store"
    },
    {
        name: "Production"
    }
];

const sendLocationType = async (data) => {
    try {
        const response = await fetch('http://localhost:3003/locations/location-types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData);
        } else {
            console.error('Error al registrar tipo de ubicación:', response.status);
            const errorText = await response.text();
            console.error(errorText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const sendMultipleLocationTypes = async () => {
    for (let i = 0; i < locationTypesData.length; i++) {
        await sendLocationType(locationTypesData[i]);
    }
};

export default sendMultipleLocationTypes;
