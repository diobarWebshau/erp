import fetch from 'node-fetch';

// Definimos los datos del carrier
const carrierData = {
  name: 'Transportes Rápidos',
  rfc: 'TR1234567890',
  type: 'Terrestre',
  phone: '123-456-7890',
  vehicle: 'Camión',
  plates: 'ABC-123',
  license_number: 'LIC123456',
  active: 1
};

// Función para enviar un carrier
const sendCarrier = async () => {
  try {
    const response = await fetch('http://localhost:3003/carriers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carrierData),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Transportista creado correctamente:', responseData);
    } else {
      console.error('Error al crear el transportista:', response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error('Error al crear el transportista:', error);
  }
};

export default sendCarrier;
