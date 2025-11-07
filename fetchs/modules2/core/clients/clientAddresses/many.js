import fetch from 'node-fetch';

const clientsData = [
  // Cliente 1
  {
    client_id: 1,
    street: "Avenida Principal",
    street_number: "123",
    neighborhood: "Colonia Centro",
    city: "Ciudad de México",
    state: "CDMX",
    country: "México",
    zip_code: "06000"
  },
  {
    client_id: 1,
    street: "Avenida Secundaria",
    street_number: "456",
    neighborhood: "Colonia Norte",
    city: "Ciudad de México",
    state: "CDMX",
    country: "México",
    zip_code: "06001"
  },
  // Cliente 2
  {
    client_id: 2,
    street: "Calle Innovación",
    street_number: "456",
    neighborhood: "Parque Industrial",
    city: "Monterrey",
    state: "Nuevo León",
    country: "México",
    zip_code: "64000"
  },
  {
    client_id: 2,
    street: "Calle Avanzada",
    street_number: "789",
    neighborhood: "Zona Industrial",
    city: "Monterrey",
    state: "Nuevo León",
    country: "México",
    zip_code: "64001"
  },
  // Cliente 3
  {
    client_id: 3,
    street: "Sunset Blvd",
    street_number: "789",
    neighborhood: "Downtown",
    city: "Los Ángeles",
    state: "California",
    country: "EE.UU.",
    zip_code: "90012"
  },
  {
    client_id: 3,
    street: "Hollywood Blvd",
    street_number: "123",
    neighborhood: "Uptown",
    city: "Los Ángeles",
    state: "California",
    country: "EE.UU.",
    zip_code: "90013"
  }
];

const sendClientAddress = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/clients/client-addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
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
  for (const address of clientsData) {
    await sendClientAddress(address);
  }
};

export default sendMultipleClientAddresses;
