import fetch from 'node-fetch';

const locationsData = [
    {
        // Location A
        name: "Location A",
        description: "Descripción de Location A.",
        is_active: true
    },
    {
        // Location B
        name: "Location B",
        description: "Descripción de Location B.",
        is_active: true
    },
    {
        // Location C
        name: "Location C",
        description: "Descripción de Location C.",
        is_active: true
    },
    {
        // Location D
        name: "Location D",
        description: "Descripción de Location D.",
        is_active: true
    },
    {
        // Location E
        name: "Location E",
        description: "Descripción de Location E.",
        is_active: true
    },
    {
        // Location F
        name: "Location F",
        description: "Descripción de Location F.",
        is_active: true
    }
];

const sendLocation = async (data) => {
    try {
        const response = await fetch('http://localhost:3003/locations/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData);
        } else {
            console.error('Error al registrar ubicación:', response.status);
            const errorText = await response.text();
            console.error(errorText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const sendMultipleLocations = async () => {
    for (let i = 0; i < locationsData.length; i++) {
        await sendLocation(locationsData[i]);
    }
};

export default sendMultipleLocations;
    