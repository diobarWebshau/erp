import fetch from 'node-fetch';

const relationshipsData = [
  { location_id: 1, location_type_id: 1 },
  { location_id: 2, location_type_id: 2 },
  { location_id: 2, location_type_id: 1 },
  { location_id: 3, location_type_id: 2 },
  { location_id: 3, location_type_id: 1 }
];

const sendLocationLocationType = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/locations/locations-location-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const contentType = response.headers.get('Content-Type');

    if (response.ok) {
      const responseData = contentType && contentType.includes('application/json')
        ? await response.json()
        : await response.text();
      console.log('Relación Location-LocationType creada con éxito:', responseData);
    } else {
      const errorMessage = contentType && contentType.includes('application/json')
        ? await response.json()
        : await response.text();
      console.error('Error al crear la relación Location-LocationType:', response.status);
      console.error('Mensaje del servidor:', errorMessage);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
  }
};

const sendMultipleLocationLocationTypes = async () => {
  for (let i = 0; i < relationshipsData.length; i++) {
    await sendLocationLocationType(relationshipsData[i]);
  }
};

export default sendMultipleLocationLocationTypes;
