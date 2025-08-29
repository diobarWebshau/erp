import fetch from 'node-fetch';

const clientAddressesData = [
  {
    client_id: 1,
    address: 'Av. Reforma 123',
    city: 'Mexicali',
    state: 'Baja California',
    country: 'México',
    zip_code: '21000'
  },
  {
    client_id: 2,
    address: 'Calle Independencia 456',
    city: 'Tijuana',
    state: 'Baja California',
    country: 'México',
    zip_code: '22000'
  },
  {
    client_id: 3,
    address: 'Blvd. Benito Juárez 789',
    city: 'Ensenada',
    state: 'Baja California',
    country: 'México',
    zip_code: '22800'
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
      console.log('Dirección de cliente creada correctamente:', responseData);
    } else {
      console.error('Error al crear la dirección de cliente:', response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error('Error al crear la dirección de cliente:', error);
  }
};

const sendMultipleClientAddresses = async () => {
  for (let i = 0; i < clientAddressesData.length; i++) {
    await sendClientAddress(clientAddressesData[i]);
  }
};

export default sendMultipleClientAddresses;
