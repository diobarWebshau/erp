import fetch from 'node-fetch';

const locationLocationType = [
    // Location A => Store (1), Production (2)
    { location_id: 1, location_type_id: 1 },
    { location_id: 1, location_type_id: 2 },

    // Location B => Store (1), Production (2)
    { location_id: 2, location_type_id: 1 },
    { location_id: 2, location_type_id: 2 },

    // Location C => Store (1)
    { location_id: 3, location_type_id: 1 }
];

const sendLocationLocationType = async (data) => {
    try {
        const response = await fetch(
            'http://localhost:3003/locations/locations-location-types',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }
        );

        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData);
        } else {
            const errorText = await response.json();
            console.error(errorText);
        }
    } catch (error) {
        console.error('Error general:', error);
    }
};

const sendMultipleLocationLocationType = async () => {
    for (const element of locationLocationType) {
        await sendLocationLocationType(element);
    }
};

export default sendMultipleLocationLocationType;
