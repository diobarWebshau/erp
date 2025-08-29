import fetch from 'node-fetch';

const carriersData = [
  {
    name: 'Logística Express',
    company_name: "Envista",
    rfc: 'LE1234567890',
    type: 'Aéreo',
    phone: '123-456-7891',
    vehicle: 'Avión',
    plates: 'N/A',
    license_number: 'LIC123457',
    active: 1
  },
  {
    name: 'Marítimos Globales',
    company_name: "Industrias SLA",
    rfc: 'MG1234567890',
    type: 'Marítimo',
    phone: '123-456-7892',
    vehicle: 'Barco',
    plates: 'MG-123',
    license_number: 'LIC123458',
    active: 1
  },
  {
    name: 'Cargas Seguras',
    company_name: "Gulfstream",
    rfc: 'CS1234567890',
    type: 'Terrestre',
    phone: '123-456-7893',
    vehicle: 'Camión',
    plates: 'CS-456',
    license_number: 'LIC123459',
    active: 1
  }
];

const sendCarrier = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/logistics/carriers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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

const sendMultipleCarriers = async () => {
  for (let i = 0; i < carriersData.length; i++) {
    await sendCarrier(carriersData[i]);
  }
};

export default sendMultipleCarriers;
