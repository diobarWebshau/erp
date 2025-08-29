import fetch from 'node-fetch';

const clientsData = [
    // Direcciones para el cliente 1
    {
        client_id: 1,
        address: "Avenida Principal 123, Colonia Centro",
        city: "Ciudad de México",
        state: "CDMX",
        country: "México",
        zip_code: "06000"
    },
    {
        client_id: 1,
        address: "Avenida Secundaria 456, Colonia Norte",
        city: "Ciudad de México",
        state: "CDMX",
        country: "México",
        zip_code: "06001"
    },
    // Direcciones para el cliente 2
    {
        client_id: 2,
        address: "Calle Innovación 456, Parque Industrial",
        city: "Monterrey",
        state: "Nuevo León",
        country: "México",
        zip_code: "64000"
    },
    {
        client_id: 2,
        address: "Calle Avanzada 789, Zona Industrial",
        city: "Monterrey",
        state: "Nuevo León",
        country: "México",
        zip_code: "64001"
    },
    // Direcciones para el cliente 3
    {
        client_id: 3,
        address: "Sunset Blvd 789, Downtown",
        city: "Los Ángeles",
        state: "California",
        country: "EE.UU.",
        zip_code: "90012"
    },
    {
        client_id: 3,
        address: "Hollywood Blvd 123, Uptown",
        city: "Los Ángeles",
        state: "California",
        country: "EE.UU.",
        zip_code: "90013"
    }
];

const sendClientAddress = async (data) => {
    try {
        // Enviar los datos al servidor (API)
        const response = await fetch('http://localhost:3003/clients/client-addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData);
        } else {
            console.error('Error al registrar la dirección:', response.status);
            const errorMessage = await response.text();
            console.error('Mensaje de error del servidor:', errorMessage);
        }
    } catch (error) {
        console.error('Error al enviar la dirección:', error);
    }
};

const sendMultipleClientAddresses = async () => {
    for (let i = 0; i < clientsData.length; i++) {
        await sendClientAddress(clientsData[i]);
    }
};

export default sendMultipleClientAddresses;
